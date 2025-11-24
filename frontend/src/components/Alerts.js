import React, { useMemo } from 'react';
import './Alerts.css';

function Alerts({ alerts, onQuarantine }) {
  const sortedAlerts = useMemo(() => {
    return [...alerts].sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      return timeB - timeA;
    });
  }, [alerts]);

  const formatTime = (timestamp) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString('en-US', { 
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch {
      return 'Invalid time';
    }
  };

  const formatDeviation = (value, baseline) => {
    if (baseline === undefined || baseline === null || baseline === 0) {
      return 'N/A';
    }
    const diff = value - baseline;
    const pct = ((diff / baseline) * 100).toFixed(1);
    return `${diff > 0 ? '+' : ''}${pct}%`;
  };

  const getScoreLevel = (score) => {
    if (score > 0.8) return 'critical';
    if (score > 0.5) return 'high';
    if (score > 0.3) return 'medium';
    return 'low';
  };

  if (!sortedAlerts || sortedAlerts.length === 0) {
    return (
      <div className="no-data">
        <div className="no-data-icon">✓</div>
        <p>No alerts detected</p>
        <span className="no-data-subtitle">All systems operating normally</span>
      </div>
    );
  }

  return (
    <div className="alerts-list">
      {sortedAlerts.map((alert, idx) => {
        const score = alert.anomaly_score || alert.score || 0;
        const scoreLevel = getScoreLevel(score);
        
        return (
          <div key={idx} className={`alert-item alert-${scoreLevel}`}>
            <div className="alert-header">
              <div className="alert-time-wrapper">
                <span className="alert-time">{formatTime(alert.timestamp)}</span>
                <span className="alert-id">#{idx + 1}</span>
              </div>
              <div className={`alert-score score-${scoreLevel}`}>
                <span className="score-label">Threat</span>
                <span className="score-value">{score.toFixed(3)}</span>
              </div>
            </div>
            
            <div className="alert-ips">
              <div className="ip-group">
                <span className="ip-label">Source</span>
                <code className="ip-value">{alert.src_ip}</code>
              </div>
              <div className="ip-separator">→</div>
              <div className="ip-group">
                <span className="ip-label">Destination</span>
                <code className="ip-value">{alert.dst_ip}</code>
              </div>
            </div>

            {alert.top_features && alert.top_features.length > 0 && (
              <div className="alert-features">
                <strong className="features-title">🔍 Anomalous Features:</strong>
                <div className="features-grid">
                  {alert.top_features.slice(0, 3).map((feature, fIdx) => (
                    <div key={fIdx} className="feature-item">
                      <code className="feature-name">{feature.name}</code>
                      <div className="feature-details">
                        <span className="feature-value">{typeof feature.value === 'number' ? feature.value.toFixed(2) : feature.value}</span>
                        <span className="feature-deviation">
                          ({formatDeviation(feature.value, feature.baseline)})
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button 
              className={`btn-quarantine btn-quarantine-${scoreLevel}`}
              onClick={() => onQuarantine(alert.src_ip, alert.device_name)}
              disabled={score < 0.5}
            >
              {score >= 0.5 ? '🔒 QUARANTINE' : '⚠ Monitor'}
            </button>
          </div>
        );
      })}
    </div>
  );
}

export default Alerts;





