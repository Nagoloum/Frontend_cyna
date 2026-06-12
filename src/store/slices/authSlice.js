import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    status: 'checking', // 'checking' | 'ok' | 'expired' | 'denied' | 'redirect' | 'twoFA'
    redirectTarget: '/auth',
    countdown: 3,
    // Méthode 2FA de l'admin connecté : 'NONE' | 'EMAIL' | 'TOTP' | null (non chargée).
    // Alimente les badges 2FA de la sidebar et du header admin.
    twoFactorMethod: null,
  },
  reducers: {
    setAuthStatus: (state, action) => {
      state.status = action.payload;
    },
    setTwoFactorMethod: (state, action) => {
      state.twoFactorMethod = action.payload;
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
  setAuthStatus, setTwoFactorMethod, setRedirectTarget, setCountdown, decrementCountdown, resetAuth,
} = authSlice.actions;

export default authSlice.reducer;
