# 🚀 Quick Start Guide

## Installation & Running (4 Commands)

### Terminal 1: Backend

```bash
cd naradh/backend
pip install -r requirements.txt
python app.py
```

✅ Backend running on **http://localhost:5000**

### Terminal 2: Frontend

```bash
naradh/frontend
npm install
npm start
```

✅ Frontend automatically opens at **http://localhost:3000**

---

## 🎯 Testing the System

1. **Check Health**: Visit http://localhost:5000/health
2. **Run Attack Simulation**: Click "Run Attack Simulation" button in dashboard
3. **View Alerts**: Alerts appear automatically in Live Alerts panel
4. **Quarantine Device**: Click "QUARANTINE" button on any alert

## 📊 Dashboard Features

- **Stats Cards**: Total alerts, critical alerts, quarantined devices, average threat score
- **Live Alerts Panel**: Real-time threat detection with anomaly scores
- **Device List**: All IoT devices with status and last seen time
- **Analytics Chart**: 30-minute alert timeline visualization

## 🔌 ML Integration

POST alerts from your ML inference to:

```cd
POST http://localhost:5000/alert
Content-Type: application/json
```

Example payload in `backend/example_alert.json`

---

**That's it! Your IoT Intrusion Detection System is ready for demo! 🎉**





