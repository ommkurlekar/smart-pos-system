import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

export const loginUser = createAsyncThunk(
    'auth/login',
    async (credentials, { rejectWithValue }) => {
        try {
            const response = await api.post('/auth/login', credentials);
            localStorage.setItem('token', response.data.access_token);
            localStorage.setItem('role', response.data.role);
            // Set default header
            api.defaults.headers.common['Authorization'] = `Bearer ${response.data.access_token}`;
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response.data);
        }
    }
);

export const registerUser = createAsyncThunk(
    'auth/register',
    async (userData, { rejectWithValue }) => {
        try {
            const response = await api.post('/auth/signup', userData);
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response.data);
        }
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: null, // { role: 'Manager' | 'Cashier' }
        token: localStorage.getItem('token') || null,
        role: localStorage.getItem('role') || null,
        loading: false,
        error: null,
    },
    reducers: {
        logout: (state) => {
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            delete api.defaults.headers.common['Authorization'];
            state.user = null;
            state.token = null;
            state.role = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.token = action.payload.access_token;
                state.role = action.payload.role;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.detail || 'Login failed';
            })
            .addCase(registerUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(registerUser.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.detail || 'Registration failed';
            });
    }
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
