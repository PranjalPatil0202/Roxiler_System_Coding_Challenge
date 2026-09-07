import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { validateEmail, getPasswordCriteria } from '../../utils/validators';
import AuthHeroIllustration from '../../components/common/illustrations/AuthHeroIllustration';
import {
  Store,
  LogIn,
  ArrowRight,
  Sparkles,
  Crown,
  User,
  Mail,
  Eye,
  EyeOff,
  Check,
  X,
} from 'lucide-react';

const LoginPage = () => {
  const { login, loading } = useAuth();
  const { showSuccess } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [activeMood, setActiveMood] = useState('admin'); // 'admin' | 'store_owner' | 'normal_user' | 'default'

  const passwordCriteria = getPasswordCriteria(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const emailError = validateEmail(email);
    if (emailError) {
      setErrorMsg(emailError);
      return;
    }

    if (!password) {
      setErrorMsg('Please enter your password');
      return;
    }

    const res = await login(email, password);
    if (res.success && res.user) {
      showSuccess(`Welcome back, ${res.user.name.split(' ')[0]}!`);

      // Role-based redirection
      if (from) {
        navigate(from, { replace: true });
      } else if (res.user.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else if (res.user.role === 'store_owner') {
        navigate('/owner/dashboard', { replace: true });
      } else {
        navigate('/stores', { replace: true });
      }
    } else {
      setErrorMsg(res.message || 'Login failed. Please check your credentials.');
    }
  };

  // Demo credentials quick filler & mood changer
  const fillDemo = (demoEmail, demoPassword, mood) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setActiveMood(mood);
    setErrorMsg('');
  };

  return (
    <div className="auth-split-container page-fade-in">
      {/* Left Column: Login Form & Demo Accounts */}
      <div className="auth-form-panel">
        <div className="auth-gradient-mesh" />

        <div className="auth-form-wrapper">
          {/* Brand Header */}
          <div style={{ marginBottom: '2rem' }}>
            <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem', textDecoration: 'none' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  backgroundColor: '#4F46E5',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)',
                }}
              >
                <Store size={22} />
              </div>
              <span style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                StorePulse
              </span>
            </Link>

            <h2 style={{ fontSize: '2.1rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-primary)', lineHeight: 1.15 }}>
              Welcome back
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.4rem' }}>
              Welcome back to your store rating & community platform.
            </p>
          </div>

          {/* Quick Demo Login Pills */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.55rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Sparkles size={13} color="#4F46E5" />
              <span>Quick demo pills</span>
            </div>

            <div className="demo-pills-row">
              <button
                type="button"
                className={`demo-pill demo-pill-admin ${activeMood === 'admin' ? 'is-active' : ''}`}
                onClick={() => fillDemo('admin@example.com', 'Admin@Password1', 'admin')}
                onMouseEnter={() => setActiveMood('admin')}
              >
                <Crown size={14} />
                <span>Admin</span>
              </button>

              <button
                type="button"
                className={`demo-pill demo-pill-owner ${activeMood === 'store_owner' ? 'is-active' : ''}`}
                onClick={() => fillDemo('owner1@example.com', 'Owner@Password1', 'store_owner')}
                onMouseEnter={() => setActiveMood('store_owner')}
              >
                <Store size={14} />
                <span>Store Owner</span>
              </button>

              <button
                type="button"
                className={`demo-pill demo-pill-user ${activeMood === 'normal_user' ? 'is-active' : ''}`}
                onClick={() => fillDemo('user1@example.com', 'User@Password1', 'normal_user')}
                onMouseEnter={() => setActiveMood('normal_user')}
              >
                <User size={14} />
                <span>Customer</span>
              </button>
            </div>
          </div>

          {/* Form Area */}
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
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                }}
              >
                {errorMsg}
              </div>
            )}

            {/* Email Field with Mail Icon */}
            <div className="form-group" style={{ marginBottom: '1.1rem' }}>
              <label className="form-label">Email</label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={17}
                  style={{
                    position: 'absolute',
                    left: '0.9rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                    pointerEvents: 'none',
                  }}
                />
                <input
                  type="email"
                  className="form-input"
                  style={{ paddingLeft: '2.5rem', borderRadius: '10px' }}
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password Field with Eye Toggle & Forgot Password Link */}
            <div className="form-group" style={{ marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <label className="form-label" style={{ marginBottom: 0 }}>Password</label>
                <Link
                  to="/login"
                  onClick={(e) => {
                    e.preventDefault();
                    fillDemo('user1@example.com', 'User@Password1', 'normal_user');
                  }}
                  style={{ fontSize: '0.8125rem', color: '#4F46E5', fontWeight: 600, textDecoration: 'none' }}
                >
                  Forgot password?
                </Link>
              </div>

              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  style={{ paddingRight: '2.6rem', borderRadius: '10px' }}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
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
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {/* Password Validation Checklist */}
            <div
              style={{
                display: 'flex',
                gap: '0.85rem',
                flexWrap: 'wrap',
                padding: '0.45rem 0',
                marginBottom: '1rem',
                fontSize: '0.75rem',
              }}
            >
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  color: passwordCriteria[0].met ? 'var(--success)' : 'var(--text-muted)',
                  fontWeight: passwordCriteria[0].met ? 600 : 400,
                  transition: 'color 200ms ease',
                }}
              >
                {passwordCriteria[0].met ? <Check size={13} strokeWidth={2.5} /> : <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--border-color)', display: 'inline-block' }} />}
                8-16 chars
              </span>

              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  color: passwordCriteria[1].met ? 'var(--success)' : 'var(--text-muted)',
                  fontWeight: passwordCriteria[1].met ? 600 : 400,
                  transition: 'color 200ms ease',
                }}
              >
                {passwordCriteria[1].met ? <Check size={13} strokeWidth={2.5} /> : <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--border-color)', display: 'inline-block' }} />}
                1 uppercase
              </span>

              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  color: passwordCriteria[2].met ? 'var(--success)' : 'var(--text-muted)',
                  fontWeight: passwordCriteria[2].met ? 600 : 400,
                  transition: 'color 200ms ease',
                }}
              >
                {passwordCriteria[2].met ? <Check size={13} strokeWidth={2.5} /> : <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--border-color)', display: 'inline-block' }} />}
                1 special char
              </span>
            </div>

            {/* Remember Me Checkbox */}
            <div style={{ marginBottom: '1.35rem' }}>
              <label
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.55rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  color: 'var(--text-secondary)',
                  userSelect: 'none',
                }}
              >
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{
                    accentColor: '#4F46E5',
                    width: '16px',
                    height: '16px',
                    cursor: 'pointer',
                    borderRadius: '4px',
                  }}
                />
                <span>Remember me</span>
              </label>
            </div>

            {/* High-Contrast Primary Button */}
            <button
              type="submit"
              className="btn btn-primary"
              style={{
                width: '100%',
                borderRadius: '12px',
                backgroundColor: '#4F46E5',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '1rem',
                padding: '0.85rem 1.25rem',
                boxShadow: '0 4px 14px rgba(79, 70, 229, 0.35)',
                transition: 'all 200ms ease',
              }}
              disabled={loading || !email || !password}
            >
              <LogIn size={18} />
              <span>{loading ? 'Signing In...' : 'Sign In'}</span>
            </button>
          </form>

          {/* Call to Action: Sign Up for Free */}
          <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Don't have an account yet?{' '}
            <Link to="/signup" style={{ fontWeight: 700, color: '#4F46E5', textDecoration: 'none' }}>
              Sign up for free <ArrowRight size={14} style={{ display: 'inline', verticalAlign: 'middle' }} />
            </Link>
          </div>
        </div>
      </div>

      {/* Right Column: Dynamic Brand Showcase Panel */}
      <div className={`auth-illustration-panel mood-${activeMood}`}>
        <div style={{ maxWidth: '480px', width: '100%', textAlign: 'center', position: 'relative', zIndex: 10 }}>
          {/* 3D Isometric Storefront & Rating Badge Scene */}
          <AuthHeroIllustration mood={activeMood} />

          {/* Action-Oriented Tagline */}
          <div style={{ marginTop: '2.25rem' }}>
            <h3
              style={{
                fontSize: '1.45rem',
                fontWeight: 800,
                color: 'var(--text-primary)',
                lineHeight: 1.35,
                maxWidth: '420px',
                margin: '0 auto',
                letterSpacing: '-0.02em',
              }}
            >
              Your voice matters. Rate and discover the best stores in your community.
            </h3>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
