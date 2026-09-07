import React, { useState, useEffect } from 'react';
import { Star, Check } from 'lucide-react';

const StarRating = ({
  rating = 0,
  onRate = null,
  size = 18,
  readOnly = false,
  showValue = false,
  count = null,
  feedbackLabel = 'Saved!',
}) => {
  const [hoverRating, setHoverRating] = useState(0);
  const [pulsingStar, setPulsingStar] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const isInteractive = !readOnly && typeof onRate === 'function';
  const effectiveRating = hoverRating || rating || 0;

  const handleClick = (starValue) => {
    if (!isInteractive) return;

    // Trigger micro-animation on clicked star
    setPulsingStar(starValue);
    setShowFeedback(true);

    onRate(starValue);

    setTimeout(() => {
      setPulsingStar(null);
    }, 300);

    setTimeout(() => {
      setShowFeedback(false);
    }, 1800);
  };

  return (
    <div className="star-rating-wrapper" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', position: 'relative' }}>
      <div className="star-rating-container" onMouseLeave={() => isInteractive && setHoverRating(0)}>
        {[1, 2, 3, 4, 5].map((starValue) => {
          const isFilled = starValue <= effectiveRating;
          const isHovered = isInteractive && hoverRating >= starValue;
          const isPulsing = pulsingStar === starValue;

          return (
            <button
              key={starValue}
              type="button"
              disabled={!isInteractive}
              className={`star-btn ${isFilled ? 'is-active' : ''} ${isHovered ? 'is-hovered' : ''} ${isPulsing ? 'star-pulse' : ''}`}
              onClick={() => handleClick(starValue)}
              onMouseEnter={() => isInteractive && setHoverRating(starValue)}
              title={isInteractive ? `Rate ${starValue} star${starValue > 1 ? 's' : ''}` : `${rating} out of 5 stars`}
              aria-label={`Star ${starValue}`}
            >
              <Star
                size={size}
                fill={isFilled ? 'var(--star-filled)' : 'none'}
                stroke={isFilled ? 'var(--star-filled)' : 'var(--star-empty)'}
                strokeWidth={1.75}
              />
            </button>
          );
        })}
      </div>

      {/* Inline Feedback Pill on Submission */}
      {showFeedback && (
        <span className="star-feedback-pill" role="status" aria-live="polite">
          <Check size={11} strokeWidth={3} />
          <span>{rating > 0 ? 'Updated!' : feedbackLabel}</span>
        </span>
      )}

      {showValue && !showFeedback && (
        <span
          className="star-score-text"
          style={{
            fontSize: '0.875rem',
            fontWeight: 600,
            color: 'var(--text-primary)',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {rating > 0 ? Number(rating).toFixed(1) : 'No reviews'}
        </span>
      )}

      {count !== null && !showFeedback && (
        <span className="star-count-text" style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
          ({count})
        </span>
      )}
    </div>
  );
};

export default StarRating;
