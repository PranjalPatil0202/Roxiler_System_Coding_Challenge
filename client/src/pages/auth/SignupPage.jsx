import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  validateName,
  validateEmail,
  validatePassword,
  validateAddress,
  getPasswordCriteria,
} from '../../utils/validators';
import SignupReviewIllustration from '../../components/common/illustrations/SignupReviewIllustration';
import {
  Store,
  UserPlus,
  ArrowRight,
  Check,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
} from 'lucide-react';

const SignupPage = () => {
  const { register, loading } = useAuth();
  const { showSuccess } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    address: '',
  });

  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Strict Real-Time Validation
  const nameLength = formData.name.length;
  const isNameEmpty = nameLength === 0;
  const isNameTooShort = nameLength > 0 && nameLength < 20;
  const isNameTooLong = nameLength > 60;
  const isNameValid = nameLength >= 20 && nameLength <= 60;

  const addressLength = formData.address.length;
  const isAddressTooLong = addressLength > 400;

  const emailError = validateEmail(formData.email);
  const passwordError = validatePassword(formData.password);
  const addressError = validateAddress(formData.address);
  const passwordCriteria = getPasswordCriteria(formData.password);

  // Form validity: Strictly disabled until all requirements are met
  const isFormValid =
    isNameValid &&
    !emailError &&
    !passwordError &&
    !addressError &&
    !isAddressTooLong &&
    formData.email.trim() !== '' &&
    formData.password.trim() !== '';

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ name: true, email: true, password: true, address: true });
    setErrorMsg('');

    if (!isFormValid) return;

    const res = await register(formData);
    if (res.success) {
      showSuccess(`Account created! Welcome to StorePulse, ${formData.name.split(' ')[0]}!`);
      navigate('/stores', { replace: true });
    } else {
      setErrorMsg(res.message || 'Registration failed. Please check your information.');
    }
  };

  // Gamified Name Counter Badge Colors
  const getNameBadgeStyle = () => {
    if (isNameEmpty) {
      return {
        bg: '#F1F5F9',
        color: '#64748B',
        border: '1px solid #E2E8F0',
      };
    }
    if (isNameTooShort) {
      return {
        bg: 'rgba(245, 158, 11, 0.12)',
        color: '#D97706',
        border: '1px solid rgba(245, 158, 11, 0.3)',
      };
    }
    if (isNameValid) {
      return {
        bg: 'rgba(16, 185, 129, 0.14)',
        color: '#059669',
        border: '1px solid rgba(16, 185, 129, 0.35)',
      };
    }
    // Too long (> 60)
    return {
      bg: 'rgba(239, 68, 68, 0.12)',
      color: '#EF4444',
      border: '1px solid rgba(239, 68, 68, 0.35)',
    };
  };

  const nameBadge = getNameBadgeStyle();
  const showNameError = touched.name && !isNameValid;

  return (
    <div className="auth-split-container page-fade-in" style={{ minHeight: '100vh', alignItems: 'stretch' }}>
      {/* =========================================================================
          LEFT SIDE: Scrollable Container with Vertical Padding (Height-Optimized)
          ========================================================================= */}
      <div
        className="auth-form-panel"
        style={{
          backgroundColor: '#ffffff',
          overflowY: 'auto',
          height: '100vh',
          maxHeight: '100vh',
          padding: '2.25rem 2.5rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          alignItems: 'center',
        }}
      >
        <div className="auth-form-wrapper" style={{ maxWidth: '440px', width: '100%', margin: 'auto 0' }}>
          {/* Compact Brand Header */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <Link
                to="/"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  textDecoration: 'none',
                }}
              >
                <div
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '10px',
                    backgroundColor: '#4F46E5',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 10px rgba(79, 70, 229, 0.25)',
                  }}
                >
                  <Store size={18} />
                </div>
                <span
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: 800,
                    fontFamily: 'var(--font-display)',
                    color: '#0F172A',
                    letterSpacing: '-0.02em',
                  }}
                >
                  StorePulse
                </span>
              </Link>

              {/* Step 1 of 1 Indicator Pill */}
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '0.2rem 0.65rem',
                  borderRadius: '9999px',
                  backgroundColor: '#EEF2FF',
                  border: '1px solid rgba(99, 102, 241, 0.2)',
                  color: '#4F46E5',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  letterSpacing: '0.02em',
                }}
              >
                Step 1 of 1
              </span>
            </div>

            {/* Compact Title */}
            <h1
              style={{
                fontSize: '1.85rem',
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                letterSpacing: '-0.03em',
                color: '#0F172A',
                lineHeight: 1.15,
                margin: 0,
              }}
            >
              Create your account
            </h1>
          </div>

          {/* Neatly Spaced Fields with space-y-4 (gap: 1rem) */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {errorMsg && (
              <div
                style={{
                  padding: '0.65rem 0.85rem',
                  backgroundColor: 'var(--danger-bg)',
                  color: 'var(--danger)',
                  borderRadius: '10px',
                  fontSize: '0.8125rem',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                }}
              >
                {errorMsg}
              </div>
            )}

            {/* 1. Full Name Field with Pill Counter and Gray Helper Text */}
            <div className="form-group" style={{ margin: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                <label className="form-label" style={{ margin: 0, fontWeight: 700, color: '#0F172A', fontSize: '0.85rem' }}>
                  Full Name
                </label>

                {/* Counter Pill Badge */}
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '0.1rem 0.5rem',
                    borderRadius: '9999px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    fontFamily: 'var(--font-mono, monospace)',
                    backgroundColor: nameBadge.bg,
                    color: nameBadge.color,
                    border: nameBadge.border,
                    transition: 'all 200ms ease',
                  }}
                >
                  {nameLength} / 60
                </span>
              </div>

              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="form-input"
                  style={{
                    borderRadius: '12px',
                    padding: '0.65rem 2.5rem 0.65rem 0.85rem',
                    fontSize: '0.875rem',
                    borderColor: showNameError
                      ? '#EF4444'
                      : isNameValid
                      ? '#10B981'
                      : 'var(--border-color)',
                    backgroundColor: showNameError ? 'rgba(239, 68, 68, 0.03)' : '#ffffff',
                    boxShadow: showNameError
                      ? '0 0 0 4px rgba(239, 68, 68, 0.12)'
                      : isNameValid
                      ? '0 0 0 4px rgba(16, 185, 129, 0.12)'
                      : 'none',
                    transition: 'border-color 150ms ease, box-shadow 150ms ease',
                  }}
                  placeholder="Enter full name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  onBlur={() => handleBlur('name')}
                  required
                />

                <div
                  style={{
                    position: 'absolute',
                    right: '0.8rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {isNameValid ? (
                    <Check size={16} color="#10B981" strokeWidth={2.5} />
                  ) : showNameError ? (
                    <AlertCircle size={16} color="#EF4444" />
                  ) : null}
                </div>
              </div>

              {/* Helper or Error text */}
              {showNameError ? (
                <span
                  style={{
                    color: '#EF4444',
                    fontSize: '0.75rem',
                    marginTop: '0.25rem',
                    display: 'block',
                    fontWeight: 600,
                  }}
                >
                  Name must be between 20 and 60 characters.
                </span>
              ) : (
                <span
                  style={{
                    color: '#94A3B8',
                    fontSize: '0.75rem',
                    marginTop: '0.25rem',
                    display: 'block',
                    fontWeight: 500,
                  }}
                >
                  Minimum 20 characters required
                </span>
              )}
            </div>

            {/* 2. Email Address Field with Mail Icon */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                Email Address
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
                  className="form-input"
                  style={{ padding: '0.65rem 0.85rem 0.65rem 2.4rem', borderRadius: '12px', fontSize: '0.875rem' }}
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  onBlur={() => handleBlur('email')}
                  required
                />
              </div>
              {touched.email && emailError && (
                <span style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block', fontWeight: 600 }}>
                  {emailError}
                </span>
              )}
            </div>

            {/* 3. Address Field: Multi-line textarea with 0/400 counter */}
            <div className="form-group" style={{ margin: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                <label className="form-label" style={{ margin: 0, fontWeight: 700, color: '#0F172A', fontSize: '0.85rem' }}>
                  Address
                </label>
              </div>

              <div style={{ position: 'relative' }}>
                <textarea
                  className="form-input form-textarea"
                  rows={2}
                  style={{
                    borderRadius: '12px',
                    borderColor: isAddressTooLong ? '#EF4444' : 'var(--border-color)',
                    resize: 'none',
                    fontSize: '0.85rem',
                    padding: '0.65rem 0.85rem 1.6rem',
                  }}
                  placeholder="Street address, city, state"
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
                    color: isAddressTooLong ? '#EF4444' : '#94A3B8',
                    fontWeight: 700,
                    pointerEvents: 'none',
                    fontFamily: 'var(--font-mono, monospace)',
                  }}
                >
                  {addressLength} / 400
                </div>
              </div>
              {isAddressTooLong && (
                <span style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block', fontWeight: 600 }}>
                  Address exceeds 400 characters
                </span>
              )}
            </div>

            {/* 4. Password Field with Compact 2-Column Requirement Checklist */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                Password
              </label>

              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Create password"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  onBlur={() => handleBlur('password')}
                  required
                  style={{ padding: '0.65rem 2.4rem 0.65rem 0.85rem', borderRadius: '12px', fontSize: '0.875rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#94A3B8',
                    padding: '4px',
                  }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>

              {/* Requirement Checklist: Compact 2-Column Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '0.4rem 0.75rem',
                  marginTop: '0.6rem',
                  fontSize: '0.75rem',
                }}
              >
                {passwordCriteria.map((c) => (
                  <div
                    key={c.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      color: c.met ? '#059669' : '#94A3B8',
                      fontWeight: c.met ? 600 : 400,
                      transition: 'color 180ms ease',
                    }}
                  >
                    <div
                      style={{
                        width: '15px',
                        height: '15px',
                        borderRadius: '50%',
                        backgroundColor: c.met ? 'rgba(16, 185, 129, 0.15)' : '#F1F5F9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: c.met ? '#059669' : '#94A3B8',
                        flexShrink: 0,
                      }}
                    >
                      <Check size={10} strokeWidth={c.met ? 3 : 2} />
                    </div>
                    <span style={{ whiteSpace: 'nowrap' }}>{c.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 5. Primary Button: High-Contrast Indigo with 12px Rounded Corners */}
            <div style={{ marginTop: '0.35rem' }}>
              <button
                type="submit"
                className="btn btn-primary btn-lg"
                style={{
                  width: '100%',
                  borderRadius: '12px',
                  fontWeight: 700,
                  fontSize: '1rem',
                  letterSpacing: '-0.01em',
                  padding: '0.8rem 1.5rem',
                  backgroundColor: isFormValid ? '#4F46E5' : '#E2E8F0',
                  borderColor: isFormValid ? '#4F46E5' : '#E2E8F0',
                  color: isFormValid ? '#ffffff' : '#94A3B8',
                  boxShadow: isFormValid ? '0 4px 14px rgba(79, 70, 229, 0.35)' : 'none',
                  cursor: isFormValid ? 'pointer' : 'not-allowed',
                  transition: 'all 200ms ease',
                }}
                disabled={loading || !isFormValid}
                title={!isFormValid ? 'Name must be at least 20 characters before signing up' : 'Create Account'}
              >
                <UserPlus size={18} />
                <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
              </button>
            </div>
          </form>

          {/* Bottom Login Link */}
          <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.85rem', color: '#64748B' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ fontWeight: 700, color: '#4F46E5', textDecoration: 'none' }}>
              Sign in instead <ArrowRight size={13} style={{ display: 'inline', verticalAlign: 'middle' }} />
            </Link>
          </div>
        </div>
      </div>

      {/* =========================================================================
          RIGHT SIDE: Fixed/Sticky Centered 3D Isometric Illustration
          ========================================================================= */}
      <div
        className="auth-illustration-panel"
        style={{
          backgroundColor: '#F5F7FF',
          background: 'linear-gradient(135deg, #F8FAFC 0%, #EEF2FF 50%, #F5F7FF 100%)',
          borderLeft: '1px solid var(--border-color)',
          position: 'sticky',
          top: 0,
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          padding: '2.5rem',
        }}
      >
        <div style={{ maxWidth: '480px', width: '100%', textAlign: 'center', position: 'relative', zIndex: 10 }}>
          {/* 3D Isometric Storefront Illustration */}
          <SignupReviewIllustration />

          <div style={{ marginTop: '1.75rem' }}>
            <h2
              style={{
                fontSize: '1.4rem',
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                color: '#0F172A',
                marginBottom: '0.35rem',
                letterSpacing: '-0.02em',
              }}
            >
              Verified Community Reviews
            </h2>
            <p
              style={{
                color: '#64748B',
                fontSize: '0.9rem',
                lineHeight: 1.5,
                maxWidth: '400px',
                margin: '0 auto',
              }}
            >
              Join verified reviewers rating storefronts, helping community members discover the highest-quality businesses.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
