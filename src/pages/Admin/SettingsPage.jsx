/* eslint-disable no-unused-vars */
// src/pages/Admin/Settings.jsx
import { useState, useEffect } from 'react';
import {
  Bell, Palette,
  CheckCircle, AlertCircle, Loader2, Sun, Moon, Monitor,
  ToggleLeft, ToggleRight,
} from 'lucide-react';
import api from '../../services/api';

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ message, type, onDismiss }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4000);
    return () => clearTimeout(t);
  }, [onDismiss]);
  return (
    <div className={`
      fixed bottom-6 right-6 z-50 flex items-center gap-3
      px-4 py-3 rounded-2xl shadow-xl text-sm font-medium
      animate-in slide-in-from-bottom-4 duration-300
      ${type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}
    `}>
      {type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
      {message}
    </div>
  );
}

// ── Section wrapper ───────────────────────────────────────────────────────────
function Section({ title, subtitle, icon: Icon, children }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700/60 shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-200 dark:border-gray-700/60">
        <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
          <Icon size={15} className="text-indigo-500" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h2>
          {subtitle && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <div className="px-6 py-5 space-y-5">{children}</div>
    </div>
  );
}

// ── Toggle row ────────────────────────────────────────────────────────────────
function ToggleRow({ label, description, value, onChange, loading }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{label}</p>
        {description && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!value)}
        disabled={loading}
        className="flex-shrink-0 transition-opacity duration-200 disabled:opacity-60"
        aria-label={value ? 'Disable' : 'Enable'}
      >
        {value
          ? <ToggleRight size={32} className="text-indigo-500" />
          : <ToggleLeft  size={32} className="text-gray-300 dark:text-gray-600" />
        }
      </button>
    </div>
  );
}

// ── Save button ───────────────────────────────────────────────────────────────
function SaveBtn({ loading, label = 'Save', onClick }) {
  return (
    <div className="flex justify-end pt-2 border-t border-gray-100 dark:border-gray-700">
      <button
        onClick={onClick}
        disabled={loading}
        className="
          flex items-center gap-2 h-9 px-5 rounded-xl text-sm font-semibold
          bg-indigo-500 hover:bg-indigo-600 text-white
          disabled:opacity-60 disabled:cursor-not-allowed
          transition-all duration-200 shadow-sm shadow-indigo-500/20
        "
      >
        {loading ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
        {loading ? 'Saving…' : label}
      </button>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// Main component
// ══════════════════════════════════════════════════════════════════════════════
export default function Settings() {
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => setToast({ message, type });

  // ── Appearance ──
  const [appearance, setAppearance] = useState({
    theme:          'system',
    primaryColor:   '#6366f1',
    sidebarCollapsed: false,
    compactMode:    false,
    animations:     true,
  });
  const [savingAppearance, setSavingAppearance] = useState(false);

  // ── Notifications ──
  const [notifs, setNotifs] = useState({
    emailNewOrder:     true,
    emailLowStock:     true,
    emailNewSupport:   true,
    emailWeeklyReport: false,
    browserPush:       false,
    slackWebhook:      '',
    slackNewOrder:     false,
    slackNewSupport:   false,
  });
  const [savingNotifs, setSavingNotifs] = useState(false);


  // ── Handlers ─────────────────────────────────────────────────────────────


  const saveAppearance = async () => {
    setSavingAppearance(true);
    try {
      await api.patch('/admin/settings/appearance', appearance);
      // Apply theme locally
      if (appearance.theme === 'dark')   document.documentElement.classList.add('dark');
      if (appearance.theme === 'light')  document.documentElement.classList.remove('dark');
      showToast('Appearance saved');
    } catch { showToast('Error saving appearance', 'error'); }
    finally { setSavingAppearance(false); }
  };

  const saveNotifs = async () => {
    setSavingNotifs(true);
    try {
      await api.patch('/admin/settings/notifications', notifs);
      showToast('Notification preferences saved');
    } catch { showToast('Error saving notifications', 'error'); }
    finally { setSavingNotifs(false); }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 max-w-3xl">

      {/* ── Page header ── */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Settings</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Configure your platform's global preferences and behaviour
        </p>
      </div>
      

      {/* ── Appearance ── */}
      <Section icon={Palette} title="Appearance" subtitle="Theme, colors and interface display">
        <div className="space-y-4">
          {/* Theme selector */}
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Theme</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'light',  label: 'Light',  icon: Sun     },
                { value: 'dark',   label: 'Dark',   icon: Moon    },
                { value: 'system', label: 'System', icon: Monitor },
              ].map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => setAppearance((a) => ({ ...a, theme: value }))}
                  className={`
                    flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all duration-200
                    ${appearance.theme === value
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                      : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
                    }
                  `}
                >
                  <Icon size={18} />
                  <span className="text-xs font-semibold">{label}</span>
                </button>
              ))}
            </div>
          </div>

         
        </div>
        <SaveBtn loading={savingAppearance} onClick={saveAppearance} />
      </Section>

      {/* ── Notifications ── */}
      <Section icon={Bell} title="Notifications" subtitle="Choose what alerts you receive and how">
        <div className="space-y-4">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email alerts</p>
          <div className="space-y-3">
            <ToggleRow label="New order received" description="Get notified for every new purchase" value={notifs.emailNewOrder} onChange={(v) => setNotifs((n) => ({ ...n, emailNewOrder: v }))} />
            <ToggleRow label="Low stock warning" description="When a product stock drops below threshold" value={notifs.emailLowStock} onChange={(v) => setNotifs((n) => ({ ...n, emailLowStock: v }))} />
            <ToggleRow label="New support ticket" description="When a customer opens a new conversation" value={notifs.emailNewSupport} onChange={(v) => setNotifs((n) => ({ ...n, emailNewSupport: v }))} />
            <ToggleRow label="Weekly performance report" description="Every Monday at 9:00 AM" value={notifs.emailWeeklyReport} onChange={(v) => setNotifs((n) => ({ ...n, emailWeeklyReport: v }))} />
          </div>

          <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Slack integration</p>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 mb-1.5 block">Webhook URL</label>
                <input
                  type="url"
                  value={notifs.slackWebhook}
                  onChange={(e) => setNotifs((n) => ({ ...n, slackWebhook: e.target.value }))}
                  placeholder="https://hooks.slack.com/services/..."
                  className="w-full h-9 px-3 rounded-xl text-sm font-mono bg-gray-50 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all"
                />
              </div>
              <ToggleRow label="Slack: new orders" value={notifs.slackNewOrder} onChange={(v) => setNotifs((n) => ({ ...n, slackNewOrder: v }))} />
              <ToggleRow label="Slack: new support tickets" value={notifs.slackNewSupport} onChange={(v) => setNotifs((n) => ({ ...n, slackNewSupport: v }))} />
            </div>
          </div>
        </div>
        <SaveBtn loading={savingNotifs} onClick={saveNotifs} />
      </Section>

     

      {/* Toast */}
      {toast && (
        <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />
      )}
    </div>
  );
}
