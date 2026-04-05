import json

class RiskEngine:
    def __init__(self):
        """
        Initializes the Risk Engine.
        Weights are defined here for easy tuning.
        """
        self.weights = {
            "failed_login": 20,
            "unknown_ip": 25,
            "admin_user": 15,
            "anomaly_detected": 30,
            "repeated_attempts_base": 10
        }
        
        # Hardcoded known IPs to match the Detection Engine
        self.known_ips = ["192.168.1.10", "192.168.1.15", "10.0.0.5"]

    def get_risk_level(self, score: int) -> str:
        """
        Categorizes the numerical score into a human-readable risk level.
        LOW: 0-40, MEDIUM: 41-70, HIGH: 71-100
        """
        if score <= 40:
            return "LOW"
        elif score <= 70:
            return "MEDIUM"
        else:
            return "HIGH"

    def calculate_risk(self, log: dict, anomaly_result: bool, recent_logs: list) -> dict:
        """
        Calculates a risk score (0-100) based on the current log, 
        anomaly detection result, and history of recent logs.
        """
        score = 0
        
        # 1. Base Log Factors
        if log.get("status") == "failed":
            score += self.weights["failed_login"]
            
        if log.get("ip") not in self.known_ips:
            score += self.weights["unknown_ip"]
            
        if log.get("user") == "admin":
            score += self.weights["admin_user"]
            
        # 2. Anomaly Factor
        if anomaly_result:
            score += self.weights["anomaly_detected"]
            
        # 3. Pattern Recognition: Repeated Failed Attempts
        # We look back through recent_logs to see if this IP/User has been failing repeatedly
        current_ip = log.get("ip")
        current_user = log.get("user")
        
        failed_count = 0
        for r_log in recent_logs:
            if r_log.get("status") == "failed":
                # Check if it's the same IP or the same User
                if r_log.get("ip") == current_ip or r_log.get("user") == current_user:
                    failed_count += 1
        
        # Applying dynamic "repeated attempts" bonus
        # 0-2 fails: +0
        # 3-5 fails: +10
        # 6-10 fails: +20
        # >10 fails: +30
        if failed_count > 10:
            score += 30
        elif failed_count > 5:
            score += 20
        elif failed_count >= 3:
            score += 10
            
        # Cap score at 100
        final_score = min(100, score)
        
        return {
            "risk_score": final_score,
            "risk_level": self.get_risk_level(final_score),
            "factors": {
                "failed_count_context": failed_count,
                "is_anomaly": anomaly_result
            }
        }

if __name__ == "__main__":
    # --- Internal module testing ---
    engine = RiskEngine()
    
    # Test Scenario 1: A very safe log (Normal user, success, known IP)
    safe_log = {
        "user": "user1",
        "ip": "192.168.1.10",
        "status": "success"
    }
    print("Scenario 1: Normal Log")
    print(json.dumps(engine.calculate_risk(safe_log, False, []), indent=2))
    print("-" * 30)

    # Test Scenario 2: Suspicious log (Unknown IP, failed login)
    susp_log = {
        "user": "user2",
        "ip": "203.0.113.45",
        "status": "failed"
    }
    print("Scenario 2: Suspicious Log")
    print(json.dumps(engine.calculate_risk(susp_log, True, []), indent=2))
    print("-" * 30)

    # Test Scenario 3: Brute Force Attack Pattern (Admin, Unknown IP, Anomaly, Many recent fails)
    attack_log = {
        "user": "admin",
        "ip": "45.33.22.11",
        "status": "failed"
    }
    # Simulate a history of 12 failed attempts from the same IP
    history = [{"user": "admin", "ip": "45.33.22.11", "status": "failed"}] * 12
    
    print("Scenario 3: High-Risk Attack")
    print(json.dumps(engine.calculate_risk(attack_log, True, history), indent=2))
