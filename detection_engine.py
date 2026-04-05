import numpy as np
from sklearn.ensemble import IsolationForest
import json

class DetectionEngine:
    def __init__(self, contamination=0.1):
        """
        Initializes the Anomaly Detection Engine using Isolation Forest.
        contamination: The proportion of outliers in the data set. 
        Keeps model lightweight and suitable for streaming.
        """
        # Random state ensures reproducibility during hackathon presentation
        self.model = IsolationForest(contamination=contamination, random_state=42)
        self.is_trained = False
        
        # Hardcoding known IPs for consistency, but this could easily be passed dynamically
        # or drawn from an environment variable / configuration file.
        self.known_ips = ["192.168.1.10", "192.168.1.15", "10.0.0.5"]

    def extract_features(self, log: dict) -> list:
        """
        Converts a log dictionary into a numerical feature vector.
        Features:
        1. Failed login (1 if failed, 0 if success)
        2. Unknown IP (1 if IP not in known list, 0 otherwise)
        3. Admin user (1 if user == 'admin', 0 otherwise)
        """
        # 1. Failed login check
        failed_login = 1 if log.get("status") == "failed" else 0
        
        # 2. Unknown IP check
        unknown_ip = 1 if log.get("ip") not in self.known_ips else 0
        
        # 3. Admin user check
        admin_user = 1 if log.get("user") == "admin" else 0
        
        return [failed_login, unknown_ip, admin_user]

    def train_model(self, logs: list):
        """
        Takes a batch of logs, extracts their numerical features, 
        and trains the Isolation Forest algorithm.
        """
        if not logs:
            print("Warning: No logs provided for training.")
            return
            
        features = [self.extract_features(log) for log in logs]
        X = np.array(features)
        
        try:
            # Fit the IsolationForest model to our training features
            self.model.fit(X)
            self.is_trained = True
        except Exception as e:
            print(f"Error training model: {e}")

    def predict_anomaly(self, log: dict) -> dict:
        """
        Returns whether the log is an anomaly or not.
        Output format: {"anomaly": True/False, "score": float}
        """
        if not self.is_trained:
            # Return safe default if the model hasn't been trained yet
            return {
                "anomaly": False,
                "score": 0.0
            }

        # Extract numerical features from the incoming log
        features = self.extract_features(log)
        
        # Reshape for single-sample prediction in scikit-learn
        X = np.array(features).reshape(1, -1)
        
        try:
            # predict() returns 1 for normal, -1 for anomaly
            prediction = self.model.predict(X)[0]
            
            # decision_function() returns a continuous score. Negative scores indicate anomalies.
            score = self.model.decision_function(X)[0]
            
            is_anomaly = True if prediction == -1 else False
            
            return {
                "anomaly": is_anomaly,
                "score": float(round(score, 3))  # Clean up the output to standard Python float
            }
        except Exception as e:
            print(f"Prediction Error: {e}")
            return {"anomaly": False, "score": 0.0}

if __name__ == "__main__":
    # --- Internal module testing ---
    # This block allows us to verify logic independently of the broader Athena system.
    from log_engine import LogEngine
    
    # We set contamination to 0.1 (10% anomaly expectation) for testing
    detector = DetectionEngine(contamination=0.1)
    generator = LogEngine()
    
    print("--- Training the Detection Engine using normal & suspicious logs ---")
    training_data = []
    
    # Generate 150 background logs (normal traffic with some suspicious mixed in)
    for _ in range(120):
        training_data.append(generator.generate_normal_log())
    for _ in range(30):
        training_data.append(generator.generate_suspicious_log())
        
    detector.train_model(training_data)
    print("Training complete.\n")
    
    print("--- Testing Predictions ---")
    
    # Test 1: A normal log
    normal_log = generator.generate_normal_log()
    res_normal = detector.predict_anomaly(normal_log)
    print("Normal Log Test:")
    print("Log:")
    print(json.dumps(normal_log, indent=2))
    print("Prediction:", json.dumps(res_normal, indent=2), "\n")
    
    # Test 2: An attack log (admin, unknown IP, failed status => heavily weighted as anomaly)
    attack_logs = generator.generate_attack_logs()
    res_attack = detector.predict_anomaly(attack_logs[0])
    print("Attack Log Test:")
    print("Log:")
    print(json.dumps(attack_logs[0], indent=2))
    print("Prediction:", json.dumps(res_attack, indent=2))
