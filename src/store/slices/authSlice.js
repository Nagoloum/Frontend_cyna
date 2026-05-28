import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    status: 'checking', // 'checking' | 'ok' | 'expired' | 'denied' | 'redirect' | 'twoFA'
    redirectTarget: '/auth',
    countdown: 3,
  },
  reducers: {
    setAuthStatus: (state, action) => {
      state.status = action.payload;
    },
    setRedirectTarget: (state, action) => {
      state.redirectTarget = action.payload;
    },
    setCountdown: (state, action) => {
      state.countdown = action.payload;
    },
    decrementCountdown: (state) => {
      state.countdown -= 1;
    },
    resetAuth: (state) => {
      state.status = 'checking';
      state.redirectTarget = '/auth';
      state.countdown = 3;
    },
  },
});

export const {
  setAuthStatus, setRedirectTarget, setCountdown, decrementCountdown, resetAuth,
} = authSlice.actions;

export default authSlice.reducer;
