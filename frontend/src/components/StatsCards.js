import React, { useMemo, useCallback } from 'react';
import './StatsCards.css';

function StatsCards({ stats, alerts, onStatClick, activeFilter }) {
  const avgScore = useMemo(() => {
    if (alerts.length === 0) return '0.00';
    const sum = alerts.reduce((acc, a) => acc + (a.anomaly_score || a.score || 0), 0);
    return (sum / alerts.length).toFixed(2);
  }, [alerts]);

  const handleClick = useCallback((filterType, filterValue) => {
    if (onStatClick) {
      onStatClick(filterType, filterValue);
    }
  }, [onStatClick]);

  return (
    <div className="stats-container">
      <div 
        className={`stat-card stat-primary ${activeFilter === 'all' ? 'active' : ''}`}
        onClick={() => handleClick(null, null)}
        role="button"
        tabIndex={0}
        onKeyPress={(e) => e.key === 'Enter' && handleClick(null, null)}
      >
        <div className="stat-icon">🚨</div>
        <div className="stat-content">
          <div className="stat-value">{stats.totalAlerts}</div>
          <div className="stat-label">Total Alerts</div>
        </div>
        <div className="stat-action">Click to view all</div>
      </div>

      <div 
        className={`stat-card stat-danger ${activeFilter === 'critical' ? 'active' : ''}`}
        onClick={() => handleClick('critical', 'high')}
        role="button"
        tabIndex={0}
        onKeyPress={(e) => e.key === 'Enter' && handleClick('critical', 'high')}
      >
        <div className="stat-icon">⚡</div>
        <div className="stat-content">
          <div className="stat-value">{stats.criticalAlerts}</div>
          <div className="stat-label">Critical Alerts</div>
        </div>
        <div className="stat-action">Click to filter</div>
      </div>

      <div 
        className={`stat-card stat-warning ${activeFilter === 'quarantined' ? 'active' : ''}`}
        onClick={() => handleClick('quarantined', 'quarantined')}
        role="button"
        tabIndex={0}
        onKeyPress={(e) => e.key === 'Enter' && handleClick('quarantined', 'quarantined')}
      >
        <div className="stat-icon">🔒</div>
        <div className="stat-content">
          <div className="stat-value">{stats.quarantinedDevices}</div>
          <div className="stat-label">Quarantined</div>
        </div>
        <div className="stat-action">Click to view</div>
      </div>

      <div 
        className={`stat-card stat-info ${activeFilter === 'devices' ? 'active' : ''}`}
        onClick={() => handleClick('devices', 'all')}
        role="button"
        tabIndex={0}
        onKeyPress={(e) => e.key === 'Enter' && handleClick('devices', 'all')}
      >
        <div className="stat-icon">📱</div>
        <div className="stat-content">
          <div className="stat-value">{stats.totalDevices}</div>
          <div className="stat-label">Total Devices</div>
        </div>
        <div className="stat-action">Click to view</div>
      </div>

      <div 
        className={`stat-card stat-success ${activeFilter === 'score' ? 'active' : ''}`}
        onClick={() => handleClick('score', avgScore)}
        role="button"
        tabIndex={0}
        onKeyPress={(e) => e.key === 'Enter' && handleClick('score', avgScore)}
      >
        <div className="stat-icon">📊</div>
        <div className="stat-content">
          <div className="stat-value">{avgScore}</div>
          <div className="stat-label">Avg Threat Score</div>
        </div>
        <div className="stat-action">Click to analyze</div>
      </div>
    </div>
  );
}

export default StatsCards;
