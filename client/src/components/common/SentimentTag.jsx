import React from 'react';
import { Smile, Meh, AlertCircle } from 'lucide-react';

/**
 * SentimentTag
 * Renders a small, high-contrast sentiment tag ("Positive", "Neutral", "Critical")
 * based on customer review rating score (1-5 stars).
 */
export const getSentimentMeta = (rating) => {
  const num = Number(rating) || 0;
  if (num >= 4) {
    return {
      type: 'positive',
      label: 'Positive',
      color: '#059669',
      bgColor: 'rgba(16, 185, 129, 0.12)',
      borderColor: 'rgba(16, 185, 129, 0.28)',
      icon: Smile,
    };
  }
  if (num === 3) {
    return {
      type: 'neutral',
      label: 'Neutral',
      color: '#d97706',
      bgColor: 'rgba(245, 158, 11, 0.12)',
      borderColor: 'rgba(245, 158, 11, 0.28)',
      icon: Meh,
    };
  }
  return {
    type: 'critical',
    label: 'Critical',
    color: '#dc2626',
    bgColor: 'rgba(239, 68, 68, 0.12)',
    borderColor: 'rgba(239, 68, 68, 0.28)',
    icon: AlertCircle,
  };
};

const SentimentTag = ({ rating, showIcon = true, size = 'md' }) => {
  const meta = getSentimentMeta(rating);
  const Icon = meta.icon;

  const isSmall = size === 'sm';

  return (
    <span
      className={`sentiment-tag sentiment-${meta.type}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: isSmall ? '0.25rem' : '0.35rem',
        padding: isSmall ? '0.12rem 0.45rem' : '0.2rem 0.6rem',
        borderRadius: '9999px',
        fontSize: isSmall ? '0.6875rem' : '0.75rem',
        fontWeight: 700,
        backgroundColor: meta.bgColor,
        color: meta.color,
        border: `1px solid ${meta.borderColor}`,
        letterSpacing: '0.02em',
        lineHeight: 1.2,
        whiteSpace: 'nowrap',
      }}
      title={`Review Sentiment: ${meta.label} (${rating} Stars)`}
    >
      {showIcon && <Icon size={isSmall ? 11 : 13} strokeWidth={2.5} />}
      <span>{meta.label}</span>
    </span>
  );
};

export default SentimentTag;
