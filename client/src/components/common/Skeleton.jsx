import React from 'react';

export const Skeleton = ({
  width = '100%',
  height = '1rem',
  borderRadius = '8px',
  className = '',
  style = {},
}) => {
  return (
    <div
      className={`skeleton ${className}`}
      style={{
        width,
        height,
        borderRadius,
        ...style,
      }}
    />
  );
};

export const TableSkeleton = ({ rows = 6 }) => {
  return (
    <div className="card elevation-raised" style={{ padding: 0, overflow: 'hidden' }}>
      {/* Table Header Row Skeleton */}
      <div
        style={{
          padding: '0.85rem 1.25rem',
          backgroundColor: 'var(--bg-surface-subtle)',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          gap: '1.5rem',
          alignItems: 'center',
        }}
      >
        <Skeleton width="40px" height="1.1rem" />
        <Skeleton width="180px" height="1.1rem" />
        <Skeleton width="130px" height="1.1rem" />
        <Skeleton width="220px" height="1.1rem" />
        <Skeleton width="80px" height="1.1rem" />
      </div>

      {/* Table Body Rows Skeleton */}
      <div style={{ padding: '0.5rem 1.25rem' }}>
        {Array.from({ length: rows }).map((_, r) => (
          <div
            key={r}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1.5rem',
              padding: '0.75rem 0',
              borderBottom: r < rows - 1 ? '1px solid var(--border-color)' : 'none',
            }}
          >
            {/* Avatar Circle */}
            <Skeleton width="34px" height="34px" borderRadius="9999px" />
            {/* User Name and Email */}
            <div style={{ width: '180px', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <Skeleton width="85%" height="0.875rem" />
              <Skeleton width="60%" height="0.75rem" />
            </div>
            {/* Role Badge */}
            <Skeleton width="105px" height="24px" borderRadius="12px" />
            {/* Physical Address */}
            <Skeleton width="220px" height="0.875rem" />
            {/* Action button */}
            <Skeleton width="75px" height="28px" borderRadius="6px" />
          </div>
        ))}
      </div>
    </div>
  );
};

export const CardSkeleton = ({ count = 6 }) => {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
        gap: '1.5rem',
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="card store-card"
          style={{
            padding: '1.5rem',
            borderRadius: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.04)',
          }}
        >
          {/* Header Row: Icon + Name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <Skeleton width="48px" height="48px" borderRadius="14px" />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <Skeleton width="70%" height="1.15rem" />
              <Skeleton width="45%" height="0.8rem" />
            </div>
          </div>

          {/* Address lines */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', margin: '0.5rem 0' }}>
            <Skeleton width="90%" height="0.875rem" />
            <Skeleton width="60%" height="0.875rem" />
          </div>

          {/* Dual rating placeholder */}
          <div
            style={{
              paddingTop: '0.75rem',
              borderTop: '1px solid var(--border-color)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Skeleton width="35%" height="0.85rem" />
              <Skeleton width="40%" height="1rem" />
            </div>
            <Skeleton width="100%" height="38px" borderRadius="10px" />
          </div>
        </div>
      ))}
    </div>
  );
};

export const StatsSkeleton = () => {
  return (
    <div className="stats-grid" style={{ marginBottom: '1.75rem' }}>
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="card stat-card elevation-raised"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            padding: '1.25rem',
            borderRadius: '16px',
          }}
        >
          <Skeleton width="52px" height="52px" borderRadius="14px" />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
            <Skeleton width="50%" height="0.8rem" />
            <Skeleton width="35%" height="1.6rem" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default Skeleton;
