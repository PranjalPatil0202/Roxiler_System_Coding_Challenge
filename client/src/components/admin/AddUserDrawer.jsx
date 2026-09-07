import React, { useState } from 'react';
import Drawer from '../common/Drawer';
import { adminService } from '../../services/admin.service';
import { useToast } from '../../context/ToastContext';
import {
  validateName,
  validateEmail,
  validatePassword,
  validateAddress,
  getPasswordCriteria,
} from '../../utils/validators';
import {
  UserPlus,
  User,
  Mail,
  KeyRound,
  Eye,
  EyeOff,
  Home,
  Check,
  X,
} from 'lucide-react';

const AddUserDrawer = ({ isOpen = false, onClose, onUserCreated, onUserDeleted }) => {
  const { showSuccess, showError, showInfo } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    address: '',
    role: 'normal_user',
  });

  const [showPassword, setShowPassword] = useState(false);
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

  // Auto-generate strong compliant password (8-16 chars, 1 uppercase, 1 special char)
  const handleGeneratePassword = () => {
    const chars = 'abcdefghjkmnpqrstuvwxyz';
    const uppers = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const specials = '@#$%&*!';
    const numbers = '23456789';

    let pass = '';
    pass += uppers[Math.floor(Math.random() * uppers.length)];
    pass += specials[Math.floor(Math.random() * specials.length)];
    pass += numbers[Math.floor(Math.random() * numbers.length)];
    pass += numbers[Math.floor(Math.random() * numbers.length)];

    for (let i = 0; i < 6; i++) {
      pass += chars[Math.floor(Math.random() * chars.length)];
    }

    setFormData((prev) => ({ ...prev, password: pass }));
    setTouched((prev) => ({ ...prev, password: true }));
    setShowPassword(true);
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
        // Reset form
        setFormData({
          name: '',
          email: '',
          password: '',
          address: '',
          role: 'normal_user',
        });
        setTouched({});

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

  const roleOptions = [
    { id: 'admin', label: 'Admin' },
    { id: 'store_owner', label: 'Store Owner' },
    { id: 'normal_user', label: 'Customer' },
  ];

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Add New User"
      subtitle="or Register Store"
      width="460px"
    >
      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          minHeight: '100%',
          fontFamily: 'var(--font-sans, Inter, sans-serif)',
        }}
      >
        {apiError && (
          <div
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: 'var(--danger-bg)',
              color: 'var(--danger)',
              borderRadius: '8px',
              fontSize: '0.85rem',
              border: '1px solid rgba(239, 68, 68, 0.25)',
            }}
          >
            {apiError}
          </div>
        )}

        {/* 1. Full Name: Label on left, '25/60' counter on right. 2px indigo progress bar nested beneath input border */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <label
              className="form-label"
              style={{
                margin: 0,
                fontWeight: 600,
                fontSize: '0.85rem',
                color: '#0F172A',
                textAlign: 'left',
              }}
            >
              Full Name
            </label>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 600,
                color: '#64748B',
                fontFamily: 'var(--font-sans, Inter, sans-serif)',
              }}
            >
              {formData.name.length}/60
            </span>
          </div>

          <div style={{ position: 'relative' }}>
            <User
              size={16}
              style={{
                position: 'absolute',
                left: '0.85rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94A3B8',
                pointerEvents: 'none',
              }}
            />
            <input
              type="text"
              className={`form-input ${touched.name && nameError ? 'is-invalid' : ''} ${touched.name && !nameError ? 'is-valid' : ''}`}
              style={{
                paddingLeft: '2.4rem',
                borderRadius: '8px',
                fontSize: '0.875rem',
                borderColor: '#E2E8F0',
              }}
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              onBlur={() => handleBlur('name')}
              placeholder="e.g. Johnathan Alexander Doe"
              required
            />
            {/* 2px Indigo Progress Bar nested perfectly beneath the border */}
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: '4px',
                right: '4px',
                height: '2px',
                backgroundColor: 'rgba(79, 70, 229, 0.12)',
                borderRadius: '0 0 8px 8px',
                overflow: 'hidden',
                pointerEvents: 'none',
              }}
              aria-hidden="true"
            >
              <div
                style={{
                  height: '100%',
                  width: `${Math.min(100, (formData.name.length / 60) * 100)}%`,
                  backgroundColor: formData.name.length > 60 ? '#EF4444' : '#4F46E5',
                  transition: 'width 200ms cubic-bezier(0.16, 1, 0.3, 1), background-color 200ms ease',
                }}
              />
            </div>
          </div>
          {touched.name && nameError && <span className="form-error" style={{ marginTop: '4px', fontSize: '0.75rem' }}>{nameError}</span>}
        </div>

        {/* 2. Email: Standard input with clear 'Mail' icon inside on the left */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label
            className="form-label"
            style={{
              marginBottom: '6px',
              fontWeight: 600,
              fontSize: '0.85rem',
              color: '#0F172A',
              textAlign: 'left',
              display: 'block',
            }}
          >
            Email
          </label>
          <div style={{ position: 'relative' }}>
            <Mail
              size={16}
              style={{
                position: 'absolute',
                left: '0.85rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94A3B8',
                pointerEvents: 'none',
              }}
            />
            <input
              type="email"
              className={`form-input ${touched.email && emailError ? 'is-invalid' : ''} ${touched.email && !emailError ? 'is-valid' : ''}`}
              style={{
                paddingLeft: '2.4rem',
                borderRadius: '8px',
                fontSize: '0.875rem',
                borderColor: '#E2E8F0',
              }}
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              onBlur={() => handleBlur('email')}
              placeholder="user@example.com"
              required
            />
          </div>
          {touched.email && emailError && <span className="form-error" style={{ marginTop: '4px', fontSize: '0.75rem' }}>{emailError}</span>}
        </div>

        {/* 3. Password Section: Label row has 'Password' on left and '✨ Generate' link on right */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <label
              className="form-label"
              style={{
                margin: 0,
                fontWeight: 600,
                fontSize: '0.85rem',
                color: '#0F172A',
                textAlign: 'left',
              }}
            >
              Password
            </label>
            <button
              type="button"
              onClick={handleGeneratePassword}
              style={{
                background: 'none',
                border: 'none',
                color: '#4F46E5',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '2px 4px',
                transition: 'opacity 150ms ease',
              }}
              title="Auto-generate a secure compliant password"
            >
              <span>✨ Generate</span>
            </button>
          </div>

          <div style={{ position: 'relative' }}>
            <KeyRound
              size={16}
              style={{
                position: 'absolute',
                left: '0.85rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94A3B8',
                pointerEvents: 'none',
              }}
            />
            <input
              type={showPassword ? 'text' : 'password'}
              className={`form-input ${touched.password && passwordError ? 'is-invalid' : ''} ${touched.password && !passwordError ? 'is-valid' : ''}`}
              style={{
                paddingLeft: '2.4rem',
                paddingRight: '2.5rem',
                borderRadius: '8px',
                fontSize: '0.875rem',
                borderColor: '#E2E8F0',
              }}
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              onBlur={() => handleBlur('password')}
              placeholder="Enter 8-16 char password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '0.65rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: '#94A3B8',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
              }}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {/* Password Validation Checklist */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '0.35rem 0.5rem',
              marginTop: '0.5rem',
              fontSize: '0.75rem',
            }}
          >
            {passwordCriteria.map((c) => (
              <div
                key={c.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  color: c.met ? 'var(--success)' : '#94A3B8',
                  fontWeight: c.met ? 600 : 400,
                  transition: 'color 180ms ease',
                }}
              >
                {c.met ? <Check size={12} strokeWidth={2.5} /> : <X size={12} />}
                <span>{c.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Address: Textarea with 'Home' icon, restricted to 3 lines height, with '0/400' counter */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label
            className="form-label"
            style={{
              marginBottom: '6px',
              fontWeight: 600,
              fontSize: '0.85rem',
              color: '#0F172A',
              textAlign: 'left',
              display: 'block',
            }}
          >
            Address
          </label>
          <div style={{ position: 'relative' }}>
            <Home
              size={16}
              style={{
                position: 'absolute',
                left: '0.85rem',
                top: '0.75rem',
                color: '#94A3B8',
                pointerEvents: 'none',
              }}
            />
            <textarea
              className={`form-input form-textarea ${touched.address && addressError ? 'is-invalid' : ''}`}
              rows={3}
              style={{
                paddingLeft: '2.4rem',
                paddingRight: '3.5rem',
                paddingBottom: '1.4rem',
                borderRadius: '8px',
                fontSize: '0.85rem',
                maxHeight: '84px',
                resize: 'none',
                borderColor: '#E2E8F0',
              }}
              placeholder="Street address, suite, city, state, zip..."
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              onBlur={() => handleBlur('address')}
            />
            <div
              style={{
                position: 'absolute',
                right: '0.75rem',
                bottom: '0.45rem',
                fontSize: '0.72rem',
                color: '#64748B',
                fontWeight: 600,
                pointerEvents: 'none',
                fontFamily: 'var(--font-sans, Inter, sans-serif)',
              }}
            >
              {formData.address.length}/400
            </div>
          </div>
          {touched.address && addressError && <span className="form-error" style={{ marginTop: '4px', fontSize: '0.75rem' }}>{addressError}</span>}
        </div>

        {/* 5. Role/Type Selector: Horizontal pill-shaped button group: [Admin] [Store Owner] [Customer] */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label
            className="form-label"
            style={{
              marginBottom: '6px',
              fontWeight: 600,
              fontSize: '0.85rem',
              color: '#0F172A',
              textAlign: 'left',
              display: 'block',
            }}
          >
            Role/Type Selector
          </label>
          <div
            style={{
              display: 'flex',
              backgroundColor: '#F1F5F9',
              padding: '4px',
              borderRadius: '9999px',
              gap: '4px',
            }}
            role="radiogroup"
            aria-label="Role/Type Selector"
          >
            {roleOptions.map((roleOption) => {
              const isSelected = formData.role === roleOption.id;
              return (
                <button
                  key={roleOption.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => handleChange('role', roleOption.id)}
                  style={{
                    flex: 1,
                    padding: '0.45rem 0.75rem',
                    borderRadius: '9999px',
                    border: 'none',
                    fontSize: '0.8125rem',
                    fontWeight: isSelected ? 700 : 500,
                    backgroundColor: isSelected ? '#4F46E5' : 'transparent',
                    color: isSelected ? '#FFFFFF' : '#64748B',
                    boxShadow: isSelected ? '0 2px 6px rgba(79, 70, 229, 0.25)' : 'none',
                    cursor: 'pointer',
                    transition: 'all 180ms cubic-bezier(0.16, 1, 0.3, 1)',
                    textAlign: 'center',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {roleOption.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sticky Footer: Full-width 'Create Account' high-contrast Indigo button */}
        <div
          style={{
            position: 'sticky',
            bottom: 0,
            marginTop: 'auto',
            paddingTop: '16px',
            paddingBottom: '4px',
            backgroundColor: '#FFFFFF',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            borderTop: '1px solid #E2E8F0',
            zIndex: 10,
          }}
        >
          <button
            type="submit"
            className="btn btn-primary"
            style={{
              width: '100%',
              backgroundColor: isFormValid ? '#4F46E5' : '#CBD5E1',
              borderColor: isFormValid ? '#4F46E5' : '#CBD5E1',
              color: '#FFFFFF',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.9375rem',
              boxShadow: isFormValid ? '0 4px 14px rgba(79, 70, 229, 0.3)' : 'none',
              cursor: isFormValid ? 'pointer' : 'not-allowed',
              padding: '0.75rem 1.25rem',
              transition: 'all 180ms ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
            disabled={submitting || !isFormValid}
          >
            <UserPlus size={18} />
            <span>{submitting ? 'Creating Account...' : 'Create Account'}</span>
          </button>
        </div>
      </form>
    </Drawer>
  );
};

export default AddUserDrawer;
