// Imperative bridge: lets non-React code (callbacks, services, axios interceptors)
// trigger toasts and confirm dialogs without needing a hook.
//
// The NotifyProvider registers its handlers on mount; if a notify call happens
// before the provider is ready, the call falls back to console output so it's
// never silently lost.

let notifyHandler = null;
let confirmHandler = null;

export function setNotifyHandler(handler) { notifyHandler = handler; }
export function setConfirmHandler(handler) { confirmHandler = handler; }

const fallback = (level, title, message) => {
  // eslint-disable-next-line no-console
  console[level === 'error' ? 'error' : 'log'](`[notify:${level}]`, title, message ?? '');
};

export const notify = {
  success: (title, message, opts) =>
    notifyHandler ? notifyHandler.success(title, message, opts) : fallback('success', title, message),
  error: (title, message, opts) =>
    notifyHandler ? notifyHandler.error(title, message, opts) : fallback('error', title, message),
  warning: (title, message, opts) =>
    notifyHandler ? notifyHandler.warning(title, message, opts) : fallback('warning', title, message),
  info: (title, message, opts) =>
    notifyHandler ? notifyHandler.info(title, message, opts) : fallback('info', title, message),
};

export function confirmDialog(opts) {
  if (confirmHandler) return confirmHandler(opts);
  // Fallback: if provider isn't mounted, fail safely (resolve to false).
  // eslint-disable-next-line no-console
  console.warn('[confirmDialog] NotifyProvider not mounted — defaulting to false', opts);
  return Promise.resolve(false);
}
