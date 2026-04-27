// Unified, theme-aware notification system (toasts + confirm dialogs).
// Renders into <body> via portal so it floats above any layout.
//
// Usage:
//   const { notify, confirm } = useNotify();
//   notify.success('Saved', 'Profile updated');
//   const ok = await confirm({ title: 'Delete?', message: '...', variant: 'danger' });
//
// Or, from anywhere (after the provider mounted):
//   import { notify, confirmDialog } from '@/components/ui/feedback';
//   notify.error('Oops', err.message);

import {
  createContext, useCallback, useContext, useEffect,
  useMemo, useRef, useState,
} from 'react';
import { createPortal } from 'react-dom';
import {
  AlertTriangle, CheckCircle2, Info, Loader2, X, XCircle,
} from 'lucide-react';
import { setNotifyHandler, setConfirmHandler } from './notify';

const NotifyContext = createContext(null);

export function useNotify() {
  const ctx = useContext(NotifyContext);
  if (!ctx) throw new Error('useNotify must be used within <NotifyProvider>');
  return ctx;
}

// ─── Visual config ──────────────────────────────────────────────────────────
const ICONS = {
  success: CheckCircle2,
  error:   XCircle,
  warning: AlertTriangle,
  info:    Info,
};

// Each variant returns inline style overrides mapped to CSS variables.
const variantTone = (type) => {
  switch (type) {
    case 'success': return { fg: 'var(--success)', glow: 'rgba(16,185,129,0.18)' };
    case 'error':   return { fg: 'var(--danger)',  glow: 'rgba(239,68,68,0.18)'  };
    case 'warning': return { fg: 'var(--warning)', glow: 'rgba(245,158,11,0.18)' };
    case 'info':
    default:        return { fg: 'var(--accent)',  glow: 'var(--accent-glow)'    };
  }
};

// ─── Toast ──────────────────────────────────────────────────────────────────
function Toast({ toast, onRemove }) {
  const { id, type = 'info', title, message, duration = 4500 } = toast;
  const Icon = ICONS[type] ?? Info;
  const tone = variantTone(type);

  useEffect(() => {
    const timer = setTimeout(() => onRemove(id), duration);
    return () => clearTimeout(timer);
  }, [id, duration, onRemove]);

  return (
    <div
      role={type === 'error' ? 'alert' : 'status'}
      className="cyna-toast"
      style={{
        '--tone-fg':   tone.fg,
        '--tone-glow': tone.glow,
      }}
    >
      <span className="cyna-toast-icon" aria-hidden>
        <Icon size={16} />
      </span>
      <div className="cyna-toast-body">
        {title && <p className="cyna-toast-title">{title}</p>}
        {message && <p className="cyna-toast-message">{message}</p>}
      </div>
      <button
        type="button"
        className="cyna-toast-close"
        onClick={() => onRemove(id)}
        aria-label="Dismiss"
      >
        <X size={14} />
      </button>
      <span
        className="cyna-toast-progress"
        style={{ animationDuration: `${duration}ms` }}
      />
    </div>
  );
}

// ─── Confirm dialog ─────────────────────────────────────────────────────────
function ConfirmDialog({ state, onResolve }) {
  const [busy, setBusy] = useState(false);

  // Reset busy whenever a new dialog opens.
  useEffect(() => { setBusy(false); }, [state?.id]);

  // ESC closes the dialog as a "cancel".
  useEffect(() => {
    if (!state) return;
    const onKey = (e) => {
      if (e.key === 'Escape' && !busy) onResolve(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [state, busy, onResolve]);

  if (!state) return null;
  const {
    title = 'Confirm action',
    message = 'Are you sure you want to continue?',
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    variant = 'danger',
  } = state;

  const tone = variantTone(variant === 'danger' ? 'error' : variant);
  const Icon = variant === 'danger' || variant === 'error'
    ? XCircle
    : ICONS[variant] ?? AlertTriangle;

  const handleConfirm = async () => {
    setBusy(true);
    onResolve(true);
  };

  return (
    <div className="cyna-modal-backdrop" onClick={() => !busy && onResolve(false)}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="cyna-confirm-title"
        className="cyna-modal-panel"
        style={{ '--tone-fg': tone.fg, '--tone-glow': tone.glow }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="cyna-modal-close"
          onClick={() => !busy && onResolve(false)}
          aria-label="Close"
          disabled={busy}
        >
          <X size={15} />
        </button>

        <div className="cyna-modal-icon" aria-hidden>
          <Icon size={22} />
        </div>

        <h3 id="cyna-confirm-title" className="cyna-modal-title">{title}</h3>
        <div className="cyna-modal-message">{message}</div>

        <div className="cyna-modal-actions">
          <button
            type="button"
            className="cyna-btn-cancel"
            onClick={() => onResolve(false)}
            disabled={busy}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className="cyna-btn-confirm"
            onClick={handleConfirm}
            disabled={busy}
          >
            {busy && <Loader2 size={14} className="animate-spin" />}
            {busy ? 'Processing…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Provider ───────────────────────────────────────────────────────────────
export function NotifyProvider({ children }) {
  const [toasts, setToasts]   = useState([]);
  const [pending, setPending] = useState(null); // { id, ...opts, resolve }
  const idRef = useRef(0);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const pushToast = useCallback((data) => {
    const id = ++idRef.current;
    setToasts((prev) => [...prev, { id, ...data }]);
    return id;
  }, []);

  const notify = useMemo(() => ({
    success: (title, message, opts) => pushToast({ type: 'success', title, message, ...opts }),
    error:   (title, message, opts) => pushToast({ type: 'error',   title, message, ...opts }),
    warning: (title, message, opts) => pushToast({ type: 'warning', title, message, ...opts }),
    info:    (title, message, opts) => pushToast({ type: 'info',    title, message, ...opts }),
  }), [pushToast]);

  const confirm = useCallback((opts) => {
    return new Promise((resolve) => {
      const id = ++idRef.current;
      setPending({ id, ...opts, resolve });
    });
  }, []);

  const resolveConfirm = useCallback((value) => {
    if (pending) {
      pending.resolve(value);
      setPending(null);
    }
  }, [pending]);

  // Expose handlers globally so non-hook code can call them.
  useEffect(() => {
    setNotifyHandler(notify);
    setConfirmHandler(confirm);
    return () => {
      setNotifyHandler(null);
      setConfirmHandler(null);
    };
  }, [notify, confirm]);

  const ctx = useMemo(() => ({ notify, confirm }), [notify, confirm]);

  return (
    <NotifyContext.Provider value={ctx}>
      {children}
      <Portal>
        <div className="cyna-toast-stack" aria-live="polite">
          {toasts.map((t) => (
            <Toast key={t.id} toast={t} onRemove={removeToast} />
          ))}
        </div>
        <ConfirmDialog state={pending} onResolve={resolveConfirm} />
      </Portal>
      <NotifyStyles />
    </NotifyContext.Provider>
  );
}

// ─── Portal (lazy: only mounts when document is ready) ──────────────────────
function Portal({ children }) {
  const [ready, setReady] = useState(false);
  useEffect(() => { setReady(true); }, []);
  if (!ready || typeof document === 'undefined') return null;
  return createPortal(children, document.body);
}

// ─── Styles (scoped via classnames, fully driven by CSS vars) ───────────────
function NotifyStyles() {
  return (
    <style>{`
      .cyna-toast-stack {
        position: fixed;
        z-index: 9999;
        top: 1rem;
        right: 1rem;
        left: 1rem;
        display: flex;
        flex-direction: column;
        gap: 0.625rem;
        align-items: stretch;
        pointer-events: none;
      }
      @media (min-width: 640px) {
        .cyna-toast-stack {
          left: auto;
          align-items: flex-end;
          top: 1.5rem;
          right: 1.5rem;
          max-width: 380px;
        }
      }

      .cyna-toast {
        pointer-events: auto;
        position: relative;
        display: flex;
        gap: 0.75rem;
        align-items: flex-start;
        padding: 0.875rem 2.25rem 0.875rem 0.875rem;
        border-radius: var(--radius-lg, 16px);
        background: var(--bg-card);
        color: var(--text-primary);
        border: 1px solid var(--border);
        box-shadow:
          var(--shadow-lg, 0 12px 32px rgba(0,0,0,0.12)),
          0 0 0 1px var(--tone-glow);
        overflow: hidden;
        font-family: 'Kumbh Sans', sans-serif;
        animation: cyna-toast-in 240ms cubic-bezier(.2,.8,.2,1);
      }
      @keyframes cyna-toast-in {
        from { opacity: 0; transform: translateY(-8px) scale(0.98); }
        to   { opacity: 1; transform: translateY(0)    scale(1); }
      }

      .cyna-toast-icon {
        flex-shrink: 0;
        width: 28px;
        height: 28px;
        border-radius: 999px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: var(--tone-glow);
        color: var(--tone-fg);
      }

      .cyna-toast-body {
        flex: 1;
        min-width: 0;
      }
      .cyna-toast-title {
        margin: 0;
        font-size: 0.875rem;
        font-weight: 700;
        color: var(--text-primary);
        line-height: 1.25;
      }
      .cyna-toast-message {
        margin: 0.125rem 0 0;
        font-size: 0.75rem;
        line-height: 1.45;
        color: var(--text-secondary);
        word-wrap: break-word;
      }

      .cyna-toast-close {
        position: absolute;
        top: 0.5rem;
        right: 0.5rem;
        background: transparent;
        border: 0;
        cursor: pointer;
        padding: 4px;
        border-radius: 8px;
        color: var(--text-muted);
        transition: background 0.15s ease, color 0.15s ease;
      }
      .cyna-toast-close:hover {
        background: var(--bg-muted);
        color: var(--text-primary);
      }

      .cyna-toast-progress {
        position: absolute;
        left: 0;
        bottom: 0;
        height: 2px;
        background: var(--tone-fg);
        animation-name: cyna-toast-shrink;
        animation-timing-function: linear;
        animation-fill-mode: forwards;
      }
      @keyframes cyna-toast-shrink {
        from { width: 100%; }
        to   { width: 0%; }
      }

      .cyna-modal-backdrop {
        position: fixed;
        inset: 0;
        z-index: 10000;
        background: rgba(8, 6, 20, 0.55);
        backdrop-filter: blur(6px);
        -webkit-backdrop-filter: blur(6px);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1rem;
        animation: cyna-fade 180ms ease;
      }
      @keyframes cyna-fade {
        from { opacity: 0; }
        to   { opacity: 1; }
      }

      .cyna-modal-panel {
        position: relative;
        width: 100%;
        max-width: 420px;
        background: var(--bg-card);
        color: var(--text-primary);
        border: 1px solid var(--border);
        border-radius: var(--radius-xl, 20px);
        padding: 1.5rem 1.5rem 1.25rem;
        box-shadow:
          var(--shadow-lg, 0 24px 60px rgba(0,0,0,0.18)),
          0 0 0 1px var(--tone-glow);
        font-family: 'Kumbh Sans', sans-serif;
        animation: cyna-pop 220ms cubic-bezier(.2,.9,.25,1);
      }
      @keyframes cyna-pop {
        from { opacity: 0; transform: translateY(10px) scale(0.97); }
        to   { opacity: 1; transform: translateY(0)   scale(1); }
      }

      .cyna-modal-close {
        position: absolute;
        top: 0.875rem;
        right: 0.875rem;
        background: transparent;
        border: 0;
        cursor: pointer;
        padding: 6px;
        border-radius: 10px;
        color: var(--text-muted);
        transition: background 0.15s, color 0.15s;
      }
      .cyna-modal-close:hover:not(:disabled) {
        background: var(--bg-muted);
        color: var(--text-primary);
      }

      .cyna-modal-icon {
        width: 48px;
        height: 48px;
        border-radius: 16px;
        background: var(--tone-glow);
        color: var(--tone-fg);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 1rem;
      }

      .cyna-modal-title {
        margin: 0 0 0.5rem;
        font-size: 1.0625rem;
        font-weight: 800;
        color: var(--text-primary);
        line-height: 1.3;
      }
      .cyna-modal-message {
        font-size: 0.875rem;
        line-height: 1.55;
        color: var(--text-secondary);
        margin-bottom: 1.25rem;
      }

      .cyna-modal-actions {
        display: flex;
        gap: 0.625rem;
        flex-wrap: wrap-reverse;
      }
      .cyna-btn-cancel,
      .cyna-btn-confirm {
        flex: 1 1 140px;
        min-height: 40px;
        border-radius: var(--radius-md, 12px);
        font-family: 'Kumbh Sans', sans-serif;
        font-weight: 600;
        font-size: 0.875rem;
        cursor: pointer;
        transition: background 0.18s ease, color 0.18s ease,
                    border-color 0.18s ease, transform 0.12s ease;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        padding: 0 1rem;
      }
      .cyna-btn-cancel {
        background: var(--bg-muted);
        color: var(--text-primary);
        border: 1px solid var(--border);
      }
      .cyna-btn-cancel:hover:not(:disabled) {
        border-color: var(--text-muted);
      }
      .cyna-btn-confirm {
        background: var(--tone-fg);
        color: #fff;
        border: 1px solid var(--tone-fg);
        box-shadow: 0 6px 16px var(--tone-glow);
      }
      .cyna-btn-confirm:hover:not(:disabled) {
        filter: brightness(1.08);
        transform: translateY(-1px);
      }
      .cyna-btn-cancel:disabled,
      .cyna-btn-confirm:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      @media (max-width: 480px) {
        .cyna-modal-panel { padding: 1.25rem 1.125rem 1rem; border-radius: 18px; }
        .cyna-modal-actions { flex-direction: column-reverse; }
        .cyna-btn-cancel, .cyna-btn-confirm { flex: 1 1 auto; }
      }
    `}</style>
  );
}
