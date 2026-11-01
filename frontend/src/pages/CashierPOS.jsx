import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import {
    fetchProducts, fetchRecommendations, lookupCustomer,
    submitTransaction, addToCart, updateQuantity,
    removeFromCart, clearCart, clearCustomer,
    fetchShiftStats, fetchRecentTransactions,
} from '../redux/posSlice';


// ─── Fallback products ─────────────────────────────────────────────────────────
const STATIC_PRODUCTS = [
    { id: '1', name: 'Wireless Mouse', price: 29.99, stock_quantity: 45, category: 'Electronics', emoji: '🖱️' },
    { id: '2', name: 'Mechanical Keyboard', price: 89.99, stock_quantity: 12, category: 'Electronics', emoji: '⌨️' },
    { id: '3', name: 'HD Monitor 24"', price: 149.99, stock_quantity: 8, category: 'Electronics', emoji: '🖥️' },
    { id: '4', name: 'USB-C Hub', price: 34.99, stock_quantity: 20, category: 'Accessories', emoji: '🔌' },
    { id: '5', name: 'Mousepad Large', price: 15.99, stock_quantity: 50, category: 'Accessories', emoji: '🟦' },
    { id: '6', name: 'Noise Cancelling Headphones', price: 199.99, stock_quantity: 15, category: 'Audio', emoji: '🎧' },
    { id: '7', name: 'Webcam 1080p', price: 59.99, stock_quantity: 18, category: 'Electronics', emoji: '📷' },
    { id: '8', name: 'Laptop Stand', price: 44.99, stock_quantity: 30, category: 'Accessories', emoji: '💻' },
    { id: '9', name: 'Desk Lamp LED', price: 24.99, stock_quantity: 35, category: 'Accessories', emoji: '💡' },
    { id: '10', name: 'Bluetooth Speaker', price: 79.99, stock_quantity: 22, category: 'Audio', emoji: '🔊' },
    { id: '11', name: 'SSD 1TB', price: 89.99, stock_quantity: 14, category: 'Electronics', emoji: '💾' },
    { id: '12', name: 'USB Flash Drive 64GB', price: 12.99, stock_quantity: 60, category: 'Accessories', emoji: '🗂️' },
];
const PAYMENT_METHODS = [
    { key: 'cash', label: 'Cash', icon: '💵' },
    { key: 'card', label: 'Card', icon: '💳' },
    { key: 'upi', label: 'UPI', icon: '📲' },
];
const TAX_RATE = 0.09;
const CAT_EMOJI = { Electronics: '💡', Accessories: '🔧', Audio: '🎵' };

// ─── Style tokens ─────────────────────────────────────────────────────────────
const F = "'Inter','Segoe UI',sans-serif";
const card = (extra = {}) => ({
    background: '#0e101c', border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '16px', boxSizing: 'border-box', ...extra,
});
const label10 = { fontSize: '10px', fontWeight: 700, color: '#8892b0', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: '4px' };
const muted = { fontSize: '13px', color: '#8892b0' };
const badge = (c) => ({ display: 'inline-block', padding: '3px 10px', borderRadius: '100px', background: `${c}20`, color: c, fontSize: '11px', fontWeight: 700 });
const input = (extra = {}) => ({
    width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)', borderRadius: '9px',
    color: '#c8d0e7', fontSize: '13px', outline: 'none',
    boxSizing: 'border-box', fontFamily: F, ...extra,
});
const primaryBtn = (disabled) => ({
    width: '100%', padding: '13px', fontFamily: F, fontSize: '14px', fontWeight: 800,
    border: 'none', borderRadius: '12px', cursor: disabled ? 'not-allowed' : 'pointer',
    background: disabled ? 'rgba(99,102,241,0.15)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: disabled ? '#3d4466' : 'white',
    boxShadow: disabled ? 'none' : '0 8px 24px rgba(99,102,241,0.22)',
});

// ═══════════════════════════════════════════════════════════════
// TAB 1: Products
// ═══════════════════════════════════════════════════════════════
const ProductsTab = ({ dispatch, products, loadingProducts, cart }) => {
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('All');
    const allProds = products.length > 0 ? products : STATIC_PRODUCTS;
    const categories = ['All', ...new Set(allProds.map(p => p.category).filter(Boolean))];
    const filtered = allProds.filter(p => {
        const catOk = category === 'All' || p.category === category;
        const qOk = p.name?.toLowerCase().includes(search.toLowerCase());
        return catOk && qOk;
    });
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', height: '100%', overflow: 'hidden' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                <h1 style={{ fontSize: '20px', fontWeight: 900, color: 'white', letterSpacing: '-0.5px', margin: 0 }}>🛒 Products</h1>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <span style={{ ...badge('#10b981'), padding: '5px 12px', fontSize: '12px' }}>✅ 14 Txns Today</span>
                    <span style={{ ...badge('#6366f1'), padding: '5px 12px', fontSize: '12px' }}>🛒 {cart.length} in Cart</span>
                </div>
            </div>
            {/* Search */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
                <span style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', fontSize: '15px' }}>🔍</span>
                <input type="text" placeholder="Scan barcode or search product..." value={search} onChange={e => setSearch(e.target.value)}
                    style={{ ...input(), paddingLeft: '40px' }} />
            </div>
            {/* Category chips */}
            <div style={{ display: 'flex', gap: '8px', flexShrink: 0, flexWrap: 'wrap' }}>
                {categories.map(c => (
                    <button key={c} onClick={() => setCategory(c)} style={{ padding: '6px 14px', borderRadius: '100px', border: `1px solid ${category === c ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.08)'}`, background: category === c ? 'rgba(99,102,241,0.15)' : 'transparent', color: category === c ? '#818cf8' : '#4a5580', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: F }}>{CAT_EMOJI[c] || ''} {c}</button>
                ))}
            </div>
            {/* Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(156px, 1fr))', gap: '12px', overflowY: 'auto' }}>
                {loadingProducts ? (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: '#3d4466' }}>Loading products...</div>
                ) : filtered.map(p => {
                    const stock = p.stock_quantity ?? p.stock ?? 99;
                    const low = stock <= 10;
                    const out = stock <= 0;
                    const inCart = cart.find(i => (i.id || i._id) === (p.id || p._id));
                    return (
                        <div key={p.id || p._id}
                            onClick={() => !out && dispatch(addToCart({ ...p, id: p.id || p._id }))}
                            style={{ ...card({ padding: '16px', cursor: out ? 'not-allowed' : 'pointer', display: 'flex', flexDirection: 'column', gap: '8px', position: 'relative', borderColor: low ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.07)', opacity: out ? 0.5 : 1 }), transition: 'transform 0.15s, border-color 0.15s' }}
                            onMouseEnter={e => { if (!out) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)'; } }}
                            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = low ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.07)'; }}
                        >
                            {inCart && <div style={{ position: 'absolute', top: '10px', right: '10px', width: '20px', height: '20px', borderRadius: '6px', background: '#6366f1', color: 'white', fontSize: '11px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{inCart.quantity}</div>}
                            <span style={{ fontSize: '26px' }}>{p.emoji || CAT_EMOJI[p.category] || '📦'}</span>
                            <span style={{ fontSize: '10px', fontWeight: 700, color: low ? '#ef4444' : '#6366f1', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{p.category}{low && !out ? ' · Low Stock' : ''}{out ? ' · Out of Stock' : ''}</span>
                            <span style={{ fontSize: '13px', fontWeight: 700, color: 'white', lineHeight: 1.3 }}>{p.name}</span>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '16px', fontWeight: 900, color: 'white' }}>${p.price}</span>
                                <span style={{ fontSize: '11px', color: low ? '#ef4444' : '#3d4466', fontWeight: 600 }}>Qty:{stock}</span>
                            </div>
                            <div style={{ height: '3px', background: 'rgba(255,255,255,0.04)', borderRadius: '2px' }}>
                                <div style={{ height: '100%', width: `${Math.min(100, (stock / 50) * 100)}%`, background: low ? '#ef4444' : '#6366f1', borderRadius: '2px' }} />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════
// TAB 2: Customer Lookup
// ═══════════════════════════════════════════════════════════════
const CustomerTab = ({ dispatch, customerInfo, lookingUpCustomer, recommendations, cart }) => {
    const [phone, setPhone] = useState('');
    const timer = useRef(null);
    const handleChange = (val) => {
        setPhone(val);
        if (timer.current) clearTimeout(timer.current);
        if (val.length >= 7) timer.current = setTimeout(() => dispatch(lookupCustomer(val)), 500);
        else dispatch(clearCustomer());
    };
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '680px' }}>
            <h1 style={{ fontSize: '20px', fontWeight: 900, color: 'white', margin: 0 }}>👤 Customer Lookup</h1>
            {/* Search */}
            <div style={card({ padding: '20px' })}>
                <div style={label10}>Enter Customer Phone</div>
                <input type="tel" placeholder="e.g. 9876543210" value={phone} onChange={e => handleChange(e.target.value)} style={input({ fontSize: '16px', padding: '14px 16px' })} />
                {lookingUpCustomer && <p style={{ ...muted, marginTop: '10px' }}>⏳ Looking up...</p>}
                {customerInfo && !customerInfo.found && phone.length >= 7 && (
                    <div style={{ marginTop: '12px', padding: '12px 14px', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: '10px' }}>
                        <p style={{ color: '#818cf8', fontSize: '13px', margin: 0 }}>✨ New customer — will be registered on first purchase</p>
                    </div>
                )}
            </div>
            {/* Customer profile */}
            {customerInfo?.found && (
                <div style={card({ padding: '22px' })}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <div>
                            <div style={{ fontSize: '20px', fontWeight: 800, color: 'white' }}>{customerInfo.name}</div>
                            <div style={{ ...muted, marginTop: '2px' }}>{customerInfo.phone}</div>
                        </div>
                        <span style={{ ...badge(customerInfo.segment_color || '#6366f1'), fontSize: '13px', padding: '6px 16px' }}>{customerInfo.segment}</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
                        {[
                            ['Total Spent', `$${customerInfo.total_spent}`, '#818cf8'],
                            ['Visits', customerInfo.visit_count, '#10b981'],
                            ['Last Visit', customerInfo.last_purchase, '#f59e0b'],
                        ].map(([l, v, c]) => (
                            <div key={l} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '14px 16px' }}>
                                <div style={label10}>{l}</div>
                                <div style={{ fontSize: '18px', fontWeight: 800, color: c }}>{v}</div>
                            </div>
                        ))}
                    </div>
                    {/* Segment explanation */}
                    <div style={{ padding: '12px 14px', background: `${customerInfo.segment_color || '#6366f1'}10`, border: `1px solid ${customerInfo.segment_color || '#6366f1'}25`, borderRadius: '10px' }}>
                        <div style={{ fontSize: '12px', color: customerInfo.segment_color || '#818cf8', fontWeight: 700, marginBottom: '4px' }}>Segment: {customerInfo.segment}</div>
                        <div style={{ fontSize: '12px', color: '#6b7694' }}>
                            {customerInfo.segment === 'Loyal' && 'High-value repeat customer. Consider offering a loyalty discount.'}
                            {customerInfo.segment === 'At-Risk' && 'Hasn\'t visited recently. Offer a win-back promotion.'}
                            {customerInfo.segment === 'New' && 'First-time buyer. Offer a welcome deal to increase retention.'}
                            {customerInfo.segment === 'Regular' && 'Steady customer with moderate frequency.'}
                        </div>
                    </div>
                </div>
            )}
            {/* AI Recommendations relevant to this customer */}
            {recommendations.length > 0 && cart.length > 0 && (
                <div style={card({ padding: '20px' })}>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#818cf8', marginBottom: '14px' }}>⚡ AI — Recommended for Current Cart</div>
                    {recommendations.slice(0, 4).map(rec => (
                        <div key={rec.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                            <div>
                                <div style={{ fontSize: '13px', color: 'white', fontWeight: 600 }}>{rec.name}</div>
                                <div style={{ fontSize: '11px', color: '#3d4466', marginTop: '2px' }}>
                                    Confidence: <span style={{ color: '#f59e0b', fontWeight: 700 }}>{Math.round((rec.confidence || 0.5) * 100)}%</span>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ color: '#818cf8', fontWeight: 700, fontSize: '14px' }}>${rec.price}</span>
                                <button onClick={() => dispatch(addToCart({ ...rec, id: rec.id || rec._id }))} style={{ padding: '5px 12px', borderRadius: '7px', background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)', color: '#818cf8', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: F }}>+ Add</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════
// TAB 3: Cart & Payment
// ═══════════════════════════════════════════════════════════════
const CartTab = ({ dispatch, cart, snapCart, customerPhone, setCustomerPhone, discount, setDiscount, payMethod, setPayMethod, note, setNote, subtotal, discountAmt, tax, total, handleCheckout, processingTx, txError, invoiceResult, handlePrint, handleNewTxn }) => {
    if (invoiceResult) {
        return (
            <div style={{ maxWidth: '520px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                    <div style={{ width: '68px', height: '68px', borderRadius: '50%', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px', margin: '0 auto 16px', boxShadow: '0 0 32px rgba(16,185,129,0.15)' }}>✅</div>
                    <h2 style={{ fontSize: '24px', fontWeight: 900, color: 'white', margin: '0 0 6px', letterSpacing: '-0.5px' }}>Payment Successful</h2>
                    <p style={muted}>Transaction saved · Stock updated · RFM recorded</p>
                </div>
                <div style={card({ padding: '22px', marginBottom: '16px' })}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                        <span style={{ fontSize: '16px', fontWeight: 800, color: 'white' }}>🧾 Invoice</span>
                        <span style={{ ...badge('#6366f1'), fontSize: '12px', padding: '4px 12px' }}>#{String(invoiceResult.invoice_id || '').slice(-10)}</span>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '14px' }}>
                        <thead><tr>
                            {['Item', 'Qty', 'Price', 'Total'].map(h => <th key={h} style={{ textAlign: 'left', padding: '7px 4px', color: '#3d4466', fontSize: '10px', fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{h}</th>)}
                        </tr></thead>
                        <tbody>
                            {(snapCart.length > 0 ? snapCart : []).map(item => (
                                <tr key={item.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                    <td style={{ padding: '9px 4px', color: 'white', fontSize: '12px', fontWeight: 600 }}>{item.name}</td>
                                    <td style={{ padding: '9px 4px', color: '#8892b0', fontSize: '12px' }}>×{item.quantity}</td>
                                    <td style={{ padding: '9px 4px', color: '#8892b0', fontSize: '12px' }}>${item.price}</td>
                                    <td style={{ padding: '9px 4px', color: '#818cf8', fontWeight: 700, fontSize: '12px' }}>${(item.price * item.quantity).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {[['Subtotal', `$${subtotal.toFixed(2)}`, '#8892b0'], ...(discountAmt > 0 ? [['Discount', `-$${discountAmt.toFixed(2)}`, '#10b981']] : []), ['Tax (9%)', `$${tax.toFixed(2)}`, '#8892b0']].map(([l, v, c]) => (
                        <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0' }}>
                            <span style={muted}>{l}</span><span style={{ color: c, fontSize: '13px', fontWeight: 600 }}>{v}</span>
                        </div>
                    ))}
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '12px', marginTop: '8px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                        <span style={{ color: 'white', fontWeight: 800, fontSize: '15px' }}>TOTAL</span>
                        <span style={{ color: 'white', fontWeight: 900, fontSize: '22px', letterSpacing: '-0.5px' }}>${total.toFixed(2)}</span>
                    </div>
                    <div style={{ marginTop: '16px', padding: '12px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        {[['Customer', customerPhone || 'Guest'], ['Payment', payMethod.toUpperCase()], ['Date', new Date().toLocaleDateString()], ['Time', new Date().toLocaleTimeString()]].map(([l, v]) => (
                            <div key={l}>
                                <div style={label10}>{l}</div>
                                <div style={{ fontSize: '12px', color: '#c8d0e7', fontWeight: 600 }}>{v}</div>
                            </div>
                        ))}
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={handlePrint} style={{ flex: 1, padding: '12px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', color: '#818cf8', borderRadius: '11px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: F }}>🖨️ Print</button>
                    <button onClick={handleNewTxn} style={{ flex: 2, ...primaryBtn(false) }}>➕ New Transaction</button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', gap: '24px', height: '100%', overflow: 'hidden' }}>
            {/* Cart items */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '14px', minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                    <h1 style={{ fontSize: '20px', fontWeight: 900, color: 'white', margin: 0 }}>🛒 Cart {cart.length > 0 && <span style={{ color: '#6366f1', fontSize: '16px' }}>({cart.length})</span>}</h1>
                    {cart.length > 0 && <button onClick={() => dispatch(clearCart())} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: F }}>Clear All</button>}
                </div>
                <div style={{ ...card({ padding: '16px', flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }) }}>
                    <div style={{ flex: 1, overflowY: 'auto' }}>
                        {cart.length === 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#2e3350', gap: '8px' }}>
                                <span style={{ fontSize: '40px' }}>🛒</span>
                                <span style={{ fontSize: '14px' }}>Cart is empty</span>
                                <span style={{ fontSize: '12px', color: '#1e2035' }}>Go to Products to add items</span>
                            </div>
                        ) : cart.map(item => (
                            <div key={item.id} style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                <span style={{ fontSize: '22px' }}>{item.emoji || '📦'}</span>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
                                    <div style={{ fontSize: '12px', color: '#4a5580', marginTop: '2px' }}>${item.price} × {item.quantity} = <strong style={{ color: '#818cf8' }}>${(item.price * item.quantity).toFixed(2)}</strong></div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    {[['−', -1], ['+', 1]].map(([sym, delta]) => (
                                        <button key={sym} onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity + delta }))} style={{ width: '24px', height: '24px', borderRadius: '7px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', color: 'white', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontFamily: F, lineHeight: 1 }}>{sym}</button>
                                    ))}
                                    <span style={{ fontSize: '13px', fontWeight: 700, color: 'white', minWidth: '18px', textAlign: 'center' }}>{item.quantity}</span>
                                    <button onClick={() => dispatch(removeFromCart(item.id))} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '14px', cursor: 'pointer', fontFamily: F, lineHeight: 1, marginLeft: '2px' }}>✕</button>
                                </div>
                            </div>
                        ))}
                    </div>
                    {cart.length > 0 && (
                        <div style={{ paddingTop: '14px', borderTop: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
                            {[['Subtotal', `$${subtotal.toFixed(2)}`], ...(discountAmt > 0 ? [['Discount', `-$${discountAmt.toFixed(2)}`]] : []), ['Tax (9%)', `$${tax.toFixed(2)}`]].map(([l, v]) => (
                                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                    <span style={muted}>{l}</span>
                                    <span style={{ fontSize: '13px', color: l === 'Discount' ? '#10b981' : '#c8d0e7', fontWeight: 600 }}>{v}</span>
                                </div>
                            ))}
                            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: '6px' }}>
                                <span style={{ color: 'white', fontWeight: 800, fontSize: '16px' }}>Total</span>
                                <span style={{ color: 'white', fontWeight: 900, fontSize: '24px', letterSpacing: '-0.5px' }}>${total.toFixed(2)}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Payment panel */}
            <div style={{ width: '280px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <h1 style={{ fontSize: '20px', fontWeight: 900, color: 'white', margin: 0, flexShrink: 0 }}>💳 Payment</h1>

                <div style={card({ padding: '18px' })}>
                    <div style={{ ...label10, marginBottom: '10px' }}>Customer Phone</div>
                    <input type="tel" placeholder="Phone (optional)" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} style={input({ marginBottom: '14px' })} />
                    <div style={{ ...label10, marginBottom: '10px' }}>Discount ($)</div>
                    <input type="number" placeholder="0.00" value={discount} onChange={e => setDiscount(e.target.value)} style={input({ marginBottom: '0' })} />
                </div>

                <div style={card({ padding: '18px' })}>
                    <div style={{ ...label10, marginBottom: '10px' }}>Payment Method</div>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '0' }}>
                        {PAYMENT_METHODS.map(pm => (
                            <button key={pm.key} onClick={() => setPayMethod(pm.key)} style={{ flex: 1, padding: '10px 6px', borderRadius: '9px', border: `1px solid ${payMethod === pm.key ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.07)'}`, background: payMethod === pm.key ? 'rgba(99,102,241,0.15)' : 'transparent', color: payMethod === pm.key ? '#818cf8' : '#4a5580', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', fontFamily: F }}>
                                <span style={{ fontSize: '18px' }}>{pm.icon}</span>{pm.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div style={card({ padding: '18px', display: 'flex', flexDirection: 'column', gap: '10px' })}>
                    <input type="text" placeholder="📝 Order note (optional)" value={note} onChange={e => setNote(e.target.value)} style={input()} />
                    {txError && <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.18)', borderRadius: '8px', padding: '10px 12px', color: '#f87171', fontSize: '12px' }}>⚠️ {String(txError)}</div>}
                    <button onClick={handleCheckout} disabled={cart.length === 0 || processingTx} style={primaryBtn(cart.length === 0 || processingTx)}>
                        {processingTx ? '⏳ Processing...' : cart.length === 0 ? 'Add items to cart first' : `✅ Complete Payment · $${total.toFixed(2)}`}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════
// TAB 4: Shift Summary
// ═══════════════════════════════════════════════════════════════
const ShiftTab = () => {
    const dispatch = useDispatch();
    const { shiftStats, recentTransactions, loadingShift } = useSelector(s => s.pos);
    const [lastUpdated, setLastUpdated] = useState(null);

    const refresh = () => {
        dispatch(fetchShiftStats());
        dispatch(fetchRecentTransactions(10));
        setLastUpdated(new Date());
    };

    // Fetch on mount and every 30s
    useEffect(() => {
        refresh();
        const interval = setInterval(refresh, 30000);
        return () => clearInterval(interval);
    }, []);  // eslint-disable-line

    const kpis = [
        { label: 'Transactions', value: shiftStats ? String(shiftStats.tx_count) : '—', color: '#6366f1', icon: '📋' },
        { label: 'Revenue', value: shiftStats ? `$${shiftStats.total_revenue.toLocaleString()}` : '—', color: '#10b981', icon: '💰' },
        { label: 'Avg. Ticket', value: shiftStats ? `$${shiftStats.avg_ticket.toFixed(2)}` : '—', color: '#f59e0b', icon: '🧾' },
        { label: 'Returns', value: shiftStats ? String(shiftStats.returns) : '—', color: '#ef4444', icon: '↩️' },
    ];
    const methodColor = { cash: '#10b981', card: '#6366f1', upi: '#f59e0b' };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '800px' }}>
            {/* Header + refresh */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 style={{ fontSize: '20px', fontWeight: 900, color: 'white', margin: 0 }}>📊 Shift Summary</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {lastUpdated && <span style={{ fontSize: '11px', color: '#3d4466' }}>Updated {lastUpdated.toLocaleTimeString()}</span>}
                    <button onClick={refresh} disabled={loadingShift} style={{ padding: '7px 16px', borderRadius: '9px', background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)', color: '#818cf8', fontSize: '12px', fontWeight: 700, cursor: loadingShift ? 'wait' : 'pointer', fontFamily: F }}>
                        {loadingShift ? '⏳ Refreshing...' : '🔄 Refresh'}
                    </button>
                </div>
            </div>

            {/* KPI cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
                {kpis.map(s => (
                    <div key={s.label} style={card({ padding: '18px', borderTop: `3px solid ${s.color}` })}>
                        <div style={{ fontSize: '22px', marginBottom: '10px' }}>{s.icon}</div>
                        <div style={label10}>{s.label}</div>
                        <div style={{ fontSize: '22px', fontWeight: 900, color: s.value === '—' ? '#2e3350' : 'white', letterSpacing: '-0.5px' }}>{s.value}</div>
                    </div>
                ))}
            </div>

            {/* Recent transactions table */}
            <div style={card({ padding: '20px' })}>
                <div style={{ fontSize: '15px', fontWeight: 800, color: 'white', marginBottom: '16px' }}>
                    Recent Transactions {recentTransactions.length > 0 && <span style={{ color: '#3d4466', fontSize: '12px', fontWeight: 400 }}>({recentTransactions.length} shown)</span>}
                </div>
                {recentTransactions.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '30px 0', color: '#3d4466', fontSize: '14px' }}>
                        {loadingShift ? '⏳ Loading...' : 'No transactions today yet'}
                    </div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead><tr>
                            {['Invoice', 'Time', 'Items', 'Method', 'Amount'].map(h => (
                                <th key={h} style={{ textAlign: 'left', padding: '8px 10px', color: '#3d4466', fontSize: '11px', fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{h}</th>
                            ))}
                        </tr></thead>
                        <tbody>
                            {recentTransactions.map(tx => {
                                const t = tx.timestamp ? new Date(tx.timestamp) : null;
                                const timeStr = t ? t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—';
                                const method = (tx.payment_method || 'cash').toLowerCase();
                                return (
                                    <tr key={tx.invoice_id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                        <td style={{ padding: '11px 10px', color: '#818cf8', fontWeight: 700, fontSize: '13px' }}>#{tx.invoice_id.slice(-8)}</td>
                                        <td style={{ padding: '11px 10px', color: '#8892b0', fontSize: '13px' }}>{timeStr}</td>
                                        <td style={{ padding: '11px 10px', color: '#8892b0', fontSize: '13px' }}>{tx.items_count}</td>
                                        <td style={{ padding: '11px 10px' }}>
                                            <span style={{ ...badge(methodColor[method] || '#6366f1'), fontSize: '11px', padding: '3px 10px' }}>{method.toUpperCase()}</span>
                                        </td>
                                        <td style={{ padding: '11px 10px', color: 'white', fontWeight: 700, fontSize: '14px' }}>${tx.total_amount.toFixed(2)}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
            <div style={card({ padding: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' })}>
                <span style={{ color: '#4a5580', fontSize: '13px' }}>🔄 Auto-refreshes every 30 seconds</span>
                <button style={{ padding: '10px 20px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', borderRadius: '9px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: F }}>End Shift</button>
            </div>
        </div>
    );
};


// ═══════════════════════════════════════════════════════════════
// Root Component
// ═══════════════════════════════════════════════════════════════
const CashierPOS = () => {
    const dispatch = useDispatch();
    const [searchParams] = useSearchParams();
    const tab = searchParams.get('tab') || 'products';

    const { products: backendProducts, loadingProducts, cart, recommendations, loadingRecommendations, customerInfo, lookingUpCustomer, processingTx, invoiceResult, txError } = useSelector(s => s.pos);

    const [customerPhone, setCustomerPhone] = useState('');
    const [discount, setDiscount] = useState('');
    const [payMethod, setPayMethod] = useState('cash');
    const [note, setNote] = useState('');
    const [snapCart, setSnapCart] = useState([]);
    const [snapDiscount, setSnapDiscount] = useState(0);

    // Load products on mount
    useEffect(() => { dispatch(fetchProducts()); }, [dispatch]);

    // Refresh AI recommendations when cart changes
    useEffect(() => {
        const ids = (cart || []).map(i => i.id || i._id).filter(Boolean);
        if (ids.length > 0) dispatch(fetchRecommendations(ids));
    }, [cart, dispatch]);

    // Calculations — safe against undefined
    const safeCart = cart || [];
    const safeSC = invoiceResult ? snapCart : safeCart;
    const subtotal = safeSC.reduce((t, i) => t + (i.price || 0) * (i.quantity || 0), 0);
    const discountAmt = Math.min(invoiceResult ? snapDiscount : (parseFloat(discount) || 0), subtotal);
    const taxable = subtotal - discountAmt;
    const tax = taxable * TAX_RATE;
    const total = taxable + tax;

    const handleCheckout = () => {
        setSnapCart([...safeCart]);
        setSnapDiscount(parseFloat(discount) || 0);
        dispatch(submitTransaction({
            customer_phone: customerPhone || null,
            payment_method: payMethod,
            note: note || null,
            items: safeCart.map(i => ({ product_id: i.id || i._id, quantity: i.quantity })),
        }));
    };

    const handlePrint = () => {
        const existing = document.getElementById('__pos_print_frame');
        if (existing) existing.remove();
        const html = `<div id="__pos_print_frame" style="display:none;"><style>@media print { body > *:not(#__pos_print_frame){display:none!important} #__pos_print_frame{display:block!important;font-family:sans-serif;padding:20px;color:#000} table{width:100%;border-collapse:collapse;margin:10px 0} th,td{padding:7px;border-bottom:1px solid #ddd;text-align:left;font-size:13px} .big{font-size:18px;font-weight:bold} }</style><h2>SmartPOS Invoice</h2><p>Invoice #: ${String(invoiceResult?.invoice_id || '').slice(-12)}</p><p>Date: ${new Date().toLocaleString()}</p><p>Customer: ${customerPhone || 'Guest'}</p><p>Payment: ${payMethod.toUpperCase()}</p><hr/><table><thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead><tbody>${snapCart.map(i => `<tr><td>${i.name}</td><td>${i.quantity}</td><td>$${i.price}</td><td>$${(i.price * i.quantity).toFixed(2)}</td></tr>`).join('')}</tbody></table><hr/><p>Subtotal: $${subtotal.toFixed(2)}</p>${discountAmt > 0 ? `<p>Discount: -$${discountAmt.toFixed(2)}</p>` : ''}<p>Tax(9%): $${tax.toFixed(2)}</p><p class="big">TOTAL: $${total.toFixed(2)}</p></div>`;
        document.body.insertAdjacentHTML('beforeend', html);
        window.print();
        setTimeout(() => { const el = document.getElementById('__pos_print_frame'); if (el) el.remove(); }, 1000);
    };

    const handleNewTxn = () => { dispatch(clearCart()); setCustomerPhone(''); setDiscount(''); setNote(''); setSnapCart([]); };

    const commonProps = { dispatch, cart: safeCart, invoiceResult };

    return (
        <div style={{ fontFamily: F, color: '#c8d0e7', height: '100%' }}>
            {tab === 'products' && <ProductsTab {...commonProps} products={backendProducts} loadingProducts={loadingProducts} />}
            {tab === 'customer' && <CustomerTab {...commonProps} customerInfo={customerInfo} lookingUpCustomer={lookingUpCustomer} recommendations={recommendations} />}
            {tab === 'cart' && <CartTab {...commonProps} {...{ customerPhone, setCustomerPhone, discount, setDiscount, payMethod, setPayMethod, note, setNote, subtotal, discountAmt, tax, total, handleCheckout, processingTx, txError, handlePrint, handleNewTxn, snapCart }} />}
            {tab === 'shift' && <ShiftTab />}
        </div>
    );
};

export default CashierPOS;
