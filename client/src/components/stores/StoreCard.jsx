import React from 'react';
import { Store, MapPin, Mail, Star, Sparkles, Edit3 } from 'lucide-react';
import HighlightMatch from '../common/HighlightMatch';
import { getRatingHeatmap } from '../../utils/ratingHeatmap';

// Generates a deterministic, vibrant modern SaaS gradient based on store ID or Name
const getStoreGradient = (id = 0, name = '') => {
  const gradients = [
    'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)', // Indigo / Purple
    'linear-gradient(135deg, #3B82F6 0%, #06B6D4 100%)', // Blue / Cyan
    'linear-gradient(135deg, #EC4899 0%, #F43F5E 100%)', // Pink / Rose
    'linear-gradient(135deg, #10B981 0%, #059669 100%)', // Emerald
    'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', // Amber
    'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)', // Violet / Pink
  ];
  const hash = (id * 17 + (name.charCodeAt(0) || 0)) % gradients.length;
  return gradients[hash];
};

const StoreCard = ({
  store,
  onOpenRatingModal,
  onSelectStore,
  searchName = '',
  searchAddress = '',
}) => {
  const hasUserRated = store.userRating !== null && store.userRating !== undefined;
  const userRatingValue = hasUserRated ? Number(store.userRating) : null;
  const averageRating = Number(store.average_rating || 0);
  const ratingCount = Number(store.rating_count || 0);

  const gradient = getStoreGradient(store.id, store.name);
  const heatmap = getRatingHeatmap(averageRating);

  return (
    <div
      className="card card-hoverable store-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: 'var(--bg-card)',
        borderRadius: '16px',
        border: '1px solid var(--border-color)',
        boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        padding: '1.5rem',
        cursor: 'pointer',
      }}
      onClick={() => onSelectStore && onSelectStore(store)}
    >
      {/* 1. Header: Colorful Store Icon/Logo & Store Name with Search Highlighting */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.9rem', marginBottom: '0.85rem' }}>
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '14px',
            background: gradient,
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 6px 14px -3px rgba(99, 102, 241, 0.35)',
          }}
        >
          <Store size={24} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <h4
            style={{
              fontSize: '1.125rem',
              fontWeight: 800,
              color: 'var(--text-primary)',
              lineHeight: 1.3,
              marginBottom: '0.2rem',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
            title={store.name}
          >
            <HighlightMatch text={store.name} query={searchName} />
          </h4>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              color: 'var(--text-muted)',
              fontSize: '0.8125rem',
            }}
          >
            <Mail size={13} style={{ flexShrink: 0 }} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {store.email}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Truncated Physical Address with Search Highlighting */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.45rem',
          color: 'var(--text-secondary)',
          fontSize: '0.875rem',
          lineHeight: 1.45,
          marginBottom: '1.25rem',
          flex: 1,
        }}
      >
        <MapPin size={15} style={{ color: '#6366F1', flexShrink: 0, marginTop: '3px' }} />
        <span
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
          title={store.address}
        >
          <HighlightMatch text={store.address} query={searchAddress} />
        </span>
      </div>

      {/* 3. Dual Rating System: Overall Rating (Heatmap Colored) vs Your Rating (Indigo) */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          paddingTop: '0.9rem',
          borderTop: '1px solid var(--border-color)',
        }}
        onClick={(e) => e.stopPropagation()} // Keeps button clicks local
      >
        {/* Section A: Community Rating (Prominent Gold 5-Star Display, Read-Only) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.85rem',
          }}
        >
          <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Community Rating</span>

          {ratingCount > 0 ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                padding: '0.2rem 0.55rem',
                borderRadius: '8px',
                border: '1px solid rgba(245, 158, 11, 0.25)',
              }}
            >
              {/* Prominent Gold Stars */}
              <div style={{ display: 'flex', gap: '2px' }}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    size={14}
                    fill={i <= Math.round(averageRating) ? '#F59E0B' : 'transparent'}
                    color={i <= Math.round(averageRating) ? '#F59E0B' : 'var(--border-color)'}
                  />
                ))}
              </div>
              <span style={{ fontWeight: 800, color: '#D97706', fontSize: '0.9rem' }}>
                ★ {averageRating.toFixed(1)}
              </span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                ({ratingCount})
              </span>
            </div>
          ) : (
            <span
              style={{
                fontSize: '0.78rem',
                fontWeight: 600,
                color: '#D97706',
                backgroundColor: 'rgba(245, 158, 11, 0.08)',
                padding: '0.15rem 0.6rem',
                borderRadius: '12px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
            >
              ★ Be the first to rate!
            </span>
          )}
        </div>

        {/* Section B: Personal Rating (Distinct Indigo Stars & Action) */}
        <div
          style={{
            backgroundColor: hasUserRated ? 'rgba(99, 102, 241, 0.06)' : 'var(--bg-surface-subtle)',
            border: hasUserRated ? '1px solid rgba(99, 102, 241, 0.22)' : '1px dashed var(--border-color)',
            borderRadius: '12px',
            padding: '0.65rem 0.85rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.5rem',
          }}
        >
          {hasUserRated ? (
            <>
              <div>
                <div
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    color: '#4F46E5',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                  }}
                >
                  <Sparkles size={12} />
                  <span>Your Rating</span>
                </div>
                {/* Indigo Stars (Interactive) */}
                <div style={{ display: 'flex', gap: '3px', marginTop: '0.25rem', alignItems: 'center' }}>
                  {[1, 2, 3, 4, 5].map((starIdx) => (
                    <button
                      key={starIdx}
                      type="button"
                      onClick={() => onOpenRatingModal && onOpenRatingModal(store, starIdx)}
                      style={{ background: 'none', border: 'none', padding: '1px', cursor: 'pointer', display: 'flex' }}
                      title={`Modify to ${starIdx} star${starIdx > 1 ? 's' : ''}`}
                    >
                      <Star
                        size={14}
                        fill={starIdx <= userRatingValue ? '#4F46E5' : 'transparent'}
                        color={starIdx <= userRatingValue ? '#4F46E5' : 'rgba(99, 102, 241, 0.35)'}
                        strokeWidth={1.75}
                      />
                    </button>
                  ))}
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#4F46E5', marginLeft: '4px' }}>
                    {userRatingValue}/5
                  </span>
                </div>
              </div>

              {/* Modify Rating text link */}
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => onOpenRatingModal && onOpenRatingModal(store)}
                style={{
                  color: '#4F46E5',
                  fontWeight: 700,
                  fontSize: '0.8125rem',
                  padding: '0.35rem 0.65rem',
                  borderRadius: '8px',
                  backgroundColor: 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  textDecoration: 'underline',
                  textUnderlineOffset: '3px',
                }}
              >
                <Edit3 size={12} />
                <span>Modify Rating</span>
              </button>
            </>
          ) : (
            <>
              <div>
                <div
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    color: '#4F46E5',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                  }}
                >
                  <Sparkles size={12} />
                  <span>Your Rating</span>
                </div>
                {/* 5 outline stars that turn Indigo when clicked */}
                <div style={{ display: 'flex', gap: '3px', marginTop: '0.25rem' }}>
                  {[1, 2, 3, 4, 5].map((starIdx) => (
                    <button
                      key={starIdx}
                      type="button"
                      onClick={() => onOpenRatingModal && onOpenRatingModal(store, starIdx)}
                      style={{ background: 'none', border: 'none', padding: '1px', cursor: 'pointer', display: 'flex' }}
                      title={`Rate ${starIdx} star${starIdx > 1 ? 's' : ''}`}
                    >
                      <Star
                        size={14}
                        fill="transparent"
                        color="#4F46E5"
                        strokeWidth={1.75}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Rating Button */}
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => onOpenRatingModal && onOpenRatingModal(store)}
                style={{
                  backgroundColor: '#4F46E5',
                  borderColor: '#4F46E5',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  padding: '0.4rem 0.85rem',
                  borderRadius: '8px',
                  boxShadow: '0 3px 10px rgba(79, 70, 229, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                <Star size={13} fill="#ffffff" />
                <span>Submit Rating</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default StoreCard;
