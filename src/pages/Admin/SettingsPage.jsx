/* eslint-disable no-unused-vars */
// src/pages/Admin/Settings.jsx
import {
    AlertCircle,
    CheckCircle,
    Eye,
    EyeOff,
    Globe,
    Loader2,
    Lock,
    Mail,
    Monitor,
    Moon,
    Palette,
    ShieldAlert,
    ShieldCheck,
    Smartphone,
    Sun,
    Trash2,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { authAPI, usersAPI } from '@/services/api';

const getUser = () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;
    return JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
  } catch { return null; }
};

const THEME_KEY = 'theme';

const applyTheme = (theme) => {
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else if (theme === 'light') {
    document.documentElement.classList.remove('dark');
  } else {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.classList.toggle('dark', prefersDark);
  }
};

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

// ── Save button ───────────────────────────────────────────────────────────────
function SaveBtn({ loading, label, onClick }) {
  const { t } = useTranslation();
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
        {loading ? t('admin.common.saving') : (label ?? t('admin.common.save'))}
      </button>
    </div>
  );
}

// ── Password field with lock icon + individual eye toggle ─────────────────────
function PwdField({ label, value, onChange, placeholder }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
        {label}
      </label>
      <div className="relative">
        <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full h-10 pl-9 pr-10 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-indigo-400 transition-all"
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          {show ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// Main component
// ══════════════════════════════════════════════════════════════════════════════
export default function Settings() {
  const { t, i18n } = useTranslation();
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => setToast({ message, type });

  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === 'dark' || stored === 'light') return stored;
    return 'system';
  });
  const [savingAppearance, setSavingAppearance] = useState(false);

  const saveAppearance = () => {
    setSavingAppearance(true);
    if (theme === 'system') localStorage.removeItem(THEME_KEY);
    else localStorage.setItem(THEME_KEY, theme);
    applyTheme(theme);
    showToast(t('admin.settings.appearance_saved'));
    setTimeout(() => setSavingAppearance(false), 250);
  };

  // ── Language ──────────────────────────────────────────────────────────────
  const [lang, setLang] = useState(localStorage.getItem('lang') || i18n.language || 'fr');
  const [savingLang, setSavingLang] = useState(false);
  const saveLanguage = () => {
    setSavingLang(true);
    i18n.changeLanguage(lang);
    localStorage.setItem('lang', lang);
    showToast(t('admin.settings.language_saved'));
    setTimeout(() => setSavingLang(false), 250);
  };

  // ── Password ──────────────────────────────────────────────────────────────
  const [pwd, setPwd] = useState({ current: '', next: '', confirm: '' });
  const [savingPwd, setSavingPwd] = useState(false);
  const changePassword = async () => {
    if (!pwd.current || !pwd.next || !pwd.confirm) { showToast(t('admin.settings.fill_all_fields'), 'error'); return; }
    if (pwd.next !== pwd.confirm) { showToast(t('admin.settings.pwd_mismatch'), 'error'); return; }
    if (pwd.next.length < 8) { showToast(t('admin.settings.pwd_too_short'), 'error'); return; }
    setSavingPwd(true);
    try {
      const res = await usersAPI.changePassword({
        currentPassword: pwd.current,
        newPassword: pwd.next,
        confirmPassword: pwd.confirm,
      });
      if (res?.data?.success === false) {
        showToast(res.data.message || t('admin.settings.update_error'), 'error');
      } else {
        showToast(t('admin.settings.pwd_updated'));
        setPwd({ current: '', next: '', confirm: '' });
      }
    } catch (e) {
      showToast(e.response?.data?.message ?? t('admin.settings.update_error'), 'error');
    } finally { setSavingPwd(false); }
  };

  // ── Danger zone ───────────────────────────────────────────────────────────
  const navigate = useNavigate();
  const tokenUser = getUser();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const deleteAccount = async () => {
    if (!tokenUser?.id) return;
    setDeleting(true);
    try {
      const res = await usersAPI.delete(tokenUser.id);
      if (res?.data?.success === false) {
        showToast(res.data.message || t('admin.settings.delete_failed'), 'error');
        setDeleting(false);
        return;
      }
      navigate('/logout');
    } catch (e) {
      showToast(e.response?.data?.message ?? t('admin.settings.delete_failed'), 'error');
      setDeleting(false);
    }
  };

  const pwdInputCls = "w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-indigo-400 transition-all";

  // ── Two-factor authentication ───────────────────────────────────────────────
  const [twoFAMethod, setTwoFAMethod] = useState('NONE');
  const [loading2FA, setLoading2FA] = useState(true);
  const [saving2FA, setSaving2FA] = useState(false);
  const [totpSetup, setTotpSetup] = useState(null); // { qrDataUrl, secret }
  const [totpCode, setTotpCode] = useState('');
  const [disableOpen, setDisableOpen] = useState(false);
  const [disablePwd, setDisablePwd] = useState('');

  useEffect(() => {
    authAPI.me()
      .then((u) => setTwoFAMethod(u?.twoFactorMethod ?? 'NONE'))
      .catch(() => {})
      .finally(() => setLoading2FA(false));
  }, []);

  const enableEmail2FA = async () => {
    setSaving2FA(true);
    try {
      const res = await authAPI.activateEmail2FA();
      if (res?.data?.success === false) showToast(res.data.message || t('admin.settings.generic_error'), 'error');
      else { setTwoFAMethod('EMAIL'); setTotpSetup(null); showToast(t('admin.settings.twofa_email_enabled_toast')); }
    } catch (e) {
      showToast(e.response?.data?.message ?? t('admin.settings.generic_error'), 'error');
    } finally { setSaving2FA(false); }
  };

  const startTotpSetup = async () => {
    setSaving2FA(true);
    try {
      const res = await authAPI.setupTotp();
      const d = res?.data?.data ?? res?.data;
      if (res?.data?.success === false || !d?.qrDataUrl) {
        showToast(res?.data?.message || t('admin.settings.twofa_setup_error'), 'error');
        return;
      }
      setTotpSetup({ qrDataUrl: d.qrDataUrl, secret: d.secret });
      setTotpCode('');
    } catch (e) {
      showToast(e.response?.data?.message ?? t('admin.settings.twofa_setup_error'), 'error');
    } finally { setSaving2FA(false); }
  };

  const confirmTotp = async () => {
    if (totpCode.trim().length < 6) { showToast(t('admin.settings.enter_6_digit_code'), 'error'); return; }
    setSaving2FA(true);
    try {
      const res = await authAPI.activateTotp(totpCode.trim());
      if (res?.data?.success === false) showToast(res.data.message || t('admin.settings.invalid_code'), 'error');
      else { setTwoFAMethod('TOTP'); setTotpSetup(null); setTotpCode(''); showToast(t('admin.settings.twofa_totp_enabled_toast')); }
    } catch (e) {
      showToast(e.response?.data?.message ?? t('admin.settings.generic_error'), 'error');
    } finally { setSaving2FA(false); }
  };

  const disable2FA = async () => {
    if (!disablePwd) { showToast(t('admin.settings.password_required'), 'error'); return; }
    setSaving2FA(true);
    try {
      const res = await authAPI.disable2FA(disablePwd);
      if (res?.data?.success === false) showToast(res.data.message || t('admin.settings.generic_error'), 'error');
      else { setTwoFAMethod('NONE'); setDisableOpen(false); setDisablePwd(''); showToast(t('admin.settings.twofa_disabled_toast')); }
    } catch (e) {
      showToast(e.response?.data?.message ?? t('admin.settings.generic_error'), 'error');
    } finally { setSaving2FA(false); }
  };

  const methodCardCls = (active) =>
    `text-left p-4 rounded-xl border-2 transition-all duration-200 disabled:opacity-60 ${
      active
        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10'
        : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-500/50'
    }`;

  return (
    <div className="space-y-6 max-w-3xl">

      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{t('admin.settings.title')}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          {t('admin.settings.subtitle')}
        </p>
      </div>

      {/* Appearance */}
      <Section icon={Palette} title={t('admin.settings.appearance')} subtitle={t('admin.settings.appearance_sub')}>
        <div className="space-y-4">
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">{t('admin.settings.theme')}</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'light',  label: t('admin.settings.theme_light'),  icon: Sun     },
                { value: 'dark',   label: t('admin.settings.theme_dark'),   icon: Moon    },
                { value: 'system', label: t('admin.settings.theme_system'), icon: Monitor },
              ].map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => setTheme(value)}
                  className={`
                    flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all duration-200
                    ${theme === value
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

      {/* Language */}
      <Section icon={Globe} title={t('admin.settings.language')} subtitle={t('admin.settings.language_sub')}>
        <div className="grid grid-cols-2 gap-2 max-w-sm">
          {[
            { value: 'fr', label: 'Français' },
            { value: 'en', label: 'English' },
          ].map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setLang(value)}
              className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 text-sm font-semibold transition-all duration-200 ${
                lang === value
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                  : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <SaveBtn loading={savingLang} onClick={saveLanguage} />
      </Section>

      {/* Security — password */}
      <Section icon={Lock} title={t('admin.settings.pwd_section_title')} subtitle={t('admin.settings.pwd_section_sub')}>
        <div className="space-y-3">
          {/* Mot de passe actuel — pleine largeur */}
          <PwdField
            label={t('admin.settings.pwd_current')}
            value={pwd.current}
            onChange={(e) => setPwd((p) => ({ ...p, current: e.target.value }))}
            placeholder="••••••••"
          />
          {/* Nouveau + Confirmer — côte à côte sur sm+, empilés sur mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <PwdField
              label={t('admin.settings.pwd_new')}
              value={pwd.next}
              onChange={(e) => setPwd((p) => ({ ...p, next: e.target.value }))}
              placeholder={t('admin.settings.pwd_new_placeholder')}
            />
            <PwdField
              label={t('admin.settings.pwd_confirm')}
              value={pwd.confirm}
              onChange={(e) => setPwd((p) => ({ ...p, confirm: e.target.value }))}
              placeholder={t('admin.settings.pwd_confirm_placeholder')}
            />
          </div>
        </div>
        <SaveBtn loading={savingPwd} label={t('admin.settings.change_pwd_btn')} onClick={changePassword} />
      </Section>

      {/* Two-factor authentication */}
      <Section icon={ShieldCheck} title={t('admin.settings.twofa_title')} subtitle={t('admin.settings.twofa_sub')}>
        {loading2FA ? (
          <div className="h-12 rounded-xl bg-gray-100 dark:bg-gray-700 animate-pulse" />
        ) : (
          <div className="space-y-4">
            {/* Status */}
            <div className="flex items-center justify-between gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2.5">
                <span className={`w-2.5 h-2.5 rounded-full ${twoFAMethod !== 'NONE' ? 'bg-green-500' : 'bg-gray-400'}`} />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  {twoFAMethod === 'TOTP' ? t('admin.settings.twofa_totp_enabled') : twoFAMethod === 'EMAIL' ? t('admin.settings.twofa_email_enabled') : t('admin.settings.twofa_disabled')}
                </span>
              </div>
              {twoFAMethod !== 'NONE' && (
                <button onClick={() => setDisableOpen(true)} className="text-xs font-semibold text-red-500 hover:underline">
                  {t('admin.settings.disable')}
                </button>
              )}
            </div>

            {/* Method choices */}
            {!totpSetup && (
              <div className="grid sm:grid-cols-2 gap-3">
                <button type="button" onClick={enableEmail2FA} disabled={saving2FA || twoFAMethod === 'EMAIL'} className={methodCardCls(twoFAMethod === 'EMAIL')}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <Mail size={16} className="text-indigo-500" />
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{t('admin.settings.twofa_email_method')}</span>
                    {twoFAMethod === 'EMAIL' && <CheckCircle size={14} className="text-green-500 ml-auto" />}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t('admin.settings.twofa_email_desc')}</p>
                </button>

                <button type="button" onClick={startTotpSetup} disabled={saving2FA} className={methodCardCls(twoFAMethod === 'TOTP')}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <Smartphone size={16} className="text-indigo-500" />
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{t('admin.settings.twofa_totp_method')}</span>
                    {twoFAMethod === 'TOTP' && <CheckCircle size={14} className="text-green-500 ml-auto" />}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t('admin.settings.twofa_totp_desc')}</p>
                </button>
              </div>
            )}

            {/* TOTP setup flow */}
            {totpSetup && (
              <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {t('admin.settings.twofa_scan_instruction')}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-start">
                  <img src={totpSetup.qrDataUrl} alt={t('admin.settings.twofa_qr_alt')} className="w-40 h-40 rounded-xl border border-gray-200 dark:border-gray-700 bg-white" />
                  <div className="flex-1 space-y-3 w-full">
                    <div>
                      <p className="text-xs text-gray-400 mb-1">{t('admin.settings.twofa_manual_key')}</p>
                      <code className="block text-xs break-all px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200">{totpSetup.secret}</code>
                    </div>
                    <input value={totpCode} onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))} inputMode="numeric" placeholder={t('admin.settings.twofa_code_placeholder')} className={pwdInputCls} />
                    <div className="flex gap-2">
                      <button onClick={() => { setTotpSetup(null); setTotpCode(''); }} disabled={saving2FA} className="flex-1 h-9 rounded-xl text-sm font-medium border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50">
                        {t('admin.common.cancel')}
                      </button>
                      <button onClick={confirmTotp} disabled={saving2FA} className="flex-1 h-9 rounded-xl text-sm font-semibold bg-indigo-500 hover:bg-indigo-600 text-white disabled:opacity-50 inline-flex items-center justify-center gap-2">
                        {saving2FA ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} />} {t('admin.settings.activate')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </Section>

      {/* Danger zone */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-red-200 dark:border-red-500/30 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-red-200 dark:border-red-500/30">
          <div className="w-8 h-8 rounded-xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center flex-shrink-0">
            <ShieldAlert size={15} className="text-red-500" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-red-600 dark:text-red-400">{t('admin.settings.danger_zone')}</h2>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{t('admin.settings.danger_zone_sub')}</p>
          </div>
        </div>
        <div className="px-6 py-5">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            {t('admin.settings.delete_account_warning')}
          </p>
          <button
            onClick={() => setConfirmDelete(true)}
            className="inline-flex items-center gap-2 h-9 px-4 rounded-xl text-sm font-semibold border border-red-300 dark:border-red-500/40 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
          >
            <Trash2 size={14} /> {t('admin.settings.delete_account')}
          </button>
        </div>
      </div>

      {/* Delete confirmation */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !deleting && setConfirmDelete(false)} />
          <div className="relative w-full max-w-md rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-2xl p-6">
            <div className="flex items-center gap-2 mb-2 text-red-500">
              <ShieldAlert size={18} />
              <h3 className="font-semibold text-gray-900 dark:text-white">{t('admin.settings.delete_confirm_title')}</h3>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
              {t('admin.settings.delete_confirm_body')}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(false)} disabled={deleting} className="flex-1 h-10 rounded-xl text-sm font-medium border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 transition-all">
                {t('admin.common.cancel')}
              </button>
              <button onClick={deleteAccount} disabled={deleting} className="flex-1 h-10 rounded-xl text-sm font-medium bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 transition-all inline-flex items-center justify-center gap-2">
                {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                {deleting ? t('admin.common.deleting') : t('admin.settings.delete_btn')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Disable 2FA confirmation */}
      {disableOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !saving2FA && setDisableOpen(false)} />
          <div className="relative w-full max-w-md rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-2xl p-6">
            <div className="flex items-center gap-2 mb-2 text-gray-900 dark:text-white">
              <ShieldAlert size={18} className="text-amber-500" />
              <h3 className="font-semibold">{t('admin.settings.disable_twofa_title')}</h3>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              {t('admin.settings.disable_twofa_body')}
            </p>
            <input type="password" value={disablePwd} onChange={(e) => setDisablePwd(e.target.value)} placeholder={t('admin.settings.password_placeholder')} className={pwdInputCls} />
            <div className="flex gap-3 mt-5">
              <button onClick={() => { setDisableOpen(false); setDisablePwd(''); }} disabled={saving2FA} className="flex-1 h-10 rounded-xl text-sm font-medium border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50">
                {t('admin.common.cancel')}
              </button>
              <button onClick={disable2FA} disabled={saving2FA} className="flex-1 h-10 rounded-xl text-sm font-medium bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 inline-flex items-center justify-center gap-2">
                {saving2FA ? <Loader2 size={14} className="animate-spin" /> : null} {t('admin.settings.disable')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />
      )}
    </div>
  );
}
