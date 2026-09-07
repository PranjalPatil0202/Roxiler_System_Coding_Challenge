import { formatRelativeTime } from './formatters';

/**
 * Compile a unified activity timeline from users, stores, and ratings
 */
export const generateRecentActivityFeed = (users = [], stores = [], ratings = [], limit = 10) => {
  const activities = [];

  // 1. Process User Signups
  users.forEach((u) => {
    if (u.created_at || u.createdAt) {
      activities.push({
        id: `user-${u.id}`,
        type: 'user_registered',
        title: 'New User Registered',
        description: `${u.name} joined as ${u.role === 'admin' ? 'Administrator' : u.role === 'store_owner' ? 'Store Owner' : 'Customer'}`,
        timestamp: new Date(u.created_at || u.createdAt),
        role: u.role,
        entityId: u.id,
      });
    }
  });

  // 2. Process Store Creations
  stores.forEach((s) => {
    if (s.created_at || s.createdAt) {
      activities.push({
        id: `store-${s.id}`,
        type: 'store_created',
        title: 'New Store Registered',
        description: `"${s.name}" was registered${s.owner?.name ? ` by ${s.owner.name}` : ''}`,
        timestamp: new Date(s.created_at || s.createdAt),
        entityId: s.id,
      });
    }
  });

  // 3. Process Ratings
  ratings.forEach((r) => {
    if (r.created_at || r.createdAt) {
      activities.push({
        id: `rating-${r.id}`,
        type: 'rating_submitted',
        title: 'Review Submitted',
        description: `${r.user?.name ? r.user.name.split(' ')[0] : 'Customer'} rated ${r.store?.name || `Store #${r.store_id}`} (${r.rating} ★)`,
        timestamp: new Date(r.created_at || r.createdAt),
        rating: r.rating,
        entityId: r.id,
      });
    }
  });

  // Sort descending by timestamp
  activities.sort((a, b) => b.timestamp - a.timestamp);

  return activities.slice(0, limit);
};

/**
 * Calculate trend indicator percentage (e.g. +14% vs previous period)
 * @param {Array<Object>} items - Array with created_at timestamps
 * @param {number} periodDays - Days per period (default 7)
 */
export const calculateTrend = (items = [], periodDays = 7) => {
  if (!items || items.length === 0) return null;

  const now = new Date().getTime();
  const periodMs = periodDays * 24 * 60 * 60 * 1000;

  const currentPeriodStart = now - periodMs;
  const previousPeriodStart = now - 2 * periodMs;

  let currentCount = 0;
  let previousCount = 0;

  items.forEach((item) => {
    const timestamp = new Date(item.created_at || item.createdAt).getTime();
    if (timestamp >= currentPeriodStart && timestamp <= now) {
      currentCount++;
    } else if (timestamp >= previousPeriodStart && timestamp < currentPeriodStart) {
      previousCount++;
    }
  });

  if (previousCount === 0) {
    if (currentCount > 0) {
      return { percentage: 100, isPositive: true, label: `+${currentCount} this week` };
    }
    return null;
  }

  const diff = currentCount - previousCount;
  const percentChange = Math.round((diff / previousCount) * 100);

  return {
    percentage: Math.abs(percentChange),
    isPositive: percentChange >= 0,
    label: `${percentChange >= 0 ? '+' : ''}${percentChange}% this week`,
  };
};

/**
 * Group registrations / items by day/week for Recharts
 */
export const groupTimelineData = (users = [], stores = [], ratings = []) => {
  // Generate date labels for the last 7 intervals/weeks
  const dateMap = {};

  const allItems = [
    ...users.map((u) => ({ type: 'users', date: new Date(u.created_at || u.createdAt) })),
    ...stores.map((s) => ({ type: 'stores', date: new Date(s.created_at || s.createdAt) })),
    ...ratings.map((r) => ({ type: 'ratings', date: new Date(r.created_at || r.createdAt) })),
  ];

  // If no items, provide structured fallback timeline
  if (allItems.length === 0) {
    return [
      { name: 'Week 1', users: 0, stores: 0, ratings: 0 },
      { name: 'Week 2', users: 0, stores: 0, ratings: 0 },
      { name: 'Week 3', users: 0, stores: 0, ratings: 0 },
      { name: 'Week 4', users: 0, stores: 0, ratings: 0 },
    ];
  }

  // Format by day / date
  allItems.forEach((item) => {
    const key = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(item.date);
    if (!dateMap[key]) {
      dateMap[key] = { name: key, users: 0, stores: 0, ratings: 0, timestamp: item.date.getTime() };
    }
    dateMap[key][item.type]++;
  });

  const timeline = Object.values(dateMap).sort((a, b) => a.timestamp - b.timestamp);

  // If only 1-2 points, pad with preceding days for aesthetics
  if (timeline.length === 1) {
    const single = timeline[0];
    return [
      { name: 'Earlier', users: 0, stores: 0, ratings: 0 },
      single,
      { name: 'Today', users: single.users, stores: single.stores, ratings: single.ratings },
    ];
  }

  return timeline;
};
