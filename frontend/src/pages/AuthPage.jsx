import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, registerUser } from '../redux/authSlice';
import { Link, useNavigate } from 'react-router-dom';

/* ─── Pure-CSS style objects ────────────────────────────────────────── */
const S = {
  page: {
    display: 'flex',
    minHeight: '100vh',
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    background: '#07080f',
  },

  /* ── Left panel ── */
  left: {
    flex: '1 1 50%',
    background: 'linear-gradient(145deg, #0d0e1e 0%, #111327 60%, #0a0b18 100%)',
    borderRight: '1px solid rgba(255,255,255,0.06)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: '60px 64px',
    position: 'relative',
    overflow: 'hidden',
  },
  leftGlow1: {
    position: 'absolute',
    bottom: '-120px',
    right: '-120px',
    width: '360px',
    height: '360px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  leftGlow2: {
    position: 'absolute',
    top: '-80px',
    left: '-80px',
    width: '280px',
    height: '280px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  leftContent: {
    position: 'relative',
    zIndex: 1,
    maxWidth: '440px',
  },
  logoBox: {
    width: '52px',
    height: '52px',
    borderRadius: '14px',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: 900,
    fontSize: '18px',
    boxShadow: '0 0 30px rgba(99,102,241,0.35)',
    marginBottom: '48px',
  },
  leftH1: {
    fontSize: '40px',
    fontWeight: 900,
    color: 'white',
    lineHeight: 1.1,
    letterSpacing: '-1.5px',
    marginBottom: '20px',
  },
  leftP: {
    fontSize: '16px',
    color: '#6b7694',
    lineHeight: 1.7,
    marginBottom: '48px',
  },
  featureList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  featureItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '18px 20px',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '14px',
  },
  featureIcon: (color) => ({
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    background: `${color}20`,
    border: `1px solid ${color}30`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    flexShrink: 0,
  }),
  featureTitle: {
    fontSize: '14px',
    fontWeight: 700,
    color: '#e2e8f0',
    marginBottom: '3px',
  },
  featureSub: {
    fontSize: '12px',
    color: '#4a5580',
  },

  /* ── Right panel (form) ── */
  right: {
    flex: '1 1 50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px 40px',
    background: '#07080f',
  },
  card: {
    width: '100%',
    maxWidth: '420px',
  },
  cardLogoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '36px',
  },
  cardLogoIcon: {
    width: '34px',
    height: '34px',
    borderRadius: '9px',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: 800,
    fontSize: '12px',
    boxShadow: '0 0 16px rgba(99,102,241,0.3)',
  },
  cardLogoText: {
    fontSize: '16px',
    fontWeight: 800,
    color: 'white',
    letterSpacing: '-0.3px',
  },
  cardH2: {
    fontSize: '28px',
    fontWeight: 900,
    color: 'white',
    letterSpacing: '-0.8px',
    marginBottom: '8px',
  },
  cardSub: {
    fontSize: '14px',
    color: '#4a5580',
    marginBottom: '32px',
  },
  errorBox: {
    background: 'rgba(239,68,68,0.08)',
    border: '1px solid rgba(239,68,68,0.2)',
    borderRadius: '10px',
    padding: '12px 16px',
    color: '#f87171',
    fontSize: '13px',
    marginBottom: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#8892b0',
    letterSpacing: '0.2px',
  },
  labelRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inputWrap: {
    position: 'relative',
  },
  inputIcon: {
    position: 'absolute',
    left: '14px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#3d4466',
    fontSize: '15px',
    pointerEvents: 'none',
    lineHeight: 1,
  },
  input: {
    width: '100%',
    padding: '13px 14px 13px 40px',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '10px',
    color: '#e2e8f0',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  },
  select: {
    width: '100%',
    padding: '13px 14px 13px 40px',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '10px',
    color: '#e2e8f0',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    appearance: 'none',
  },
  forgotLink: {
    fontSize: '12px',
    color: '#6366f1',
    textDecoration: 'none',
  },
  submitBtn: {
    width: '100%',
    padding: '14px',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 8px 24px rgba(99,102,241,0.3)',
    marginTop: '4px',
    transition: 'opacity 0.2s, transform 0.2s',
    fontFamily: 'inherit',
    letterSpacing: '0.2px',
  },
  submitBtnDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  switchRow: {
    textAlign: 'center',
    marginTop: '28px',
    fontSize: '13px',
    color: '#4a5580',
  },
  switchLink: {
    color: '#818cf8',
    textDecoration: 'none',
    fontWeight: 600,
    marginLeft: '4px',
  },
};

const FEATURES = [
  {
    icon: '📊',
    color: '#6366f1',
    title: 'Manager Dashboard',
    sub: 'Deep insights into predictive analytics and KPIs.',
  },
  {
    icon: '🛒',
    color: '#10b981',
    title: 'Cashier Interface',
    sub: 'Blazing-fast real-time cart intelligence & upselling.',
  },
];

const AuthPage = ({ isLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Manager');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const [focusedField, setFocusedField] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLogin) {
      dispatch(loginUser({ username, password })).unwrap().then((data) => {
        if (data.role === 'Manager') navigate('/manager');
        else navigate('/pos');
      });
    } else {
      dispatch(registerUser({ username, password, role })).unwrap().then(() => {
        navigate('/login');
      });
    }
  };

  const inputStyle = (field) => ({
    ...S.input,
    borderColor: focusedField === field ? 'rgba(99,102,241,0.6)' : 'rgba(255,255,255,0.08)',
    boxShadow: focusedField === field ? '0 0 0 3px rgba(99,102,241,0.1)' : 'none',
  });

  return (
    <div style={S.page}>
      {/* ─── LEFT PANEL ─── */}
      <div style={S.left}>
        <div style={S.leftGlow1} />
        <div style={S.leftGlow2} />
        <div style={S.leftContent}>
          <div style={S.logoBox}>AI</div>
          <h1 style={S.leftH1}>
            Intelligent POS<br />for the Modern<br />Business.
          </h1>
          <p style={S.leftP}>
            Empower your staff with cutting-edge HA-LSTM forecasting, AI-driven collaborative filtering, and dynamic customer segmentation.
          </p>
          <div style={S.featureList}>
            {FEATURES.map((f) => (
              <div key={f.title} style={S.featureItem}>
                <div style={S.featureIcon(f.color)}>{f.icon}</div>
                <div>
                  <div style={S.featureTitle}>{f.title}</div>
                  <div style={S.featureSub}>{f.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── RIGHT PANEL ─── */}
      <div style={S.right}>
        <div style={S.card}>
          {/* Logo row */}
          <div style={S.cardLogoRow}>
            <div style={S.cardLogoIcon}>AI</div>
            <span style={S.cardLogoText}>Smart<span style={{ color: '#818cf8' }}>POS</span></span>
          </div>

          <h2 style={S.cardH2}>{isLogin ? 'Welcome back' : 'Create your account'}</h2>
          <p style={S.cardSub}>
            {isLogin
              ? 'Enter your credentials to access your dashboard.'
              : 'Sign up to configure your new workspace.'}
          </p>

          {error && (
            <div style={S.errorBox}>
              <span>⚠</span>
              <span>{String(error)}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={S.form}>
            {/* Username */}
            <div style={S.fieldGroup}>
              <label style={S.label}>Email Address / Username</label>
              <div style={S.inputWrap}>
                <span style={S.inputIcon}>@</span>
                <input
                  type="text"
                  placeholder="manager@example.com"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                  style={inputStyle('username')}
                  onFocus={() => setFocusedField('username')}
                  onBlur={() => setFocusedField(null)}
                />
              </div>
            </div>

            {/* Password */}
            <div style={S.fieldGroup}>
              <div style={S.labelRow}>
                <label style={S.label}>Password</label>
                {isLogin && (
                  <a href="#" style={S.forgotLink}>Forgot password?</a>
                )}
              </div>
              <div style={S.inputWrap}>
                <span style={S.inputIcon}>🔒</span>
                <input
                  type="password"
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  style={inputStyle('password')}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                />
              </div>
            </div>

            {/* Role (signup only) */}
            {!isLogin && (
              <div style={S.fieldGroup}>
                <label style={S.label}>Account Role</label>
                <div style={S.inputWrap}>
                  <span style={S.inputIcon}>👤</span>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    disabled={loading}
                    style={S.select}
                  >
                    <option value="Manager">Regional Manager</option>
                    <option value="Cashier">Store Cashier</option>
                  </select>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                ...S.submitBtn,
                ...(loading ? S.submitBtnDisabled : {}),
              }}
            >
              {loading
                ? 'Authenticating...'
                : isLogin
                  ? 'Sign In →'
                  : 'Create Account →'}
            </button>
          </form>

          <div style={S.switchRow}>
            {isLogin ? 'New to the platform?' : 'Already have an account?'}
            <Link
              to={isLogin ? '/signup' : '/login'}
              style={S.switchLink}
            >
              {isLogin ? 'Create an account' : 'Sign in instead'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
