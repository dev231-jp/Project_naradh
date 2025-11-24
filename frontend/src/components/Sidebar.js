import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';

function Sidebar() {
  const location = useLocation();

  const menuItems = [
    { path: '/', icon: '📊', label: 'Dashboard', exact: true },
    { path: '/alerts', icon: '🚨', label: 'Alerts' },
    { path: '/devices', icon: '📱', label: 'Devices' },
    { path: '/analytics', icon: '📈', label: 'Analytics' },
    { path: '/network', icon: '🌐', label: 'Network Topology' },
    { path: '/settings', icon: '⚙️', label: 'Settings' },
  ];

  const isActive = (path, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <span className="logo-icon">🛡️</span>
          <div className="logo-text">
            <h2>EdgeGuard</h2>
            <p>IoT Security</p>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <ul className="nav-menu">
          {menuItems.map((item) => (
            <li key={item.path} className="nav-item">
              <Link
                to={item.path}
                className={`nav-link ${isActive(item.path, item.exact) ? 'active' : ''}`}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
                {isActive(item.path, item.exact) && <span className="nav-indicator"></span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-status">
          <div className="status-indicator"></div>
          <span>System Active</span>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;




