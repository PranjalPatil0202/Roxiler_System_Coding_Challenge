import React from 'react';
import { Link } from 'react-router-dom';
import { Store, Star, AlertTriangle, ArrowRight, CheckCircle2, TrendingDown } from 'lucide-react';

const StoresGovernanceWidget = ({ stores = [] }) => {
  // Sort stores descending by average rating
  const sortedStores = [...stores].sort((a, b) => {
    return (parseFloat(b.average_rating) || 0) - (parseFloat(a.average_rating) || 0);
  });

  // Top Rated: stores with rating >= 3.5 (up to 3)
  const topRated = sortedStores
    .filter((s) => parseFloat(s.average_rating) >= 3.5)
    .slice(0, 3);

  // Needs Attention: stores with rating < 3.5 or 0 ratings (up to 3)
  const needsAttention = sortedStores
    .filter((s) => parseFloat(s.average_rating) < 3.5 || s.rating_count === 0)
    .slice(-3)
    .reverse();

  return (
    <div className="card elevation-raised" style={{ padding: '1.5rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div>
          <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Stores Governance & Oversight
          </h4>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
            Merchant rating performance and quality benchmarks
          </p>
        </div>
        <Link to="/admin/stores" className="btn btn-ghost btn-sm" style={{ gap: '0.3rem' }}>
          <span>View All ({stores.length})</span>
          <ArrowRight size={13} />
        </Link>
      </div>

      {/* Two Column Governance Layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
          flex: 1,
        }}
      >
        {/* Left Column: Top Rated Stores */}
        <div
          style={{
            backgroundColor: 'var(--bg-surface-subtle)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.85rem' }}>
            <CheckCircle2 size={15} color="var(--success)" />
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Top Rated Stores
            </span>
          </div>

          {topRated.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', flex: 1 }}>
              {topRated.map((s) => (
                <div
                  key={s.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.5rem 0.65rem',
                    backgroundColor: 'var(--bg-card)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <div style={{ minWidth: 0, flex: 1, marginRight: '0.5rem' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {s.name}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      {s.rating_count || 0} customer reviews
                    </div>
                  </div>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.2rem',
                      fontSize: '0.725rem',
                      fontWeight: 800,
                      backgroundColor: 'var(--success-bg)',
                      color: 'var(--success)',
                      padding: '0.15rem 0.45rem',
                      borderRadius: 'var(--radius-full)',
                      flexShrink: 0,
                    }}
                  >
                    ★ {Number(s.average_rating || 0).toFixed(1)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', padding: '1rem 0', textAlign: 'center' }}>
              No high-rating stores yet
            </div>
          )}
        </div>

        {/* Right Column: Stores Needing Attention */}
        <div
          style={{
            backgroundColor: 'var(--bg-surface-subtle)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.85rem' }}>
            <AlertTriangle size={15} color="var(--warning)" />
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Needs Attention
            </span>
          </div>

          {needsAttention.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', flex: 1 }}>
              {needsAttention.map((s) => (
                <div
                  key={s.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.5rem 0.65rem',
                    backgroundColor: 'var(--bg-card)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <div style={{ minWidth: 0, flex: 1, marginRight: '0.5rem' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {s.name}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      {s.rating_count === 0 ? 'Zero reviews' : `${s.rating_count} reviews • low score`}
                    </div>
                  </div>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.2rem',
                      fontSize: '0.725rem',
                      fontWeight: 800,
                      backgroundColor: 'var(--warning-bg)',
                      color: 'var(--warning)',
                      padding: '0.15rem 0.45rem',
                      borderRadius: 'var(--radius-full)',
                      flexShrink: 0,
                    }}
                  >
                    ★ {s.average_rating > 0 ? Number(s.average_rating).toFixed(1) : 'New'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', padding: '1rem 0', textAlign: 'center' }}>
              All stores meet healthy rating thresholds
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StoresGovernanceWidget;
