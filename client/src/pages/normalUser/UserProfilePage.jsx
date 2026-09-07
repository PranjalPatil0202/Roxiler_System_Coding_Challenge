import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { storeService } from '../../services/store.service';
import StarRating from '../../components/common/StarRating';
import { validatePassword, getPasswordCriteria } from '../../utils/validators';
import { formatRoleLabel, formatDate } from '../../utils/formatters';
import {
  User,
  Mail,
  MapPin,
  KeyRound,
  Check,
  X,
  Store,
  Sparkles,
  ShoppingBag,
  ExternalLink,
} from 'lucide-react';

const UserProfilePage = () => {
  const { user, role, updatePassword } = useAuth();
  const { showSuccess } = useToast();

  // Stores & rating history state
  const [stores, setStores] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // Password update form state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const passwordCriteria = getPasswordCriteria(newPassword);
  const isCriteriaMet = passwordCriteria.every((c) => c.met);
  const isMatch = newPassword === confirmPassword && confirmPassword.length > 0;

  useEffect(() => {
    const fetchRatedStores = async () => {
      setLoadingHistory(true);
      try {
        const res = await storeService.getStores({ limit: 100 });
        if (res.success && Array.isArray(res.data)) {
          setStores(res.data);
        }
      } catch (err) {
        console.warn('Could not fetch rating history:', err);
      } finally {
        setLoadingHistory(false);
      }
    };
    fetchRatedStores();
  }, []);

  const ratedStores = useMemo(() => {
    return stores.filter((s) => s.userRating !== null && s.userRating !== undefined);
  }, [stores]);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!oldPassword) {
      setErrorMsg('Please enter your current password');
      return;
    }

    const validationError = validatePassword(newPassword);
    if (validationError) {
      setErrorMsg(validationError);
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('New passwords do not match');
      return;
    }

    setSubmitting(true);
    try {
      const response = await updatePassword(oldPassword, newPassword);
      if (response.success) {
        showSuccess('Password updated successfully!');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setErrorMsg(response.message || 'Failed to update password');
      }
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message || 'Failed to update password. Check your current password.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="user-profile-page">
      {/* Header */}
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 className="page-title">My Account & Rating History</h1>
          <p className="page-subtitle">
            View your community contributions, profile information, and manage your account security.
          </p>
        </div>
      </div>

      <div className="settings-grid">
        {/* Left Column: Account Profile & Rating History */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* User Profile Card */}
          <div className="card elevation-raised" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--user-accent-subtle)',
                  color: 'var(--user-accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <User size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Personal Profile</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                  Your registered account credentials
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.875rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Full Name
                </label>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                  {user?.name || '—'}
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Email Address
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  <Mail size={14} style={{ color: 'var(--text-muted)' }} />
                  <span>{user?.email || '—'}</span>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Address
                </label>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.4rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  <MapPin size={14} style={{ color: 'var(--text-muted)', marginTop: '2px', flexShrink: 0 }} />
                  <span>{user?.address || 'No address provided'}</span>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Role Badge
                </label>
                <div style={{ marginTop: '0.35rem' }}>
                  <span className="badge badge-normal_user">
                    {formatRoleLabel(role || 'normal_user')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Rating History Card */}
          <div className="card elevation-raised" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--owner-accent-subtle)',
                    color: 'var(--star-filled)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Sparkles size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Your Rating History</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                    Stores you have reviewed ({ratedStores.length})
                  </p>
                </div>
              </div>

              <Link to="/stores" className="btn btn-ghost btn-sm" style={{ gap: '0.3rem' }}>
                <span>Browse</span>
                <ExternalLink size={13} />
              </Link>
            </div>

            {loadingHistory ? (
              <div style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                Loading your reviews...
              </div>
            ) : ratedStores.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {ratedStores.map((st) => (
                  <div key={st.id} className="rating-history-item">
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9375rem' }}>
                        {st.name}
                      </div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.775rem', marginTop: '0.2rem' }}>
                        {st.address}
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' }}>
                      <StarRating rating={st.userRating} size={15} readOnly />
                      <span
                        style={{
                          fontSize: '0.725rem',
                          fontWeight: 700,
                          color: 'var(--user-accent)',
                          backgroundColor: 'var(--user-accent-subtle)',
                          padding: '0.1rem 0.45rem',
                          borderRadius: 'var(--radius-full)',
                        }}
                      >
                        You rated {st.userRating} ★
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div
                style={{
                  padding: '1.5rem',
                  textAlign: 'center',
                  backgroundColor: 'var(--bg-surface-subtle)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px dashed var(--border-color)',
                }}
              >
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.75rem' }}>
                  You have not submitted ratings for any stores yet.
                </p>
                <Link to="/stores" className="btn btn-primary btn-sm">
                  <ShoppingBag size={14} />
                  <span>Start Rating Stores</span>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Password & Account Security */}
        <div>
          <div className="card elevation-raised" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--admin-accent-subtle)',
                  color: 'var(--admin-accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <KeyRound size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Security & Password</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                  Update your authentication password
                </p>
              </div>
            </div>

            <form onSubmit={handlePasswordSubmit}>
              {errorMsg && (
                <div
                  style={{
                    padding: '0.75rem 1rem',
                    backgroundColor: 'var(--danger-bg)',
                    color: 'var(--danger)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.875rem',
                    marginBottom: '1.25rem',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                  }}
                >
                  {errorMsg}
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Current Password</label>
                <input
                  type="password"
                  className="form-input"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Enter current password"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">New Password</label>
                <input
                  type="password"
                  className="form-input"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter 8-16 char password"
                  required
                />

                {/* Real-time criteria checklist */}
                <div className="criteria-list">
                  {passwordCriteria.map((c) => (
                    <div key={c.id} className={`criteria-item ${c.met ? 'met' : ''}`}>
                      {c.met ? (
                        <Check size={14} color="var(--success)" />
                      ) : (
                        <X size={14} color="var(--text-muted)" />
                      )}
                      <span>{c.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input
                  type="password"
                  className="form-input"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  required
                />
                {confirmPassword && !isMatch && (
                  <span className="form-error">Passwords do not match</span>
                )}
              </div>

              <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting || !isCriteriaMet || !isMatch || !oldPassword}
                >
                  <KeyRound size={16} />
                  <span>{submitting ? 'Updating Password...' : 'Save New Password'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
