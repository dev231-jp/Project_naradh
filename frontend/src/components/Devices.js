import React, { useMemo } from 'react';
import './Devices.css';

function Devices({ devices, onDeviceClick, onQuarantine, onUnquarantine }) {
  const sortedDevices = useMemo(() => {
    return [...devices].sort((a, b) => {
      if (a.status === 'Quarantined' && b.status !== 'Quarantined') return -1;
      if (a.status !== 'Quarantined' && b.status === 'Quarantined') return 1;
      return 0;
    });
  }, [devices]);

  const formatTime = (timestamp) => {
    if (!timestamp) return 'Never';
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'Invalid time';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'quarantined':
        return '🔒';
      case 'ok':
        return '✓';
      default:
        return '○';
    }
  };

  if (!sortedDevices || sortedDevices.length === 0) {
    return (
      <div className="no-data">
        <div className="no-data-icon">📱</div>
        <p>No devices found</p>
        <span className="no-data-subtitle">Devices will appear here when detected</span>
      </div>
    );
  }

  return (
    <div className="devices-list">
      {sortedDevices.map((device, idx) => {
        const status = device.status || 'OK';
        const isQuarantined = status.toLowerCase() === 'quarantined';
        
        return (
          <div 
            key={idx} 
            className={`device-item ${isQuarantined ? 'device-quarantined' : ''}`}
            onClick={() => {
              if (onDeviceClick && isQuarantined) {
                onDeviceClick('quarantined', device.ip);
              }
            }}
            role={isQuarantined ? "button" : undefined}
            tabIndex={isQuarantined ? 0 : undefined}
            onKeyPress={(e) => {
              if (isQuarantined && e.key === 'Enter' && onDeviceClick) {
                onDeviceClick('quarantined', device.ip);
              }
            }}
          >
            <div className="device-main">
              <div className="device-icon">{getStatusIcon(status)}</div>
              <div className="device-info">
                <div className="device-name-row">
                  <strong className="device-name">{device.name || 'Unknown Device'}</strong>
                  {device.ip && device.name && (
                    <span className="device-ip">{device.ip}</span>
                  )}
                </div>
                <div className="device-meta">
                  <span className="device-time">
                    <span className="meta-icon">🕐</span>
                    {formatTime(device.last_seen)}
                  </span>
                  {!device.ip || !device.name ? (
                    <code className="device-ip-solo">{device.ip || 'No IP'}</code>
                  ) : null}
                </div>
              </div>
            </div>
            <div className={`device-status status-${status.toLowerCase()}`}>
              <span className="status-icon">{getStatusIcon(status)}</span>
              <span className="status-text">{status}</span>
            </div>
            {(onQuarantine || onUnquarantine) && (
              <div className="device-actions">
                {isQuarantined ? (
                  <button
                    className="action-btn unquarantine-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onUnquarantine) onUnquarantine(device.ip);
                    }}
                    title="Unquarantine device"
                  >
                    🔓 Release
                  </button>
                ) : (
                  <button
                    className="action-btn quarantine-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onQuarantine) onQuarantine(device.ip, device.name);
                    }}
                    title="Quarantine device"
                  >
                    🔒 Quarantine
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default Devices;

