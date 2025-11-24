import React, { useState } from 'react';
import Toast from '../components/Toast';
import './Settings.css';

function Settings() {
  const [settings, setSettings] = useState({
    alertThreshold: 0.7,
    autoQuarantine: false,
    notificationEnabled: true,
    refreshInterval: 3000,
    demoMode: false
  });
  const [toast, setToast] = useState(null);
  const [saving, setSaving] = useState(false);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      showToast('Settings saved successfully', 'success');
    } catch (error) {
      showToast('Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all settings to default?')) {
      setSettings({
        alertThreshold: 0.7,
        autoQuarantine: false,
        notificationEnabled: true,
        refreshInterval: 3000,
        demoMode: false
      });
      showToast('Settings reset to default', 'info');
    }
  };

  return (
    <div className="settings-page">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <div className="page-header">
        <div className="header-content">
          <div className="header-left">
            <h1>⚙️ Settings</h1>
            <p className="page-subtitle">Configure system preferences and security policies</p>
          </div>
        </div>
      </div>

      <div className="page-content">
        <div className="settings-container">
          <div className="settings-section">
            <h2 className="section-title">Detection Settings</h2>
            <div className="setting-item">
              <div className="setting-info">
                <label className="setting-label">Alert Threshold</label>
                <p className="setting-description">
                  Minimum anomaly score (0.0 - 1.0) required to trigger an alert
                </p>
              </div>
              <div className="setting-control">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={settings.alertThreshold}
                  onChange={(e) => handleChange('alertThreshold', parseFloat(e.target.value))}
                  className="slider"
                />
                <span className="slider-value">{settings.alertThreshold.toFixed(1)}</span>
              </div>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <label className="setting-label">Auto Quarantine</label>
                <p className="setting-description">
                  Automatically quarantine devices when threat score exceeds critical threshold
                </p>
              </div>
              <div className="setting-control">
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.autoQuarantine}
                    onChange={(e) => handleChange('autoQuarantine', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
          </div>

          <div className="settings-section">
            <h2 className="section-title">System Settings</h2>
            <div className="setting-item">
              <div className="setting-info">
                <label className="setting-label">Notifications</label>
                <p className="setting-description">
                  Enable desktop and browser notifications for critical alerts
                </p>
              </div>
              <div className="setting-control">
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.notificationEnabled}
                    onChange={(e) => handleChange('notificationEnabled', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <label className="setting-label">Refresh Interval</label>
                <p className="setting-description">
                  How often the dashboard updates data (in milliseconds)
                </p>
              </div>
              <div className="setting-control">
                <select
                  value={settings.refreshInterval}
                  onChange={(e) => handleChange('refreshInterval', parseInt(e.target.value))}
                  className="select-input"
                >
                  <option value={1000}>1 second</option>
                  <option value={3000}>3 seconds</option>
                  <option value={5000}>5 seconds</option>
                  <option value={10000}>10 seconds</option>
                </select>
              </div>
            </div>
          </div>

          <div className="settings-section">
            <h2 className="section-title">Demo Mode</h2>
            <div className="setting-item">
              <div className="setting-info">
                <label className="setting-label">Enable Demo Mode</label>
                <p className="setting-description">
                  Generate simulated alerts for testing and demonstration purposes
                </p>
              </div>
              <div className="setting-control">
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.demoMode}
                    onChange={(e) => handleChange('demoMode', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
          </div>

          <div className="settings-actions">
            <button 
              onClick={handleSave} 
              className="btn btn-primary"
              disabled={saving}
            >
              {saving ? 'Saving...' : '💾 Save Settings'}
            </button>
            <button 
              onClick={handleReset} 
              className="btn btn-secondary"
            >
              🔄 Reset to Default
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;

