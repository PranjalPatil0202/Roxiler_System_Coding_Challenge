import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { formatRoleLabel, getInitials } from '../../utils/formatters';
import {
  Store,
  LayoutDashboard,
  Users,
  ShoppingBag,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Star,
  Settings,
  User,
  LogOut,
} from 'lucide-react';

import LogoutConfirmModal from './LogoutConfirmModal';

const Sidebar = ({ isCollapsed, onToggleCollapse, isMobileOpen = false, onCloseMobile }) => {
  const { user, role } = useAuth();
  const location = useLocation();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const isActive = (path) => location.pathname === path;

  // Navigation configurations per role
  const getNavItems = () => {
    if (role === 'admin') {
      return [
        {
          label: 'Dashboard',
          path: '/admin/dashboard',
          icon: LayoutDashboard,
        },
        {
          label: 'Users Directory',
          path: '/admin/users',
          icon: Users,
        },
        {
          label: 'Stores Directory',
          path: '/admin/stores',
          icon: Store,
        },
      ];
    }

    if (role === 'store_owner') {
      return [
        {
          label: 'Dashboard',
          path: '/owner/dashboard',
          icon: LayoutDashboard,
        },
        {
          label: 'Security',
          path: '/owner/settings',
          icon: ShieldCheck,
        },
      ];
    }

    // normal_user
    return [
      {
        label: 'Browse Stores',
        path: '/stores',
        icon: ShoppingBag,
      },
      {
        label: 'My Account & Ratings',
        path: '/user/profile',
        icon: User,
      },
    ];
  };

  const navItems = getNavItems();

  return (
    <>
      <aside className={`dashboard-sidebar ${isCollapsed ? 'is-collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}>
      {/* Brand Header */}
      <div className="sidebar-header">
        <Link to="/" className="sidebar-brand-link" onClick={onCloseMobile}>
          <div className="sidebar-brand-icon">
            <Store size={22} />
          </div>
          {!isCollapsed && (
            <div className="sidebar-brand-text">
              <span className="sidebar-brand-name">StorePulse</span>
            </div>
          )}
        </Link>
      </div>

      {/* Server System Status Indicator */}
      {!isCollapsed && (
        <div style={{ padding: '0 1rem 0.75rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.45rem 0.65rem',
              backgroundColor: 'var(--bg-surface-subtle)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              fontSize: '0.725rem',
              color: 'var(--text-secondary)',
            }}
          >
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: 'var(--success)',
                boxShadow: '0 0 0 2px var(--success-bg), 0 0 8px var(--success)',
                flexShrink: 0,
              }}
            />
            <span>Server Status: <strong style={{ color: 'var(--success)' }}>Online</strong></span>
          </div>
        </div>
      )}

      {/* Nav Items */}
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-nav-item ${active ? 'active' : ''}`}
              title={isCollapsed ? item.label : undefined}
              onClick={onCloseMobile}
            >
              <Icon size={20} />
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          );
        })}

        {/* Direct Logout Option in Sidebar */}
        <button
          onClick={handleLogout}
          className="sidebar-logout-btn"
          title={isCollapsed ? 'Log Out' : undefined}
        >
          <LogOut size={20} />
          {!isCollapsed && <span>Log Out</span>}
        </button>
      </nav>

      {/* User Profile Footer & Collapse Toggle */}
      <div className="sidebar-footer">
        {user && (
          <Link
            to={role === 'admin' ? '/admin/dashboard' : role === 'store_owner' ? '/owner/settings' : '/user/profile'}
            className="sidebar-user-card"
            title={`${user.name || 'User'} (${formatRoleLabel(role)})`}
            onClick={onCloseMobile}
          >
            <div className={`table-avatar avatar-${role} sidebar-user-avatar`}>
              {getInitials(user?.name)}
            </div>
            {!isCollapsed && (
              <div className="sidebar-user-details">
                <span className="sidebar-user-name" title={user.name}>
                  {user.name}
                </span>
                <span className={`sidebar-role-pill role-${role}`}>
                  {formatRoleLabel(role)}
                </span>
              </div>
            )}
          </Link>
        )}

        <button
          className="sidebar-collapse-btn"
          onClick={onToggleCollapse}
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          aria-label={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={16} />}
          {!isCollapsed && <span>Collapse Sidebar</span>}
        </button>
      </div>
    </aside>

    {/* Mobile Backdrop Overlay */}
    {isMobileOpen && (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.55)',
          backdropFilter: 'blur(3px)',
          zIndex: 85,
        }}
        onClick={onCloseMobile}
        aria-label="Close navigation overlay"
      />
    )}

    {/* Logout Confirmation Modal */}
    <LogoutConfirmModal
      isOpen={showLogoutModal}
      onClose={() => setShowLogoutModal(false)}
    />
  </>
);
};

export default Sidebar;
