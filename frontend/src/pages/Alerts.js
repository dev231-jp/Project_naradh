import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Alerts from '../components/Alerts';
import Toast from '../components/Toast';
import './Alerts.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function AlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchAlerts = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE}/alerts`, { timeout: 5000 });
      if (response.data && Array.isArray(response.data)) {
        setAlerts(response.data);
      }
    } catch (error) {
      showToast('Failed to fetch alerts', 'error');
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
    setLoading(false);

    const interval = setInterval(fetchAlerts, 3000);
    return () => clearInterval(interval);
  }, [fetchAlerts]);

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
        await fetchAlerts();
      }
    } catch (error) {
      showToast('Failed to quarantine device', 'error');
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    const matchesFilter = filter === 'all' || 
      (filter === 'critical' && (alert.anomaly_score || alert.score || 0) > 0.8) ||
      (filter === 'high' && 0.5 < (alert.anomaly_score || alert.score || 0) <= 0.8) ||
      (filter === 'low' && (alert.anomaly_score || alert.score || 0) <= 0.5);
    
    const matchesSearch = !searchTerm || 
      alert.src_ip?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.dst_ip?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.device_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader"></div>
        <p>Loading alerts...</p>
      </div>
    );
  }

  return (
    <div className="alerts-page">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <div className="page-header">
        <div className="header-content">
          <div className="header-left">
            <h1>🚨 Security Alerts</h1>
            <p className="page-subtitle">Monitor and manage intrusion detection alerts</p>
          </div>
          <div className="header-right">
            <div className="alert-count-badge">
              <span className="count-label">Total Alerts</span>
              <span className="count-value">{alerts.length}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="page-content">
        <div className="filters-section">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search by IP address or device name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="filter-buttons">
            <button 
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All ({alerts.length})
            </button>
            <button 
              className={`filter-btn ${filter === 'critical' ? 'active' : ''}`}
              onClick={() => setFilter('critical')}
            >
              Critical ({alerts.filter(a => (a.anomaly_score || a.score || 0) > 0.8).length})
            </button>
            <button 
              className={`filter-btn ${filter === 'high' ? 'active' : ''}`}
              onClick={() => setFilter('high')}
            >
              High ({alerts.filter(a => 0.5 < (a.anomaly_score || a.score || 0) <= 0.8).length})
            </button>
            <button 
              className={`filter-btn ${filter === 'low' ? 'active' : ''}`}
              onClick={() => setFilter('low')}
            >
              Low ({alerts.filter(a => (a.anomaly_score || a.score || 0) <= 0.5).length})
            </button>
          </div>
        </div>

        <div className="panel alerts-panel-full">
          <div className="panel-header">
            <h2>Alert Details</h2>
            <span className="badge">{filteredAlerts.length} filtered</span>
          </div>
          <Alerts alerts={filteredAlerts} onQuarantine={handleQuarantine} />
        </div>
      </div>
    </div>
  );
}

export default AlertsPage;




