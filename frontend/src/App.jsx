import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate, useSearchParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from './redux/authSlice';
import ManagerDashboard from './pages/ManagerDashboard';
import CashierPOS from './pages/CashierPOS';
import AuthPage from './pages/AuthPage';
import LandingPage from './pages/LandingPage';

// ─── Inline style tokens ──────────────────────────────────────────────────────
const ACCENT = '#6366f1';

const styles = {
  appContainer: {
    display: 'flex',
    height: '100vh',
    overflow: 'hidden',
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    background: '#07080f',
  },
  sidebar: {
    width: '240px',
    flexShrink: 0,
    background: '#0a0b14',
    borderRight: '1px solid rgba(255,255,255,0.06)',
    display: 'flex',
    flexDirection: 'column',
    padding: '0',
    overflowY: 'auto',
  },
  sidebarTop: {
    padding: '20px 16px 16px',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  },
  logoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    textDecoration: 'none',
  },
  logoIcon: {
    width: '34px',
    height: '34px',
    borderRadius: '9px',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: 900,
    fontSize: '13px',
    boxShadow: '0 0 14px rgba(99,102,241,0.3)',
    flexShrink: 0,
  },
  logoText: {
    fontSize: '16px',
    fontWeight: 800,
    color: 'white',
    letterSpacing: '-0.3px',
  },
  navSection: {
    padding: '12px 12px 0',
    flex: 1,
  },
  navGroup: {
    marginBottom: '4px',
  },
  navGroupLabel: {
    fontSize: '10px',
    fontWeight: 700,
    color: '#2e3350',
    letterSpacing: '1.2px',
    textTransform: 'uppercase',
    padding: '10px 8px 6px',
  },
  navItem: (active) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '9px 12px',
    borderRadius: '8px',
    textDecoration: 'none',
    fontSize: '13px',
    fontWeight: active ? 700 : 500,
    color: active ? 'white' : '#4a5580',
    background: active ? 'rgba(99,102,241,0.15)' : 'transparent',
    border: active ? '1px solid rgba(99,102,241,0.25)' : '1px solid transparent',
    marginBottom: '2px',
    transition: 'all 0.15s',
    cursor: 'pointer',
  }),
  navDot: (active) => ({
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: active ? ACCENT : '#2e3350',
    flexShrink: 0,
  }),
  sidebarBottom: {
    padding: '16px',
    borderTop: '1px solid rgba(255,255,255,0.06)',
  },
  userRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '10px',
  },
  userDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: '#10b981',
    flexShrink: 0,
  },
  userLabel: {
    fontSize: '12px',
    color: '#4a5580',
  },
  signOutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    width: '100%',
    padding: '9px 12px',
    borderRadius: '8px',
    background: 'transparent',
    border: '1px solid transparent',
    color: '#ef4444',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
    textAlign: 'left',
    transition: 'background 0.15s',
  },
  mainContent: {
    flex: 1,
    overflowY: 'auto',
    padding: '28px',
    background: '#07080f',
  },
};

// Manager sidebar nav items
const MANAGER_TABS = [
  { key: 'overview',   label: 'Overview',     icon: '⊞' },
  { key: 'analytics',  label: 'Analytics',    icon: '↗' },
  { key: 'forecast',   label: 'AI Forecast',  icon: '⚡' },
  { key: 'inventory',  label: 'Inventory',    icon: '◫' },
  { key: 'segments',   label: 'Segmentation', icon: '👥' },
  { key: 'reports',    label: 'Reports',      icon: '📊' },
];


// ─── Protected Route ──────────────────────────────────────────────────────────
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { token, role } = useSelector(state => state.auth);
  const location = useLocation();

  if (!token) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(role)) {
    let redirectPath = '/login';
    if (role === 'Manager') redirectPath = '/manager';
    else if (role === 'Cashier') redirectPath = '/pos';
    if (location.pathname === redirectPath) return <Navigate to="/login" replace />;
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

// ─── App Layout (with sidebar) ────────────────────────────────────────────────
const AppLayout = ({ children }) => {
  const dispatch = useDispatch();
  const { role } = useSelector(state => state.auth);
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';

  const handleTabClick = (key) => {
    setSearchParams({ tab: key });
  };

  return (
    <div style={styles.appContainer}>
      {/* ── Sidebar ── */}
      <nav style={styles.sidebar}>
        {/* Logo */}
        <div style={styles.sidebarTop}>
          <div style={styles.logoRow}>
            <div style={styles.logoIcon}>AI</div>
            <span style={styles.logoText}>Smart<span style={{ color: '#818cf8' }}>POS</span></span>
          </div>
        </div>

        {/* Nav */}
        <div style={styles.navSection}>
          {/* Manager has inline sub-nav items */}
          {role === 'Manager' && (
            <div style={styles.navGroup}>
              <div style={styles.navGroupLabel}>Manager Portal</div>
              {MANAGER_TABS.map(({ key, label, icon }) => {
                const active = activeTab === key;
                return (
                  <button
                    key={key}
                    onClick={() => handleTabClick(key)}
                    style={{
                      ...styles.navItem(active),
                      width: '100%',
                      background: active ? 'rgba(99,102,241,0.15)' : 'transparent',
                    }}
                  >
                    <span style={{ fontSize: '14px', width: '18px', textAlign: 'center' }}>{icon}</span>
                    {label}
                    {active && (
                      <span style={{ marginLeft: 'auto', width: '6px', height: '6px', borderRadius: '50%', background: ACCENT, display: 'inline-block' }} />
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Cashier nav */}
          {role === 'Cashier' && (
            <div style={styles.navGroup}>
              <div style={styles.navGroupLabel}>Cashier Portal</div>
              {[
                { key: 'products', label: 'Products', icon: '🛒' },
                { key: 'customer', label: 'Customer Lookup', icon: '👤' },
                { key: 'cart',     label: 'Cart & Payment', icon: '💳' },
                { key: 'shift',    label: 'Shift Summary',  icon: '📊' },
              ].map(({ key, label, icon }) => {
                const active = (searchParams.get('tab') || 'products') === key;
                return (
                  <button
                    key={key}
                    onClick={() => handleTabClick(key)}
                    style={{
                      ...styles.navItem(active),
                      width: '100%',
                      background: active ? 'rgba(99,102,241,0.15)' : 'transparent',
                    }}
                  >
                    <span style={{ fontSize: '14px', width: '18px', textAlign: 'center' }}>{icon}</span>
                    {label}
                    {active && (
                      <span style={{ marginLeft: 'auto', width: '6px', height: '6px', borderRadius: '50%', background: ACCENT, display: 'inline-block' }} />
                    )}
                  </button>
                );
              })}
            </div>
          )}

        </div>

        {/* Bottom: user info + sign out */}
        <div style={styles.sidebarBottom}>
          <div style={styles.userRow}>
            <div style={styles.userDot} />
            <span style={styles.userLabel}>Logged in as <strong style={{ color: '#8892b0' }}>{role}</strong></span>
          </div>
          <button
            onClick={() => dispatch(logout())}
            style={styles.signOutBtn}
          >
            ⬡ Sign Out
          </button>
        </div>
      </nav>

      {/* ── Main Content ── */}
      <main style={styles.mainContent}>
        {children}
      </main>
    </div>
  );
};

// ─── App ──────────────────────────────────────────────────────────────────────
function App() {
  return (
    <Router>
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<AuthPage isLogin={true} />} />
        <Route path="/signup" element={<AuthPage isLogin={false} />} />

        {/* Protected */}
        <Route path="/manager" element={
          <ProtectedRoute allowedRoles={['Manager']}>
            <AppLayout><ManagerDashboard /></AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/pos" element={
          <ProtectedRoute allowedRoles={['Cashier']}>
            <AppLayout><CashierPOS /></AppLayout>
          </ProtectedRoute>
        } />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
