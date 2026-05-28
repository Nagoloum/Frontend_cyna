// Imperative bridge: lets non-React code (callbacks, services, axios interceptors)
// trigger toasts and confirm dialogs by dispatching directly to the Redux store.

import { store } from '../../../store';
import { addToast, openConfirm, closeConfirm } from '../../../store/slices/notificationsSlice';

// Resolve callback for the currently pending confirm dialog.
// Stored outside Redux because functions are not serializable.
let pendingConfirmResolve = null;

export const notify = {
  success: (title, message, opts) =>
    store.dispatch(addToast({ type: 'success', title, message, ...opts })),
  error: (title, message, opts) =>
    store.dispatch(addToast({ type: 'error', title, message, ...opts })),
  warning: (title, message, opts) =>
    store.dispatch(addToast({ type: 'warning', title, message, ...opts })),
  info: (title, message, opts) =>
    store.dispatch(addToast({ type: 'info', title, message, ...opts })),
};

export function confirmDialog(opts) {
  return new Promise((resolve) => {
    pendingConfirmResolve = resolve;
    store.dispatch(openConfirm(opts));
  });
}

export function resolveConfirm(value) {
  if (pendingConfirmResolve) {
    pendingConfirmResolve(value);
    pendingConfirmResolve = null;
  }
  store.dispatch(closeConfirm());
}
