import os
import json
from google import genai
from google.genai import types
from datetime import datetime
from dotenv import load_dotenv

# Load key from .env file
load_dotenv()

class AIAgent:
    def __init__(self, api_key: str = None, default_model: str = "models/gemini-2.5-flash"):
        """
        Initializes the AI Agent with the LATEST Google GenAI SDK.
        api_key: The Google AI Studio API key.
        default_model: The preferred model version.
        """
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        self.default_model = default_model
        self.fallback_model = "models/gemini-2.5-pro"
        
        if self.api_key:
            try:
                self.client = genai.Client(api_key=self.api_key)
                print(f"DEBUG: Gemini Client initialized using {self.default_model}")
            except Exception as e:
                self.client = None
                print(f"CRITICAL ERROR: Failed to initialize Gemini Client: {e}")
        else:
            self.client = None
            print("Warning: GEMINI_API_KEY not found. AI Agent will operate in MOCK mode.")

    def list_available_models(self):
        """
        Debug utility to list all models accessible with the current API key.
        """
        if not self.client:
            print("Client not initialized. Cannot list models.")
            return
            
        print("\n--- Available Models ---")
        try:
            for m in self.client.models.list():
                print(f"- {m.name} (Supported: {m.supported_actions})")
        except Exception as e:
            print(f"Error listing models: {e}")
        print("------------------------\n")

    def prepare_prompt(self, logs: list) -> str:
        """
        Formats a list of logs into a structured prompt for the LLM.
        """
        logs_str = json.dumps(logs, indent=2)
        
        prompt = f"""You are an expert cybersecurity AI system.

Analyze the following activity logs and determine:

1. Is this an attack? (Yes/No)
2. Attack type (Brute Force / Suspicious Login / Credential Stuffing / None)
3. Severity (Low / Medium / High / Critical)
4. Recommended action
5. Explanation

Logs:
{logs_str}

Respond ONLY in JSON format like:
{{
  "attack": "Yes",
  "attack_type": "Brute Force",
  "severity": "Critical",
  "action": "Block IP and lock account",
  "explanation": "Multiple failed login attempts from unknown IP targeting admin account"
}}
"""
        return prompt

    def call_gemini_api(self, prompt: str) -> str:
        """
        Sends the prompt to Gemini using the new SDK with fallback logic.
        """
        if not self.client:
            return self._get_mock_response(prompt)
            
        # Try primary model first, then fallback
        models_to_try = [self.default_model, self.fallback_model]
        
        for model_id in models_to_try:
            try:
                print(f"DEBUG: Calling Gemini model: {model_id}...")
                response = self.client.models.generate_content(
                    model=model_id,
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        temperature=0.3
                    )
                )
                if response and response.text:
                    return response.text
            except Exception as e:
                print(f"Warning: Model {model_id} failed: {e}")
                continue # Try next model
        
        print("CRITICAL: All Gemini model attempts failed.")
        return None

    def parse_response(self, response_text: str) -> dict:
        """
        Cleans and parses the Gemini response into a structured dictionary.
        Handles markdown-wrapped JSON and whitespace.
        """
        if not response_text:
            return self._get_error_fallback("No response from API")

        try:
            # More robust JSON extraction
            content = response_text.strip()
            if "```json" in content:
                content = content.split("```json")[-1].split("```")[0].strip()
            elif "```" in content:
                content = content.split("```")[-1].split("```")[0].strip()
                
            return json.loads(content)
        except json.JSONDecodeError:
            print(f"Error parsing Gemini JSON output. Raw text: {response_text[:100]}...")
            return self._get_error_fallback("Invalid JSON format from AI")

    def _get_error_fallback(self, reason: str) -> dict:
        return {
            "attack": "Unknown",
            "attack_type": "None",
            "severity": "High",
            "action": "Manual review required",
            "explanation": f"AI Assistant error: {reason}"
        }

    def _get_mock_response(self, prompt: str) -> str:
        if "admin" in prompt.lower() and "failed" in prompt.lower():
            return json.dumps({
                "attack": "Yes",
                "attack_type": "Brute Force",
                "severity": "Critical",
                "action": "Block IP and lock account",
                "explanation": "MOCK: Detected pattern of failed logins against admin account."
            })
        return json.dumps({
            "attack": "No",
            "attack_type": "None",
            "severity": "Low",
            "action": "Monitor",
            "explanation": "MOCK: Traffic appears within normal parameters."
        })

    def analyze_threat(self, logs: list) -> dict:
        if not logs:
            return {"error": "No logs provided"}
            
        prompt = self.prepare_prompt(logs)
        raw_res = self.call_gemini_api(prompt)
        return self.parse_response(raw_res)

    def test_agent(self, test_prompt: str = "Explain brute force attack in one line"):
        """
        Simple test function to verify API functionality.
        """
        print(f"\n--- AI Agent Test: '{test_prompt}' ---")
        if not self.client:
            print("Operating in MOCK mode. No actual API call will be made.")
            
        try:
            raw_res = self.call_gemini_api(test_prompt)
            if raw_res:
                print(f"Gemini Output: {raw_res.strip()}")
            else:
                print("Failed to get response from Gemini.")
        except Exception as e:
            print(f"Test Error: {e}")
        print("------------------------------------------\n")

if __name__ == "__main__":
    # --- Internal module testing ---
    agent = AIAgent()
    
    # 1. List available models (Debug utility)
    agent.list_available_models()
    
    # 2. Run simple test
    agent.test_agent()
    
    # 3. Run full threat analysis test
    test_logs = [
        {"timestamp": "2024-03-31T23:55:00Z", "user": "admin", "ip": "45.33.22.11", "status": "failed"},
        {"timestamp": "2024-03-31T23:55:01Z", "user": "admin", "ip": "45.33.22.11", "status": "failed"},
        {"timestamp": "2024-03-31T23:55:02Z", "user": "admin", "ip": "45.33.22.11", "status": "failed"}
    ]
    
    print("--- Running Threat Analysis Simulation ---")
    result = agent.analyze_threat(test_logs)
    print(json.dumps(result, indent=2))
