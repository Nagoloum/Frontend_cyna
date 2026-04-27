/* eslint-disable no-unused-vars */
// src/pages/Admin/MyProfile.jsx
import { useState, useEffect } from 'react';
import {
  User, Mail, Lock, CheckCircle, AlertCircle, Eye, EyeOff, Loader2,
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

function PasswordInput({ ...props }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      <input
        type={show ? 'text' : 'password'}
        className="
          w-full h-10 pl-9 pr-10 rounded-xl text-sm
          bg-gray-50 dark:bg-gray-700/60
          border border-gray-200 dark:border-gray-600
          text-gray-900 dark:text-white
          placeholder-gray-400 dark:placeholder-gray-500
          focus:outline-none focus:ring-2 focus:ring-indigo-500/30
          focus:border-indigo-500 dark:focus:border-indigo-400
          transition-all duration-200
        "
        {...props}
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
      >
        {show ? <EyeOff size={14} /> : <Eye size={14} />}
      </button>
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

  const [passwords, setPasswords] = useState({ next: '', confirm: '' });
  const [pwErrors, setPwErrors] = useState({});
  const [savingPw, setSavingPw] = useState(false);

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

  const handleChangePassword = async () => {
    const errors = {};
    if (passwords.next.length < 8) errors.next = 'Minimum 8 characters';
    if (passwords.next !== passwords.confirm) errors.confirm = 'Passwords do not match';
    if (Object.keys(errors).length) { setPwErrors(errors); return; }
    setPwErrors({});
    if (!userId) { showToast('User session not found', 'error'); return; }
    setSavingPw(true);
    try {
      await usersAPI.updateProfile(userId, { password: passwords.next });
      setPasswords({ next: '', confirm: '' });
      showToast('Password changed successfully');
    } catch (err) {
      const msg = err.response?.data?.message ?? 'Error changing password';
      showToast(msg, 'error');
    }
    finally { setSavingPw(false); }
  };

  // Initials avatar
  const fullName = `${profile.firstName} ${profile.lastName}`.trim();
  const initials = fullName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'AD';

  return (
    <div className="space-y-6 max-w-3xl">

      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">My Profile</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Manage your personal information and account security
        </p>
      </div>

      {/* Identity card */}
      <Section icon={User} title="Identity" subtitle="Your administrator account information">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center ring-2 ring-indigo-500/20 flex-shrink-0">
            <span className="text-2xl font-bold text-white">{initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{fullName || 'Admin'}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 truncate">{profile.email}</p>
          </div>
        </div>
      </Section>

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

      {/* Password */}
      <Section icon={Lock} title="Change Password" subtitle="Use a strong password of at least 8 characters">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="New password" error={pwErrors.next} hint="Min. 8 characters">
              <PasswordInput
                value={passwords.next}
                onChange={(e) => setPasswords((p) => ({ ...p, next: e.target.value }))}
                placeholder="New password"
              />
            </Field>
            <Field label="Confirm new password" error={pwErrors.confirm}>
              <PasswordInput
                value={passwords.confirm}
                onChange={(e) => setPasswords((p) => ({ ...p, confirm: e.target.value }))}
                placeholder="Repeat new password"
              />
            </Field>
          </div>

          {passwords.next && <PasswordStrength password={passwords.next} />}

          <div className="flex justify-end pt-1">
            <SaveBtn loading={savingPw} label="Change Password" onClick={handleChangePassword} />
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

// ── Password strength meter ───────────────────────────────────────────────────
function PasswordStrength({ password }) {
  const checks = [
    { label: '8+ characters',    ok: password.length >= 8 },
    { label: 'Uppercase letter', ok: /[A-Z]/.test(password) },
    { label: 'Number',           ok: /[0-9]/.test(password) },
    { label: 'Special char',     ok: /[^A-Za-z0-9]/.test(password) },
  ];
  const score = checks.filter((c) => c.ok).length;
  const levels = [
    { label: 'Very weak',   color: 'bg-red-500' },
    { label: 'Weak',        color: 'bg-orange-500' },
    { label: 'Fair',        color: 'bg-yellow-500' },
    { label: 'Strong',      color: 'bg-blue-500' },
    { label: 'Very strong', color: 'bg-green-500' },
  ];
  const level = levels[score] ?? levels[0];

  return (
    <div className="space-y-2">
      <div className="flex gap-1">
        {levels.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i < score ? level.color : 'bg-gray-200 dark:bg-gray-700'}`}
          />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <span className={`text-xs font-semibold ${score >= 3 ? 'text-green-600 dark:text-green-400' : score >= 2 ? 'text-yellow-600' : 'text-red-500'}`}>
          {level.label}
        </span>
        <div className="flex gap-3">
          {checks.map((c) => (
            <span key={c.label} className={`text-xs flex items-center gap-1 ${c.ok ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-600'}`}>
              <CheckCircle size={10} />
              {c.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
