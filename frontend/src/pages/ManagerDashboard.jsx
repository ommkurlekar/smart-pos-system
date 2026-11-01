import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboardData, predictDemand } from '../redux/dashboardSlice';
import api from '../services/api';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';

// ─── Color palette ───────────────────────────────────────────────────────────
const ACCENT = '#6366f1';
const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

// ─── Inline style helpers ─────────────────────────────────────────────────────
const card = (extra = {}) => ({
    background: '#0e101c',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '16px',
    padding: '24px',
    boxSizing: 'border-box',
    ...extra,
});

const row = (extra = {}) => ({
    display: 'flex',
    flexWrap: 'wrap',
    gap: '20px',
    ...extra,
});

const statCard = (accent = ACCENT) => ({
    ...card(),
    flex: '1 1 180px',
    minWidth: '160px',
    borderTop: `3px solid ${accent}`,
});

const gridTwo = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' };
const gridThree = { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' };

const label = { fontSize: '12px', fontWeight: 700, color: '#8892b0', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: '6px' };
const bigNum = { fontSize: '32px', fontWeight: 900, color: 'white', letterSpacing: '-1px', lineHeight: 1 };
const sectionTitle = { fontSize: '17px', fontWeight: 800, color: 'white', marginBottom: '20px', letterSpacing: '-0.3px' };
const muted = { color: '#8892b0', fontSize: '13px' };

const badge = (color = '#6366f1') => ({
    display: 'inline-block',
    padding: '3px 10px',
    borderRadius: '100px',
    background: `${color}20`,
    color: color,
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '0.3px',
});

const tt = { backgroundColor: '#1a1d2e', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: '#e2e8f0' };
const axis = { stroke: '#4a5580', fontSize: 11, tick: { fill: '#8892b0' } };

// ─── Simulated extra data ─────────────────────────────────────────────────────
const MONTHLY_REVENUE = [
    { month: 'Sep', revenue: 12400 },
    { month: 'Oct', revenue: 18200 },
    { month: 'Nov', revenue: 15800 },
    { month: 'Dec', revenue: 24600 },
    { month: 'Jan', revenue: 21300 },
    { month: 'Feb', revenue: 27900 },
];

const HOURLY_SALES = [
    { h: '8am', sales: 12 },
    { h: '10am', sales: 34 },
    { h: '12pm', sales: 55 },
    { h: '2pm', sales: 41 },
    { h: '4pm', sales: 67 },
    { h: '6pm', sales: 48 },
    { h: '8pm', sales: 22 },
];

const STAFF = [
    { name: 'Priya Sharma', role: 'Senior Cashier', txns: 148, revenue: '$4,320', rating: '98%' },
    { name: 'Rahul Desai', role: 'Cashier', txns: 112, revenue: '$3,210', rating: '93%' },
    { name: 'Ankita Patil', role: 'Cashier', txns: 97, revenue: '$2,880', rating: '89%' },
];

const RECENT_TXN = [
    { id: '#INV-1042', customer: '+91 98765 43210', items: 4, total: '$129.96', time: '2 min ago', status: 'Completed' },
    { id: '#INV-1041', customer: '+91 87654 32109', items: 1, total: '$89.99', time: '9 min ago', status: 'Completed' },
    { id: '#INV-1040', customer: 'Guest', items: 2, total: '$45.98', time: '21 min ago', status: 'Completed' },
    { id: '#INV-1039', customer: '+91 76543 21098', items: 6, total: '$314.94', time: '38 min ago', status: 'Completed' },
];

const ACTIVITY = [
    { icon: '🛒', text: 'New transaction #INV-1042 — $129.96', time: '2m ago', color: '#10b981' },
    { icon: '⚠️', text: 'Low stock alert: Mechanical Keyboard (qty: 3)', time: '15m ago', color: '#f59e0b' },
    { icon: '👤', text: 'New customer registered — +91 98765 43210', time: '31m ago', color: '#6366f1' },
    { icon: '🤖', text: 'AI forecasted demand for HD Monitor: 28 units', time: '1h ago', color: '#8b5cf6' },
    { icon: '📦', text: 'Restock order placed for USB-C Hub', time: '2h ago', color: '#06b6d4' },
];




// ─── Tooltip styles ───────────────────────────────────────────────────────────
const tooltipStyle = {
    contentStyle: tt,
    labelStyle: { color: '#e2e8f0' },
    itemStyle: { color: '#e2e8f0' },
    cursor: { stroke: 'rgba(255,255,255,0.05)', fill: 'rgba(255,255,255,0.02)' }
};

const modalOverlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'rgba(5, 6, 12, 0.85)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
};

const modalContentStyle = {
    background: '#0d0f1e',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '20px',
    padding: '32px',
    width: '100%',
    maxWidth: '500px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
    position: 'relative',
};

const inputStyle = {
    width: '100%',
    padding: '12px 14px',
    background: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '10px',
    color: '#e2e8f0',
    fontSize: '14px',
    outline: 'none',
    fontFamily: 'inherit',
    marginBottom: '16px',
    boxSizing: 'border-box',
};

// ─────────────────────────────────────────────────────────────────────────────
const ManagerDashboard = () => {
    const dispatch = useDispatch();
    const { data, loading, predicting, predictionResult } = useSelector(s => s.dashboard);
    const [searchParams] = useSearchParams();
    const tab = searchParams.get('tab') || 'overview';
    const [selectedProduct, setSelectedProduct] = useState('');

    const [productsList, setProductsList] = useState([]);
    const [selectedCustomerCard, setSelectedCustomerCard] = useState(null);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [editName, setEditName] = useState('');
    const [editPhone, setEditPhone] = useState('');
    const [exportForecastFormat, setExportForecastFormat] = useState('pdf');
    const [exportCustomerFormat, setExportCustomerFormat] = useState('pdf');

    useEffect(() => { dispatch(fetchDashboardData()); }, [dispatch]);

    useEffect(() => {
        api.get('/products/')
            .then(res => {
                setProductsList(res.data);
            })
            .catch(err => console.error("Error loading products", err));
    }, []);

    const handlePredict = () => { if (selectedProduct) dispatch(predictDemand(selectedProduct)); };

    const forecastChartData = predictionResult ? [
        { day: 'D-5', actual: 12, predicted: 14 },
        { day: 'D-4', actual: 19, predicted: 18 },
        { day: 'D-3', actual: 10, predicted: 13 },
        { day: 'D-2', actual: 15, predicted: 17 },
        { day: 'D-1', actual: 8, predicted: 10 },
        { day: 'Today', actual: null, predicted: predictionResult.predicted_quantity },
    ] : [];

    if (loading || !data) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', color: '#4a5580', fontSize: '15px' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '40px', marginBottom: '12px' }}>⚡</div>
                    Loading Dashboard...
                </div>
            </div>
        );
    }

    return (
        <div style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif", color: '#c8d0e7' }}>
            {/* ── Header ── */}
            <div style={{ marginBottom: '28px' }}>
                <h1 style={{ fontSize: '26px', fontWeight: 900, color: 'white', letterSpacing: '-0.8px', marginBottom: '4px' }}>
                    Manager Dashboard
                </h1>
                <p style={muted}>Last updated: {new Date().toLocaleTimeString()}</p>
            </div>


            {/* ══════════════ OVERVIEW TAB ══════════════════════════════════════ */}
            {tab === 'overview' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* KPI row */}
                    <div style={row()}>
                        <StatCard accent="#6366f1" icon="💰" title="Today's Sales" value={`$${data.stats?.today_sales?.toFixed(2) || '0.00'}`} sub="+12.5% from yesterday" subColor="#10b981" />
                        <StatCard accent="#10b981" icon="📈" title="Monthly Revenue" value={`$${data.stats?.monthly_revenue?.toFixed(2) || '0.00'}`} sub="Target: $30,000" subColor="#6b7694" />
                        <StatCard accent="#f59e0b" icon="⚠️" title="Low Stock Alerts" value={data.stats?.low_stock_count || 0} sub="Items need reorder" subColor="#f59e0b" />
                        <StatCard accent="#8b5cf6" icon="👥" title="Total Customers" value={data.stats?.total_customers || 0} sub="+8 this week" subColor="#10b981" />
                    </div>

                    <div style={gridTwo}>
                        {/* Revenue Goal */}
                        <div style={card()}>
                            <div style={sectionTitle}>Monthly Revenue Goal</div>
                            <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                                <span style={muted}>Progress</span>
                                <span style={{ color: 'white', fontWeight: 700 }}>$27,900 / $30,000</span>
                            </div>
                            <div style={{ height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                                <div style={{ width: '93%', height: '100%', background: 'linear-gradient(90deg, #6366f1, #8b5cf6)', borderRadius: '4px' }} />
                            </div>
                            <div style={{ marginTop: '8px', ...muted }}>93% achieved — <span style={{ color: '#10b981', fontWeight: 700 }}>On Track</span></div>
                            <div style={{ marginTop: '24px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
                                    <div>
                                        <div style={label}>Avg Transaction</div>
                                        <div style={{ color: 'white', fontWeight: 700, fontSize: '20px' }}>$84.30</div>
                                    </div>
                                    <div>
                                        <div style={label}>Transactions Today</div>
                                        <div style={{ color: 'white', fontWeight: 700, fontSize: '20px' }}>142</div>
                                    </div>
                                    <div>
                                        <div style={label}>Return Rate</div>
                                        <div style={{ color: '#f59e0b', fontWeight: 700, fontSize: '20px' }}>2.1%</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Activity Feed */}
                        <div style={card()}>
                            <div style={sectionTitle}>Live Activity Feed</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {ACTIVITY.map((a, i) => (
                                    <div key={i} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                                        <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: `${a.color}18`, border: `1px solid ${a.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>
                                            {a.icon}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: '13px', color: '#c8d0e7', lineHeight: 1.4 }}>{a.text}</div>
                                            <div style={{ fontSize: '11px', color: '#3d4466', marginTop: '3px' }}>{a.time}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Recent Transactions */}
                    <div style={card()}>
                        <div style={sectionTitle}>Recent Transactions</div>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr>
                                    {['Invoice', 'Customer', 'Items', 'Total', 'Time', 'Status'].map(h => (
                                        <th key={h} style={{ textAlign: 'left', padding: '10px 14px', color: '#3d4466', fontSize: '11px', fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {RECENT_TXN.map(r => (
                                    <tr key={r.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                        <td style={{ padding: '14px', color: ACCENT, fontWeight: 700, fontSize: '13px' }}>{r.id}</td>
                                        <td style={{ padding: '14px', fontSize: '13px' }}>{r.customer}</td>
                                        <td style={{ padding: '14px', fontSize: '13px' }}>{r.items}</td>
                                        <td style={{ padding: '14px', color: 'white', fontWeight: 700, fontSize: '13px' }}>{r.total}</td>
                                        <td style={{ padding: '14px', ...muted, fontSize: '12px' }}>{r.time}</td>
                                        <td style={{ padding: '14px' }}><span style={badge('#10b981')}>{r.status}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ══════════════ ANALYTICS TAB ══════════════════════════════════════ */}
            {tab === 'analytics' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={gridTwo}>
                        {/* Sales Trend */}
                        <div style={card()}>
                            <div style={sectionTitle}>Daily Sales Trend</div>
                            <ResponsiveContainer width="100%" height={260}>
                                <AreaChart data={data.salesTrend}>
                                    <defs>
                                        <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={ACCENT} stopOpacity={0.3} />
                                            <stop offset="95%" stopColor={ACCENT} stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.12)" />
                                    <XAxis dataKey="date" {...axis} />
                                    <YAxis {...axis} />
                                    <Tooltip {...tooltipStyle} />
                                    <Area type="monotone" dataKey="sales" stroke={ACCENT} strokeWidth={3} fill="url(#salesGrad)" dot={{ r: 4, fill: ACCENT }} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Hourly Distribution */}
                        <div style={card()}>
                            <div style={sectionTitle}>Hourly Sales Distribution</div>
                            <ResponsiveContainer width="100%" height={260}>
                                <BarChart data={HOURLY_SALES}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.12)" />
                                    <XAxis dataKey="h" {...axis} />
                                    <YAxis {...axis} />
                                    <Tooltip {...tooltipStyle} />
                                    <Bar dataKey="sales" fill="#10b981" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div style={gridTwo}>
                        {/* Monthly Revenue */}
                        <div style={card()}>
                            <div style={sectionTitle}>6-Month Revenue Trend</div>
                            <ResponsiveContainer width="100%" height={240}>
                                <AreaChart data={MONTHLY_REVENUE}>
                                    <defs>
                                        <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.12)" />
                                    <XAxis dataKey="month" {...axis} />
                                    <YAxis {...axis} />
                                    <Tooltip {...tooltipStyle} />
                                    <Area type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={3} fill="url(#revGrad)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Top Products Bar */}
                        <div style={card()}>
                            <div style={sectionTitle}>Top Selling Products</div>
                            <ResponsiveContainer width="100%" height={240}>
                                <BarChart data={data.topProducts} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={false} />
                                    <XAxis type="number" {...axis} />
                                    <YAxis type="category" dataKey="name" {...axis} width={110} />
                                    <Tooltip {...tooltipStyle} />
                                    <Bar dataKey="quantity_sold" fill={ACCENT} radius={[0, 6, 6, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Staff */}
                    <div>
                        <div style={card()}>
                            <div style={sectionTitle}>Staff Performance</div>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr>
                                        {['Name', 'Role', 'Txns', 'Revenue', 'Rating'].map(h => (
                                            <th key={h} style={{ textAlign: 'left', padding: '8px 10px', color: '#3d4466', fontSize: '11px', fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {STAFF.map(s => (
                                        <tr key={s.name} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                            <td style={{ padding: '12px 10px', color: 'white', fontWeight: 700, fontSize: '13px' }}>{s.name}</td>
                                            <td style={{ padding: '12px 10px', ...muted, fontSize: '12px' }}>{s.role}</td>
                                            <td style={{ padding: '12px 10px', fontSize: '13px' }}>{s.txns}</td>
                                            <td style={{ padding: '12px 10px', color: '#10b981', fontWeight: 700, fontSize: '13px' }}>{s.revenue}</td>
                                            <td style={{ padding: '12px 10px' }}><span style={badge('#10b981')}>{s.rating}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* ══════════════ AI FORECAST TAB ══════════════════════════════════════ */}
            {tab === 'forecast' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Forecast tool */}
                    <div style={card()}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
                            <div>
                                <div style={sectionTitle}>HA-LSTM Demand Forecast</div>
                                <p style={muted}>Select a product to predict its demand for the next 7 days</p>
                            </div>
                            <span style={{ ...badge('#8b5cf6'), fontSize: '12px', padding: '5px 12px' }}>AI Model v2.4</span>
                        </div>
                        <div style={{ display: 'flex', gap: '12px', marginBottom: '8px' }}>
                            <select
                                value={selectedProduct}
                                onChange={e => setSelectedProduct(e.target.value)}
                                style={{ flex: 1, padding: '12px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#e2e8f0', fontSize: '14px', outline: 'none', fontFamily: 'inherit' }}
                            >
                                <option value="">Select a product...</option>
                                {productsList.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                            <button
                                onClick={handlePredict}
                                disabled={predicting || !selectedProduct}
                                style={{ padding: '12px 24px', background: predicting || !selectedProduct ? 'rgba(99,102,241,0.3)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: predicting || !selectedProduct ? 'not-allowed' : 'pointer', fontSize: '14px', fontFamily: 'inherit', whiteSpace: 'nowrap' }}
                            >
                                {predicting ? '⚡ Predicting...' : '🤖 Run Forecast'}
                            </button>
                        </div>
                    </div>

                    {predictionResult && (
                        <>
                            <div style={row()}>
                                <StatCard accent="#8b5cf6" icon="📦" title="Predicted Volume (7 Days)" value={`${predictionResult.predicted_quantity} Units`} sub="HA-LSTM Forecast" subColor="#8b5cf6" />
                                <StatCard accent="#10b981" icon="🎯" title="Model Confidence" value={`${Math.round(predictionResult.forecast_accuracy * 100)}%`} sub="Accuracy score" subColor="#10b981" />
                                <StatCard accent="#f59e0b" icon="💰" title="Est. Revenue Impact" value={`$${(predictionResult.predicted_quantity * 89.99).toFixed(0)}`} sub="Based on avg price" subColor="#f59e0b" />
                            </div>

                            <div style={card()}>
                                <div style={sectionTitle}>Forecast vs Actual (Last 5 Days + Prediction)</div>
                                <ResponsiveContainer width="100%" height={280}>
                                    <LineChart data={forecastChartData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                        <XAxis dataKey="day" {...axis} />
                                        <YAxis {...axis} />
                                        <Tooltip {...tooltipStyle} />
                                        <Legend iconType="circle" />
                                        <Line type="monotone" dataKey="actual" stroke="#94a3b8" strokeWidth={2} dot={{ r: 4 }} name="Actual" connectNulls={false} />
                                        <Line type="monotone" dataKey="predicted" stroke="#f59e0b" strokeDasharray="6 4" strokeWidth={3} dot={{ r: 5, fill: '#f59e0b' }} name="Forecast" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </>
                    )}

                    {!predictionResult && (
                        <div style={{ ...card(), textAlign: 'center', padding: '60px 24px' }}>
                            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🤖</div>
                            <div style={{ color: 'white', fontWeight: 700, fontSize: '18px', marginBottom: '8px' }}>Select a product and run the forecast</div>
                            <div style={muted}>The HA-LSTM model analyzes rolling sales history to predict demand.</div>
                        </div>
                    )}
                </div>
            )}

            {/* ══════════════ SEGMENTATION TAB ══════════════════════════════════════ */}
            {tab === 'segments' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={gridTwo}>
                        <div style={card()}>
                            <div style={sectionTitle}>Segmentation Summary (K-Means)</div>
                            <ResponsiveContainer width="100%" height={260}>
                                <PieChart>
                                    <Pie data={data.segments} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                                        {data.segments?.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip {...tooltipStyle} />
                                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', color: '#c8d0e7' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        <div style={card()}>
                            <div style={sectionTitle}>What is RFM?</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {[
                                    { label: 'Recency (R)', desc: 'Days since last purchase. Lower is better.', icon: '🕒' },
                                    { label: 'Frequency (F)', desc: 'Total number of transactions. Higher is better.', icon: '🔄' },
                                    { label: 'Monetary (M)', desc: 'Total revenue from this customer. Higher is better.', icon: '💰' },
                                ].map(item => (
                                    <div key={item.label} style={{ display: 'flex', gap: '14px' }}>
                                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>
                                            {item.icon}
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '14px', fontWeight: 700, color: 'white' }}>{item.label}</div>
                                            <div style={muted}>{item.desc}</div>
                                        </div>
                                    </div>
                                ))}
                                <div style={{ marginTop: '10px', padding: '12px', background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '10px', fontSize: '12px', color: '#c084fc' }}>
                                    ✨ <strong>AI Insight:</strong> K-Means clustering uses these 3 dimensions to group users automatically without manual rules.
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={card()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <div style={sectionTitle}>Customer RFM Scores</div>
                            <span style={badge('#10b981')}>{data.segmentData?.length || 0} Customers Analyzed</span>
                        </div>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr>
                                    {['Customer ID', 'Phone', 'Recency', 'Frequency', 'Monetary', 'AI Segment', 'Actions'].map(h => (
                                        <th key={h} style={{ textAlign: 'left', padding: '12px 14px', color: '#3d4466', fontSize: '11px', fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {data.segmentData?.map((c, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                        <td style={{ padding: '14px', ...muted, fontSize: '12px' }}>...{c.id.slice(-6)}</td>
                                        <td style={{ padding: '14px', color: 'white', fontWeight: 600, fontSize: '13px' }}>{c.phone || 'Guest'}</td>
                                        <td style={{ padding: '14px', fontSize: '13px' }}>{c.recency} days</td>
                                        <td style={{ padding: '14px', fontSize: '13px' }}>{c.frequency} txns</td>
                                        <td style={{ padding: '14px', color: 'white', fontWeight: 700, fontSize: '13px' }}>${c.monetary.toFixed(2)}</td>
                                        <td style={{ padding: '14px' }}>
                                            <span style={badge(
                                                c.segment === 'Big Spenders' ? '#8b5cf6' :
                                                c.segment === 'Loyal' ? '#10b981' :
                                                c.segment === 'New' ? '#6366f1' : '#ef4444'
                                            )}>{c.segment}</span>
                                        </td>
                                        <td style={{ padding: '14px', display: 'flex', gap: '8px' }}>
                                            <button
                                                onClick={() => setSelectedCustomerCard(c)}
                                                style={{ padding: '6px 12px', background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.25)', color: '#818cf8', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
                                            >
                                                📄 Report Card
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setEditingCustomer(c);
                                                    setEditName(c.name || `Customer ${c.id.slice(-4)}`);
                                                    setEditPhone(c.phone || '');
                                                }}
                                                style={{ padding: '6px 12px', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.25)', color: '#34d399', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
                                            >
                                                ✏️ Edit
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ══════════════ INVENTORY TAB ══════════════════════════════════════ */}
            {tab === 'inventory' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={row()}>
                        <StatCard accent="#ef4444" icon="🚨" title="Critical Stock" value="3" sub="Items below reorder level" subColor="#ef4444" />
                        <StatCard accent="#f59e0b" icon="⚠️" title="Low Stock" value={data.stats?.low_stock_count || 0} sub="Items approaching limit" subColor="#f59e0b" />
                        <StatCard accent="#10b981" icon="✅" title="Healthy Stock" value="42" sub="SKUs fully stocked" subColor="#10b981" />
                        <StatCard accent="#6366f1" icon="📦" title="Total SKUs" value="48" sub="Active products" subColor="#6366f1" />
                    </div>

                    <div style={card()}>
                        <div style={sectionTitle}>Low Stock Alerts</div>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr>
                                    {['Product', 'Category', 'Current Stock', 'Reorder Level', 'Status', 'Action'].map(h => (
                                        <th key={h} style={{ textAlign: 'left', padding: '10px 14px', color: '#3d4466', fontSize: '11px', fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {(data.lowStock?.length > 0 ? data.lowStock : [
                                    { id: 1, name: 'Mechanical Keyboard', category: 'Electronics', stock: 3, reorder_level: 10 },
                                    { id: 2, name: 'HD Monitor 24"', category: 'Electronics', stock: 5, reorder_level: 8 },
                                    { id: 3, name: 'USB-C Hub', category: 'Accessories', stock: 7, reorder_level: 15 },
                                ]).map(item => (
                                    <tr key={item.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                        <td style={{ padding: '14px', color: 'white', fontWeight: 700, fontSize: '13px' }}>{item.name}</td>
                                        <td style={{ padding: '14px' }}><span style={badge('#6366f1')}>{item.category || 'Electronics'}</span></td>
                                        <td style={{ padding: '14px', color: item.stock < 5 ? '#ef4444' : '#f59e0b', fontWeight: 800, fontSize: '15px' }}>{item.stock}</td>
                                        <td style={{ padding: '14px', ...muted }}>{item.reorder_level}</td>
                                        <td style={{ padding: '14px' }}>
                                            <span style={badge(item.stock < 5 ? '#ef4444' : '#f59e0b')}>
                                                {item.stock < 5 ? 'Critical' : 'Low'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '14px' }}>
                                            <button style={{ padding: '6px 14px', background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', color: '#818cf8', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                                                Reorder
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {data.lowStock?.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '40px', color: '#10b981', fontWeight: 600 }}>
                                ✅ All products are sufficiently stocked
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ══════════════ REPORTS TAB ══════════════════════════════════════ */}
            {tab === 'reports' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={gridTwo}>
                        {/* Demand Forecast Report Panel */}
                        <div style={card()}>
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
                                <span style={{ fontSize: '24px' }}>🤖</span>
                                <div style={sectionTitle}>Demand Forecasting Report</div>
                            </div>
                            <p style={{ ...muted, marginBottom: '20px', lineHeight: '1.4' }}>
                                Generate an inventory optimization sheet containing product stock levels, LSTM AI demand predictions, sales trends, reorder recommendations, and demand statuses.
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                                <label style={{ ...label, marginBottom: 0 }}>Format:</label>
                                <select
                                    value={exportForecastFormat}
                                    onChange={e => setExportForecastFormat(e.target.value)}
                                    style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#e2e8f0', fontSize: '13px', outline: 'none', fontFamily: 'inherit' }}
                                >
                                    <option value="pdf">PDF Document (.pdf)</option>
                                    <option value="excel">Excel Sheet (.xlsx)</option>
                                    <option value="csv">CSV File (.csv)</option>
                                </select>
                            </div>
                            <button
                                onClick={() => window.open(`/api/ml/forecast-report?format=${exportForecastFormat}`)}
                                style={{ width: '100%', padding: '12px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', color: 'white', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', fontSize: '14px', fontFamily: 'inherit' }}
                            >
                                📥 Generate & Export Report
                            </button>
                        </div>

                        {/* Customer Segmentation CRM Report Panel */}
                        <div style={card()}>
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
                                <span style={{ fontSize: '24px' }}>👥</span>
                                <div style={sectionTitle}>Customer Segmentation CRM Report</div>
                            </div>
                            <p style={{ ...muted, marginBottom: '20px', lineHeight: '1.4' }}>
                                Generate a customer analytics sheet containing RFM scores, classified AI segment labels, purchase totals, visit counts, and contact information.
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                                <label style={{ ...label, marginBottom: 0 }}>Format:</label>
                                <select
                                    value={exportCustomerFormat}
                                    onChange={e => setExportCustomerFormat(e.target.value)}
                                    style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#e2e8f0', fontSize: '13px', outline: 'none', fontFamily: 'inherit' }}
                                >
                                    <option value="pdf">PDF Document (.pdf)</option>
                                    <option value="excel">Excel Sheet (.xlsx)</option>
                                    <option value="csv">CSV File (.csv)</option>
                                </select>
                            </div>
                            <button
                                onClick={() => window.open(`/api/ml/customer-report?format=${exportCustomerFormat}`)}
                                style={{ width: '100%', padding: '12px', background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', color: 'white', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', fontSize: '14px', fontFamily: 'inherit' }}
                            >
                                📥 Generate & Export Report
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- Modals Render Area --- */}
            {editingCustomer && (
                <div style={modalOverlayStyle}>
                    <div style={modalContentStyle}>
                        <div style={sectionTitle}>Edit Customer CRM Details</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div>
                                <label style={{ ...label, display: 'block', marginBottom: '8px' }}>Customer Name</label>
                                <input
                                    type="text"
                                    value={editName}
                                    onChange={e => setEditName(e.target.value)}
                                    style={inputStyle}
                                    placeholder="Enter customer name..."
                                />
                            </div>
                            <div>
                                <label style={{ ...label, display: 'block', marginBottom: '8px' }}>Contact Phone</label>
                                <input
                                    type="text"
                                    value={editPhone}
                                    onChange={e => setEditPhone(e.target.value)}
                                    style={inputStyle}
                                    placeholder="Enter phone number..."
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '12px', marginTop: '16px', justifyContent: 'flex-end' }}>
                                <button
                                    onClick={() => setEditingCustomer(null)}
                                    style={{ padding: '10px 20px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#8892b0', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', fontSize: '14px', fontFamily: 'inherit' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={async () => {
                                        try {
                                            const res = await api.put(`/ml/customers/${editingCustomer.id}`, { name: editName, phone: editPhone });
                                            if (res.data.error) {
                                                alert(res.data.error);
                                            } else {
                                                setEditingCustomer(null);
                                                dispatch(fetchDashboardData());
                                            }
                                        } catch (err) {
                                            console.error(err);
                                            alert("Failed to update customer");
                                        }
                                    }}
                                    style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', color: 'white', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', fontSize: '14px', fontFamily: 'inherit' }}
                                >
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {selectedCustomerCard && (
                <div style={modalOverlayStyle}>
                    <div style={{ ...modalContentStyle, maxWidth: '460px' }}>
                        <div style={{ ...sectionTitle, textAlign: 'center', color: '#818cf8', fontSize: '19px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '16px', marginBottom: '24px' }}>
                            CUSTOMER REPORT CARD
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '8px' }}>
                                <span style={muted}>Customer Name</span>
                                <span style={{ color: 'white', fontWeight: 700 }}>{selectedCustomerCard.name || 'N/A'}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '8px' }}>
                                <span style={muted}>Contact Phone</span>
                                <span style={{ color: 'white', fontWeight: 600 }}>{selectedCustomerCard.phone || 'N/A'}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '8px' }}>
                                <span style={muted}>Customer ID</span>
                                <span style={{ ...muted, fontSize: '11px' }}>{selectedCustomerCard.id}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '8px' }}>
                                <span style={muted}>AI Segment</span>
                                <span style={badge(
                                    selectedCustomerCard.segment === 'Big Spenders' ? '#8b5cf6' :
                                    selectedCustomerCard.segment === 'Loyal' ? '#10b981' :
                                    selectedCustomerCard.segment === 'New' ? '#6366f1' : '#ef4444'
                                )}>{selectedCustomerCard.segment}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '8px' }}>
                                <span style={muted}>Total Spent</span>
                                <span style={{ color: '#10b981', fontWeight: 700 }}>${selectedCustomerCard.monetary.toFixed(2)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '8px' }}>
                                <span style={muted}>Total Orders</span>
                                <span style={{ color: 'white', fontWeight: 700 }}>{selectedCustomerCard.frequency}</span>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'space-between' }}>
                            <button
                                onClick={() => window.open(`/api/ml/customer-card/${selectedCustomerCard.id}`)}
                                style={{ flex: 1, padding: '12px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', color: 'white', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                            >
                                📥 Download PDF
                            </button>
                            <button
                                onClick={() => setSelectedCustomerCard(null)}
                                style={{ padding: '12px 20px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#8892b0', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit' }}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// ─── Small StatCard component ─────────────────────────────────────────────────
const StatCard = ({ accent, icon, title, value, sub, subColor }) => (
    <div style={statCard(accent)}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
            <div style={label}>{title}</div>
            <span style={{ fontSize: '20px' }}>{icon}</span>
        </div>
        <div style={bigNum}>{value}</div>
        <div style={{ fontSize: '12px', color: subColor || '#4a5580', marginTop: '8px', fontWeight: 500 }}>{sub}</div>
    </div>
);

export default ManagerDashboard;
