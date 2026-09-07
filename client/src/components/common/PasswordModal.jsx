import React, { useState } from 'react';
import Modal from './Modal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { validatePassword, getPasswordCriteria } from '../../utils/validators';
import { Check, X, KeyRound } from 'lucide-react';

const PasswordModal = ({ onClose }) => {
  const { updatePassword } = useAuth();
  const { showSuccess, showError } = useToast();

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const passwordCriteria = getPasswordCriteria(newPassword);
  const isCriteriaMet = passwordCriteria.every((c) => c.met);
  const isMatch = newPassword === confirmPassword && confirmPassword.length > 0;

  const handleSubmit = async (e) => {
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
        onClose();
      } else {
        setErrorMsg(response.message || 'Failed to update password');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update password. Check your current password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal title="Change Password" onClose={onClose} maxWidth="480px">
      <form onSubmit={handleSubmit}>
        {errorMsg && (
          <div
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: 'var(--danger-bg)',
              color: 'var(--danger)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.875rem',
              marginBottom: '1.25rem',
              border: '1px solid rgba(239, 68, 68, 0.2)',
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
                {c.met ? <Check size={14} color="var(--success)" /> : <X size={14} color="var(--text-muted)" />}
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

        <div className="modal-footer" style={{ margin: '1.5rem -1.5rem -1.5rem', padding: '1rem 1.5rem' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting || !isCriteriaMet || !isMatch || !oldPassword}
          >
            <KeyRound size={16} />
            <span>{submitting ? 'Updating...' : 'Update Password'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default PasswordModal;
