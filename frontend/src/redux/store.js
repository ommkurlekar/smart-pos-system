import { configureStore } from '@reduxjs/toolkit';
import posReducer from './posSlice';
import dashboardReducer from './dashboardSlice';
import authReducer from './authSlice';

export const store = configureStore({
    reducer: {
        pos: posReducer,
        dashboard: dashboardReducer,
        auth: authReducer,
    },
});
