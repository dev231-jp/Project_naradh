import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import StatsCards from '../components/StatsCards';
import Alerts from '../components/Alerts';
import Devices from '../components/Devices';
import AlertChart from '../components/AlertChart';
import Toast from '../components/Toast';
import ChatWidget from '../components/ChatWidget';
import './Dashboard.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function Dashboard() {
  const [demoStatus, setDemoStatus] = useState('Stopped');
  const [alerts, setAlerts] = useState([]);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [filter, setFilter] = useState({ type: null, value: null });

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const checkConnection = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE}/health`, { timeout: 2000 });
      if (response.data.status === 'healthy') {
        setConnectionStatus('connected');
        return true;
      }
    } catch (error) {
      setConnectionStatus('disconnected');
      return false;
    }
  }, []);

  const fetchAlerts = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE}/alerts`, { timeout: 5000 });
      if (response.data && Array.isArray(response.data)) {
        setAlerts(response.data);
      }
    } catch (error) {
      if (error.code !== 'ECONNABORTED' && connectionStatus === 'connected') {
        setConnectionStatus('disconnected');
      }
    }
  }, [connectionStatus]);

  const fetchDevices = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE}/devices`, { timeout: 5000 });
      if (response.data && Array.isArray(response.data)) {
        setDevices(response.data);
      }
    } catch (error) {
      if (error.code !== 'ECONNABORTED' && connectionStatus === 'connected') {
        setConnectionStatus('disconnected');
      }
    }
  }, [connectionStatus]);

  useEffect(() => {
    const initialize = async () => {
      const connected = await checkConnection();
      if (connected) {
        await Promise.all([fetchAlerts(), fetchDevices()]);
      }
      setLoading(false);
    };

    initialize();

    const interval = setInterval(async () => {
      const connected = await checkConnection();
      if (connected) {
        await Promise.all([fetchAlerts(), fetchDevices()]);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [checkConnection, fetchAlerts, fetchDevices]);

  const handleQuarantine = async (srcIp, deviceName) => {
    if (!window.confirm(`Are you sure you want to quarantine ${deviceName || srcIp}?`)) {
      return;
    }

    try {
      const response = await axios.post(`${API_BASE}/quarantine`, 
        { src: srcIp }, 
        { timeout: 5000 }
      );
      
      if (response.data.status === 'success') {
        showToast(`Device ${srcIp} quarantined successfully`, 'success');
        await Promise.all([fetchDevices(), fetchAlerts()]);
      }
    } catch (error) {
      showToast('Failed to quarantine device. Please check backend connection.', 'error');
    }
  };

  const handleStartDemo = async () => {
    try {
      const response = await axios.post(`${API_BASE}/start_demo`, {}, { timeout: 5000 });
      if (response.data.status === 'success') {
        setDemoStatus('Running');
        showToast('Demo started successfully', 'success');
      }
    } catch (error) {
      setDemoStatus('Running');
      showToast('Demo started (offline mode)', 'info');
    }
  };

  const handleStopDemo = async () => {
    try {
      await axios.post(`${API_BASE}/stop_demo`, {}, { timeout: 5000 });
    } catch (error) {
      // Ignore errors
    }
    setDemoStatus('Stopped');
    showToast('Demo stopped', 'info');
  };

  const handleRunAttack = async () => {
    try {
      const response = await axios.post(`${API_BASE}/run_attack`, {}, { timeout: 5000 });
      showToast(`Attack simulation triggered: ${response.data.message || 'Attack running'}`, 'warning');
      setTimeout(() => fetchAlerts(), 1000);
    } catch (error) {
      showToast('Attack simulation triggered (offline mode)', 'warning');
    }
  };

  const handleStatClick = useCallback((filterType, filterValue) => {
    setFilter({ type: filterType, value: filterValue });
    setTimeout(() => {
      document.querySelector('.alerts-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }, []);

  const handleFilterClear = useCallback(() => {
    setFilter({ type: null, value: null });
  }, []);

  const stats = useMemo(() => ({
    totalAlerts: alerts.length,
    criticalAlerts: alerts.filter(a => (a.anomaly_score || a.score || 0) > 0.8).length,
    quarantinedDevices: devices.filter(d => d.status === 'Quarantined').length,
    totalDevices: devices.length
  }), [alerts, devices]);

  const filteredAlerts = useMemo(() => {
    if (!filter.type) return alerts;
    
    switch (filter.type) {
      case 'critical':
        return alerts.filter(a => (a.anomaly_score || a.score || 0) > 0.8);
      case 'quarantined':
        const quarantinedIPs = devices.filter(d => d.status === 'Quarantined').map(d => d.ip);
        return alerts.filter(a => quarantinedIPs.includes(a.src_ip));
      default:
        return alerts;
    }
  }, [alerts, filter, devices]);

  const primaryAlert = alerts[0] || null;

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader"></div>
        <p>Initializing IoT Intrusion Detection System...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <div className="page-header">
        <div className="header-content">
          <div className="header-left">
            <h1>Dashboard Overview</h1>
            <p className="page-subtitle">Real-time monitoring and threat detection</p>
          </div>
          <div className="header-right">
            <div className={`connection-status status-${connectionStatus}`}>
              <span className="status-dot"></span>
              {connectionStatus === 'connected' ? 'Connected' : 
               connectionStatus === 'connecting' ? 'Connecting...' : 'Disconnected'}
            </div>
            <div className="status-badge">
              <span className="status-label">System:</span>
              <span className={`status-value status-${demoStatus.toLowerCase()}`}>
                {demoStatus === 'Running' ? '🟢 Active' : '⚫ Stopped'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="page-content">
        <StatsCards 
          stats={stats} 
          alerts={alerts} 
          onStatClick={handleStatClick}
          activeFilter={filter.type}
        />
        
        {filter.type && (
          <div className="filter-banner">
            <span>Filtered by: <strong>{filter.type === 'critical' ? 'Critical Alerts' : 'Quarantined Devices'}</strong></span>
            <button onClick={handleFilterClear} className="btn-clear-filter">✕ Clear Filter</button>
          </div>
        )}
        
        <div className="panels-container">
          <div className="panel alerts-panel">
            <div className="panel-header">
              <h2>🚨 Live Alerts</h2>
              <span className="badge">{filteredAlerts.length}</span>
            </div>
            <Alerts alerts={filteredAlerts} onQuarantine={handleQuarantine} />
          </div>

          <div className="panel devices-panel">
            <div className="panel-header">
              <h2>📱 Device List</h2>
              <span className="badge">{devices.length}</span>
            </div>
            <Devices devices={devices} onDeviceClick={handleStatClick} />
          </div>
        </div>

        <div className="panel graph-panel">
          <div className="panel-header">
            <h2>📊 Alert Analytics (Last 30 Minutes)</h2>
          </div>
          <AlertChart alerts={alerts} />
        </div>

        <div className="control-panel">
          <button 
            onClick={demoStatus === 'Running' ? handleStopDemo : handleStartDemo} 
            className={`btn btn-${demoStatus === 'Running' ? 'danger' : 'primary'}`}
          >
            {demoStatus === 'Running' ? '⏹ Stop Demo' : '▶ Start Demo'}
          </button>
          <button onClick={handleRunAttack} className="btn btn-secondary">
            ⚡ Run Attack Simulation
          </button>
        </div>
      </div>
      <ChatWidget alert={primaryAlert} />
    </div>
  );
}

export default Dashboard;




