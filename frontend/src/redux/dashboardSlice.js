import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

export const fetchDashboardData = createAsyncThunk(
    'dashboard/fetchData',
    async () => {
        try {
            const statsRes = await api.get('/dashboard/stats');
            const topProdRes = await api.get('/dashboard/top-products');
            const trendRes = await api.get('/dashboard/sales-trend');
            const stockRes = await api.get('/dashboard/low-stock');
            const segmentsRes = await api.get('/ml/customer-segments');

            return {
                stats: statsRes.data,
                topProducts: topProdRes.data,
                salesTrend: trendRes.data,
                lowStock: stockRes.data,
                segments: segmentsRes.data.summary,
                segmentData: segmentsRes.data.raw_data,
            };
        } catch (err) {
            console.error("Dashboard fetch error", err)
            throw err;
        }
    }
);

export const predictDemand = createAsyncThunk(
    'dashboard/predictDemand',
    async (productId) => {
        const response = await api.post('/ml/predict-demand', { product_id: productId });
        return { productId, ...response.data };
    }
)

const dashboardSlice = createSlice({
    name: 'dashboard',
    initialState: {
        data: null,
        loading: false,
        predicting: false,
        predictionResult: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchDashboardData.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchDashboardData.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(fetchDashboardData.rejected, (state) => {
                state.loading = false;
            })
            .addCase(predictDemand.pending, (state) => {
                state.predicting = true;
            })
            .addCase(predictDemand.fulfilled, (state, action) => {
                state.predicting = false;
                state.predictionResult = action.payload;
            })
            .addCase(predictDemand.rejected, (state) => {
                state.predicting = false;
            });
    },
});

export default dashboardSlice.reducer;
