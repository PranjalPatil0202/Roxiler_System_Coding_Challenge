import React, { useState, useMemo } from 'react';
import StarRating from '../common/StarRating';
import SentimentTag from '../common/SentimentTag';
import EmptyState from '../common/EmptyState';
import {
  NoRatingsIllustration,
  NoSearchResultsIllustration,
} from '../common/illustrations/EmptyStateIllustrations';
import {
  formatRelativeTime,
  formatReviewerName,
  getInitials,
} from '../../utils/formatters';
import {
  Check,
  Search,
  X,
  ShieldCheck,
  Store,
  AlertCircle,
  Smile,
  Meh,
  Filter,
} from 'lucide-react';

const RecentRatingsFeed = ({ ratings = [], loading = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sentimentFilter, setSentimentFilter] = useState('all'); // 'all' | 'critical' | 'neutral' | 'positive'

  // Sentiment counts
  const sentimentCounts = useMemo(() => {
    let positive = 0;
    let neutral = 0;
    let critical = 0;
    ratings.forEach((r) => {
      const score = Number(r.rating) || 0;
      if (score >= 4) positive++;
      else if (score === 3) neutral++;
      else critical++;
    });
    return { all: ratings.length, positive, neutral, critical };
  }, [ratings]);

  // Filtered ratings list
  const filteredRatings = useMemo(() => {
    let list = [...ratings];

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      list = list.filter((r) => {
        const name = (r.user?.name || '').toLowerCase();
        const email = (r.user?.email || '').toLowerCase();
        const storeName = (r.store?.name || '').toLowerCase();
        return name.includes(q) || email.includes(q) || storeName.includes(q);
      });
    }

    if (sentimentFilter !== 'all') {
      list = list.filter((r) => {
        const score = Number(r.rating) || 0;
        if (sentimentFilter === 'positive') return score >= 4;
        if (sentimentFilter === 'neutral') return score === 3;
        if (sentimentFilter === 'critical') return score <= 2;
        return true;
      });
    }

    // Default: newest first
    list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return list;
  }, [ratings, searchTerm, sentimentFilter]);

  if (ratings.length === 0 && !loading) {
    return (
      <EmptyState
        illustration={NoRatingsIllustration}
        title="No Customer Ratings Yet"
        description="When customers rate your store, their ratings, verified status, and feedback will stream into this feed in real time."
      />
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Section Header with Controls */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h3
            style={{
              fontSize: '1.35rem',
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              color: 'var(--text-primary)',
              letterSpacing: '-0.01em',
            }}
          >
            Recent Customer Ratings
          </h3>
          <p
            style={{
              color: 'var(--text-secondary)',
              fontSize: '0.85rem',
              marginTop: '0.2rem',
            }}
          >
            Stream of authentic customer reviews, ratings, and sentiment
          </p>
        </div>

        {/* Toolbar: Search and Sentiment Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div className="table-search-bar" style={{ width: '240px', borderRadius: '12px' }}>
            <Search size={15} style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search reviewer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                }}
                title="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Sentiment Filter Pills */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          flexWrap: 'wrap',
        }}
      >
        <button
          onClick={() => setSentimentFilter('all')}
          className={`btn btn-sm ${sentimentFilter === 'all' ? 'btn-primary' : 'btn-ghost'}`}
          style={{
            borderRadius: '12px',
            fontSize: '0.8125rem',
            fontWeight: sentimentFilter === 'all' ? 700 : 500,
            padding: '0.35rem 0.85rem',
          }}
        >
          All ({sentimentCounts.all})
        </button>

        <button
          onClick={() => setSentimentFilter('positive')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.35rem 0.85rem',
            borderRadius: '12px',
            fontSize: '0.8125rem',
            fontWeight: 600,
            cursor: 'pointer',
            border:
              sentimentFilter === 'positive'
                ? '1.5px solid #059669'
                : '1px solid rgba(16, 185, 129, 0.3)',
            backgroundColor:
              sentimentFilter === 'positive' ? '#059669' : 'rgba(16, 185, 129, 0.08)',
            color: sentimentFilter === 'positive' ? '#ffffff' : '#059669',
            transition: 'all 150ms ease',
          }}
        >
          <Smile size={13} strokeWidth={2.5} />
          <span>Positive ({sentimentCounts.positive})</span>
        </button>

        <button
          onClick={() => setSentimentFilter('neutral')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.35rem 0.85rem',
            borderRadius: '12px',
            fontSize: '0.8125rem',
            fontWeight: 600,
            cursor: 'pointer',
            border:
              sentimentFilter === 'neutral'
                ? '1.5px solid #d97706'
                : '1px solid rgba(245, 158, 11, 0.3)',
            backgroundColor:
              sentimentFilter === 'neutral' ? '#d97706' : 'rgba(245, 158, 11, 0.08)',
            color: sentimentFilter === 'neutral' ? '#ffffff' : '#d97706',
            transition: 'all 150ms ease',
          }}
        >
          <Meh size={13} strokeWidth={2.5} />
          <span>Neutral ({sentimentCounts.neutral})</span>
        </button>

        <button
          onClick={() => setSentimentFilter('critical')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.35rem 0.85rem',
            borderRadius: '12px',
            fontSize: '0.8125rem',
            fontWeight: 700,
            cursor: 'pointer',
            border:
              sentimentFilter === 'critical'
                ? '1.5px solid #dc2626'
                : '1px solid rgba(239, 68, 68, 0.3)',
            backgroundColor:
              sentimentFilter === 'critical' ? '#dc2626' : 'rgba(239, 68, 68, 0.08)',
            color: sentimentFilter === 'critical' ? '#ffffff' : '#dc2626',
            transition: 'all 150ms ease',
          }}
        >
          <AlertCircle size={13} strokeWidth={2.5} />
          <span>Critical ({sentimentCounts.critical})</span>
        </button>
      </div>

      {/* Feed Cards List */}
      {filteredRatings.length === 0 ? (
        <div style={{ padding: '2.5rem 1rem' }}>
          <EmptyState
            illustration={NoSearchResultsIllustration}
            title={
              sentimentFilter !== 'all'
                ? `No ${sentimentFilter.charAt(0).toUpperCase() + sentimentFilter.slice(1)} Reviews Found`
                : 'No Matching Reviews'
            }
            description={
              sentimentFilter !== 'all'
                ? `There are currently no reviews matching the '${sentimentFilter}' filter.`
                : `No customer ratings matched "${searchTerm}".`
            }
            action={
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setSearchTerm('');
                  setSentimentFilter('all');
                }}
              >
                Clear Review Filters
              </button>
            }
          />
        </div>
      ) : (
        <div className="ratings-feed-container">
          {filteredRatings.map((r) => {
            const reviewerName = formatReviewerName(r.user?.name || 'Alex M.');
            const initials = getInitials(r.user?.name || 'Alex Miller');
            const relativeTime = formatRelativeTime(r.created_at, { verbose: true });

            return (
              <div key={r.id} className="feed-rating-card">
                {/* Left Side: User Avatar, Name, Gold Rating, Verified Badge */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    flexWrap: 'wrap',
                  }}
                >
                  {/* User Avatar Circle with Initials & Verified Checkmark */}
                  <div className="feed-user-avatar" title={r.user?.name || 'Customer'}>
                    {initials}
                    <div className="feed-avatar-check">
                      <Check size={10} strokeWidth={3} />
                    </div>
                  </div>

                  {/* Reviewer Details */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <span
                        style={{
                          fontWeight: 700,
                          fontSize: '1.05rem',
                          color: 'var(--text-primary)',
                        }}
                      >
                        {reviewerName}
                      </span>

                      {/* Store Location tag if multi-store */}
                      {r.store?.name && (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            fontSize: '0.75rem',
                            color: 'var(--text-muted)',
                            fontWeight: 500,
                          }}
                        >
                          <Store size={12} style={{ color: 'var(--owner-accent)' }} />
                          <span>{r.store.name}</span>
                        </span>
                      )}
                    </div>

                    {/* Gold 5-Star Rating & Verified Badge */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.65rem',
                        marginTop: '0.15rem',
                        flexWrap: 'wrap',
                      }}
                    >
                      {/* Gold 5-Star Rating */}
                      <StarRating rating={r.rating} size={16} />

                      {/* Verified Reviewer Badge */}
                      <span className="verified-reviewer-badge">
                        <ShieldCheck size={13} strokeWidth={2.5} />
                        <span>Verified Reviewer</span>
                      </span>

                      {/* Sentiment Tag */}
                      <SentimentTag rating={r.rating} size="sm" />
                    </div>
                  </div>
                </div>

                {/* Right Side: Relative Timestamp */}
                <div style={{ textAlign: 'right', flexShrink: 0, paddingLeft: '1rem' }}>
                  <span
                    style={{
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: 'var(--text-muted)',
                    }}
                  >
                    {relativeTime}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RecentRatingsFeed;
