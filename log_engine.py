import random
import time
from datetime import datetime, timezone
import json

USERS = ["admin", "user1", "user2"]
KNOWN_IPS = ["192.168.1.10", "192.168.1.15", "10.0.0.5"]
UNKNOWN_IPS = ["203.0.113.45", "198.51.100.23", "45.33.22.11", "185.20.10.5"]

class LogEngine:
    def __init__(self):
        """Initializes the log engine with an empty history buffer."""
        self.log_history = []
        self.max_history = 1000  # Number of recent logs to keep in memory
        self.current_mode = "normal"  # Default mode

    def set_mode(self, mode: str):
        """Dynamically switch log generation mode (normal, suspicious, attack)."""
        mode = mode.lower()
        if mode in ["normal", "suspicious", "attack"]:
            self.current_mode = mode
        else:
            raise ValueError(f"Invalid mode: {mode}. Must be normal, suspicious, or attack.")

    def _create_log(self, user: str, ip: str, status: str, timestamp: str = None) -> dict:
        """Helper to structure the log dictionary and append to history buffer."""
        
        if not timestamp:
            # Generate current time with a tiny bit of random jitter for realism
            now = datetime.now(timezone.utc).timestamp()
            jitter = random.uniform(-0.01, 0.01) # +/- 10ms jitter
            now_dt = datetime.fromtimestamp(now + jitter, tz=timezone.utc)
            timestamp = now_dt.isoformat().replace("+00:00", "Z")

        log_entry = {
            "timestamp": timestamp,
            "user": user,
            "ip": ip,
            "action": "login",
            "status": status
        }
        
        self.log_history.append(log_entry)
        if len(self.log_history) > self.max_history:
            self.log_history.pop(0)  # Maintain the maximum buffer size
            
        return log_entry

    def generate_normal_log(self) -> dict:
        """
        Normal Mode:
        - Mostly successful logins
        - Known IP addresses
        - Low randomness
        """
        user = random.choice(USERS)
        ip = random.choice(KNOWN_IPS)
        # 95% success rate for normal traffic
        status = "success" if random.random() > 0.05 else "failed"
        return self._create_log(user, ip, status)

    def generate_suspicious_log(self) -> dict:
        """
        Suspicious Mode:
        - Occasional failed logins
        - Some unknown IP addresses
        - Slight irregular behavior
        """
        user = random.choice(USERS)
        # Higher probability of picking from UNKNOWN_IPS
        ip = random.choice(KNOWN_IPS + UNKNOWN_IPS + UNKNOWN_IPS)
        # 60% success rate (higher threshold of failures)
        status = "success" if random.random() > 0.40 else "failed"
        return self._create_log(user, ip, status)

    def generate_attack_logs(self) -> list:
        """
        Attack Mode:
        - Rapid burst of failed login attempts
        - Same user (admin)
        - Unknown IP
        - Simulates an aggressive, highly obvious brute-force attack
        """
        logs = []
        ip = random.choice(UNKNOWN_IPS)
        user = "admin"  # Target of the brute-force
        
        # Simulate a much larger burst of 15 to 40 attempts for a more obvious attack signal
        num_attempts = random.randint(15, 40)
        
        # Base time for the burst
        base_time = datetime.now(timezone.utc).timestamp()
        
        for _ in range(num_attempts):
            status = "failed"
            # Add 20ms to 150ms synthetic delay between consecutive attack logs
            delay = random.uniform(0.02, 0.15)
            base_time += delay
            
            dt = datetime.fromtimestamp(base_time, tz=timezone.utc)
            ts_str = dt.isoformat().replace("+00:00", "Z")
            
            logs.append(self._create_log(user, ip, status, timestamp=ts_str))
            
        return logs

    def stream_logs(self):
        """
        Generator that continuously yields logs based on the current mode.
        Allows dynamic switching of the mode via self.set_mode().
        """
        while True:
            if self.current_mode == "normal":
                yield self.generate_normal_log()
                # Natural, human-like gaps between background traffic (0.2s to 2.5s)
                time.sleep(random.uniform(0.2, 2.5))
                
            elif self.current_mode == "suspicious":
                yield self.generate_suspicious_log()
                # Faster, more frantic pace but still slightly randomized (0.05s to 0.8s)
                time.sleep(random.uniform(0.05, 0.8))
                
            elif self.current_mode == "attack":
                burst_logs = self.generate_attack_logs()
                for log in burst_logs:
                    yield log
                    # Extremely fast pace simulating an automated script (5ms to 30ms)
                    time.sleep(random.uniform(0.005, 0.03))
                # Pause a bit after a burst to simulate rate-limiting or script resetting
                time.sleep(random.uniform(1.5, 4.0))

if __name__ == "__main__":
    # Example usage / Test routine
    engine = LogEngine()
    print("--- Normal Mode ---")
    for _ in range(2):
        print(json.dumps(engine.generate_normal_log(), indent=2))
        
    print("\n--- Suspicious Mode ---")
    for _ in range(2):
        print(json.dumps(engine.generate_suspicious_log(), indent=2))
        
    print("\n--- Attack Mode ---")
    attack_logs = engine.generate_attack_logs()
    for log in attack_logs:
        print(json.dumps(log, indent=2))
