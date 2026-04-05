import json
from datetime import datetime, timezone

class ActionEngine:
    def __init__(self):
        """
        Initializes the state of the defense system.
        Tracks blocked IPs and locked users.
        """
        self.blocked_ips = set()
        self.locked_users = set()
        self.action_history = []

    def block_ip(self, ip: str) -> str:
        """Adds an IP to the blocklist."""
        if ip not in self.blocked_ips:
            self.blocked_ips.add(ip)
            return f"IP {ip} has been blocked."
        return f"IP {ip} is already blocked."

    def lock_account(self, user: str) -> str:
        """Locks a user account."""
        if user not in self.locked_users:
            self.locked_users.add(user)
            return f"User account '{user}' has been locked."
        return f"User account '{user}' is already locked."

    def terminate_session(self, user: str, ip: str) -> str:
        """Simulates terminating an active session."""
        return f"Active session for user '{user}' from IP {ip} has been terminated."

    def execute_action(self, ai_recommendation: dict, target_log: dict) -> list:
        """
        Parses the AI's'action' string and executes the corresponding methods.
        ai_recommendation: The dict from AIAgent.analyze_threat()
        target_log: The latest log associated with the threat
        """
        actions_taken = []
        recommendation_text = ai_recommendation.get("action", "").lower()
        
        user = target_log.get("user")
        ip = target_log.get("ip")

        # Basic logic mapping AI recommendation phrases to engine functions
        if "block ip" in recommendation_text:
            msg = self.block_ip(ip)
            actions_taken.append(msg)
            
        if "lock account" in recommendation_text or "lock user" in recommendation_text:
            msg = self.lock_account(user)
            actions_taken.append(msg)
            
        if "terminate session" in recommendation_text or "kill session" in recommendation_text:
            msg = self.terminate_session(user, ip)
            actions_taken.append(msg)

        if not actions_taken:
            actions_taken.append("No automated action taken. Manual review required.")

        # Record event in history
        event_record = {
            "timestamp": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
            "target_ip": ip,
            "target_user": user,
            "actions": actions_taken,
            "severity": ai_recommendation.get("severity", "Unknown")
        }
        self.action_history.append(event_record)
        
        return actions_taken

    def get_system_status(self) -> dict:
        """Returns the current state of blocked/locked assets."""
        return {
            "blocked_ips": list(self.blocked_ips),
            "locked_users": list(self.locked_users),
            "total_actions": len(self.action_history)
        }

if __name__ == "__main__":
    # --- Internal module testing ---
    engine = ActionEngine()
    
    # Mock AI output
    mock_ai = {
        "attack": "Yes",
        "attack_type": "Brute Force",
        "severity": "Critical",
        "action": "Block IP and lock account",
        "explanation": "Test attack"
    }
    
    # Mock Log
    mock_log = {
        "user": "admin",
        "ip": "45.33.22.11"
    }
    
    print("--- Executing Actions ---")
    results = engine.execute_action(mock_ai, mock_log)
    for r in results:
        print(f"[ACTION] {r}")
        
    print("\n--- System Status ---")
    print(json.dumps(engine.get_system_status(), indent=2))
