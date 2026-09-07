import React from 'react';
import { formatRelativeTime } from '../../utils/formatters';
import { UserPlus, Store, Star, Activity, ChevronRight, User } from 'lucide-react';

const ActivityFeed = ({ activities = [], onSelectUser, onSelectStore }) => {
  const getEventIcon = (type) => {
    switch (type) {
      case 'user_registered':
        return (
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--admin-accent-subtle)',
              color: 'var(--admin-accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <UserPlus size={16} />
          </div>
        );
      case 'store_created':
        return (
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--owner-accent-subtle)',
              color: 'var(--owner-accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Store size={16} />
          </div>
        );
      case 'rating_submitted':
        return (
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--user-accent-subtle)',
              color: 'var(--user-accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Star size={16} fill="currentColor" />
          </div>
        );
      default:
        return (
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-surface)',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Activity size={16} />
          </div>
        );
    }
  };

  const handleItemClick = (act) => {
    if (act.type === 'user_registered' && onSelectUser) {
      onSelectUser(act.userId || act.entityId);
    } else if (act.type === 'store_created' && onSelectStore) {
      onSelectStore(act.entityId);
    }
  };

  return (
    <div
      className="card elevation-raised"
      style={{
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.25rem',
        }}
      >
        <div>
          <h4 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Recent Platform Activity</h4>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
            Interactive audit log — click any event to inspect records in slide-over drawer
          </p>
        </div>
        <span
          className="badge"
          style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-secondary)' }}
        >
          {activities.length} Events
        </span>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          flex: 1,
          overflowY: 'auto',
        }}
      >
        {activities.length === 0 ? (
          <div
            style={{
              padding: '2rem 1rem',
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontSize: '0.875rem',
            }}
          >
            No recent platform activities recorded yet.
          </div>
        ) : (
          activities.map((act) => {
            const isUserEvent = act.type === 'user_registered';
            return (
              <div
                key={act.id}
                onClick={() => handleItemClick(act)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.875rem',
                  padding: '0.75rem 0.95rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-surface-subtle)',
                  border: '1px solid var(--border-color)',
                  cursor: isUserEvent ? 'pointer' : 'default',
                  transition: 'all var(--trans-fast)',
                }}
                className="activity-item-interactive"
                title={isUserEvent ? `Click to inspect full user profile for ${act.description}` : undefined}
              >
                {getEventIcon(act.type)}

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'baseline',
                      gap: '0.5rem',
                    }}
                  >
                    <span
                      style={{
                        fontWeight: 700,
                        fontSize: '0.875rem',
                        color: 'var(--text-primary)',
                      }}
                    >
                      {act.title}
                    </span>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)',
                        whiteSpace: 'nowrap',
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {formatRelativeTime(act.timestamp)}
                    </span>
                  </div>
                  <div
                    style={{
                      color: 'var(--text-secondary)',
                      fontSize: '0.8125rem',
                      marginTop: '0.15rem',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {act.description}
                  </div>
                </div>

                {isUserEvent && (
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleItemClick(act);
                    }}
                    style={{
                      padding: '4px 8px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: '#4F46E5',
                      backgroundColor: 'rgba(79, 70, 229, 0.08)',
                      borderRadius: '6px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '3px',
                      flexShrink: 0,
                    }}
                    title="Inspect user profile in slide-over drawer"
                  >
                    <User size={12} />
                    <span>Profile</span>
                    <ChevronRight size={12} />
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ActivityFeed;
