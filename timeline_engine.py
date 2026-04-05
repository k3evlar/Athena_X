import json
from datetime import datetime, timezone

class TimelineEngine:
    def __init__(self, max_events: int = 100):
        """
        Initializes the Timeline Engine to track historical events.
        max_events: The maximum number of events to retain in memory.
        """
        self.events = []
        self.max_events = max_events

    def add_event(self, event_type: str, details: str, severity: str = "INFO"):
        """
        Adds a new event to the timeline.
        event_type: e.g., 'DETECTION', 'RISK', 'AI_ANALYSIS', 'ACTION'
        details: A human-readable description of the event.
        severity: INFO, LOW, MEDIUM, HIGH, CRITICAL
        """
        event = {
            "timestamp": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
            "event_type": event_type.upper(),
            "details": details,
            "severity": severity.upper()
        }
        
        self.events.append(event)
        
        # Keep the timeline within the max_events limit (sliding window)
        if len(self.events) > self.max_events:
            self.events.pop(0)
            
        return event

    def get_history(self, limit: int = None) -> list:
        """
        Returns the event history, optionally limited to the most recent X events.
        Events are returned in chronological order (latest last).
        """
        if limit:
            return self.events[-limit:]
        return self.events

    def clear(self):
        """Resets the timeline history."""
        self.events = []

if __name__ == "__main__":
    # --- Internal module testing ---
    timeline = TimelineEngine()
    
    print("--- Recording Events ---")
    timeline.add_event("DETECTION", "Anomaly detected in log from 45.33.22.11", "MEDIUM")
    timeline.add_event("RISK", "System risk score increased to 85", "HIGH")
    timeline.add_event("ACTION", "IP 45.33.22.11 has been blocked", "CRITICAL")
    
    print("\n--- Event History ---")
    history = timeline.get_history()
    for event in history:
        print(f"[{event['timestamp']}] {event['event_type']} - ({event['severity']}) - {event['details']}")
