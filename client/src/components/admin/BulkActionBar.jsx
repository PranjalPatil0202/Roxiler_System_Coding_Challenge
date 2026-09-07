import React from 'react';
import { CheckSquare, X } from 'lucide-react';

const BulkActionBar = ({
  selectedCount = 0,
  onClearSelection,
  children,
}) => {
  if (selectedCount === 0) return null;

  return (
    <div
      className="elevation-floating"
      style={{
        position: 'fixed',
        bottom: '1.75rem',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        padding: '0.75rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1.25rem',
        boxShadow: '0 20px 35px -8px rgba(0, 0, 0, 0.22), 0 0 0 1px rgba(99, 102, 241, 0.25)',
        animation: 'slideUp 200ms cubic-bezier(0.16, 1, 0.3, 1)',
        maxWidth: '92vw',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          fontWeight: 700,
          fontSize: '0.9rem',
          color: 'var(--text-primary)',
          whiteSpace: 'nowrap',
        }}
      >
        <CheckSquare size={18} color="#4F46E5" />
        <span>
          {selectedCount} {selectedCount === 1 ? 'User' : 'Users'} Selected —
        </span>
      </div>

      {/* Action Buttons: [Change Role] [Delete] [Export to CSV] */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
        {children}
      </div>

      <div style={{ height: '22px', width: '1px', backgroundColor: 'var(--border-color)' }} />

      <button
        onClick={onClearSelection}
        className="btn btn-ghost btn-sm"
        title="Deselect All"
        style={{ color: 'var(--text-muted)', padding: '4px 8px', borderRadius: '8px' }}
      >
        <X size={15} />
        <span>Clear</span>
      </button>
    </div>
  );
};

export default BulkActionBar;
