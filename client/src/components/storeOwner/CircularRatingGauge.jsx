import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, CheckCircle2 } from 'lucide-react';

const CircularRatingGauge = ({
  rating = 0,
  totalRatings = 0,
  storeName,
  storeAddress,
}) => {
  const numericRating = Math.max(0, Math.min(5, Number(rating) || 0));
  const hasRatings = totalRatings > 0 && numericRating > 0;
  const displayRating = hasRatings ? numericRating.toFixed(1) : '0.0';
  const displayCount = totalRatings;

  // Geometry for 260-degree open circular arc
  const size = 260;
  const strokeWidth = 20;
  const center = size / 2;
  const radius = center - strokeWidth - 8;
  const totalAngle = 260;
  const arcLength = (totalAngle / 360) * (2 * Math.PI * radius);
  const totalCircumference = 2 * Math.PI * radius;

  // Progress relative to max 5.0 rating (0% when unrated)
  const percentage = hasRatings ? Math.min(1, Math.max(0, numericRating / 5.0)) : 0;
  const strokeDashoffset = arcLength * (1 - percentage);

  return (
    <div className="owner-hero-card">
      <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '2.5rem' }}>
        {/* Left Side: Circular Donut Gauge */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ position: 'relative', width: `${size}px`, height: `${size}px` }}>
            <svg
              width={size}
              height={size}
              viewBox={`0 0 ${size} ${size}`}
              style={{ transform: 'rotate(140deg)' }}
            >
              <defs>
                {/* Gradient of Gold (#F59E0B) and Deep Indigo (#4F46E5) */}
                <linearGradient id="gaugeGradient" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#F59E0B" />
                  <stop offset="40%" stopColor="#FBBF24" />
                  <stop offset="75%" stopColor="#6366F1" />
                  <stop offset="100%" stopColor="#4F46E5" />
                </linearGradient>
              </defs>

              {/* Background Track Arc */}
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke="var(--bg-surface-subtle)"
                strokeWidth={strokeWidth}
                strokeDasharray={`${arcLength} ${totalCircumference}`}
                strokeLinecap="round"
                style={{ opacity: 0.9 }}
              />

              {/* Animated Foreground Progress Arc */}
              <motion.circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke="url(#gaugeGradient)"
                strokeWidth={strokeWidth}
                strokeDasharray={`${arcLength} ${totalCircumference}`}
                strokeDashoffset={arcLength}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                strokeLinecap="round"
              />
            </svg>

            {/* Inner Content centered inside the donut */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none',
                paddingTop: '0.5rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
                <span
                  style={{
                    fontSize: '3.25rem',
                    fontFamily: 'var(--font-display)',
                    fontWeight: 800,
                    color: 'var(--text-primary)',
                    lineHeight: 1,
                    letterSpacing: '-0.02em',
                  }}
                >
                  {displayRating}
                </span>
                <span
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: 600,
                    color: 'var(--text-muted)',
                  }}
                >
                  / 5.0
                </span>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  marginTop: '0.4rem',
                }}
              >
                {[1, 2, 3, 4, 5].map((s) => (
                  <span
                    key={s}
                    style={{
                      fontSize: '1rem',
                      lineHeight: 1,
                      color: hasRatings && s <= Math.round(numericRating) ? '#F59E0B' : 'var(--border-color)',
                      transition: 'color 0.3s ease',
                    }}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Subtitle Below Gauge */}
          <div style={{ marginTop: '-0.5rem', maxWidth: '280px' }}>
            <p
              style={{
                fontSize: '0.9rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                lineHeight: 1.4,
              }}
            >
              {hasRatings ? (
                <>
                  Based on{' '}
                  <strong style={{ color: 'var(--text-primary)', fontWeight: 700 }}>
                    {displayCount} verified
                  </strong>{' '}
                  customer review{displayCount === 1 ? '' : 's'}.
                </>
              ) : (
                <>
                  <strong style={{ color: 'var(--text-primary)', fontWeight: 700 }}>
                    No customer reviews yet.
                  </strong>{' '}
                  Ratings will appear once customers review your store.
                </>
              )}
            </p>
          </div>
        </div>

        {/* Center / Right Merchant Header Context */}
        <div style={{ flex: 1, minWidth: '240px', paddingBottom: '0.5rem' }}>
          {storeName && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0.75rem', borderRadius: '9999px', backgroundColor: 'var(--owner-accent-subtle)', color: 'var(--owner-accent)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
              <CheckCircle2 size={13} strokeWidth={2.5} />
              <span>Verified Storefront Performance</span>
            </div>
          )}

          <h2
            style={{
              fontSize: '1.65rem',
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              color: 'var(--text-primary)',
              lineHeight: 1.25,
            }}
          >
            {storeName || 'StorePulse Merchant Hub'}
          </h2>

          <p
            style={{
              color: 'var(--text-secondary)',
              fontSize: '0.9rem',
              marginTop: '0.45rem',
              lineHeight: 1.5,
              maxWidth: '420px',
            }}
          >
            {storeAddress ||
              'Real-time rating analytics and verified customer sentiment for your retail store.'}
          </p>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              marginTop: '1.25rem',
              flexWrap: 'wrap',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
              }}
            >
              {hasRatings ? (
                <>
                  <Sparkles size={16} color="#F59E0B" />
                  <span>
                    {numericRating >= 4.5
                      ? 'Top 5% Merchant Score'
                      : numericRating >= 3.5
                      ? 'Verified Merchant Rating'
                      : 'Merchant Feedback Active'}
                  </span>
                </>
              ) : (
                <>
                  <Sparkles size={16} color="var(--owner-accent)" />
                  <span>New Storefront • Awaiting First Review</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Subtle 2D Vector Illustration in Background: Merchant looking at floating star */}
      <div className="owner-hero-bg-art" aria-hidden="true">
        <svg width="220" height="200" viewBox="0 0 220 200" fill="none">
          {/* Subtle clouds / decorative lines */}
          <path
            d="M140 70C140 64.4772 144.477 60 150 60H190C195.523 60 200 64.4772 200 70C200 75.5228 195.523 80 190 80H150C144.477 80 140 75.5228 140 70Z"
            fill="var(--bg-surface-subtle)"
            opacity="0.6"
          />
          <path
            d="M170 100C170 95.5817 173.582 92 178 92H210C214.418 92 218 95.5817 218 100C218 104.418 214.418 108 210 108H178C173.582 108 170 104.418 170 100Z"
            fill="var(--bg-surface-subtle)"
            opacity="0.4"
          />

          {/* Floating Gold Star */}
          <g transform="translate(130, 25)">
            <polygon
              points="20,0 26,14 40,14 29,23 33,38 20,29 7,38 11,23 0,14 14,14"
              fill="#F59E0B"
              filter="drop-shadow(0 4px 12px rgba(245, 158, 11, 0.45))"
            />
            {/* Sparkle lines */}
            <circle cx="20" cy="-6" r="1.5" fill="#FBBF24" />
            <circle cx="48" cy="18" r="1.5" fill="#FBBF24" />
            <circle cx="-4" cy="22" r="1.5" fill="#FBBF24" />
          </g>

          {/* Minimalist 2D Merchant Figure looking up */}
          <g transform="translate(115, 75)">
            {/* Head */}
            <ellipse cx="48" cy="22" rx="12" ry="14" fill="#3B82F6" opacity="0.9" />
            {/* Hair */}
            <path
              d="M38 18C38 12 43 7 51 8C59 9 61 15 60 22C57 19 50 16 45 19Z"
              fill="#1E1B4B"
            />
            {/* Face profile */}
            <path
              d="M48 24C52 24 55 21 56 18"
              stroke="#1E1B4B"
              strokeWidth="1.5"
              strokeLinecap="round"
            />

            {/* Neck */}
            <rect x="44" y="34" width="8" height="10" fill="#60A5FA" opacity="0.8" />

            {/* Indigo T-shirt / Torso */}
            <path
              d="M28 44C34 40 62 40 68 44L78 120H18L28 44Z"
              fill="#4F46E5"
            />

            {/* Left Arm raised pointing/looking up toward the star */}
            <path
              d="M30 46C20 40 12 28 14 14C14.5 10 18 12 18 16C18 24 24 38 34 46Z"
              fill="#60A5FA"
            />
            {/* Hand */}
            <ellipse cx="15" cy="13" rx="4" ry="5" fill="#93C5FD" />
          </g>
        </svg>
      </div>
    </div>
  );
};

export default CircularRatingGauge;
