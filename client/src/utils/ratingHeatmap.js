/**
 * Visual Rating Heatmap Color Scale
 * 5 stars = Emerald Green (#10B981)
 * 3 stars = Amber (#F59E0B)
 * 1 star  = Soft Red (#EF4444)
 * Allows users to visually scan store quality across cards and tables.
 */
export const getRatingHeatmap = (rating) => {
  const num = parseFloat(rating) || 0;

  if (num >= 4.5) {
    return {
      tier: 'excellent',
      color: '#059669', // Emerald dark text
      starColor: '#10B981', // Emerald star fill
      bg: 'rgba(16, 185, 129, 0.12)',
      border: 'rgba(16, 185, 129, 0.28)',
      glow: '0 0 12px rgba(16, 185, 129, 0.35)',
      label: 'Exceptional (5★)',
    };
  }

  if (num >= 3.5) {
    return {
      tier: 'good',
      color: '#0D9488', // Teal
      starColor: '#14B8A6',
      bg: 'rgba(20, 184, 166, 0.12)',
      border: 'rgba(20, 184, 166, 0.28)',
      glow: '0 0 10px rgba(20, 184, 166, 0.3)',
      label: 'Very Good (4★)',
    };
  }

  if (num >= 2.5) {
    return {
      tier: 'average',
      color: '#D97706', // Amber
      starColor: '#F59E0B',
      bg: 'rgba(245, 158, 11, 0.12)',
      border: 'rgba(245, 158, 11, 0.28)',
      glow: '0 0 10px rgba(245, 158, 11, 0.3)',
      label: 'Average (3★)',
    };
  }

  if (num >= 1.5) {
    return {
      tier: 'fair',
      color: '#EA580C', // Orange
      starColor: '#F97316',
      bg: 'rgba(249, 115, 22, 0.12)',
      border: 'rgba(249, 115, 22, 0.28)',
      glow: '0 0 10px rgba(249, 115, 22, 0.3)',
      label: 'Fair (2★)',
    };
  }

  if (num > 0) {
    return {
      tier: 'poor',
      color: '#DC2626', // Soft Red
      starColor: '#EF4444',
      bg: 'rgba(239, 68, 68, 0.12)',
      border: 'rgba(239, 68, 68, 0.28)',
      glow: '0 0 10px rgba(239, 68, 68, 0.3)',
      label: 'Poor (1★)',
    };
  }

  return {
    tier: 'unrated',
    color: '#6366F1',
    starColor: '#CBD5E1',
    bg: 'rgba(99, 102, 241, 0.08)',
    border: 'rgba(99, 102, 241, 0.2)',
    glow: 'none',
    label: 'Be the first to rate!',
  };
};
