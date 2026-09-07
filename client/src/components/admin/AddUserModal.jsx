import React, { useState } from 'react';
import Modal from '../common/Modal';
import NameProgressBar from '../common/NameProgressBar';
import { adminService } from '../../services/admin.service';
import { useToast } from '../../context/ToastContext';
import {
  validateName,
  validateEmail,
  validatePassword,
  validateAddress,
  getPasswordCriteria,
} from '../../utils/validators';
import { UserPlus, Check, X } from 'lucide-react';

const AddUserModal = ({ isOpen = true, onClose, onUserCreated, onUserDeleted }) => {
  const { showSuccess, showError, showInfo } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    address: '',
    role: 'normal_user',
  });

  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');

  const nameError = validateName(formData.name);
  const emailError = validateEmail(formData.email);
  const passwordError = validatePassword(formData.password);
  const addressError = validateAddress(formData.address);
  const passwordCriteria = getPasswordCriteria(formData.password);

  const isFormValid =
    !nameError && !emailError && !passwordError && !addressError;

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ name: true, email: true, password: true, address: true });
    setApiError('');

    if (!isFormValid) return;

    setSubmitting(true);
    try {
      const res = await adminService.createUser(formData);
      if (res.success) {
        const createdUser = res.data;
        const createdName = formData.name;
        if (onUserCreated) onUserCreated(createdUser);
        onClose();

        // Actionable Toast with [Undo]
        showSuccess(`User '${createdName}' added successfully.`, {
          action: {
            label: 'Undo',
            onClick: async () => {
              try {
                await adminService.deleteUser(createdUser.id);
                if (onUserDeleted) onUserDeleted(createdUser.id);
                showInfo(`Action undone: User '${createdName}' removed.`);
              } catch (undoErr) {
                showError('Failed to undo user creation.');
              }
            },
          },
          duration: 7000,
        });
      } else {
        setApiError(res.message || 'Failed to create user');
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.message ||
        'Error creating user';
      setApiError(msg);
      showError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal title="Create New Platform User" isOpen={isOpen} onClose={onClose} maxWidth="560px">
      <form onSubmit={handleSubmit}>
        {apiError && (
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
            {apiError}
          </div>
        )}

        <div className="form-group">
          <label className="form-label">
            Full Name <span className="form-hint">(20–60 characters)</span>
          </label>
          <input
            type="text"
            className={`form-input ${touched.name && nameError ? 'is-invalid' : ''} ${touched.name && !nameError ? 'is-valid' : ''}`}
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            onBlur={() => handleBlur('name')}
            placeholder="e.g. Johnathan Alexander Doe Member"
            required
          />
          {/* Real-time Validation UI: Progress Bar (20-60 chars) */}
          <NameProgressBar length={formData.name.length} min={20} max={60} />
          {touched.name && nameError && <span className="form-error">{nameError}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">Email Address</label>
          <input
            type="email"
            className={`form-input ${touched.email && emailError ? 'is-invalid' : ''} ${touched.email && !emailError ? 'is-valid' : ''}`}
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            onBlur={() => handleBlur('email')}
            placeholder="user@example.com"
            required
          />
          {touched.email && emailError && <span className="form-error">{emailError}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">Role Assignment</label>
          <select
            className="form-select"
            value={formData.role}
            onChange={(e) => handleChange('role', e.target.value)}
          >
            <option value="normal_user">Normal User (Customer / Reviewer)</option>
            <option value="store_owner">Store Owner (Merchant)</option>
            <option value="admin">System Administrator</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">
            Temporary Password <span className="form-hint">(8–16 chars)</span>
          </label>
          <input
            type="password"
            className={`form-input ${touched.password && passwordError ? 'is-invalid' : ''} ${touched.password && !passwordError ? 'is-valid' : ''}`}
            value={formData.password}
            onChange={(e) => handleChange('password', e.target.value)}
            onBlur={() => handleBlur('password')}
            placeholder="e.g. TempPass@123"
            required
          />

          {/* Password criteria checklist */}
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
          <label className="form-label">
            Address <span className="form-hint">(Max 400 chars)</span>
          </label>
          <textarea
            className={`form-textarea ${touched.address && addressError ? 'is-invalid' : ''}`}
            value={formData.address}
            onChange={(e) => handleChange('address', e.target.value)}
            onBlur={() => handleBlur('address')}
            rows={2}
            placeholder="123 Main Street, Suite 100, City..."
          />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            {touched.address && addressError ? (
              <span className="form-error">{addressError}</span>
            ) : <span />}
            <span className="char-counter">{formData.address.length}/400</span>
          </div>
        </div>

        <div className="modal-footer" style={{ margin: '1.5rem -1.5rem -1.5rem', padding: '1rem 1.5rem' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting || !isFormValid}>
            <UserPlus size={16} />
            <span>{submitting ? 'Creating...' : 'Create User'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddUserModal;
