import asyncio
import random
import json
from datetime import datetime, timezone
from typing import List, Dict, Optional

from fastapi import FastAPI, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Import existing engines
from log_engine import LogEngine
from detection_engine import DetectionEngine
from risk_engine import RiskEngine
from ai_agent import AIAgent
from action_engine import ActionEngine
from timeline_engine import TimelineEngine

app = FastAPI(title="ATHENA-X AI Cyber Defense Backend")

# Enable CORS for React/Bolt frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- GLOBAL SYSTEM STATE ---
class SystemState:
    def __init__(self):
        self.logs: List[Dict] = []
        self.risk_score: int = 0
        self.risk_level: str = "LOW"
        self.ai_output: Dict = {}
        self.actions: List[str] = []
        self.timeline: List[Dict] = []
        self.mode: str = "normal"
        self.is_analyzing: bool = False
        self.last_ai_trigger_time: float = 0

state = SystemState()

# --- ENGINE INITIALIZATION ---
log_eng = LogEngine()
det_eng = DetectionEngine(contamination=0.1)
risk_eng = RiskEngine()
ai_agent = AIAgent()
action_eng = ActionEngine()
time_eng = TimelineEngine(max_events=100)

def pre_train_detector():
    """Trains the detection engine with baseline data on startup."""
    print("DEBUG: Pre-training detection engine...")
    training_data = []
    for _ in range(100):
        training_data.append(log_eng.generate_normal_log())
    for _ in range(20):
        training_data.append(log_eng.generate_suspicious_log())
    det_eng.train_model(training_data)
    print("DEBUG: Detection engine ready.")

pre_train_detector()

# --- ASYNC AI TASK ---
async def trigger_ai_analysis(target_logs: List[Dict], trigger_log: Dict):
    """Calls Gemini AI for deep threat analysis without blocking the main loop."""
    if state.is_analyzing:
        return
        
    state.is_analyzing = True
    print(f"DEBUG: Triggering AI analysis for {len(target_logs)} logs...")
    
    try:
        # 1. AI Analysis
        analysis = ai_agent.analyze_threat(target_logs)
        state.ai_output = analysis
        
        time_eng.add_event("AI_ANALYSIS", f"Analysis Complete: {analysis.get('attack_type', 'Unknown')}", analysis.get('severity', 'INFO'))
        
        # 2. Automated Action
        if analysis.get("attack") == "Yes":
            actions = action_eng.execute_action(analysis, trigger_log)
            for act in actions:
                state.actions.append(act)
                time_eng.add_event("ACTION", act, "CRITICAL")
                
    except Exception as e:
        print(f"ERROR: AI Analysis failed: {e}")
        state.ai_output = {"error": str(e), "attack": "Unknown"}
    finally:
        state.is_analyzing = False
        state.last_ai_trigger_time = asyncio.get_event_loop().time()

# --- BACKGROUND SIMULATION LOOP ---
async def simulation_loop():
    """Continuous background task generating logs and calculating real-time risk."""
    print("DEBUG: Starting simulation loop...")
    
    while True:
        try:
            # 1. Generate Log based on Mode
            new_log = {}
            if state.mode == "normal":
                new_log = log_eng.generate_normal_log()
            elif state.mode == "suspicious":
                new_log = log_eng.generate_suspicious_log()
            elif state.mode == "attack":
                # During attack mode, generate a burst
                attack_burst = log_eng.generate_attack_logs()
                for log in attack_burst:
                    state.logs.append(log)
                new_log = attack_burst[-1] # Process the last one for current risk
            
            if new_log and state.mode != "attack": # Single logs only for normal/susp
                state.logs.append(new_log)
            
            # Keep log buffer clean (last 50)
            if len(state.logs) > 50:
                state.logs = state.logs[-50:]

            # 2. Detection & Risk Calculation
            anomaly_res = det_eng.predict_anomaly(new_log)
            risk_res = risk_eng.calculate_risk(new_log, anomaly_res["anomaly"], state.logs)
            
            # 3. Update Risk State
            # Smoothen risk changes: if mode is normal, decay risk slowly; if attack, jump up
            target_score = risk_res["risk_score"]
            if state.mode == "normal" and state.risk_score > 0:
                state.risk_score = max(0, state.risk_score - 2) # Slow decay
            else:
                # Weighted average for smooth transition
                state.risk_score = int(0.7 * state.risk_score + 0.3 * target_score)
            
            state.risk_level = risk_eng.get_risk_level(state.risk_score)

            # 4. Timeline Reporting
            if anomaly_res["anomaly"]:
                time_eng.add_event("DETECTION", f"Anomaly detected from IP {new_log.get('ip')}", "MEDIUM")

            # 5. Conditional AI Trigger (Throttled)
            current_time = asyncio.get_event_loop().time()
            if state.risk_score > 60 and not state.is_analyzing:
                if (current_time - state.last_ai_trigger_time) > 15: # 15s cool down
                    asyncio.create_task(trigger_ai_analysis(state.logs[-10:], new_log))

        except Exception as e:
            print(f"ERROR in simulation loop: {e}")

        # Sleep interval jittered (0.5 to 1.5s)
        await asyncio.sleep(random.uniform(0.5, 1.5))

@app.on_event("startup")
async def startup_event():
    # Start the simulation loop in the background
    asyncio.create_task(simulation_loop())

# --- API ENDPOINTS ---

@app.get("/logs")
async def get_logs():
    return state.logs[-20:]

@app.get("/risk")
async def get_risk():
    return {
        "risk_score": state.risk_score,
        "risk_level": state.risk_level,
        "mode": state.mode
    }

@app.get("/ai")
async def get_ai():
    return {
        "latest_output": state.ai_output,
        "is_analyzing": state.is_analyzing
    }

@app.get("/actions")
async def get_actions():
    return {
        "actions_history": action_eng.action_history,
        "blocked_ips": list(action_eng.blocked_ips),
        "locked_users": list(action_eng.locked_users)
    }

@app.get("/timeline")
async def get_timeline():
    return time_eng.get_history(limit=20)

@app.post("/simulate_attack")
async def simulate_attack():
    state.mode = "attack"
    time_eng.add_event("SYSTEM", "Attack simulation mode enabled", "HIGH")
    return {"status": "Attack mode active"}

@app.post("/reset")
async def reset_system():
    # Clear instances and local state
    state.logs = []
    state.risk_score = 0
    state.risk_level = "LOW"
    state.ai_output = {}
    state.actions = []
    state.timeline = []
    state.mode = "normal"
    
    action_eng.blocked_ips.clear()
    action_eng.locked_users.clear()
    action_eng.action_history.clear()
    time_eng.clear()
    
    time_eng.add_event("SYSTEM", "System state reset successful", "INFO")
    return {"status": "System reset"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
