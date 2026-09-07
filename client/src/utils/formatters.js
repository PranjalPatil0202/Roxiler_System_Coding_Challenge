/**
 * Format ISO date string into readable format (e.g., Oct 24, 2026)
 */
export const formatDate = (dateString) => {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  } catch (e) {
    return dateString;
  }
};

/**
 * Format relative date (e.g. "2 hours ago", "Yesterday", "3 days ago")
 */
export const formatRelativeTime = (dateString, options = { verbose: false }) => {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 7) return formatDate(dateString);
    if (diffDays === 1) return options.verbose ? 'Yesterday' : '1d ago';
    if (diffDays > 1) return options.verbose ? `${diffDays} days ago` : `${diffDays}d ago`;
    if (diffHours === 1) return options.verbose ? '1 hour ago' : '1h ago';
    if (diffHours > 1) return options.verbose ? `${diffHours} hours ago` : `${diffHours}h ago`;
    if (diffMins === 1) return options.verbose ? '1 minute ago' : '1m ago';
    if (diffMins > 1) return options.verbose ? `${diffMins} minutes ago` : `${diffMins}m ago`;
    return 'Just now';
  } catch (e) {
    return formatDate(dateString);
  }
};

/**
 * Format user name into "First Name + Last Initial" format (e.g., "Alex M.")
 */
export const formatReviewerName = (name = '') => {
  if (!name || typeof name !== 'string') return 'Customer';
  const trimmed = name.trim();
  const parts = trimmed.split(/\s+/);
  if (parts.length <= 1) return trimmed;
  const firstName = parts[0];
  const lastInitial = parts[parts.length - 1].charAt(0).toUpperCase();
  return `${firstName} ${lastInitial}.`;
};

/**
 * Format role identifier into a friendly display label
 */
export const formatRoleLabel = (role) => {
  switch (role) {
    case 'admin':
      return 'Admin';
    case 'store_owner':
      return 'Store Owner';
    case 'normal_user':
      return 'User / Reviewer';
    default:
      return role || 'User';
  }
};

/**
 * Generate user initials for avatar
 */
export const getInitials = (name = '') => {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};
