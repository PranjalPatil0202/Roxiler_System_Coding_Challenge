import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { storeOwnerService } from '../../services/storeOwner.service';
import { validatePassword, getPasswordCriteria } from '../../utils/validators';
import { formatDate, formatRoleLabel } from '../../utils/formatters';
import {
  Store,
  Mail,
  MapPin,
  Calendar,
  Shield,
  KeyRound,
  Check,
  X,
  Building,
  User,
} from 'lucide-react';

const OwnerSettings = () => {
  const { user, role, updatePassword } = useAuth();
  const { showSuccess } = useToast();

  // Store data state
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);

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
    const fetchStores = async () => {
      setLoading(true);
      try {
        const res = await storeOwnerService.getStats();
        if (res.success && res.data?.stores) {
          setStores(res.data.stores);
        }
      } catch (err) {
        console.error('Error loading store info for settings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStores();
  }, []);

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
    <div className="owner-settings-page">
      {/* Header */}
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 className="page-title">Store & Account Settings</h1>
          <p className="page-subtitle">
            Manage your merchant store profile, account details, and security credentials.
          </p>
        </div>
      </div>

      <div className="settings-grid">
        {/* Left Column: Read-Only Store & Account Profile */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Managed Stores Information */}
          <div className="card elevation-raised" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--owner-accent-subtle)',
                  color: 'var(--owner-accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Store size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Store Information</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                  Read-only business locations registered to you
                </p>
              </div>
            </div>

            {loading ? (
              <div style={{ padding: '1rem', color: 'var(--text-muted)' }}>Loading store details...</div>
            ) : stores.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {stores.map((st) => (
                  <div
                    key={st.id}
                    style={{
                      padding: '1.25rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-surface-subtle)',
                      border: '1px solid var(--border-color)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
                        {st.name}
                      </span>
                      <span className="badge badge-rating">
                        ★ {st.average_rating > 0 ? st.average_rating.toFixed(1) : 'New'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                        <Mail size={15} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                        <span>{st.email || 'No email specified'}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                        <MapPin size={15} style={{ color: 'var(--text-muted)', marginTop: '2px', flexShrink: 0 }} />
                        <span>{st.address}</span>
                      </div>
                      {st.created_at && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                          <Calendar size={14} style={{ flexShrink: 0 }} />
                          <span>Registered {formatDate(st.created_at)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div
                style={{
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-surface-subtle)',
                  border: '1px dashed var(--border-color)',
                  color: 'var(--text-secondary)',
                  fontSize: '0.875rem',
                  lineHeight: 1.5,
                }}
              >
                <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '0.25rem' }}>
                  No store assigned yet
                </strong>
                Your merchant credentials are active, but no retail store has been linked to this account yet. Please contact a platform administrator to register or assign your store.
              </div>
            )}
          </div>

          {/* Merchant Account Profile */}
          <div className="card elevation-raised" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
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
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Merchant Profile</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                  Your platform login details
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.875rem' }}>
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
                <div style={{ color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  {user?.email || '—'}
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Account Role
                </label>
                <div style={{ marginTop: '0.35rem' }}>
                  <span className={`badge badge-${role || 'store_owner'}`}>
                    {formatRoleLabel(role || 'store_owner')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Security & Password Update Form */}
        <div>
          <div className="card elevation-raised" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
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

                {/* Password Criteria List */}
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

export default OwnerSettings;
