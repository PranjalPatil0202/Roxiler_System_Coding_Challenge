import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { formatRoleLabel, getInitials } from '../../utils/formatters';
import PasswordModal from './PasswordModal';
import LogoutConfirmModal from './LogoutConfirmModal';
import {
  Sun,
  Moon,
  LogOut,
  Key,
  Store,
  Users,
  LayoutDashboard,
  ShoppingBag,
  ShieldAlert,
  ChevronDown,
} from 'lucide-react';

const Navbar = () => {
  const { user, role } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const location = useLocation();

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    setDropdownOpen(false);
    setShowLogoutModal(true);
  };

  const isActive = (path) => location.pathname === path;

  // Determine role styling class
  const roleClass = role ? `role-${role}` : '';

  return (
    <>
      <header className={`navbar-root ${roleClass}`}>
        <div className="navbar-container">
          {/* Logo / Brand */}
          <div className="nav-brand">
            <Link to="/" className="brand-link">
              <div className="brand-logo">
                <Store size={22} />
              </div>
              <div className="brand-text">
                <span className="brand-title">StorePulse</span>
                {role && (
                  <span className={`badge badge-${role}`}>
                    {formatRoleLabel(role)}
                  </span>
                )}
              </div>
            </Link>
          </div>

          {/* Navigation Links based on role */}
          {user && (
            <nav className="nav-links">
              {role === 'admin' && (
                <>
                  <Link
                    to="/admin/dashboard"
                    className={`nav-item ${isActive('/admin/dashboard') ? 'active' : ''}`}
                  >
                    <LayoutDashboard size={17} />
                    <span>Dashboard</span>
                  </Link>
                  <Link
                    to="/admin/users"
                    className={`nav-item ${isActive('/admin/users') ? 'active' : ''}`}
                  >
                    <Users size={17} />
                    <span>Users</span>
                  </Link>
                  <Link
                    to="/admin/stores"
                    className={`nav-item ${isActive('/admin/stores') ? 'active' : ''}`}
                  >
                    <Store size={17} />
                    <span>Stores</span>
                  </Link>
                </>
              )}

              {role === 'normal_user' && (
                <Link
                  to="/stores"
                  className={`nav-item ${isActive('/stores') ? 'active' : ''}`}
                >
                  <ShoppingBag size={17} />
                  <span>Browse Stores</span>
                </Link>
              )}

              {role === 'store_owner' && (
                <Link
                  to="/owner/dashboard"
                  className={`nav-item ${isActive('/owner/dashboard') ? 'active' : ''}`}
                >
                  <LayoutDashboard size={17} />
                  <span>My Store Dashboard</span>
                </Link>
              )}
            </nav>
          )}

          {/* Right Utilities (Theme Toggle & User Menu) */}
          <div className="nav-actions">
            <button
              onClick={toggleTheme}
              className="theme-toggle-btn"
              title={`Switch to ${isDark ? 'Light' : 'Dark'} mode`}
              aria-label="Toggle theme"
            >
              {isDark ? <Sun size={19} /> : <Moon size={19} />}
            </button>

            {user ? (
              <div className="user-dropdown-container">
                <button
                  className="user-profile-btn"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  aria-expanded={dropdownOpen}
                >
                  <div className="user-avatar">{getInitials(user.name)}</div>
                  <div className="user-meta">
                    <span className="user-name">{user.name}</span>
                    <span className="user-email">{user.email}</span>
                  </div>
                  <ChevronDown size={15} className={`chevron ${dropdownOpen ? 'rotated' : ''}`} />
                </button>

                {dropdownOpen && (
                  <>
                    <div className="dropdown-backdrop" onClick={() => setDropdownOpen(false)} />
                    <div className="dropdown-menu">
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

                      <div className="dropdown-divider" />

                      <button className="dropdown-item text-danger" onClick={handleLogout}>
                        <LogOut size={16} />
                        <span>Log Out</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="guest-actions">
                <Link to="/login" className="btn btn-ghost btn-sm">
                  Log In
                </Link>
                <Link to="/signup" className="btn btn-primary btn-sm">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
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

export default Navbar;
