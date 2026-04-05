import os
import google.generativeai as genai
from dotenv import load_dotenv

# Re-loading .env from disk to be absolutely sure
load_dotenv(".env", override=True)
key = os.getenv("GEMINI_API_KEY")

def test_connection():
    if not key:
        print("CRITICAL: No GEMINI_API_KEY found.")
        return
    
    print(f"DEBUG: Key length is {len(key)}")
    print(f"DEBUG: Key starts with {key[:7]}")
    
    try:
        genai.configure(api_key=key)
        model = genai.GenerativeModel("gemini-1.5-flash")
        print("DEBUG: Model initialized. Sending request...")
        
        # Using a Very simple request
        response = model.generate_content("Ping")
        
        print(f"DEBUG: Response object type: {type(response)}")
        
        if response and hasattr(response, "text"):
            print(f"SUCCESS: AI Response -> {response.text.strip()}")
        else:
            print("ERROR: Response object received but text attribute is missing.")
            print(f"Full response object: {response}")
            
    except Exception as e:
        print(f"EXCEPTION: {str(e)}")

if __name__ == "__main__":
    test_connection()
