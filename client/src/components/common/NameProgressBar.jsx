import React from 'react';

/**
 * NameProgressBar
 * Real-time validation UI for Name inputs (20-60 characters requirement)
 * - Stays red/short until it hits 20 chars
 * - Turns green between 20 and 60 chars
 * - Turns red again if it exceeds 60 chars
 */
const NameProgressBar = ({ length = 0, min = 20, max = 60 }) => {
  const isUnder = length < min;
  const isOver = length > max;
  const isValid = length >= min && length <= max;

  // Color selection: Red (<20), Green (20-60), Red (>60)
  const barColor = isUnder ? '#ef4444' : isValid ? '#10b981' : '#ef4444';

  // Calculate visual width percentage (0 - 100%)
  const rawPercent = (length / max) * 100;
  const clampedPercent = Math.min(100, Math.max(length > 0 ? 6 : 0, rawPercent));

  return (
    <div
      className="name-progress-bar-container"
      style={{
        marginTop: '0.45rem',
        marginBottom: '0.35rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.3rem',
      }}
      aria-label="Name length requirement progress"
    >
      {/* Progress Track */}
      <div
        role="progressbar"
        aria-valuenow={length}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuetext={`${length} of ${max} characters. ${
          isUnder ? `Requires at least ${min}` : isValid ? 'Valid length' : 'Exceeds maximum'
        }`}
        style={{
          width: '100%',
          height: '5px',
          backgroundColor: 'var(--border-color)',
          borderRadius: '9999px',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Active Fill Bar */}
        <div
          style={{
            height: '100%',
            width: `${clampedPercent}%`,
            backgroundColor: barColor,
            borderRadius: '9999px',
            transition: 'width 200ms cubic-bezier(0.16, 1, 0.3, 1), background-color 200ms ease',
            boxShadow: isValid ? '0 0 8px rgba(16, 185, 129, 0.3)' : '0 0 8px rgba(239, 68, 68, 0.3)',
          }}
        />
      </div>

      {/* Real-time Status Caption */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.75rem',
          fontWeight: 600,
          color: barColor,
        }}
      >
        <span>
          {length === 0 ? (
            <span style={{ color: 'var(--text-muted)' }}>Min 20 characters required</span>
          ) : isUnder ? (
            <span>Min 20 characters required (type {min - length} more)</span>
          ) : isValid ? (
            <span>✓ Name satisfies requirement ({length}/{max} chars)</span>
          ) : (
            <span>⚠ Exceeds limit by {length - max} character{length - max > 1 ? 's' : ''}</span>
          )}
        </span>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.725rem', fontWeight: 500 }}>
          {length}/{max}
        </span>
      </div>
    </div>
  );
};

export default NameProgressBar;
