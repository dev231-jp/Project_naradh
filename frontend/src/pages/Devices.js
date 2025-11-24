import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Devices from '../components/Devices';
import Toast from '../components/Toast';
import './Devices.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function DevicesPage() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchDevices = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE}/devices`, { timeout: 5000 });
      if (response.data && Array.isArray(response.data)) {
        setDevices(response.data);
      }
    } catch (error) {
      showToast('Failed to fetch devices', 'error');
    }
  }, []);

  useEffect(() => {
    fetchDevices();
    setLoading(false);

    const interval = setInterval(fetchDevices, 3000);
    return () => clearInterval(interval);
  }, [fetchDevices]);

  const handleQuarantine = async (ip) => {
    if (!window.confirm(`Are you sure you want to quarantine device ${ip}?`)) {
      return;
    }

    try {
      const response = await axios.post(`${API_BASE}/quarantine`, 
        { src: ip }, 
        { timeout: 5000 }
      );
      
      if (response.data.status === 'success') {
        showToast(`Device ${ip} quarantined successfully`, 'success');
        await fetchDevices();
      }
    } catch (error) {
      showToast('Failed to quarantine device', 'error');
    }
  };

  const handleUnquarantine = async (ip) => {
    try {
      const response = await axios.post(`${API_BASE}/unquarantine`, 
        { src: ip }, 
        { timeout: 5000 }
      );
      
      if (response.data.status === 'success') {
        showToast(`Device ${ip} unquarantined successfully`, 'success');
        await fetchDevices();
      }
    } catch (error) {
      showToast('Failed to unquarantine device', 'error');
    }
  };

  const filteredDevices = devices.filter(device => {
    const matchesFilter = filter === 'all' || 
      (filter === 'quarantined' && device.status === 'Quarantined') ||
      (filter === 'healthy' && device.status === 'OK');
    
    const matchesSearch = !searchTerm || 
      device.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.ip?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const stats = {
    total: devices.length,
    healthy: devices.filter(d => d.status === 'OK').length,
    quarantined: devices.filter(d => d.status === 'Quarantined').length,
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader"></div>
        <p>Loading devices...</p>
      </div>
    );
  }

  return (
    <div className="devices-page">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <div className="page-header">
        <div className="header-content">
          <div className="header-left">
            <h1>📱 Device Management</h1>
            <p className="page-subtitle">Monitor and manage IoT devices on your network</p>
          </div>
          <div className="header-right">
            <div className="device-stats">
              <div className="stat-item">
                <span className="stat-value">{stats.total}</span>
                <span className="stat-label">Total</span>
              </div>
              <div className="stat-item healthy">
                <span className="stat-value">{stats.healthy}</span>
                <span className="stat-label">Healthy</span>
              </div>
              <div className="stat-item quarantined">
                <span className="stat-value">{stats.quarantined}</span>
                <span className="stat-label">Quarantined</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="page-content">
        <div className="filters-section">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search by device name or IP address..."
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
              All ({stats.total})
            </button>
            <button 
              className={`filter-btn ${filter === 'healthy' ? 'active' : ''}`}
              onClick={() => setFilter('healthy')}
            >
              Healthy ({stats.healthy})
            </button>
            <button 
              className={`filter-btn ${filter === 'quarantined' ? 'active' : ''}`}
              onClick={() => setFilter('quarantined')}
            >
              Quarantined ({stats.quarantined})
            </button>
          </div>
        </div>

        <div className="panel devices-panel-full">
          <div className="panel-header">
            <h2>Device List</h2>
            <span className="badge">{filteredDevices.length} devices</span>
          </div>
          <Devices 
            devices={filteredDevices} 
            onDeviceClick={() => {}}
            onQuarantine={handleQuarantine}
            onUnquarantine={handleUnquarantine}
          />
        </div>
      </div>
    </div>
  );
}

export default DevicesPage;




