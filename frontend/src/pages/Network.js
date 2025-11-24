import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Toast from '../components/Toast';
import './Network.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function Network() {
  const [devices, setDevices] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [selectedDevice, setSelectedDevice] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchData = useCallback(async () => {
    try {
      const [devicesRes, alertsRes] = await Promise.all([
        axios.get(`${API_BASE}/devices`, { timeout: 5000 }),
        axios.get(`${API_BASE}/alerts`, { timeout: 5000 })
      ]);

      if (devicesRes.data && Array.isArray(devicesRes.data)) {
        setDevices(devicesRes.data);
      }
      if (alertsRes.data && Array.isArray(alertsRes.data)) {
        setAlerts(alertsRes.data);
      }
    } catch (error) {
      showToast('Failed to fetch network data', 'error');
    }
  }, []);

  useEffect(() => {
    fetchData();
    setLoading(false);

    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const getDeviceThreatLevel = (device) => {
    const deviceAlerts = alerts.filter(a => a.src_ip === device.ip || a.dst_ip === device.ip);
    const maxScore = deviceAlerts.length > 0 
      ? Math.max(...deviceAlerts.map(a => a.anomaly_score || a.score || 0))
      : 0;
    
    if (device.status === 'Quarantined') return 'quarantined';
    if (maxScore > 0.8) return 'critical';
    if (maxScore > 0.5) return 'warning';
    return 'healthy';
  };

  const getDeviceAlertCount = (device) => {
    return alerts.filter(a => a.src_ip === device.ip || a.dst_ip === device.ip).length;
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader"></div>
        <p>Loading network topology...</p>
      </div>
    );
  }

  return (
    <div className="network-page">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <div className="page-header">
        <div className="header-content">
          <div className="header-left">
            <h1>🌐 Network Topology</h1>
            <p className="page-subtitle">Visual network map and device connections</p>
          </div>
          <div className="header-right">
            <div className="network-stats">
              <div className="network-stat">
                <span className="stat-value">{devices.length}</span>
                <span className="stat-label">Devices</span>
              </div>
              <div className="network-stat">
                <span className="stat-value">{alerts.length}</span>
                <span className="stat-label">Active Alerts</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="page-content">
        <div className="network-container">
          <div className="network-map">
            <div className="topology-view">
              {devices.map((device, index) => {
                const threatLevel = getDeviceThreatLevel(device);
                const alertCount = getDeviceAlertCount(device);
                const angle = (index * 360) / devices.length;
                const radius = 30; // Percentage radius for positioning
                const x = Math.cos((angle * Math.PI) / 180) * radius;
                const y = Math.sin((angle * Math.PI) / 180) * radius;

                return (
                  <div
                    key={device.ip}
                    className={`network-node ${threatLevel} ${selectedDevice?.ip === device.ip ? 'selected' : ''}`}
                    style={{
                      left: `calc(50% + ${x}px)`,
                      top: `calc(50% + ${y}px)`,
                      transform: 'translate(-50%, -50%)'
                    }}
                    onClick={() => setSelectedDevice(device)}
                  >
                    <div className="node-icon">
                      {threatLevel === 'quarantined' ? '🔒' : 
                       threatLevel === 'critical' ? '⚠️' : 
                       threatLevel === 'warning' ? '⚡' : '📱'}
                    </div>
                    <div className="node-label">{device.name || device.ip.split('.').pop()}</div>
                    {alertCount > 0 && (
                      <div className="node-badge">{alertCount}</div>
                    )}
                  </div>
                );
              })}

              {/* Connection lines */}
              {devices.length > 1 && (
                <svg className="connection-line" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
                  {devices.map((device, i) => {
                    if (i === devices.length - 1) return null;
                    const nextDevice = devices[i + 1];
                    const hasAlert = alerts.some(a => 
                      (a.src_ip === device.ip && a.dst_ip === nextDevice.ip) ||
                      (a.dst_ip === device.ip && a.src_ip === nextDevice.ip)
                    );
                    const angle1 = (i * 360) / devices.length;
                    const angle2 = ((i + 1) * 360) / devices.length;
                    const radiusPercent = 30; // Same as device positioning radius
                    const x1 = 50 + (Math.cos((angle1 * Math.PI) / 180) * radiusPercent);
                    const y1 = 50 + (Math.sin((angle1 * Math.PI) / 180) * radiusPercent);
                    const x2 = 50 + (Math.cos((angle2 * Math.PI) / 180) * radiusPercent);
                    const y2 = 50 + (Math.sin((angle2 * Math.PI) / 180) * radiusPercent);
                    
                    return (
                      <line
                        key={`line-${i}`}
                        x1={`${x1}%`}
                        y1={`${y1}%`}
                        x2={`${x2}%`}
                        y2={`${y2}%`}
                        stroke={hasAlert ? '#ef4444' : 'rgba(100, 116, 139, 0.3)'}
                        strokeWidth="2"
                        strokeDasharray={hasAlert ? '5,5' : 'none'}
                      />
                    );
                  })}
                </svg>
              )}
            </div>
          </div>

          <div className="network-sidebar">
            {selectedDevice ? (
              <div className="device-details">
                <div className="details-header">
                  <h3>Device Details</h3>
                  <button className="close-btn" onClick={() => setSelectedDevice(null)}>✕</button>
                </div>
                <div className="details-content">
                  <div className="detail-item">
                    <span className="detail-label">Device Name</span>
                    <span className="detail-value">{selectedDevice.name}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">IP Address</span>
                    <span className="detail-value">{selectedDevice.ip}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Status</span>
                    <span className={`detail-value status-${selectedDevice.status?.toLowerCase()}`}>
                      {selectedDevice.status}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Last Seen</span>
                    <span className="detail-value">
                      {new Date(selectedDevice.last_seen).toLocaleString()}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Threat Level</span>
                    <span className={`detail-value threat-${getDeviceThreatLevel(selectedDevice)}`}>
                      {getDeviceThreatLevel(selectedDevice).toUpperCase()}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Alert Count</span>
                    <span className="detail-value">{getDeviceAlertCount(selectedDevice)}</span>
                  </div>
                </div>
                <div className="device-alerts">
                  <h4>Recent Alerts</h4>
                  <div className="alerts-list">
                    {alerts
                      .filter(a => a.src_ip === selectedDevice.ip || a.dst_ip === selectedDevice.ip)
                      .slice(0, 5)
                      .map((alert, idx) => (
                        <div key={idx} className="alert-item">
                          <span className="alert-time">
                            {new Date(alert.timestamp).toLocaleTimeString()}
                          </span>
                          <span className="alert-score">
                            Score: {(alert.anomaly_score || alert.score || 0).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    {alerts.filter(a => a.src_ip === selectedDevice.ip || a.dst_ip === selectedDevice.ip).length === 0 && (
                      <p className="no-alerts">No alerts for this device</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="network-legend">
                <h3>Legend</h3>
                <div className="legend-items">
                  <div className="legend-item">
                    <div className="legend-color healthy"></div>
                    <span>Healthy Device</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-color warning"></div>
                    <span>Warning</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-color critical"></div>
                    <span>Critical Threat</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-color quarantined"></div>
                    <span>Quarantined</span>
                  </div>
                </div>
                <div className="legend-info">
                  <p>Click on any device node to view detailed information.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Network;

