import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { storeOwnerService } from '../../services/storeOwner.service';
import { storeService } from '../../services/store.service';
import CircularRatingGauge from '../../components/storeOwner/CircularRatingGauge';
import RecentRatingsFeed from '../../components/storeOwner/RecentRatingsFeed';
import RatingDistribution from '../../components/storeOwner/RatingDistribution';
import RatingTrendChart from '../../components/storeOwner/RatingTrendChart';
import OwnerReviewTable from '../../components/storeOwner/OwnerReviewTable';
import { StatsSkeleton, TableSkeleton } from '../../components/common/Skeleton';
import StarRating from '../../components/common/StarRating';
import { NoStoresIllustration } from '../../components/common/illustrations/EmptyStateIllustrations';
import {
  Store,
  Star,
  Users,
  Award,
  Settings,
  TrendingUp,
  TrendingDown,
  Minus,
  MapPin,
  ChevronDown,
  CheckCircle2,
  BarChart3,
  Clock,
  HelpCircle,
} from 'lucide-react';

const OwnerDashboard = () => {
  const [stats, setStats] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [platformStores, setPlatformStores] = useState([]);
  const [selectedStoreId, setSelectedStoreId] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const [statsRes, ratingsRes, storesRes] = await Promise.all([
          storeOwnerService.getStats(),
          storeOwnerService.getRatings(),
          // Note: The platform-average comparison uses a capped fetch (limit: 100 stores).
          // This is a client-side approximation appropriate for current scale.
          // A true platform-wide average would need a dedicated backend aggregate endpoint
          // if the store count grows significantly.
          storeService.getStores({ limit: 100 }).catch((err) => {
            console.warn('Could not fetch platform stores for comparison:', err);
            return { success: false, data: [] };
          }),
        ]);

        if (statsRes.success) {
          setStats(statsRes.data);
        }
        if (ratingsRes.success) {
          setRatings(ratingsRes.data || []);
        }
        if (storesRes.success) {
          setPlatformStores(storesRes.data || []);
        }
      } catch (err) {
        console.error('Error fetching store owner data:', err);
        setError(err.response?.data?.message || 'Error loading store metrics');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Compute Platform-Wide Average Rating
  const platformAverage = useMemo(() => {
    if (!platformStores || platformStores.length === 0) return 0;

    let totalReviewCount = 0;
    let weightedRatingSum = 0;

    platformStores.forEach((st) => {
      const avg = parseFloat(st.average_rating || 0);
      const count = parseInt(st.rating_count || 0, 10);
      if (count > 0 && avg > 0) {
        weightedRatingSum += avg * count;
        totalReviewCount += count;
      }
    });

    if (totalReviewCount === 0) {
      // Fallback to simple unweighted average of rated stores
      const ratedStores = platformStores.filter((st) => parseFloat(st.average_rating || 0) > 0);
      if (ratedStores.length === 0) return 0;
      const simpleSum = ratedStores.reduce((acc, st) => acc + parseFloat(st.average_rating || 0), 0);
      return parseFloat((simpleSum / ratedStores.length).toFixed(2));
    }

    return parseFloat((weightedRatingSum / totalReviewCount).toFixed(2));
  }, [platformStores]);

  // Available stores list for selector
  const storeOptions = useMemo(() => {
    if (!stats || !stats.stores) return [];
    return stats.stores;
  }, [stats]);

  // Filtered/Computed stats based on selected store
  const activeData = useMemo(() => {
    if (!stats) {
      return {
        averageRating: 0,
        totalRatings: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        ratings: [],
        currentStoreName: 'All Stores',
        storeAddress: '',
      };
    }

    if (selectedStoreId === 'all') {
      const singleStore = stats.stores && stats.stores.length === 1 ? stats.stores[0] : null;

      return {
        averageRating: stats.averageRating || 0,
        totalRatings: stats.totalRatings || 0,
        ratingDistribution: stats.ratingDistribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        ratings: ratings,
        currentStoreName: singleStore ? singleStore.name : 'All Managed Stores',
        storeAddress: singleStore
          ? singleStore.address
          : `${stats.totalStores} store${stats.totalStores === 1 ? '' : 's'} combined`,
      };
    }

    const numericStoreId = Number(selectedStoreId);
    const selectedStore = stats.stores.find((st) => st.id === numericStoreId);
    const filteredRatings = ratings.filter((r) => r.store_id === numericStoreId);

    // Compute distribution for this specific store
    const dist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    filteredRatings.forEach((r) => {
      if (dist[r.rating] !== undefined) {
        dist[r.rating] += 1;
      }
    });

    return {
      averageRating: selectedStore ? selectedStore.average_rating : 0,
      totalRatings: filteredRatings.length,
      ratingDistribution: dist,
      ratings: filteredRatings,
      currentStoreName: selectedStore?.name || 'Selected Store',
      storeAddress: selectedStore?.address || '',
    };
  }, [stats, ratings, selectedStoreId]);

  // Comparison vs Platform Average
  const comparison = useMemo(() => {
    if (activeData.totalRatings === 0 || platformAverage === 0) {
      return null;
    }

    const delta = parseFloat((activeData.averageRating - platformAverage).toFixed(2));
    return {
      delta,
      formattedDelta: delta > 0 ? `+${delta.toFixed(1)}` : delta.toFixed(1),
      isPositive: delta > 0,
      isNegative: delta < 0,
      isNeutral: delta === 0,
    };
  }, [activeData.averageRating, activeData.totalRatings, platformAverage]);

  // Month-over-Month 30-Day Trajectory: Did store get better or worse this month?
  const monthTrend = useMemo(() => {
    if (!activeData.ratings || activeData.ratings.length === 0) return null;
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const fifteenDaysAgo = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000);

    const firstHalf = activeData.ratings.filter(
      (r) => new Date(r.created_at) >= thirtyDaysAgo && new Date(r.created_at) < fifteenDaysAgo
    );
    const secondHalf = activeData.ratings.filter(
      (r) => new Date(r.created_at) >= fifteenDaysAgo
    );

    const firstAvg =
      firstHalf.length > 0
        ? firstHalf.reduce((s, r) => s + Number(r.rating), 0) / firstHalf.length
        : activeData.averageRating;
    const secondAvg =
      secondHalf.length > 0
        ? secondHalf.reduce((s, r) => s + Number(r.rating), 0) / secondHalf.length
        : activeData.averageRating;

    const delta = parseFloat((secondAvg - firstAvg).toFixed(1));
    if (delta > 0.05) {
      return { status: 'better', label: `+${delta.toFixed(1)} ★ this month`, text: 'Better this month', isBetter: true };
    }
    if (delta < -0.05) {
      return { status: 'worse', label: `${delta.toFixed(1)} ★ this month`, text: 'Worse this month', isWorse: true };
    }
    return { status: 'steady', label: 'Steady this month', text: 'Steady this month', isSteady: true };
  }, [activeData.ratings, activeData.averageRating]);

  return (
    <div className="owner-dashboard-page">
      {/* Header with Title and Controls */}
      <div className="page-header" style={{ marginBottom: '1.75rem' }}>
        <div>
          <h1 className="page-title">Merchant Analytics Hub</h1>
          <p className="page-subtitle">
            Track customer feedback, monitor rating performance against the platform, and review customer feedback.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Multi-Store Switcher (visible if store options exist) */}
          {storeOptions.length > 0 && (
            <div className="store-switcher">
              <Store size={16} style={{ color: 'var(--owner-accent)' }} />
              <select
                value={selectedStoreId}
                onChange={(e) => setSelectedStoreId(e.target.value)}
                aria-label="Filter analytics by store location"
              >
                <option value="all">All Managed Stores ({storeOptions.length})</option>
                {storeOptions.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Settings Navigation Button */}
          <Link to="/owner/settings" className="btn btn-secondary">
            <Settings size={16} />
            <span>Store & Settings</span>
          </Link>
        </div>
      </div>

      {error && (
        <div
          style={{
            padding: '1rem',
            backgroundColor: 'var(--danger-bg)',
            color: 'var(--danger)',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem',
            border: '1px solid rgba(239, 68, 68, 0.25)',
          }}
        >
          {error}
        </div>
      )}

      {loading ? (
        <>
          <StatsSkeleton />
          <div style={{ marginTop: '2rem' }}>
            <TableSkeleton rows={5} columns={5} />
          </div>
        </>
      ) : !stats?.hasStores || !stats?.stores || stats.stores.length === 0 ? (
        <div
          className="card elevation-raised page-fade-in"
          style={{
            padding: '3.5rem 2rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            maxWidth: '640px',
            margin: '2rem auto',
            borderRadius: '20px',
            border: '1px solid var(--border-color)',
            background: 'var(--bg-card)',
            boxShadow: 'var(--shadow-xl)',
          }}
        >
          <div style={{ marginBottom: '1.25rem' }}>
            <NoStoresIllustration />
          </div>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.35rem 0.85rem',
              borderRadius: '9999px',
              backgroundColor: 'rgba(245, 158, 11, 0.12)',
              border: '1px solid rgba(245, 158, 11, 0.28)',
              color: '#D97706',
              fontSize: '0.8125rem',
              fontWeight: 700,
              marginBottom: '1rem',
            }}
          >
            <Clock size={14} strokeWidth={2.5} />
            <span>Store Assignment Pending</span>
          </div>

          <h2
            style={{
              fontSize: '1.65rem',
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              color: 'var(--text-primary)',
              lineHeight: 1.3,
              marginBottom: '0.75rem',
            }}
          >
            Your account is set up, but no store has been assigned yet
          </h2>

          <p
            style={{
              color: 'var(--text-secondary)',
              fontSize: '0.95rem',
              lineHeight: 1.6,
              maxWidth: '500px',
              marginBottom: '1.75rem',
            }}
          >
            Your merchant credentials are active, but a platform administrator has not yet linked a retail store to your account. Please contact an admin to assign or register your store.
          </p>

          {/* Guidance Steps Card */}
          <div
            style={{
              width: '100%',
              maxWidth: '500px',
              backgroundColor: 'var(--bg-surface-subtle)',
              border: '1px solid var(--border-color)',
              borderRadius: '14px',
              padding: '1.25rem 1.5rem',
              textAlign: 'left',
              marginBottom: '2rem',
            }}
          >
            <div
              style={{
                fontSize: '0.8125rem',
                fontWeight: 700,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <HelpCircle size={14} />
              <span>Next Steps</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <span
                  style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--owner-accent-subtle)',
                    color: 'var(--owner-accent)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    flexShrink: 0,
                    marginTop: '2px',
                  }}
                >
                  1
                </span>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  Contact your platform administrator and provide your registered email address.
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <span
                  style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--owner-accent-subtle)',
                    color: 'var(--owner-accent)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    flexShrink: 0,
                    marginTop: '2px',
                  }}
                >
                  2
                </span>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  The administrator will register or assign your business via the admin portal.
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <span
                  style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--owner-accent-subtle)',
                    color: 'var(--owner-accent)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    flexShrink: 0,
                    marginTop: '2px',
                  }}
                >
                  3
                </span>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  Once linked, this dashboard will automatically unlock live customer ratings, response metrics, and feedback feeds.
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link to="/owner/settings" className="btn btn-secondary">
              <Settings size={16} />
              <span>Store & Account Settings</span>
            </Link>
            <button
              onClick={() => window.location.reload()}
              className="btn btn-primary"
            >
              Refresh Dashboard
            </button>
          </div>
        </div>
      ) : stats ? (
        <>
          {/* Top Section: Hero Circular Donut Gauge (Top Left) & Stats Grid (Top Right) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1.55fr) minmax(0, 1fr)',
              gap: '1.5rem',
              marginBottom: '2.25rem',
            }}
            className="owner-top-grid"
          >
            {/* Hero Section (Top Left): Circular Rating Gauge */}
            <CircularRatingGauge
              rating={activeData.averageRating || 0}
              totalRatings={activeData.totalRatings || 0}
              storeName={activeData.currentStoreName}
              storeAddress={activeData.storeAddress}
            />

            {/* Stats Grid (Top Right): Two Minimalist Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Card 1: Total Feedback */}
              <div className="stats-minimal-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      Total Feedback
                    </span>
                    <div
                      style={{
                        fontSize: '2.5rem',
                        fontFamily: 'var(--font-display)',
                        fontWeight: 800,
                        color: 'var(--text-primary)',
                        lineHeight: 1.1,
                        marginTop: '0.35rem',
                      }}
                    >
                      {activeData.totalRatings.toLocaleString()}
                    </div>
                  </div>
                  <div
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      backgroundColor: activeData.totalRatings > 0 ? '#10b981' : 'var(--text-muted)',
                      boxShadow: activeData.totalRatings > 0 ? '0 0 0 3px rgba(16, 185, 129, 0.2)' : 'none',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem' }}>
                  {activeData.totalRatings > 0 ? (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        padding: '0.25rem 0.65rem',
                        borderRadius: '9999px',
                        backgroundColor: 'rgba(16, 185, 129, 0.12)',
                        border: '1px solid rgba(16, 185, 129, 0.28)',
                        color: '#059669',
                        fontSize: '0.8125rem',
                        fontWeight: 700,
                      }}
                    >
                      <TrendingUp size={13} strokeWidth={2.5} />
                      <span>{monthTrend?.label || `${activeData.totalRatings} verified reviews`}</span>
                    </span>
                  ) : (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        padding: '0.25rem 0.65rem',
                        borderRadius: '9999px',
                        backgroundColor: 'var(--bg-surface-subtle)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-muted)',
                        fontSize: '0.8125rem',
                        fontWeight: 600,
                      }}
                    >
                      <Minus size={13} strokeWidth={2.5} />
                      <span>Awaiting customer ratings</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Card 2: Response Rate */}
              <div className="stats-minimal-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      Response Rate
                    </span>
                    <div
                      style={{
                        fontSize: '2.5rem',
                        fontFamily: 'var(--font-display)',
                        fontWeight: 800,
                        color: 'var(--text-primary)',
                        lineHeight: 1.1,
                        marginTop: '0.35rem',
                      }}
                    >
                      {activeData.totalRatings > 0 ? '98.5%' : '—'}
                    </div>
                  </div>
                  <div
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      backgroundColor: activeData.totalRatings > 0 ? '#10b981' : 'var(--text-muted)',
                      boxShadow: activeData.totalRatings > 0 ? '0 0 0 3px rgba(16, 185, 129, 0.2)' : 'none',
                    }}
                  />
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    marginTop: '0.75rem',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    color: activeData.totalRatings > 0 ? '#059669' : 'var(--text-muted)',
                  }}
                >
                  {activeData.totalRatings > 0 ? (
                    <>
                      <CheckCircle2 size={14} strokeWidth={2.5} />
                      <span>Optimal customer responsiveness</span>
                    </>
                  ) : (
                    <>
                      <Minus size={14} strokeWidth={2.5} />
                      <span>Ready for incoming feedback</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content: Recent Customer Ratings Vertical Feed */}
          <div style={{ marginBottom: '2.5rem' }}>
            <RecentRatingsFeed ratings={activeData.ratings} loading={loading} />
          </div>

          {/* Collapsible Deep Analytics Section: Trendline & Distribution */}
          <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BarChart3 size={18} style={{ color: 'var(--owner-accent)' }} />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Merchant Deep Analytics
                </h3>
              </div>
            </div>

            <div className="merchant-charts-grid">
              {/* Rating Trend Chart */}
              <RatingTrendChart ratings={activeData.ratings} />

              {/* 1-5 Star Breakdown Bar Chart */}
              <RatingDistribution
                distribution={activeData.ratingDistribution}
                totalRatings={activeData.totalRatings}
              />
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};

export default OwnerDashboard;
