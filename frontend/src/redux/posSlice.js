import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

// ─── Thunks ───────────────────────────────────────────────────────────────────

export const fetchProducts = createAsyncThunk('pos/fetchProducts', async () => {
    try { const r = await api.get('/products/'); return r.data; } catch { return []; }
});

export const fetchRecommendations = createAsyncThunk('pos/fetchRecommendations', async (productIds) => {
    if (!productIds || productIds.length === 0) return [];
    try { const r = await api.post('/ml/recommend', { product_ids: productIds }); return r.data.recommended_products || []; } catch { return []; }
});

export const lookupCustomer = createAsyncThunk('pos/lookupCustomer', async (phone) => {
    if (!phone || phone.length < 5) return null;
    try { const r = await api.get(`/dashboard/customer-lookup?phone=${encodeURIComponent(phone)}`); return r.data; } catch { return null; }
});

export const submitTransaction = createAsyncThunk('pos/submitTransaction', async (txData, { rejectWithValue }) => {
    try {
        const r = await api.post('/transactions/', txData);
        return r.data;
    } catch (err) {
        const detail = err?.response?.data?.detail;
        if (typeof detail === 'string') return rejectWithValue(detail);
        if (Array.isArray(detail)) return rejectWithValue(detail.map(d => d.msg || JSON.stringify(d)).join(', '));
        return rejectWithValue('Transaction failed. Is the backend running?');
    }
});

export const fetchShiftStats = createAsyncThunk('pos/fetchShiftStats', async () => {
    try { const r = await api.get('/transactions/shift-stats'); return r.data; } catch { return null; }
});

export const fetchRecentTransactions = createAsyncThunk('pos/fetchRecentTransactions', async (limit = 10) => {
    try { const r = await api.get(`/transactions/recent?limit=${limit}`); return r.data; } catch { return []; }
});

// ─── Slice ────────────────────────────────────────────────────────────────────
const posSlice = createSlice({
    name: 'pos',
    initialState: {
        products: [],
        loadingProducts: false,
        cart: [],
        recommendations: [],
        loadingRecommendations: false,
        customerInfo: null,
        lookingUpCustomer: false,
        processingTx: false,
        invoiceResult: null,
        invoiceCart: [],
        txError: null,
        shiftStats: null,
        recentTransactions: [],
        loadingShift: false,
    },
    reducers: {
        addToCart: (state, action) => {
            const product = action.payload;
            const item = state.cart.find(i => i.id === product.id);
            const max = product.stock || product.stock_quantity || 999;
            if (item) { if (item.quantity < max) item.quantity += 1; }
            else state.cart.push({ ...product, quantity: 1 });
        },
        updateQuantity: (state, action) => {
            const { id, quantity } = action.payload;
            const item = state.cart.find(i => i.id === id);
            if (!item) return;
            if (quantity <= 0) state.cart = state.cart.filter(i => i.id !== id);
            else item.quantity = Math.min(quantity, item.stock || item.stock_quantity || 999);
        },
        removeFromCart: (state, action) => {
            state.cart = state.cart.filter(i => i.id !== action.payload);
        },
        clearCart: (state) => {
            state.cart = []; state.recommendations = []; state.invoiceResult = null;
            state.invoiceCart = []; state.txError = null; state.customerInfo = null;
        },
        clearCustomer: (state) => { state.customerInfo = null; },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchProducts.pending, (s) => { s.loadingProducts = true; })
            .addCase(fetchProducts.fulfilled, (s, a) => { s.loadingProducts = false; s.products = a.payload; })
            .addCase(fetchProducts.rejected, (s) => { s.loadingProducts = false; })

            .addCase(fetchRecommendations.pending, (s) => { s.loadingRecommendations = true; })
            .addCase(fetchRecommendations.fulfilled, (s, a) => { s.loadingRecommendations = false; s.recommendations = a.payload; })
            .addCase(fetchRecommendations.rejected, (s) => { s.loadingRecommendations = false; })

            .addCase(lookupCustomer.pending, (s) => { s.lookingUpCustomer = true; })
            .addCase(lookupCustomer.fulfilled, (s, a) => { s.lookingUpCustomer = false; s.customerInfo = a.payload; })
            .addCase(lookupCustomer.rejected, (s) => { s.lookingUpCustomer = false; })

            .addCase(submitTransaction.pending, (s) => { s.processingTx = true; s.txError = null; })
            .addCase(submitTransaction.fulfilled, (s, a) => {
                s.processingTx = false;
                s.invoiceCart = [...s.cart];  // snapshot before clear
                s.invoiceResult = a.payload;
                s.cart = [];
            })
            .addCase(submitTransaction.rejected, (s, a) => { s.processingTx = false; s.txError = a.payload || 'Transaction failed'; })

            .addCase(fetchShiftStats.pending, (s) => { s.loadingShift = true; })
            .addCase(fetchShiftStats.fulfilled, (s, a) => { s.loadingShift = false; s.shiftStats = a.payload; })
            .addCase(fetchShiftStats.rejected, (s) => { s.loadingShift = false; })

            .addCase(fetchRecentTransactions.fulfilled, (s, a) => { s.recentTransactions = a.payload || []; });
    },
});

export const { addToCart, updateQuantity, removeFromCart, clearCart, clearCustomer } = posSlice.actions;
export default posSlice.reducer;
