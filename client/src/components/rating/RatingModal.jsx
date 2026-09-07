import React, { useState, useEffect, useRef } from 'react';
import { Store, Star, X, Sparkles, MessageSquare, Check } from 'lucide-react';
import { ratingService } from '../../services/rating.service';
import { useToast } from '../../context/ToastContext';
import { triggerSubtleConfetti } from '../../utils/confetti';
import { getRatingHeatmap } from '../../utils/ratingHeatmap';

const RATING_LABELS = {
  1: '1 Star - Poor Experience',
  2: '2 Stars - Fair Experience',
  3: '3 Stars - Good Experience',
  4: '4 Stars - Very Good Experience',
  5: '5 Stars - Exceptional Experience!',
};

const RatingModal = ({ store, isOpen, onClose, onRatingSubmitted }) => {
  const { showSuccess, showError } = useToast();
  const [selectedRating, setSelectedRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const submitBtnRef = useRef(null);

  // Sync initial rating when modal opens
  useEffect(() => {
    if (store) {
      setSelectedRating(store.preselectedRating || store.userRating || 0);
      setHoverRating(0);
      setFeedback('');
    }
  }, [store, isOpen]);

  if (!isOpen || !store) return null;

  const isModify = store.userRating !== null && store.userRating !== undefined;
  const currentRating = hoverRating || selectedRating;
  const heatmap = getRatingHeatmap(currentRating);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedRating < 1 || selectedRating > 5) {
      showError('Please select a star rating between 1 and 5');
      return;
    }

    setSubmitting(true);
    try {
      let res;
      if (isModify) {
        res = await ratingService.updateRating(store.id, selectedRating);
      } else {
        res = await ratingService.submitRating(store.id, selectedRating);
      }

      if (res.success) {
        // Trigger subtle confetti celebration from the button
        triggerSubtleConfetti(submitBtnRef.current);

        showSuccess(
          isModify
            ? `Rating updated for '${store.name}'!`
            : `Rating submitted for '${store.name}'!`
        );
        if (onRatingSubmitted) {
          onRatingSubmitted(store.id, selectedRating);
        }
        onClose();
      }
    } catch (err) {
      console.error('Rating submission failed:', err);
      showError(err.response?.data?.message || 'Failed to save rating. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1100,
        padding: '1rem',
        animation: 'fadeIn 200ms ease-out',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          backgroundColor: 'var(--bg-card)',
          borderRadius: '16px',
          border: '1px solid var(--border-color)',
          boxShadow: '0 25px 50px -12px rgba(79, 70, 229, 0.25)',
          overflow: 'hidden',
          animation: 'modalSlideUp 250ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '1.5rem 1.75rem 1rem',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--border-color)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #4F46E5 0%, #818CF8 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)',
              }}
            >
              <Store size={22} />
            </div>
            <div>
              <h3
                style={{
                  fontSize: '1.15rem',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.25,
                }}
              >
                {isModify ? 'Modify Your Rating' : 'Rate this Store'}
              </h3>
              <p
                style={{
                  fontSize: '0.85rem',
                  color: 'var(--text-secondary)',
                  marginTop: '0.15rem',
                }}
              >
                {store.name}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="btn-icon"
            style={{
              borderRadius: '8px',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              border: 'none',
              background: 'transparent',
              padding: '4px',
            }}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} style={{ padding: '1.75rem' }}>
          {/* Centered Large Interactive Stars with Hover-to-Preview Effect */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.75rem',
            }}
          >
            <span
              style={{
                fontSize: '0.8125rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'var(--text-muted)',
                marginBottom: '0.85rem',
              }}
            >
              Hover to preview & click to score
            </span>

            {/* 5 Interactive Glowing Stars */}
            <div
              style={{
                display: 'flex',
                gap: '0.65rem',
                alignItems: 'center',
              }}
              onMouseLeave={() => setHoverRating(0)}
            >
              {[1, 2, 3, 4, 5].map((starValue) => {
                const isLit = starValue <= currentRating;
                const isHovered = hoverRating > 0 && starValue <= hoverRating;

                return (
                  <button
                    key={starValue}
                    type="button"
                    onClick={() => setSelectedRating(starValue)}
                    onMouseEnter={() => setHoverRating(starValue)}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: '4px',
                      cursor: 'pointer',
                      transition: 'transform 180ms cubic-bezier(0.16, 1, 0.3, 1), filter 180ms ease',
                      transform: isHovered ? 'scale(1.22)' : isLit ? 'scale(1.08)' : 'scale(1)',
                      filter: isLit
                        ? `drop-shadow(0 0 12px ${heatmap.starColor})`
                        : 'none',
                    }}
                    title={`${starValue} Star${starValue > 1 ? 's' : ''}`}
                  >
                    <Star
                      size={38}
                      fill={isLit ? heatmap.starColor : 'transparent'}
                      color={isLit ? heatmap.starColor : 'var(--border-color)'}
                      strokeWidth={1.75}
                    />
                  </button>
                );
              })}
            </div>

            {/* Dynamic Label Under Stars with Heatmap Color Pill */}
            <div
              style={{
                minHeight: '28px',
                marginTop: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {currentRating > 0 ? (
                <span
                  style={{
                    fontSize: '0.925rem',
                    fontWeight: 800,
                    color: heatmap.color,
                    backgroundColor: heatmap.bg,
                    border: `1px solid ${heatmap.border}`,
                    padding: '0.3rem 0.9rem',
                    borderRadius: '20px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    transition: 'all 200ms ease',
                  }}
                >
                  <Sparkles size={14} />
                  {RATING_LABELS[currentRating]}
                </span>
              ) : (
                <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  Hover over stars to preview rating
                </span>
              )}
            </div>
          </div>

          {/* Optional Feedback Textarea */}
          <div style={{ marginBottom: '1.75rem' }}>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                marginBottom: '0.45rem',
              }}
            >
              <MessageSquare size={14} color="var(--text-muted)" />
              <span>Feedback Notes (Optional)</span>
            </label>
            <textarea
              className="form-input form-textarea"
              rows={3}
              placeholder="Tell others what you liked or how the store can improve..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              style={{ resize: 'none', fontSize: '0.875rem' }}
            />
          </div>

          {/* Modal Action Buttons */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '0.75rem',
            }}
          >
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={submitting}
              style={{ borderRadius: '10px', padding: '0.6rem 1.15rem' }}
            >
              Cancel
            </button>
            <button
              ref={submitBtnRef}
              type="submit"
              className="btn btn-primary"
              disabled={submitting || selectedRating === 0}
              style={{
                backgroundColor: '#4F46E5',
                borderColor: '#4F46E5',
                color: '#ffffff',
                borderRadius: '10px',
                padding: '0.6rem 1.4rem',
                fontWeight: 700,
                boxShadow: '0 4px 14px rgba(79, 70, 229, 0.35)',
              }}
            >
              {submitting ? (
                'Saving...'
              ) : (
                <>
                  <Check size={16} />
                  <span>{isModify ? 'Update Rating' : 'Submit Rating'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RatingModal;
