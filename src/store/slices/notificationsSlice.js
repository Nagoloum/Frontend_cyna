import { createSlice } from '@reduxjs/toolkit';

let nextId = 1;

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: {
    toasts: [],
    confirm: null, // { id, title, message, confirmLabel, cancelLabel, variant }
  },
  reducers: {
    addToast: {
      reducer: (state, action) => {
        state.toasts.push(action.payload);
      },
      prepare: (data) => ({
        payload: { id: nextId++, ...data },
      }),
    },
    removeToast: (state, action) => {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    },
    clearToasts: (state) => {
      state.toasts = [];
    },
    openConfirm: {
      reducer: (state, action) => {
        state.confirm = action.payload;
      },
      prepare: (config) => ({
        payload: { id: nextId++, ...config },
      }),
    },
    closeConfirm: (state) => {
      state.confirm = null;
    },
  },
});

export const {
  addToast, removeToast, clearToasts, openConfirm, closeConfirm,
} = notificationsSlice.actions;

export default notificationsSlice.reducer;
