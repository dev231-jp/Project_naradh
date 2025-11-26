# 🛡️ IoT Intrusion Detection System

A production-ready, hackathon-grade IoT Intrusion Detection System with real-time threat monitoring, device management, and beautiful visualizations.

## ✨ Features

- **Real-time Alert Monitoring** - Live threat detection with anomaly scoring
- **Device Management** - Track and quarantine suspicious IoT devices
- **Interactive Dashboard** - Modern, responsive UI with real-time updates
- **Analytics & Charts** - Visual representation of threat patterns
- **RESTful API** - Clean, documented endpoints for ML integration
- **EdgeGuard Assistant** - Context-aware chatbot that guides operators through suspicious alerts
- **Error Handling** - Robust error handling and connection status monitoring

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+ and npm
- Modern web browser

## Windows Setup Instructions

### Backend Setup (Windows)

Open Command Prompt or PowerShell and run:

```cmd
cd Project_naradh/backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
rem Edit .env with your API keys (optional for basic functionality)
python app.py
```

**Backend will run on http://localhost:5000**

### Frontend Setup (Windows)

Open a NEW Command Prompt or PowerShell window:

```cmd
cd Project_naradh/frontend
npm install
npm start
```

**Frontend will automatically open at http://localhost:3000**

### Environment Configuration (Optional)

For full chatbot functionality, edit `backend/.env`:

```env
OPENAI_API_KEY=your_actual_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini
```

> **Note:** The system works without API keys but provides enhanced responses with OpenAI integration.

## Linux/Mac Setup

### 1. Setup Backend

```bash
cd Project_naradh/backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your API keys (optional)
python3 app.py
```

Backend will run on **http://localhost:5000**

### 2. Setup Frontend

```bash
cd Project_naradh/frontend
npm install
npm start
```

Frontend will automatically open at **http://localhost:3000**

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/alert` | Receive alert from ML inference |
| `GET` | `/alerts` | Get last 200 alerts (newest first) |
| `POST` | `/quarantine` | Quarantine device: `{"src": "192.168.1.10"}` |
| `POST` | `/run_attack` | Trigger simulated attack |
| `GET` | `/devices` | Get all devices with statuses |
| `GET` | `/health` | Health check endpoint |
| `GET` | `/stats` | Get system statistics |
| `POST` | `/api/chat/session` | Start the chat assistant session |
| `POST` | `/api/chat/<session_id>/send` | Send user text to the assistant |
| `GET` | `/api/chat/<session_id>/history` | Load a session’s conversation history |

## 🤖 Chat Assistant

- A floating **EdgeGuard Assistant** sits on the dashboard and loads the latest alert context whenever a session is created.
- Sessions persist through `backend/chatbot/sessions_store.py`; change the storage file with `CHAT_SESSION_DB` (default `chat_sessions.db` next to `app.py`).
- Supply `OPENAI_API_KEY` (and optionally `OPENAI_MODEL`) via a `.env` file or shell to activate polite OpenAI polishing; the assistant gracefully skips OpenAI when those settings or the package are unavailable.
- The frontend `ChatWidget` respects `process.env.REACT_APP_API_URL`, so it always talks to whichever backend base you configure.

## 🔌 ML Integration

To integrate with your ML inference process (`realtime_inference.py`), POST alerts to:

```
POST http://localhost:5000/alert
Content-Type: application/json
```

### Example Alert Payload

See `backend/example_alert.json` for exact format:

```json
{
  "timestamp": "2024-01-15T14:30:25.123456",
  "src_ip": "192.168.1.10",
  "dst_ip": "192.168.1.1",
  "anomaly_score": 0.847,
  "device_name": "IoT-Sensor-001",
  "top_features": [
    {
      "name": "packet_rate",
      "value": 1250.5,
      "baseline": 150.0
    }
  ]
}
```

### Python Integration Example

```python
import requests
from datetime import datetime

alert_data = {
    "timestamp": datetime.now().isoformat(),
    "src_ip": "192.168.1.10",
    "dst_ip": "192.168.1.1",
    "anomaly_score": 0.847,
    "top_features": [
        {"name": "packet_rate", "value": 1250.5, "baseline": 150.0}
    ]
}

response = requests.post('http://localhost:5000/alert', json=alert_data)
print(response.json())
```

## 🎨 UI Features

- **Dark Theme** - Modern, eye-friendly dark interface
- **Real-time Updates** - Auto-refresh every 3 seconds
- **Toast Notifications** - User-friendly feedback messages
- **Connection Status** - Visual indicator of backend connectivity
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Interactive Charts** - Beautiful Recharts visualizations

## 🏗️ Architecture Overview

### Backend (Flask API)
- **app.py:** Main Flask server with REST API endpoints
- **chatbot/**: OpenAI-powered assistant with session management
- **In-memory storage:** Last 200 alerts for real-time monitoring
- **SQLite:** Chat session persistence
- **Environment variables:** Configuration via python-dotenv
- **Anomaly detection:** Scoring system with ML inference integration
- **Device management:** Quarantine/unquarantine functionality

### Chatbot System
- **assistant.py:** OpenAI integration with fallback responses
- **sessions_store.py:** Session persistence and management using SQLite
- **templates.py:** Response templates for IoT security guidance
- **Graceful degradation:** Works without OpenAI API key

### Frontend (React SPA)
- **App.js:** Main application with routing and real-time updates
- **components/**: Reusable UI components (Alerts, Devices, Charts, ChatWidget)
- **pages/**: Full-page components (Dashboard, Analytics, Settings)
- **Real-time updates:** 3-second refresh intervals for live monitoring
- **Professional UI:** Dark theme with responsive design
- **Charts:** Interactive visualizations using Recharts library

### API Integration
- **REST endpoints:** Standard HTTP methods for data exchange
- **CORS enabled:** Cross-origin requests from frontend to backend
- **Error handling:** Comprehensive error responses and status codes
- **JSON format:** Consistent data exchange format
- **Session management:** Chat sessions with contextual assistance

### Data Flow
1. **ML Inference** → POST /alert (anomaly scoring)
2. **Alert Storage** → In-memory cache (last 200 alerts)
3. **Frontend Updates** → Real-time polling every 3 seconds
4. **User Interaction** → Chat sessions via ChatWidget
5. **Device Management** → Quarantine/unquarantine operations

### Security Features
- **Anomaly Scoring:** Real-time threat level assessment
- **Device Isolation:** Automatic quarantine capabilities
- **Attack Simulation:** Demo mode for testing and training
- **Session Persistence:** Secure chat session storage
- **API Key Protection:** Environment variable configuration

## 🏗️ Project Structure

```
Project_naradh/
├── frontend/          # React dashboard
│   ├── src/
│   │   ├── components/
│   │   │   ├── Alerts.js
│   │   │   ├── Devices.js
│   │   │   ├── StatsCards.js
│   │   │   ├── AlertChart.js
│   │   │   ├── Toast.js
│   │   │   └── ChatWidget.js
│   │   ├── pages/
│   │   │   ├── Dashboard.js
│   │   │   ├── Alerts.js
│   │   │   ├── Devices.js
│   │   │   ├── Analytics.js
│   │   │   ├── Network.js
│   │   │   └── Settings.js
│   │   ├── App.js
│   │   └── App.css
│   ├── package.json
│   └── .env.example
├── backend/           # Flask API
│   ├── app.py
│   ├── requirements.txt
│   ├── .env.example
│   ├── chatbot/
│   │   ├── assistant.py
│   │   ├── sessions_store.py
│   │   └── templates.py
│   └── example_alert.json
├── .gitignore
└── README.md
```

## 🐛 Troubleshooting

### Backend won't start
- Check if port 5000 is available
- Verify Python version: `python --version`
- Install dependencies: `pip install -r requirements.txt`

### Frontend won't connect
- Ensure backend is running on port 5000
- Check browser console for CORS errors
- Verify API_BASE URL in App.js

### No alerts showing
- Check backend logs for errors
- Verify alert JSON format matches example
- Test with "Run Attack Simulation" button

## 📝 Notes

- Alerts are stored in-memory (last 200)
- Devices persist during session
- Quarantine status resets on server restart
- Demo mode generates periodic test alerts

## 🎯 Hackathon Highlights

- **Production-ready code** with error handling
- **Beautiful UI/UX** with animations and transitions
- **Comprehensive documentation**
- **Easy ML integration** with example payloads
- **Real-time updates** for live demos
- **Responsive design** for any screen

## 📄 License

MIT License - Feel free to use for your hackathon project!

---

**Built with ❤️ for IoT Security Hackathons**





