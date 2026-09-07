import React, { useState, useEffect } from 'react';
import Drawer from '../common/Drawer';
import StarRating from '../common/StarRating';
import RatingDistribution from '../storeOwner/RatingDistribution';
import { storeService } from '../../services/store.service';
import { ratingService } from '../../services/rating.service';
import { useToast } from '../../context/ToastContext';
import {
  Store,
  MapPin,
  Mail,
  Calendar,
  Sparkles,
  Users,
  Award,
  CheckCircle2,
} from 'lucide-react';
import { formatDate } from '../../utils/formatters';

const StoreDetailDrawer = ({
  store,
  isOpen = false,
  onClose,
  onRatingUpdated,
}) => {
  const { showSuccess, showError } = useToast();
  const [storeDetail, setStoreDetail] = useState(store);
  const [currentUserRating, setCurrentUserRating] = useState(store?.userRating || null);
  const [submittingRating, setSubmittingRating] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    if (store) {
      setStoreDetail(store);
      setCurrentUserRating(store.userRating || null);

      // Fetch fresh detail
      const fetchDetail = async () => {
        setLoadingDetail(true);
        try {
          const res = await storeService.getStoreById(store.id);
          if (res.success && res.data) {
            setStoreDetail(res.data);
            if (res.data.userRating !== undefined) {
              setCurrentUserRating(res.data.userRating);
            }
          }
        } catch (err) {
          console.warn('Could not fetch store detail:', err);
        } finally {
          setLoadingDetail(false);
        }
      };

      fetchDetail();
    }
  }, [store]);

  if (!store) return null;

  const handleRate = async (newRating) => {
    if (submittingRating) return;
    setSubmittingRating(true);

    try {
      let res;
      if (currentUserRating !== null) {
        res = await ratingService.updateRating(currentStore.id, newRating);
      } else {
        res = await ratingService.submitRating(currentStore.id, newRating);
      }

      if (res.success) {
        setCurrentUserRating(newRating);
        showSuccess(`You rated "${currentStore.name}" ${newRating} star${newRating > 1 ? 's' : ''}!`);
        if (onRatingUpdated) {
          onRatingUpdated(currentStore.id, newRating);
        }
      }
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to submit rating.');
    } finally {
      setSubmittingRating(false);
    }
  };

  const currentStore = storeDetail || store;
  if (!currentStore) return null;

  // Real rating distribution from backend database
  const avg = parseFloat(currentStore.average_rating || currentStore.averageRating || 0);
  const count = parseInt(currentStore.rating_count || currentStore.ratingCount || currentStore.totalRatings || 0, 10);
  const distribution = currentStore.ratingDistribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };


  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={currentStore.name}
      subtitle="Verified Store Profile & Reviews"
      width="540px"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Store Location & Contact Card */}
        <div
          style={{
            padding: '1.25rem',
            backgroundColor: 'var(--bg-surface-subtle)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
            <MapPin size={18} style={{ color: 'var(--user-accent)', marginTop: '2px', flexShrink: 0 }} />
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Full Address
              </span>
              <div style={{ color: 'var(--text-primary)', fontSize: '0.9375rem', fontWeight: 500, marginTop: '0.15rem' }}>
                {currentStore.address}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)' }}>
            <Mail size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              {currentStore.email}
            </span>
          </div>
        </div>

        {/* Interactive "Your Rating" Action Panel */}
        <div
          style={{
            backgroundColor: 'var(--user-accent-subtle)',
            border: '1px solid var(--user-border)',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={16} style={{ color: 'var(--user-accent)' }} />
              <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                {currentUserRating ? 'Your Submitted Rating' : 'Rate This Store'}
              </span>
            </div>
            {currentUserRating && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  fontSize: '0.775rem',
                  fontWeight: 700,
                  color: 'var(--user-accent)',
                  backgroundColor: 'var(--bg-card)',
                  padding: '0.2rem 0.55rem',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--user-border)',
                }}
              >
                <CheckCircle2 size={13} />
                Rated {currentUserRating} ★
              </span>
            )}
          </div>

          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: 0 }}>
            {currentUserRating
              ? 'You have rated this store. Click any star below to update your rating anytime.'
              : 'Share your genuine experience with the community. Click stars to submit your score.'}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.5rem' }}>
            <StarRating
              rating={currentUserRating || 0}
              onRate={handleRate}
              size={24}
              feedbackLabel="Submitted!"
            />
            {currentUserRating && (
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Click to re-score
              </span>
            )}
          </div>
        </div>

        {/* Overall Community Rating Card */}
        <div
          className="card elevation-raised"
          style={{
            padding: '1.5rem',
            backgroundColor: 'var(--bg-card)',
            display: 'flex',
            alignItems: 'center',
            gap: '1.25rem',
          }}
        >
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--owner-accent-subtle)',
              color: 'var(--star-filled)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Award size={30} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Overall Community Score
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.15rem' }}>
              <span style={{ fontSize: '2rem', fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
                {avg > 0 ? avg.toFixed(1) : 'New'}
              </span>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>/ 5.0</span>
            </div>
            <div style={{ marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <StarRating rating={avg} size={15} />
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                ({count} verified review{count === 1 ? '' : 's'})
              </span>
            </div>
          </div>
        </div>

        {/* Community Rating Distribution Breakdown */}
        <div
          className="card elevation-raised"
          style={{
            padding: '1.5rem',
            backgroundColor: 'var(--bg-card)',
          }}
        >
          <RatingDistribution
            showCard={false}
            distribution={distribution}
            totalRatings={count}
            accentColor="var(--user-accent)"
            badgeClass="badge-user"
            title="Rating Distribution"
            subtitle="Breakdown of community scores"
          />
        </div>
      </div>
    </Drawer>
  );
};

export default StoreDetailDrawer;
