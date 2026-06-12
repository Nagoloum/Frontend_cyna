/* eslint-disable no-unused-vars */
// src/pages/Admin/MyProfile.jsx
import { useState, useEffect } from 'react';
import {
  User, Mail, CheckCircle, AlertCircle, Loader2,
} from 'lucide-react';
import { authAPI, usersAPI } from '../../services/api';

// ── Helper: decode JWT payload (used as fallback before /auth/user/me resolves) ─
const getUserIdFromToken = () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return payload?.id ?? payload?.sub ?? null;
  } catch { return null; }
};

// ── Toast local ───────────────────────────────────────────────────────────────
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
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

function Field({ label, children, hint, error }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5">
        {label}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{hint}</p>}
      {error && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={11} />{error}</p>}
    </div>
  );
}

function Input({ icon: Icon, type = 'text', ...props }) {
  return (
    <div className="relative">
      {Icon && (
        <Icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none" />
      )}
      <input
        type={type}
        className={`
          w-full h-10 rounded-xl text-sm
          bg-gray-50 dark:bg-gray-700/60
          border border-gray-200 dark:border-gray-600
          text-gray-900 dark:text-white
          placeholder-gray-400 dark:placeholder-gray-500
          focus:outline-none focus:ring-2 focus:ring-indigo-500/30
          focus:border-indigo-500 dark:focus:border-indigo-400
          transition-all duration-200
          ${Icon ? 'pl-9 pr-3' : 'px-3'}
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
        {...props}
      />
    </div>
  );
}


function SaveBtn({ loading, label = 'Save changes', onClick }) {
  return (
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
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// Main component
// ══════════════════════════════════════════════════════════════════════════════
export default function MyProfile() {
  const [toast, setToast] = useState(null);
  const [userId, setUserId] = useState(null);

  const [profile, setProfile] = useState({ firstName: '', lastName: '', email: '' });
  const [savingProfile, setSavingProfile] = useState(false);

  const showToast = (message, type = 'success') => setToast({ message, type });

  // Fetch profile from /auth/user/me
  useEffect(() => {
    authAPI.me()
      .then((u) => {
        setUserId(u?._id ?? u?.id ?? getUserIdFromToken());
        setProfile({
          firstName: u?.firstName ?? '',
          lastName:  u?.lastName  ?? '',
          email:     u?.email     ?? '',
        });
      })
      .catch(() => {
        setUserId(getUserIdFromToken());
      });
  }, []);

  const handleSaveProfile = async () => {
    if (!userId) { showToast('User session not found', 'error'); return; }
    setSavingProfile(true);
    try {
      await usersAPI.updateProfile(userId, {
        firstName: profile.firstName,
        lastName:  profile.lastName,
      });
      showToast('Profile updated successfully');
    } catch { showToast('Error updating profile', 'error'); }
    finally { setSavingProfile(false); }
  };


  return (
    <div className="space-y-6 max-w-3xl">

      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">My Profile</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Manage your personal information and account security
        </p>
      </div>

      {/* Personal info */}
      <Section icon={User} title="Personal Information" subtitle="Update your name">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="First name">
              <Input
                icon={User}
                value={profile.firstName}
                onChange={(e) => setProfile((p) => ({ ...p, firstName: e.target.value }))}
                placeholder="John"
              />
            </Field>
            <Field label="Last name">
              <Input
                icon={User}
                value={profile.lastName}
                onChange={(e) => setProfile((p) => ({ ...p, lastName: e.target.value }))}
                placeholder="Doe"
              />
            </Field>
          </div>

          <Field label="Email address" hint="Contact your system administrator to change email">
            <Input icon={Mail} value={profile.email} disabled />
          </Field>

          <div className="flex justify-end pt-1">
            <SaveBtn loading={savingProfile} onClick={handleSaveProfile} />
          </div>
        </div>
      </Section>

      {/* Toast */}
      {toast && (
        <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />
      )}
    </div>
  );
}

