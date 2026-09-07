import React from 'react';
import { Inbox } from 'lucide-react';

const EmptyState = ({
  icon: Icon = Inbox,
  illustration = null,
  title = 'No records found',
  description = 'There are no items matching your criteria at this moment.',
  action = null,
}) => {
  return (
    <div
      className="card elevation-flat page-fade-in"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3.5rem 1.5rem',
        textAlign: 'center',
        margin: '1.25rem 0',
        borderStyle: 'dashed',
        backgroundColor: 'var(--bg-surface-subtle)',
      }}
    >
      {illustration ? (
        <div style={{ marginBottom: '0.75rem' }}>
          {React.isValidElement(illustration) ? (
            illustration
          ) : (
            React.createElement(illustration)
          )}
        </div>
      ) : (
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-muted)',
            marginBottom: '1.25rem',
            boxShadow: 'var(--shadow-raised)',
          }}
        >
          <Icon size={30} strokeWidth={1.75} color="var(--accent)" />
        </div>
      )}

      <h4
        style={{
          fontSize: '1.15rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          marginBottom: '0.4rem',
        }}
      >
        {title}
      </h4>

      <p
        style={{
          color: 'var(--text-secondary)',
          fontSize: '0.9rem',
          maxWidth: '440px',
          lineHeight: 1.5,
          marginBottom: action ? '1.5rem' : 0,
        }}
      >
        {description}
      </p>

      {action && <div>{action}</div>}
    </div>
  );
};

export default EmptyState;
