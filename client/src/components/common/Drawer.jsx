import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

const Drawer = ({
  isOpen = true,
  onClose,
  title,
  subtitle = null,
  children,
  width = '520px',
  footer = null,
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="modal-backdrop drawer-backdrop"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 9999,
        display: 'flex',
        justifyContent: 'flex-end',
        padding: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(3px)',
      }}
    >
      <div
        className="drawer-content elevation-floating"
        style={{
          width: '100%',
          maxWidth: width,
          height: '100vh',
          backgroundColor: '#ffffff',
          borderLeft: '1px solid #E0E7FF',
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideLeft 220ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
      >
        {/* Sticky Drawer Header */}
        <div
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 20,
            backgroundColor: 'var(--bg-card)',
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          <div>
            <h3 id="drawer-title" style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#0F172A', fontFamily: 'var(--font-display, Inter, sans-serif)' }}>
              {title}
            </h3>
            {subtitle && (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', marginTop: '0.2rem', margin: 0 }}>
                {subtitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm modal-close-btn"
            aria-label="Close panel"
            style={{ borderRadius: '8px', padding: '6px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Drawer Body */}
        <div style={{ padding: '1.5rem', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          {children}
        </div>

        {/* Sticky Drawer Optional Footer */}
        {footer && (
          <div
            style={{
              position: 'sticky',
              bottom: 0,
              zIndex: 20,
              padding: '1rem 1.5rem',
              borderTop: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-card)',
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default Drawer;
