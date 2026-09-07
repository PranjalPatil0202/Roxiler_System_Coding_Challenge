import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import StarRating from '../common/StarRating';
import { adminService } from '../../services/admin.service';
import { formatRoleLabel, formatDate } from '../../utils/formatters';
import { User, Mail, MapPin, Shield, Store, Star, Calendar } from 'lucide-react';

const UserDetailModal = ({ userId, isOpen = true, onClose }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) return;
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
  }, [userId]);

  return (
    <Modal title="User Account Details" isOpen={isOpen} onClose={onClose} maxWidth="600px">
      {loading ? (
        <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="skeleton" style={{ width: '60%', height: '1.75rem' }} />
          <div className="skeleton" style={{ width: '40%', height: '1rem' }} />
          <div className="skeleton" style={{ width: '100%', height: '4rem' }} />
          <div className="skeleton" style={{ width: '100%', height: '6rem' }} />
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Top Profile Summary */}
          <div
            style={{
              padding: '1.25rem',
              backgroundColor: 'var(--bg-surface)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h4 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{user.name}</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.2rem' }}>
                  <Mail size={14} />
                  <span>{user.email}</span>
                </div>
              </div>
              <span className={`badge badge-${user.role}`}>
                {formatRoleLabel(user.role)}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              <MapPin size={15} style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>{user.address || 'No address provided'}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
              <Calendar size={14} />
              <span>Joined on {formatDate(user.created_at)}</span>
            </div>
          </div>

          {/* Store Owner Special Section: Average Rating & Owned Stores */}
          {user.role === 'store_owner' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <h5 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Store size={18} />
                  <span>Owned Stores & Performance</span>
                </h5>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Overall Avg:</span>
                  <div className="badge badge-rating" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Star size={13} fill="currentColor" />
                    <span>{user.averageRating ? user.averageRating.toFixed(2) : '0.00'}</span>
                  </div>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    ({user.totalRatingsCount || 0} reviews)
                  </span>
                </div>
              </div>

              {user.stores && user.stores.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {user.stores.map((store) => (
                    <div
                      key={store.id}
                      style={{
                        padding: '1rem',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--bg-card)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ fontWeight: 600 }}>{store.name}</div>
                          <div style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', marginTop: '0.2rem' }}>
                            {store.address}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <StarRating rating={store.average_rating} showValue count={store.rating_count} size={15} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontStyle: 'italic' }}>
                  No stores currently registered under this owner account.
                </p>
              )}
            </div>
          )}

          {/* Normal User Submitted Ratings */}
          {user.role === 'normal_user' && (
            <div>
              <h5 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Star size={18} color="var(--star-filled)" />
                <span>Submitted Reviews</span>
              </h5>
              {user.submittedRatings && user.submittedRatings.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {user.submittedRatings.map((r) => (
                    <div
                      key={r.id}
                      style={{
                        padding: '0.75rem 1rem',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <span style={{ fontWeight: 600 }}>{r.store?.name || `Store #${r.store_id}`}</span>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                          Reviewed on {formatDate(r.created_at)}
                        </div>
                      </div>
                      <StarRating rating={r.rating} size={16} />
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontStyle: 'italic' }}>
                  This user has not submitted any store reviews yet.
                </p>
              )}
            </div>
          )}
        </div>
      ) : null}

      <div className="modal-footer" style={{ margin: '1.5rem -1.5rem -1.5rem', padding: '1rem 1.5rem' }}>
        <button className="btn btn-secondary" onClick={onClose}>
          Close
        </button>
      </div>
    </Modal>
  );
};

export default UserDetailModal;
