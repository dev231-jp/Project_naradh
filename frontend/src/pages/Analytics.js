import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import AlertChart from '../components/AlertChart';
import Toast from '../components/Toast';
import './Analytics.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function Analytics() {
  const [alerts, setAlerts] = useState([]);
  const [devices, setDevices] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [timeRange, setTimeRange] = useState('24h');

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchData = useCallback(async () => {
    try {
      const [alertsRes, devicesRes, statsRes] = await Promise.all([
        axios.get(`${API_BASE}/alerts`, { timeout: 5000 }),
        axios.get(`${API_BASE}/devices`, { timeout: 5000 }),
        axios.get(`${API_BASE}/stats`, { timeout: 5000 })
      ]);

      if (alertsRes.data && Array.isArray(alertsRes.data)) {
        setAlerts(alertsRes.data);
      }
      if (devicesRes.data && Array.isArray(devicesRes.data)) {
        setDevices(devicesRes.data);
      }
      if (statsRes.data) {
        setStats(statsRes.data);
      }
    } catch (error) {
      showToast('Failed to fetch analytics data', 'error');
    }
  }, []);

  useEffect(() => {
    fetchData();
    setLoading(false);

    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const threatDistribution = alerts.reduce((acc, alert) => {
    const score = alert.anomaly_score || alert.score || 0;
    if (score > 0.8) acc.critical++;
    else if (score > 0.5) acc.high++;
    else acc.low++;
    return acc;
  }, { critical: 0, high: 0, low: 0 });

  const topThreatSources = alerts
    .reduce((acc, alert) => {
      const ip = alert.src_ip;
      if (!acc[ip]) acc[ip] = { ip, count: 0, avgScore: 0, scores: [] };
      acc[ip].count++;
      acc[ip].scores.push(alert.anomaly_score || alert.score || 0);
      return acc;
    }, {})
    .valueOf();

  const topSources = Object.values(topThreatSources)
    .map(item => ({
      ...item,
      avgScore: item.scores.reduce((a, b) => a + b, 0) / item.scores.length
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader"></div>
        <p>Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="analytics-page">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <div className="page-header">
        <div className="header-content">
          <div className="header-left">
            <h1>📈 Analytics & Reports</h1>
            <p className="page-subtitle">Comprehensive threat analysis and insights</p>
          </div>
          <div className="header-right">
            <div className="time-range-selector">
              <button 
                className={`time-btn ${timeRange === '24h' ? 'active' : ''}`}
                onClick={() => setTimeRange('24h')}
              >
                24H
              </button>
              <button 
                className={`time-btn ${timeRange === '7d' ? 'active' : ''}`}
                onClick={() => setTimeRange('7d')}
              >
                7D
              </button>
              <button 
                className={`time-btn ${timeRange === '30d' ? 'active' : ''}`}
                onClick={() => setTimeRange('30d')}
              >
                30D
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="page-content">
        <div className="analytics-grid">
          <div className="analytics-card stat-card">
            <div className="card-header">
              <h3>System Statistics</h3>
            </div>
            <div className="card-content">
              {stats ? (
                <div className="stats-grid">
                  <div className="stat-item">
                    <span className="stat-label">Total Alerts</span>
                    <span className="stat-value">{stats.total_alerts}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Critical Alerts</span>
                    <span className="stat-value critical">{stats.critical_alerts}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">High Alerts</span>
                    <span className="stat-value high">{stats.high_alerts}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Quarantined Devices</span>
                    <span className="stat-value">{stats.quarantined_devices}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Total Devices</span>
                    <span className="stat-value">{stats.total_devices}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Avg Threat Score</span>
                    <span className="stat-value">{stats.avg_threat_score?.toFixed(2) || '0.00'}</span>
                  </div>
                </div>
              ) : (
                <p>No statistics available</p>
              )}
            </div>
          </div>

          <div className="analytics-card chart-card">
            <div className="card-header">
              <h3>Alert Timeline</h3>
            </div>
            <div className="card-content">
              <AlertChart alerts={alerts} />
            </div>
          </div>

          <div className="analytics-card distribution-card">
            <div className="card-header">
              <h3>Threat Distribution</h3>
            </div>
            <div className="card-content">
              <div className="distribution-chart">
                <div className="dist-item critical">
                  <div className="dist-bar">
                    <div 
                      className="dist-fill" 
                      style={{ width: `${(threatDistribution.critical / alerts.length) * 100 || 0}%` }}
                    ></div>
                  </div>
                  <div className="dist-info">
                    <span className="dist-label">Critical</span>
                    <span className="dist-value">{threatDistribution.critical}</span>
                  </div>
                </div>
                <div className="dist-item high">
                  <div className="dist-bar">
                    <div 
                      className="dist-fill" 
                      style={{ width: `${(threatDistribution.high / alerts.length) * 100 || 0}%` }}
                    ></div>
                  </div>
                  <div className="dist-info">
                    <span className="dist-label">High</span>
                    <span className="dist-value">{threatDistribution.high}</span>
                  </div>
                </div>
                <div className="dist-item low">
                  <div className="dist-bar">
                    <div 
                      className="dist-fill" 
                      style={{ width: `${(threatDistribution.low / alerts.length) * 100 || 0}%` }}
                    ></div>
                  </div>
                  <div className="dist-info">
                    <span className="dist-label">Low</span>
                    <span className="dist-value">{threatDistribution.low}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="analytics-card sources-card">
            <div className="card-header">
              <h3>Top Threat Sources</h3>
            </div>
            <div className="card-content">
              <div className="sources-list">
                {topSources.length > 0 ? (
                  topSources.map((source, idx) => (
                    <div key={source.ip} className="source-item">
                      <div className="source-rank">#{idx + 1}</div>
                      <div className="source-details">
                        <div className="source-ip">{source.ip}</div>
                        <div className="source-meta">
                          <span>{source.count} alerts</span>
                          <span>Avg: {(source.avgScore * 100).toFixed(1)}%</span>
                        </div>
                      </div>
                      <div className="source-score">
                        <div className="score-bar">
                          <div 
                            className="score-fill" 
                            style={{ width: `${source.avgScore * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="no-data">No threat sources detected</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Analytics;




