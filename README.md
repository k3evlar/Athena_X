# ATHENA-X: AI-Powered Cyber Defense Platform

ATHENA-X is a cutting-edge, real-time cyber defense system that combines machine learning anomaly detection with Google's Gemini AI for deep threat analysis and automated incident response.

![Athena-X Banner](https://img.shields.io/badge/Status-Active-brightgreen)
![Python](https://img.shields.io/badge/Backend-Python%203.10%2B-blue)
![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61dafb)
![FastAPI](https://img.shields.io/badge/Framework-FastAPI-009688)
![Gemini](https://img.shields.io/badge/AI-Gemini%202.5%20Flash-orange)

---

## 🚀 Overview

Modern cyber threats evolve faster than static rules can catch them. **ATHENA-X** shifts from reactive to proactive defense by:
1.  **Continuous Monitoring**: Ingesting real-time system logs.
2.  **ML Anomaly Detection**: Identifying deviations from "normal" behavior using Isolation Forests.
3.  **AI Threat Intelligence**: Leveraging Gemini AI to perform deep-dive forensics on suspicious activity.
4.  **Automated Mitigation**: Instantly blocking malicious IPs or locking compromised accounts.

---

## 🏗️ Architecture

The system is built on a modular "Engine" architecture:

- **Log Engine**: Generates and manages synthetic/real-time traffic streams.
- **Detection Engine**: Uses Scikit-Learn's Isolation Forest to find statistical outliers.
- **Risk Engine**: Calculates a dynamic risk score based on frequency, severity, and anomaly indicators.
- **AI Agent**: Integrates with Google GenAI SDK to interpret complex attack patterns.
- **Action Engine**: Executes fire-and-forget defensive maneuvers.
- **Timeline Engine**: Maintains a chronological record of security events.

---

## ✨ Features

-   **Live Dashboard**: Real-time visualization of risk levels and system logs.
-   **Intelligent Analysis**: AI-generated explanations for *why* an activity was flagged.
-   **Automated Blocking**: Immediate response to "High" or "Critical" threats.
-   **Attack Simulation**: One-click mode to stress-test the system with brute-force simulations.
-   **Dynamic Learning**: The detection engine trains itself on baseline "normal" data during startup.

---

## 🛠️ Tech Stack

-   **Backend**: Python 3.10+, FastAPI, Uvicorn, Scikit-Learn, NumPy.
-   **AI**: Google GenAI SDK (`google-genai`).
-   **Frontend**: React, TypeScript, Vite, Tailwind CSS, Lucide Icons.
-   **Environment**: Python Dotenv for secure API key management.

---

## 🚦 Getting Started

### 1. Prerequisites
- Python 3.10 or higher.
- Node.js (for the frontend).
- A Google AI Studio API Key ([Get one here](https://aistudio.google.com/app/apikey)).

### 2. Backend Setup
```bash
# Install dependencies
pip install -r requirements.txt

# Create .env file and add your key
echo "GEMINI_API_KEY=your_key_here" > .env

# Run the server
python main.py
```
The API will be available at `http://localhost:8000`.

### 3. Frontend Setup
```bash
cd Frontend
npm install
npm run dev
```
The dashboard will be available at `http://localhost:5173`.

---

## 🧪 Usage

Once the system is running:
1.  Open the **Dashboard**.
2.  Watch the **Risk Radar** as normal traffic flows in.
3.  Click **"Simulate Attack"** in the UI (or call `POST /simulate_attack`).
4.  Observe as the **Detection Engine** flags anomalies, the **AI Agent** analyzes the threat, and the **Action Engine** blocks the attacker.

---

## 🛡️ License
Distruibuted under the MIT License. See `LICENSE` for more information.
