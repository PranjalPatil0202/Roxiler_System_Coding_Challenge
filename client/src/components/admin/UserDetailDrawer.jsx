import React, { useState, useEffect } from 'react';
import Drawer from '../common/Drawer';
import StarRating from '../common/StarRating';
import { adminService } from '../../services/admin.service';
import { formatRoleLabel, formatDate, getInitials, formatRelativeTime } from '../../utils/formatters';
import { User, Mail, MapPin, Calendar, Store, Star, Award, MessageSquare } from 'lucide-react';

const UserDetailDrawer = ({ userId, isOpen, onClose }) => {
  const isDrawerOpen = isOpen !== undefined ? isOpen : Boolean(userId);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!userId || !isDrawerOpen) {
      setUser(null);
      return;
    }

    const fetchUser = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await adminService.getUserDetail(userId);
        if (res.success && res.data) {
          setUser(res.data);
        } else {
          setError('User details could not be retrieved');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Error loading user details');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [userId, isDrawerOpen]);

  if (!isDrawerOpen) return null;

  return (
    <Drawer
      title="User Inspection Profile"
      subtitle={user ? `Account ID #${user.id} • ${formatRoleLabel(user.role)}` : 'Loading profile...'}
      isOpen={isDrawerOpen}
      onClose={onClose}
      width="560px"
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>
            Close Panel
          </button>
        </div>
      }
    >
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="skeleton" style={{ width: '100%', height: '100px', borderRadius: 'var(--radius-md)' }} />
          <div className="skeleton" style={{ width: '80%', height: '24px' }} />
          <div className="skeleton" style={{ width: '100%', height: '140px' }} />
        </div>
      ) : error ? (
        <div
          style={{
            padding: '1rem',
            backgroundColor: 'var(--danger-bg)',
            color: 'var(--danger)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          {error}
        </div>
      ) : user ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {/* Header Card with User Avatar & Role */}
          <div
            className="card elevation-flat"
            style={{
              padding: '1.25rem',
              backgroundColor: 'var(--bg-surface)',
              display: 'flex',
              alignItems: 'center',
              gap: '1.25rem',
            }}
          >
            <div
              className={`table-avatar avatar-${user.role}`}
              style={{ width: '56px', height: '56px', fontSize: '1.25rem' }}
            >
              {getInitials(user.name)}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                {user.name}
              </h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.15rem' }}>
                <Mail size={13} />
                <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{user.email}</span>
              </div>
              <div style={{ marginTop: '0.5rem' }}>
                <span className={`badge badge-${user.role}`}>
                  {formatRoleLabel(user.role)}
                </span>
              </div>
            </div>
          </div>

          {/* Profile Details List */}
          <div>
            <h5 style={{ fontSize: '0.875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
              Account Information
            </h5>

            <div className="card elevation-flat" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem', fontSize: '0.875rem' }}>
                <MapPin size={16} color="var(--text-muted)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Address</div>
                  <div style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {user.address || 'No physical address provided'}
                  </div>
                </div>
              </div>

              <div style={{ height: '1px', backgroundColor: 'var(--border-color)' }} />

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', fontSize: '0.875rem' }}>
                <Calendar size={16} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Member Since</div>
                  <div style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {formatDate(user.created_at)} ({formatRelativeTime(user.created_at)})
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* If Store Owner: Owned Stores & Ratings Performance */}
          {user.role === 'store_owner' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <h5 style={{ fontSize: '0.875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Store size={15} />
                  <span>Owned Stores & Performance ({user.stores?.length || 0})</span>
                </h5>

                <div className="badge badge-rating">
                  ★ {user.averageRating ? user.averageRating.toFixed(2) : '0.00'} Overall
                </div>
              </div>

              {user.stores && user.stores.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {user.stores.map((store) => (
                    <div
                      key={store.id}
                      className="card elevation-flat"
                      style={{ padding: '1rem', backgroundColor: 'var(--bg-card)' }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{store.name}</div>
                          <div style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', marginTop: '0.2rem' }}>
                            {store.address}
                          </div>
                        </div>
                        <StarRating rating={store.average_rating} showValue count={store.rating_count} size={14} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="card elevation-flat" style={{ padding: '1.25rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  No stores registered under this merchant account.
                </div>
              )}
            </div>
          )}

          {/* If Normal User: Submitted Reviews Log */}
          {user.role === 'normal_user' && (
            <div>
              <h5 style={{ fontSize: '0.875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Star size={15} color="var(--star-filled)" />
                <span>Submitted Reviews ({user.submittedRatings?.length || 0})</span>
              </h5>

              {user.submittedRatings && user.submittedRatings.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                  {user.submittedRatings.map((r) => (
                    <div
                      key={r.id}
                      className="card elevation-flat"
                      style={{
                        padding: '0.875rem 1rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          {r.store?.name || `Store #${r.store_id}`}
                        </div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '2px' }}>
                          Reviewed on {formatDate(r.created_at)}
                        </div>
                      </div>
                      <StarRating rating={r.rating} size={15} showValue />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="card elevation-flat" style={{ padding: '1.25rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  This user has not submitted any store reviews yet.
                </div>
              )}
            </div>
          )}
        </div>
      ) : null}
    </Drawer>
  );
};

export default UserDetailDrawer;
