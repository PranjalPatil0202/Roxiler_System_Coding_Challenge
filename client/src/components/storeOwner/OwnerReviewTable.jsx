import React, { useState, useMemo } from 'react';
import StarRating from '../common/StarRating';
import EmptyState from '../common/EmptyState';
import SentimentTag from '../common/SentimentTag';
import {
  NoRatingsIllustration,
  NoSearchResultsIllustration,
} from '../common/illustrations/EmptyStateIllustrations';
import { formatDate, formatRelativeTime, getInitials } from '../../utils/formatters';
import {
  MessageSquare,
  Mail,
  Search,
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Store as StoreIcon,
  AlertCircle,
  Smile,
  Meh,
} from 'lucide-react';

const OwnerReviewTable = ({ ratings = [], loading = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sentimentFilter, setSentimentFilter] = useState('all'); // 'all' | 'critical' | 'neutral' | 'positive'
  const [sortField, setSortField] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');

  // Compute sentiment distribution counts for prioritization tabs
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

  // Handle Sort Toggle
  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  // Filter & Sort
  const processedRatings = useMemo(() => {
    let list = [...ratings];

    // Search filter
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      list = list.filter((r) => {
        const name = (r.user?.name || '').toLowerCase();
        const email = (r.user?.email || '').toLowerCase();
        const storeName = (r.store?.name || '').toLowerCase();
        return name.includes(q) || email.includes(q) || storeName.includes(q);
      });
    }

    // Sentiment Prioritization filter
    if (sentimentFilter !== 'all') {
      list = list.filter((r) => {
        const score = Number(r.rating) || 0;
        if (sentimentFilter === 'positive') return score >= 4;
        if (sentimentFilter === 'neutral') return score === 3;
        if (sentimentFilter === 'critical') return score <= 2;
        return true;
      });
    }

    // Sorting
    list.sort((a, b) => {
      let valA, valB;
      if (sortField === 'rating') {
        valA = Number(a.rating) || 0;
        valB = Number(b.rating) || 0;
      } else {
        // created_at
        valA = new Date(a.created_at).getTime();
        valB = new Date(b.created_at).getTime();
      }

      if (sortOrder === 'asc') {
        return valA > valB ? 1 : -1;
      } else {
        return valA < valB ? 1 : -1;
      }
    });

    return list;
  }, [ratings, searchTerm, sentimentFilter, sortField, sortOrder]);

  if (ratings.length === 0 && !loading) {
    return (
      <EmptyState
        illustration={NoRatingsIllustration}
        title="No Customer Ratings Yet"
        description="When customers rate your store, their ratings, sentiment tags, and customer information will appear here in real time."
      />
    );
  }

  const renderSortIcon = (field) => {
    if (sortField !== field) {
      return <ArrowUpDown size={14} style={{ opacity: 0.4 }} />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp size={14} color="var(--owner-accent)" />
    ) : (
      <ArrowDown size={14} color="var(--owner-accent)" />
    );
  };

  return (
    <div
      className="card elevation-raised"
      style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
    >
      {/* Table Toolbar: Sentiment Prioritization Filter Pills & Search */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        {/* Sentiment Prioritization Tabs */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            flexWrap: 'wrap',
          }}
          role="tablist"
          aria-label="Filter reviews by sentiment"
        >
          {/* All */}
          <button
            onClick={() => setSentimentFilter('all')}
            className={`btn btn-sm ${sentimentFilter === 'all' ? 'btn-primary' : 'btn-ghost'}`}
            style={{
              padding: '0.3rem 0.75rem',
              borderRadius: '8px',
              fontWeight: sentimentFilter === 'all' ? 700 : 500,
              fontSize: '0.8125rem',
            }}
          >
            All Feedback ({sentimentCounts.all})
          </button>

          {/* Critical (High Priority) */}
          <button
            onClick={() => setSentimentFilter('critical')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.3rem 0.75rem',
              borderRadius: '8px',
              fontSize: '0.8125rem',
              fontWeight: 700,
              cursor: 'pointer',
              border: sentimentFilter === 'critical' ? '1.5px solid #dc2626' : '1px solid rgba(239, 68, 68, 0.3)',
              backgroundColor: sentimentFilter === 'critical' ? '#dc2626' : 'rgba(239, 68, 68, 0.08)',
              color: sentimentFilter === 'critical' ? '#ffffff' : '#dc2626',
              transition: 'all 150ms ease',
            }}
            title="Prioritize feedback requiring urgent merchant attention (1-2 Stars)"
          >
            <AlertCircle size={13} strokeWidth={2.5} />
            <span>Critical Priority ({sentimentCounts.critical})</span>
          </button>

          {/* Neutral */}
          <button
            onClick={() => setSentimentFilter('neutral')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.3rem 0.75rem',
              borderRadius: '8px',
              fontSize: '0.8125rem',
              fontWeight: 600,
              cursor: 'pointer',
              border: sentimentFilter === 'neutral' ? '1.5px solid #d97706' : '1px solid rgba(245, 158, 11, 0.3)',
              backgroundColor: sentimentFilter === 'neutral' ? '#d97706' : 'rgba(245, 158, 11, 0.08)',
              color: sentimentFilter === 'neutral' ? '#ffffff' : '#d97706',
              transition: 'all 150ms ease',
            }}
            title="Neutral ratings (3 Stars)"
          >
            <Meh size={13} strokeWidth={2.5} />
            <span>Neutral ({sentimentCounts.neutral})</span>
          </button>

          {/* Positive */}
          <button
            onClick={() => setSentimentFilter('positive')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.3rem 0.75rem',
              borderRadius: '8px',
              fontSize: '0.8125rem',
              fontWeight: 600,
              cursor: 'pointer',
              border: sentimentFilter === 'positive' ? '1.5px solid #059669' : '1px solid rgba(16, 185, 129, 0.3)',
              backgroundColor: sentimentFilter === 'positive' ? '#059669' : 'rgba(16, 185, 129, 0.08)',
              color: sentimentFilter === 'positive' ? '#ffffff' : '#059669',
              transition: 'all 150ms ease',
            }}
            title="Satisfied customer feedback (4-5 Stars)"
          >
            <Smile size={13} strokeWidth={2.5} />
            <span>Positive ({sentimentCounts.positive})</span>
          </button>
        </div>

        {/* Search Bar & Result Counter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="table-search-bar" style={{ width: '260px' }}>
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

          <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
            <strong>{processedRatings.length}</strong> of {ratings.length}
          </span>
        </div>
      </div>

      {/* Table Content */}
      {processedRatings.length === 0 ? (
        <div style={{ padding: '2rem 1rem' }}>
          <EmptyState
            illustration={NoSearchResultsIllustration}
            title={
              sentimentFilter !== 'all'
                ? `No ${sentimentFilter.charAt(0).toUpperCase() + sentimentFilter.slice(1)} Reviews Found`
                : 'No Matching Reviews'
            }
            description={
              sentimentFilter !== 'all'
                ? `There are currently no reviews classified under the '${sentimentFilter}' sentiment category.`
                : `No customer reviews matched "${searchTerm}".`
            }
            action={
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setSearchTerm('');
                  setSentimentFilter('all');
                }}
              >
                Reset Review Filters
              </button>
            }
          />
        </div>
      ) : (
        <div className="table-container" style={{ border: 'none', boxShadow: 'none' }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Email</th>
                <th>Store Location</th>
                <th
                  className="num-col sortable-th"
                  onClick={() => handleSort('rating')}
                  title="Click to sort by rating score"
                >
                  <span className="sortable-th-content" style={{ justifyContent: 'flex-end' }}>
                    <span>Rating & Sentiment</span>
                    {renderSortIcon('rating')}
                  </span>
                </th>
                <th
                  className="num-col sortable-th"
                  onClick={() => handleSort('created_at')}
                  title="Click to sort by submission date"
                >
                  <span className="sortable-th-content" style={{ justifyContent: 'flex-end' }}>
                    <span>Review Date</span>
                    {renderSortIcon('created_at')}
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {processedRatings.map((r) => (
                <tr key={r.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div
                        className="table-avatar avatar-normal_user"
                        style={{ border: '2px solid var(--user-border)' }}
                      >
                        {getInitials(r.user?.name || 'Customer')}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          {r.user?.name || 'Anonymous Customer'}
                        </div>
                        {r.user?.address && (
                          <div
                            style={{
                              color: 'var(--text-muted)',
                              fontSize: '0.75rem',
                              marginTop: '1px',
                            }}
                          >
                            {r.user.address}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Mail size={13} style={{ color: 'var(--text-muted)' }} />
                      <span>{r.user?.email || '—'}</span>
                    </div>
                  </td>
                  <td>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        fontWeight: 500,
                        color: 'var(--text-primary)',
                      }}
                    >
                      <StoreIcon size={14} style={{ color: 'var(--owner-accent)' }} />
                      <span>{r.store?.name || 'Your Store'}</span>
                    </div>
                  </td>
                  {/* Rating Score with Reviewer Sentiment Tag */}
                  <td className="num-col">
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        gap: '0.6rem',
                        flexWrap: 'nowrap',
                      }}
                    >
                      <StarRating rating={r.rating} size={15} showValue />
                      {/* Sentiment Tag next to rating */}
                      <SentimentTag rating={r.rating} size="sm" />
                    </div>
                  </td>
                  <td className="num-col">
                    <div
                      style={{
                        color: 'var(--text-primary)',
                        fontSize: '0.8125rem',
                        fontWeight: 500,
                      }}
                    >
                      {formatDate(r.created_at)}
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                      {formatRelativeTime(r.created_at)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default OwnerReviewTable;
