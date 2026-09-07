import React from 'react';
import { Star, BarChart2 } from 'lucide-react';

const RatingDistribution = ({
  distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  totalRatings = 0,
  accentColor = 'var(--owner-accent)',
  badgeClass = 'badge-owner',
  title = 'Rating Distribution',
  subtitle = 'Breakdown across 1 to 5 star customer scores',
  showCard = true,
}) => {
  const stars = [5, 4, 3, 2, 1];

  const content = (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
        <div>
          <h4 style={{ fontSize: '1.125rem', fontWeight: 700 }}>{title}</h4>
          {subtitle && (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', marginTop: '0.2rem' }}>
              {subtitle}
            </p>
          )}
        </div>
        <div className={`badge ${badgeClass}`} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <BarChart2 size={13} />
          <span>{totalRatings} Review{totalRatings === 1 ? '' : 's'}</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', flex: 1, justifyContent: 'center' }}>
        {stars.map((star) => {
          const count = distribution[star] || 0;
          const percentage = totalRatings > 0 ? Math.round((count / totalRatings) * 100) : 0;

          return (
            <div
              key={star}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
                fontSize: '0.875rem',
                padding: '0.25rem 0.5rem',
                borderRadius: 'var(--radius-sm)',
                transition: 'background-color var(--trans-fast)',
              }}
              className="rating-dist-row"
            >
              {/* Star Label */}
              <div
                style={{
                  width: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  flexShrink: 0,
                }}
              >
                <span>{star}</span>
                <Star size={14} fill="var(--star-filled)" color="var(--star-filled)" />
              </div>

              {/* Progress Track */}
              <div
                style={{
                  flex: 1,
                  height: '10px',
                  backgroundColor: 'var(--bg-surface)',
                  borderRadius: 'var(--radius-full)',
                  overflow: 'hidden',
                  position: 'relative',
                  border: '1px solid var(--border-color)',
                }}
                title={`${percentage}% (${count} reviews)`}
              >
                <div
                  style={{
                    width: `${percentage}%`,
                    height: '100%',
                    backgroundColor: percentage > 0 ? accentColor : 'transparent',
                    borderRadius: 'var(--radius-full)',
                    transition: 'width 800ms cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                />
              </div>

              {/* Counts and Percentages */}
              <div
                style={{
                  width: '85px',
                  textAlign: 'right',
                  fontVariantNumeric: 'tabular-nums',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: '0.35rem',
                  flexShrink: 0,
                }}
              >
                <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                  {count}
                </span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.775rem' }}>
                  ({percentage}%)
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );

  if (!showCard) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {content}
      </div>
    );
  }

  return (
    <div className="card elevation-raised" style={{ padding: '1.5rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {content}
    </div>
  );
};

export default RatingDistribution;
