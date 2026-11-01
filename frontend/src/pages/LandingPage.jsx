import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const S = {
  page: {
    minHeight: '100vh',
    background: '#07080f',
    color: '#c8d0e7',
    fontFamily: "'Inter', 'Segoe UI', sans-serif',",
    overflowX: 'hidden',
  },
  // NAV
  nav: {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    background: 'rgba(7, 8, 15, 0.85)',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  },
  navInner: {
    maxWidth: '1180px',
    margin: '0 auto',
    padding: '0 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '68px',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    textDecoration: 'none',
  },
  logoIcon: {
    width: '38px',
    height: '38px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: 800,
    fontSize: '14px',
    boxShadow: '0 0 20px rgba(99,102,241,0.4)',
    flexShrink: 0,
  },
  logoText: {
    fontSize: '20px',
    fontWeight: 800,
    color: 'white',
    letterSpacing: '-0.5px',
  },
  navLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '32px',
  },
  navA: {
    color: '#8892b0',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: 500,
    transition: 'color 0.2s',
  },
  navSignin: {
    color: '#8892b0',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: 500,
  },
  navCta: {
    padding: '9px 20px',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 700,
    boxShadow: '0 4px 20px rgba(99,102,241,0.3)',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  // HERO
  hero: {
    padding: '100px 24px 80px',
    maxWidth: '1180px',
    margin: '0 auto',
    textAlign: 'center',
    position: 'relative',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 16px',
    borderRadius: '100px',
    background: 'rgba(99,102,241,0.1)',
    border: '1px solid rgba(99,102,241,0.25)',
    color: '#818cf8',
    fontSize: '12px',
    fontWeight: 700,
    letterSpacing: '1px',
    textTransform: 'uppercase',
    marginBottom: '32px',
  },
  h1: {
    fontSize: 'clamp(48px, 6vw, 86px)',
    fontWeight: 900,
    color: 'white',
    lineHeight: 1,
    letterSpacing: '-3px',
    marginBottom: '24px',
  },
  h1Gradient: {
    background: 'linear-gradient(135deg, #818cf8 0%, #c084fc 50%, #e879f9 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  heroSub: {
    fontSize: '18px',
    color: '#6b7694',
    maxWidth: '560px',
    margin: '0 auto 48px',
    lineHeight: 1.7,
  },
  ctas: {
    display: 'flex',
    gap: '16px',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginBottom: '80px',
  },
  ctaPrimary: {
    padding: '16px 36px',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: 700,
    boxShadow: '0 8px 32px rgba(99,102,241,0.35)',
    transition: 'transform 0.2s',
    display: 'inline-block',
  },
  ctaSecondary: {
    padding: '16px 36px',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#c8d0e7',
    textDecoration: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: 600,
    display: 'inline-block',
  },
  // DASHBOARD PREVIEW
  previewWrap: {
    position: 'relative',
    width: '100%',
    maxWidth: '900px',
    margin: '0 auto',
  },
  previewGlow: {
    position: 'absolute',
    inset: '-2px',
    borderRadius: '24px',
    background: 'linear-gradient(135deg, #6366f1, #a855f7, #ec4899)',
    opacity: 0.25,
    filter: 'blur(16px)',
    zIndex: 0,
  },
  previewBox: {
    position: 'relative',
    zIndex: 1,
    background: '#0e101c',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '20px',
    overflow: 'hidden',
    boxShadow: '0 40px 80px rgba(0,0,0,0.6)',
  },
  previewBar: {
    padding: '12px 20px',
    background: 'rgba(255,255,255,0.03)',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  previewDot: (color) => ({
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    background: color,
    opacity: 0.6,
  }),
  previewUrl: {
    flex: 1,
    textAlign: 'center',
    fontSize: '11px',
    color: '#3d4466',
    fontFamily: 'monospace',
    letterSpacing: '0.5px',
  },
  previewImg: {
    width: '100%',
    height: '440px',
    objectFit: 'cover',
    display: 'block',
  },
  // STATS BAR
  stats: {
    background: 'linear-gradient(180deg, #07080f 0%, #0c0e1a 100%)',
    borderTop: '1px solid rgba(255,255,255,0.04)',
    borderBottom: '1px solid rgba(255,255,255,0.04)',
    padding: '56px 24px',
  },
  statsGrid: {
    maxWidth: '900px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '40px',
    textAlign: 'center',
  },
  statVal: {
    fontSize: '40px',
    fontWeight: 900,
    color: 'white',
    lineHeight: 1,
    marginBottom: '8px',
  },
  statLabel: {
    fontSize: '11px',
    fontWeight: 700,
    color: '#6366f1',
    letterSpacing: '2px',
    textTransform: 'uppercase',
  },
  // FEATURES
  section: {
    padding: '100px 24px',
    maxWidth: '1180px',
    margin: '0 auto',
  },
  sectionHead: {
    textAlign: 'center',
    marginBottom: '64px',
  },
  h2: {
    fontSize: 'clamp(32px, 4vw, 52px)',
    fontWeight: 900,
    color: 'white',
    letterSpacing: '-1.5px',
    lineHeight: 1.1,
    marginBottom: '16px',
  },
  sectionSub: {
    fontSize: '17px',
    color: '#6b7694',
    maxWidth: '520px',
    margin: '0 auto',
    lineHeight: 1.7,
  },
  featureGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '24px',
  },
  featureCard: (accent) => ({
    padding: '40px',
    borderRadius: '20px',
    background: '#0e101c',
    border: '1px solid rgba(255,255,255,0.06)',
    transition: 'border-color 0.3s, transform 0.3s',
    cursor: 'default',
    position: 'relative',
    overflow: 'hidden',
  }),
  featureIconWrap: (color) => ({
    width: '52px',
    height: '52px',
    borderRadius: '14px',
    background: `${color}18`,
    border: `1px solid ${color}35`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '24px',
    fontSize: '24px',
  }),
  featureTitle: {
    fontSize: '19px',
    fontWeight: 800,
    color: 'white',
    marginBottom: '12px',
    letterSpacing: '-0.3px',
  },
  featureDesc: {
    fontSize: '14px',
    color: '#6b7694',
    lineHeight: 1.7,
  },
  // WORKFLOW
  workflowSection: {
    padding: '100px 24px',
    background: '#0a0b14',
    borderTop: '1px solid rgba(255,255,255,0.04)',
    borderBottom: '1px solid rgba(255,255,255,0.04)',
  },
  workflowInner: {
    maxWidth: '1180px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '80px',
    alignItems: 'center',
  },
  workflowItems: {
    display: 'flex',
    flexDirection: 'column',
    gap: '32px',
  },
  workflowItem: {
    display: 'flex',
    gap: '20px',
    alignItems: 'flex-start',
  },
  workflowIcon: (color) => ({
    width: '48px',
    height: '48px',
    flexShrink: 0,
    borderRadius: '14px',
    background: `${color}18`,
    border: `1px solid ${color}30`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
  }),
  workflowTitle: {
    fontSize: '18px',
    fontWeight: 800,
    color: 'white',
    marginBottom: '6px',
  },
  workflowDesc: {
    fontSize: '14px',
    color: '#6b7694',
    lineHeight: 1.7,
  },
  // MOCK UI
  mockUI: {
    background: '#0e101c',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '20px',
    padding: '28px',
    boxShadow: '0 24px 60px rgba(0,0,0,0.4)',
  },
  mockBar: {
    height: '8px',
    width: '60px',
    background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
    borderRadius: '4px',
    marginBottom: '20px',
  },
  mockLine: (w) => ({
    height: '10px',
    width: w,
    background: 'rgba(255,255,255,0.06)',
    borderRadius: '5px',
    marginBottom: '10px',
  }),
  mockGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
    marginTop: '24px',
  },
  mockCard: {
    height: '80px',
    background: 'rgba(255,255,255,0.03)',
    borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.05)',
  },
  mockCta: {
    marginTop: '16px',
    height: '48px',
    background: 'rgba(99,102,241,0.15)',
    border: '1px solid rgba(99,102,241,0.3)',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#818cf8',
    fontSize: '13px',
    fontWeight: 700,
    letterSpacing: '0.5px',
  },
  // FOOTER / CTA
  footerCta: {
    textAlign: 'center',
    padding: '100px 24px',
    background: '#07080f',
  },
  footerCtaText: {
    fontSize: 'clamp(28px, 4vw, 48px)',
    fontWeight: 900,
    color: 'white',
    letterSpacing: '-1px',
    marginBottom: '20px',
  },
  footerCtaSub: {
    color: '#6b7694',
    fontSize: '16px',
    marginBottom: '40px',
  },
  footerCopy: {
    color: '#2e3350',
    fontSize: '13px',
    marginTop: '48px',
  },
};

const features = [
  {
    icon: '📈',
    color: '#6366f1',
    title: 'AI Demand Forecasting',
    desc: 'Our proprietary HA-LSTM neural networks analyze rolling sales data to predict inventory needs with 98.4% accuracy.',
  },
  {
    icon: '🧾',
    color: '#8b5cf6',
    title: 'Instant POS Checkout',
    desc: 'Blazing-fast transaction processing with AI-powered upselling recommendations shown to cashiers in real time.',
  },
  {
    icon: '📊',
    color: '#ec4899',
    title: 'Manager Analytics',
    desc: 'Unified dashboard with revenue breakdown, RFM customer segmentation, and top-selling product reports.',
  },
  {
    icon: '🔐',
    color: '#10b981',
    title: 'Role-Based Security',
    desc: 'JWT-authenticated distinct interfaces for Cashiers and Managers — every endpoint is permission-validated.',
  },
  {
    icon: '🤖',
    color: '#f59e0b',
    title: 'Collaborative Filtering',
    desc: 'Association rule mining surfaces "Frequently Bought Together" bundles to boost average transaction value.',
  },
  {
    icon: '⚡',
    color: '#06b6d4',
    title: 'FastAPI Backend',
    desc: 'Async Python backend with Motor MongoDB driver ensures sub-500ms response times even under heavy load.',
  },
];

export default function LandingPage() {
  return (
    <div style={S.page}>
      {/* ─── NAV ─── */}
      <nav style={S.nav}>
        <div style={S.navInner}>
          <Link to="/" style={S.logo}>
            <div style={S.logoIcon}>AI</div>
            <span style={S.logoText}>Smart<span style={{ color: '#818cf8' }}>POS</span></span>
          </Link>
          <div style={S.navLinks}>
            <a href="#features" style={S.navA}>Features</a>
            <a href="#workflow" style={S.navA}>Workflow</a>
            <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.08)' }} />
            <Link to="/login" style={S.navSignin}>Sign In</Link>
            <Link to="/signup" style={S.navCta}>Get Started →</Link>
          </div>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section style={{ padding: '100px 24px 80px', maxWidth: '1180px', margin: '0 auto', textAlign: 'center' }}>
        <div style={S.badge}>
          <span>✦</span> Next-Gen Retail Intelligence
        </div>

        <h1 style={S.h1}>
          Predict. Sell.
          <br />
          <span style={S.h1Gradient}>Dominate.</span>
        </h1>

        <p style={S.heroSub}>
          The first Point of Sale system with built-in Deep Learning forecasting. Stop guessing inventory — start predicting success with our HA-LSTM powered engine.
        </p>

        <div style={S.ctas}>
          <Link to="/signup" style={S.ctaPrimary}>Deploy Now →</Link>
          <Link to="/login" style={S.ctaSecondary}>View Dashboard</Link>
        </div>

        {/* Dashboard Preview */}
        <div style={S.previewWrap}>
          <div style={S.previewGlow} />
          <div style={S.previewBox}>
            <div style={S.previewBar}>
              <div style={S.previewDot('#ef4444')} />
              <div style={S.previewDot('#eab308')} />
              <div style={S.previewDot('#22c55e')} />
              <div style={S.previewUrl}>system_pos_v4.0 · connected · secure</div>
            </div>
            <img
              src="https://images.unsplash.com/photo-1556740758-90de374c12ad?auto=format&fit=crop&q=80&w=2000"
              alt="SmartPOS in action"
              style={S.previewImg}
            />
          </div>
        </div>
      </section>

      {/* ─── STATS ─── */}
      <div style={S.stats}>
        <div style={S.statsGrid}>
          {[
            { v: '98.4%', l: 'Forecasting Accuracy' },
            { v: '<500ms', l: 'Transaction Speed' },
            { v: '24 / 7', l: 'AI Monitoring' },
            { v: '15k+', l: 'Products Managed' },
          ].map(({ v, l }) => (
            <div key={l}>
              <div style={S.statVal}>{v}</div>
              <div style={S.statLabel}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── FEATURES ─── */}
      <section id="features" style={S.section}>
        <div style={S.sectionHead}>
          <h2 style={S.h2}>Built for Retail Excellence</h2>
          <p style={S.sectionSub}>
            Every layer of SmartPOS is engineered to give your business an unfair advantage.
          </p>
        </div>

        <div style={S.featureGrid}>
          {features.map((f) => (
            <div key={f.title} style={S.featureCard(f.color)}>
              <div style={S.featureIconWrap(f.color)}>
                <span>{f.icon}</span>
              </div>
              <div style={S.featureTitle}>{f.title}</div>
              <div style={S.featureDesc}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── WORKFLOW ─── */}
      <section id="workflow" style={S.workflowSection}>
        <div style={S.workflowInner}>
          {/* Left */}
          <div>
            <div style={{ ...S.badge, display: 'inline-flex', marginBottom: '24px' }}>
              <span>⚙</span> Role-Based Intelligence
            </div>
            <h2 style={{ ...S.h2, letterSpacing: '-1px', marginBottom: '40px' }}>
              The right tools for<br />every team member.
            </h2>
            <div style={S.workflowItems}>
              <div style={S.workflowItem}>
                <div style={S.workflowIcon('#6366f1')}>👤</div>
                <div>
                  <div style={S.workflowTitle}>Store Managers</div>
                  <div style={S.workflowDesc}>Deep dive into financial reports, RFM customer analysis, and AI demand forecasts to drive strategic business growth.</div>
                </div>
              </div>
              <div style={S.workflowItem}>
                <div style={S.workflowIcon('#ec4899')}>🛒</div>
                <div>
                  <div style={S.workflowTitle}>Retail Cashiers</div>
                  <div style={S.workflowDesc}>Simplified, ultra-fast checkout interface with live AI upsell recommendations based on the current cart contents.</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right — Mock UI */}
          <div style={S.mockUI}>
            <div style={S.mockBar} />
            <div style={S.mockLine('100%')} />
            <div style={S.mockLine('75%')} />
            <div style={S.mockLine('55%')} />
            <div style={S.mockGrid}>
              <div style={S.mockCard} />
              <div style={S.mockCard} />
              <div style={S.mockCard} />
              <div style={S.mockCard} />
            </div>
            <div style={S.mockCta}>⚡ AI Recommendation Analysis...</div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER CTA ─── */}
      <section style={S.footerCta}>
        <div style={S.footerCtaText}>Ready to upgrade your store?</div>
        <div style={S.footerCtaSub}>Join retailers who let AI manage complexity so they can focus on customers.</div>
        <Link to="/signup" style={{ ...S.ctaPrimary, fontSize: '18px', padding: '18px 44px' }}>
          Create Free Account
        </Link>
        <div style={S.footerCopy}>© 2026 SmartPOS AI Systems. All rights reserved.</div>
      </section>
    </div>
  );
}
