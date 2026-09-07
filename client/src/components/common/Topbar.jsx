import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { formatRoleLabel, getInitials } from '../../utils/formatters';
import PasswordModal from './PasswordModal';
import LogoutConfirmModal from './LogoutConfirmModal';
import AdminGlobalSearch from '../admin/AdminGlobalSearch';
import {
  Sun,
  Moon,
  LogOut,
  Key,
  ChevronDown,
  ChevronRight,
  Menu,
} from 'lucide-react';

const Topbar = ({ onMobileMenuToggle, onSelectUser }) => {
  const { user, role, logout } = useAuth();
  const { toggleTheme, isDark } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    setDropdownOpen(false);
    setShowLogoutModal(true);
  };

  // Generate dynamic breadcrumb trail
  const getBreadcrumbs = () => {
    const path = location.pathname;
    if (path.startsWith('/admin/dashboard')) {
      return ['Admin', 'Dashboard', 'Analytics'];
    }
    if (path.startsWith('/admin/users')) {
      return ['Admin', 'Directory', 'Users'];
    }
    if (path.startsWith('/admin/stores')) {
      return ['Admin', 'Directory', 'Stores'];
    }
    if (path.startsWith('/owner/dashboard')) {
      return ['Merchant', 'Dashboard', 'Analytics'];
    }
    if (path.startsWith('/owner/settings')) {
      return ['Merchant', 'Settings', 'Account'];
    }
    if (path.startsWith('/stores')) {
      return ['Explore', 'Community', 'Stores'];
    }
    if (path.startsWith('/user/profile')) {
      return ['Account', 'Profile', 'Reviews'];
    }
    return ['Platform', 'Overview'];
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <>
      <header className="dashboard-topbar">
        {/* Left Side: Mobile Trigger & Breadcrumbs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {onMobileMenuToggle && (
            <button
              className="btn btn-ghost btn-sm"
              onClick={onMobileMenuToggle}
              aria-label="Toggle mobile menu"
            >
              <Menu size={20} />
            </button>
          )}

          <div className="breadcrumb-container" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <ChevronRight size={13} style={{ color: 'var(--text-muted)' }} />}
                <span
                  style={{
                    color: idx === breadcrumbs.length - 1 ? 'var(--text-primary)' : 'var(--text-secondary)',
                    fontWeight: idx === breadcrumbs.length - 1 ? 700 : 500,
                  }}
                >
                  {crumb}
                </span>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Center / Right Side: Admin Global Search & Actions */}
        <div className="topbar-right-actions">
          {/* Admin Global Search scoped strictly to admin role */}
          {role === 'admin' && (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <AdminGlobalSearch onSelectUser={onSelectUser} />
            </div>
          )}

          <button
            onClick={toggleTheme}
            className="theme-toggle-btn"
            title={`Switch to ${isDark ? 'Light' : 'Dark'} mode`}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun size={19} /> : <Moon size={19} />}
          </button>

          {user && (
            <div className="user-dropdown-container">
              <button
                className="user-profile-btn elevation-flat"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                aria-expanded={dropdownOpen}
              >
                <div className={`user-avatar ${role ? `avatar-${role}` : ''}`}>
                  {getInitials(user.name)}
                </div>
                <div className="user-meta" style={{ textAlign: 'left' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span className="user-name" style={{ fontWeight: 700 }}>{user.name.split(' ')[0]}</span>
                    <span className={`badge badge-${role}`} style={{ fontSize: '0.65rem', padding: '1px 6px', fontWeight: 800 }}>
                      {role === 'admin' ? 'ADMIN' : formatRoleLabel(role)}
                    </span>
                  </div>
                  <span className="user-email" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.email}</span>
                </div>
                <ChevronDown size={14} className={`chevron ${dropdownOpen ? 'rotated' : ''}`} />
              </button>

              {dropdownOpen && (
                <>
                  <div className="dropdown-backdrop" onClick={() => setDropdownOpen(false)} />
                  <div className="dropdown-menu elevation-floating">
                    <div className="dropdown-user-header">
                      <div className="header-name">{user.name}</div>
                      <div className="header-email">{user.email}</div>
                      <div className={`badge badge-${role} header-badge`}>
                        {formatRoleLabel(role)}
                      </div>
                    </div>

                    <div className="dropdown-divider" />

                    <button
                      className="dropdown-item"
                      onClick={() => {
                        setDropdownOpen(false);
                        setShowPasswordModal(true);
                      }}
                    >
                      <Key size={16} />
                      <span>Change Password</span>
                    </button>

                    <button
                      className="dropdown-item"
                      onClick={() => {
                        toggleTheme();
                      }}
                    >
                      {isDark ? <Sun size={16} /> : <Moon size={16} />}
                      <span>{isDark ? 'Light Theme' : 'Dark Theme'}</span>
                    </button>

                    <div className="dropdown-divider" />

                    <button className="dropdown-item text-danger" onClick={handleLogout}>
                      <LogOut size={16} />
                      <span>Log Out</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <PasswordModal onClose={() => setShowPasswordModal(false)} />
      )}

      {/* Logout Confirmation Modal */}
      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
      />
    </>
  );
};

export default Topbar;
