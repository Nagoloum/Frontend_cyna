/* eslint-disable no-unused-vars */
// src/pages/Admin/MyProfile.jsx
import { useState, useEffect, useRef } from 'react';
import {
  User, Mail, Phone, Lock, Shield, Camera,
  CheckCircle, AlertCircle, Eye, EyeOff, Loader2,
  Key, Smartphone, LogOut, Clock, Globe,
} from 'lucide-react';
import api from '../../services/api';

// ── Helper: decode JWT payload ────────────────────────────────────────────────
const getAdminFromToken = () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return {
      name:  payload?.name  ?? payload?.user?.name  ?? 'Admin',
      email: payload?.email ?? payload?.user?.email ?? '',
      role:  payload?.role  ?? payload?.user?.role  ?? 'ADMIN',
      id:    payload?.sub   ?? payload?.id           ?? null,
    };
  } catch { return { name: 'Admin', email: '', role: 'ADMIN', id: null }; }
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

// ── Input ─────────────────────────────────────────────────────────────────────
function Field({ label, children, hint, error }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1.5">
        {label}
      </label>
      {children}
      {hint  && !error && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{hint}</p>}
      {error && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={11}/>{error}</p>}
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

// ── Save button ───────────────────────────────────────────────────────────────
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
  const admin = getAdminFromToken();
  const avatarInputRef = useRef(null);
  const [toast, setToast] = useState(null);

  // ── Profile info ──
  const [profile, setProfile] = useState({
    name:  admin?.name  ?? '',
    email: admin?.email ?? '',
    phone: '',
    timezone: 'Europe/Paris',
    language: 'en',
  });
  const [savingProfile, setSavingProfile] = useState(false);

  // ── Avatar ──
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [savingAvatar, setSavingAvatar]   = useState(false);

  // ── Password ──
  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' });
  const [pwErrors, setPwErrors]   = useState({});
  const [savingPw, setSavingPw]   = useState(false);

  // ── 2FA ──
  const [twoFAEnabled, setTwoFAEnabled] = useState(true);
  const [saving2FA, setSaving2FA]       = useState(false);
  const [qrCode, setQrCode]             = useState(null);
  const [otpCode, setOtpCode]           = useState('');

  // ── Sessions ──
  const [sessions] = useState([
    { id: 1, device: 'Chrome — Windows 11', location: 'Paris, France', lastSeen: 'Now',          current: true  },
    { id: 2, device: 'Safari — iPhone 15',  location: 'Paris, France', lastSeen: '2h ago',       current: false },
    { id: 3, device: 'Firefox — macOS',     location: 'Lyon, France',  lastSeen: '3 days ago',   current: false },
  ]);

  const showToast = (message, type = 'success') => setToast({ message, type });

  // ── Fetch profile from API ────────────────────────────────────────────────
  useEffect(() => {
    api.get('/admin/profile').then((res) => {
      const d = res.data?.data ?? res.data;
      if (d) setProfile((p) => ({ ...p, ...d }));
    }).catch(() => {}); // silently use JWT data as fallback
  }, []);

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSaveAvatar = async () => {
    if (!avatarInputRef.current?.files?.[0]) return;
    setSavingAvatar(true);
    try {
      const fd = new FormData();
      fd.append('avatar', avatarInputRef.current.files[0]);
      await api.post('/admin/profile/avatar', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      showToast('Profile picture updated successfully');
    } catch { showToast('Error updating profile picture', 'error'); }
    finally { setSavingAvatar(false); }
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      await api.patch('/admin/profile', {
        name:     profile.name,
        phone:    profile.phone,
        timezone: profile.timezone,
        language: profile.language,
      });
      showToast('Profile updated successfully');
    } catch { showToast('Error updating profile', 'error'); }
    finally { setSavingProfile(false); }
  };

  const handleChangePassword = async () => {
    const errors = {};
    if (!passwords.current) errors.current = 'Current password required';
    if (passwords.next.length < 8) errors.next = 'Minimum 8 characters';
    if (passwords.next !== passwords.confirm) errors.confirm = 'Passwords do not match';
    if (Object.keys(errors).length) { setPwErrors(errors); return; }
    setPwErrors({});
    setSavingPw(true);
    try {
      await api.patch('/admin/profile/password', {
        currentPassword: passwords.current,
        newPassword:     passwords.next,
      });
      setPasswords({ current: '', next: '', confirm: '' });
      showToast('Password changed successfully');
    } catch (err) {
      const msg = err.response?.data?.message ?? 'Incorrect current password';
      setPwErrors({ current: msg });
    }
    finally { setSavingPw(false); }
  };

  const handle2FAToggle = async () => {
    setSaving2FA(true);
    try {
      if (twoFAEnabled) {
        await api.delete('/admin/profile/2fa');
        setTwoFAEnabled(false);
        setQrCode(null);
        showToast('Two-factor authentication disabled');
      } else {
        const res = await api.post('/admin/profile/2fa/setup');
        const d   = res.data?.data ?? res.data;
        setQrCode(d?.qrCode ?? null);
      }
    } catch { showToast('Error updating 2FA', 'error'); }
    finally { setSaving2FA(false); }
  };

  const handle2FAVerify = async () => {
    if (otpCode.length !== 6) return;
    setSaving2FA(true);
    try {
      await api.post('/admin/profile/2fa/verify', { code: otpCode });
      setTwoFAEnabled(true);
      setQrCode(null);
      setOtpCode('');
      showToast('2FA activated successfully');
    } catch { showToast('Invalid code, please retry', 'error'); }
    finally { setSaving2FA(false); }
  };

  const handleRevokeSession = (id) => {
    api.delete(`/admin/profile/sessions/${id}`).catch(() => {});
    showToast('Session revoked');
  };

  // ── Initials avatar ───────────────────────────────────────────────────────
  const initials = profile.name
    .split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'AD';

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 max-w-3xl">

      {/* ── Page header ── */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">My Profile</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Manage your personal information and account security
        </p>
      </div>

      {/* ── Avatar ── */}
      <Section icon={Camera} title="Profile Picture" subtitle="JPG, PNG or WebP — max 2 MB">
        <div className="flex items-center gap-6">
          {/* Avatar preview */}
          <div className="relative flex-shrink-0">
            {avatarPreview ? (
              <img src={avatarPreview} alt="Avatar" className="w-20 h-20 rounded-2xl object-cover ring-2 ring-indigo-500/30" />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center ring-2 ring-indigo-500/20">
                <span className="text-2xl font-bold text-white">{initials}</span>
              </div>
            )}
            <button
              onClick={() => avatarInputRef.current?.click()}
              className="absolute -bottom-2 -right-2 w-7 h-7 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white flex items-center justify-center shadow-lg transition-colors"
            >
              <Camera size={13} />
            </button>
          </div>

          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{profile.name || 'Admin'}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{profile.email}</p>
            <div className="flex items-center gap-2 mt-3">
              <button
                onClick={() => avatarInputRef.current?.click()}
                className="text-xs font-medium text-indigo-500 hover:text-indigo-600 transition-colors"
              >
                Choose file
              </button>
              {avatarPreview && (
                <SaveBtn loading={savingAvatar} label="Upload" onClick={handleSaveAvatar} />
              )}
            </div>
          </div>

          <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
        </div>
      </Section>

      {/* ── Personal info ── */}
      <Section icon={User} title="Personal Information" subtitle="Update your name, phone and preferences">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Full name">
              <Input
                icon={User}
                value={profile.name}
                onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                placeholder="John Doe"
              />
            </Field>
            <Field label="Email address" hint="Contact your system administrator to change email">
              <Input icon={Mail} value={profile.email} disabled />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Phone number" hint="Optional — used for account recovery">
              <Input
                icon={Phone}
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                placeholder="+33 6 12 34 56 78"
              />
            </Field>
            <Field label="Timezone">
              <div className="relative">
                <Globe size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <select
                  value={profile.timezone}
                  onChange={(e) => setProfile((p) => ({ ...p, timezone: e.target.value }))}
                  className="
                    w-full h-10 pl-9 pr-3 rounded-xl text-sm
                    bg-gray-50 dark:bg-gray-700/60
                    border border-gray-200 dark:border-gray-600
                    text-gray-900 dark:text-white
                    focus:outline-none focus:ring-2 focus:ring-indigo-500/30
                    focus:border-indigo-500 transition-all duration-200
                  "
                >
                  <option value="Europe/Paris">Europe/Paris (CET)</option>
                  <option value="Europe/London">Europe/London (GMT)</option>
                  <option value="America/New_York">America/New_York (EST)</option>
                  <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
                  <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
                  <option value="UTC">UTC</option>
                </select>
              </div>
            </Field>
          </div>

          <div className="flex justify-end pt-1">
            <SaveBtn loading={savingProfile} onClick={handleSaveProfile} />
          </div>
        </div>
      </Section>

      {/* ── Password ── */}
      <Section icon={Lock} title="Change Password" subtitle="Use a strong password of at least 8 characters">
        <div className="space-y-4">
          <Field label="Current password" error={pwErrors.current}>
            <PasswordInput
              value={passwords.current}
              onChange={(e) => setPasswords((p) => ({ ...p, current: e.target.value }))}
              placeholder="Enter current password"
            />
          </Field>

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

          {/* Password strength indicator */}
          {passwords.next && (
            <PasswordStrength password={passwords.next} />
          )}

          <div className="flex justify-end pt-1">
            <SaveBtn loading={savingPw} label="Change Password" onClick={handleChangePassword} />
          </div>
        </div>
      </Section>

      {/* ── 2FA ── */}
      <Section icon={Shield} title="Two-Factor Authentication" subtitle="Add an extra layer of security to your account">
        <div className="space-y-4">
          {/* Status */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-700/40 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${twoFAEnabled ? 'bg-green-50 dark:bg-green-500/10' : 'bg-gray-100 dark:bg-gray-700'}`}>
                <Shield size={17} className={twoFAEnabled ? 'text-green-500' : 'text-gray-400'} />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  Authenticator App
                </p>
                <p className={`text-xs font-medium mt-0.5 ${twoFAEnabled ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'}`}>
                  {twoFAEnabled ? '✓ Active — your account is protected' : 'Inactive — enable for better security'}
                </p>
              </div>
            </div>
            <button
              onClick={handle2FAToggle}
              disabled={saving2FA}
              className={`
                flex items-center gap-1.5 h-8 px-4 rounded-xl text-xs font-semibold transition-all duration-200
                ${twoFAEnabled
                  ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20'
                  : 'bg-indigo-500 hover:bg-indigo-600 text-white'}
                disabled:opacity-60
              `}
            >
              {saving2FA && <Loader2 size={11} className="animate-spin" />}
              {twoFAEnabled ? 'Disable' : 'Enable 2FA'}
            </button>
          </div>

          {/* QR Code setup flow */}
          {qrCode && (
            <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 space-y-4">
              <div className="flex items-start gap-3">
                <Smartphone size={16} className="text-indigo-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">Scan this QR code</p>
                  <p className="text-xs text-indigo-600/70 dark:text-indigo-400/70 mt-0.5">
                    Open Google Authenticator or Authy and scan the code below
                  </p>
                </div>
              </div>
              <div className="flex justify-center">
                <img src={qrCode} alt="2FA QR Code" className="w-40 h-40 rounded-xl border-4 border-white dark:border-gray-700 shadow-md" />
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">Enter the 6-digit code from your app:</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    className="
                      flex-1 h-10 px-3 rounded-xl text-sm text-center font-mono font-bold tracking-widest
                      bg-white dark:bg-gray-700 border border-indigo-200 dark:border-indigo-500/30
                      text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30
                    "
                  />
                  <button
                    onClick={handle2FAVerify}
                    disabled={otpCode.length !== 6 || saving2FA}
                    className="h-10 px-4 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold disabled:opacity-40 transition-colors"
                  >
                    Verify
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </Section>

      {/* ── Active sessions ── */}
      <Section icon={Clock} title="Active Sessions" subtitle="Manage devices where you're logged in">
        <div className="space-y-2">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50 dark:bg-gray-700/40 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${session.current ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                    {session.device}
                    {session.current && (
                      <span className="ml-2 text-[10px] font-semibold uppercase tracking-wider text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/10 px-1.5 py-0.5 rounded-full">
                        Current
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                    {session.location} · {session.lastSeen}
                  </p>
                </div>
              </div>
              {!session.current && (
                <button
                  onClick={() => handleRevokeSession(session.id)}
                  className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-600 font-medium transition-colors"
                >
                  <LogOut size={12} />
                  Revoke
                </button>
              )}
            </div>
          ))}
        </div>
      </Section>

      {/* ── Danger zone ── */}
      <div className="bg-red-50 dark:bg-red-500/5 rounded-2xl border border-red-200 dark:border-red-500/20 p-5">
        <h3 className="text-sm font-semibold text-red-700 dark:text-red-400 flex items-center gap-2 mb-1">
          <AlertCircle size={15} />
          Danger Zone
        </h3>
        <p className="text-xs text-red-600/70 dark:text-red-400/60 mb-4">
          These actions are irreversible. Proceed with caution.
        </p>
        <button className="
          h-8 px-4 rounded-xl text-xs font-semibold
          border border-red-300 dark:border-red-500/30
          text-red-600 dark:text-red-400
          hover:bg-red-100 dark:hover:bg-red-500/10
          transition-colors duration-200
        ">
          Delete my account
        </button>
      </div>

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
    { label: '8+ characters',    ok: password.length >= 8    },
    { label: 'Uppercase letter', ok: /[A-Z]/.test(password)  },
    { label: 'Number',           ok: /[0-9]/.test(password)  },
    { label: 'Special char',     ok: /[^A-Za-z0-9]/.test(password) },
  ];
  const score = checks.filter((c) => c.ok).length;
  const levels = [
    { label: 'Very weak',  color: 'bg-red-500'    },
    { label: 'Weak',       color: 'bg-orange-500' },
    { label: 'Fair',       color: 'bg-yellow-500' },
    { label: 'Strong',     color: 'bg-blue-500'   },
    { label: 'Very strong',color: 'bg-green-500'  },
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
