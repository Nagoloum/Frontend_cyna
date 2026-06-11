import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, MailCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { authAPI, getApiErrorMessage, login as loginAPI } from '@/services/api';
import { notify } from '@/components/ui/feedback';

export default function AuthPageComponent() {
  const { t } = useTranslation();
  const [isLogin, setIsLogin] = useState(true);
  const [registerSuccess, setRegisterSuccess] = useState(false);
  // Acceptation des CGU + politique de confidentialité : requise pour
  // l'inscription uniquement (pas pour la connexion).
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const nextPath = searchParams.get('next');
  const safeNext = nextPath && nextPath.startsWith('/') ? nextPath : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        const { user, twoFactorMethod } = await loginAPI({
          email: formData.email,
          password: formData.password,
        });
        const needs2FA = twoFactorMethod === 'EMAIL' || twoFactorMethod === 'TOTP';
        if (needs2FA) {
          localStorage.setItem('twoFARequired', '1');
          localStorage.setItem('twoFAMethod', twoFactorMethod);
          localStorage.removeItem('twoFAVerified');
          navigate('/2FA', { replace: true });
        } else if (user?.role === 'ADMIN') {
          // Admin sans 2FA : RouteLayout exige twoFAVerified pour /admin.
          localStorage.setItem('twoFAVerified', '1');
          localStorage.removeItem('twoFARequired');
          localStorage.removeItem('twoFAMethod');
          navigate('/admin', { replace: true });
        } else {
          navigate(safeNext ?? '/home', { replace: true });
        }
        if (user && user.confirmed === false) {
          setTimeout(() => {
            notify.warning(t('auth.unconfirmed_title'), t('auth.unconfirmed_message'), { duration: 7000 });
          }, 800);
        }
      } else {
        if (!acceptedTerms) {
          notify.error(t('auth.register_failed'), t('auth.accept_terms_required'));
          return;
        }
        const res = await authAPI.register({
          firstName: formData.firstName,
          lastName:  formData.lastName,
          email:     formData.email,
          password:  formData.password,
        });
        const data = res.data;
        if (!data.success) {
          notify.error(t('auth.register_failed'), data.message || t('auth.register_error_generic'));
          return;
        }
        // Popup de validation personnalisé (au lieu d'un alert() natif).
        setRegisterSuccess(true);
      }
    } catch (err) {
      // Jamais de message technique brut (réseau, 5xx) à l'utilisateur.
      const msg = getApiErrorMessage(err, t('errors.generic'));
      notify.error(isLogin ? t('auth.login_failed') : t('auth.register_failed'), msg);
    }
  };

  const [showPassword, setShowPassword] = useState(false);
  const toggleVisibility = () => setShowPassword(!showPassword);

  const inputCls = "flex items-center w-full h-12 rounded-full overflow-hidden pl-6 gap-3 mt-4 transition-all duration-300 focus-within:border-[var(--accent)]";
  const inputStyle = { background: "var(--bg-subtle)", border: "1px solid var(--border)" };
  const textInputCls = "bg-transparent outline-none text-sm w-full";
  const textInputStyle = { color: "var(--text-primary)", fontFamily: "'Kumbh Sans', sans-serif" };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "var(--bg-base)" }}
    >
      {/* ── Popup de validation d'inscription (custom, pas un alert natif) ── */}
      {registerSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => { setRegisterSuccess(false); setIsLogin(true); }} />
          <div
            className="relative w-full max-w-md rounded-3xl border bg-[var(--bg-card)] shadow-2xl p-8 text-center page-enter"
            style={{ borderColor: "var(--border)" }}
          >
            <div
              className="w-16 h-16 mx-auto mb-5 rounded-2xl flex items-center justify-center shadow-[var(--shadow-accent)]"
              style={{ background: "linear-gradient(135deg, var(--accent), #a78bfa)" }}
            >
              <MailCheck size={30} color="#fff" />
            </div>
            <h3 className="font-[Kumbh Sans] font-800 text-xl mb-2" style={{ color: "var(--text-primary)" }}>
              {t('auth.register_success_title')}
            </h3>
            <p className="text-sm mb-6" style={{ color: "var(--text-secondary)", fontFamily: "'Kumbh Sans', sans-serif" }}>
              {t('auth.register_success_message')}
            </p>
            <button
              onClick={() => { setRegisterSuccess(false); setIsLogin(true); }}
              className="btn-primary w-full justify-center py-3"
            >
              {t('auth.register_success_cta')}
            </button>
          </div>
        </div>
      )}

      <div
        className="rounded-3xl overflow-hidden max-w-5xl w-full flex flex-col md:flex-row"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border)", boxShadow: "var(--shadow-lg)" }}
      >
        {/* Image */}
        <div className="md:w-1/2 w-full h-64 md:h-auto hidden md:block">
          <img
            src="./images/img.jpg"
            alt="Illustration"
            className="w-full h-full object-cover md:rounded-l-3xl md:rounded-tr-none rounded-t-3xl"
          />
        </div>

        {/* Form */}
        <div className="md:w-1/2 w-full flex items-center justify-center p-10 md:p-12">
          <form onSubmit={handleSubmit} className="w-full max-w-md flex flex-col">

            <div className="flex flex-row items-center justify-center gap-8 mb-1">
              <img src="/logo.png" alt="Cyna" className="w-14 h-14 object-contain" />
              <h2
                className="text-4xl font-semibold text-center"
                style={{ color: "var(--text-primary)" }}
              >
                {isLogin ? t('auth.sign_in_title') : t('auth.sign_up_title')}
              </h2>
            </div>

            <p className="text-sm my-5 text-center" style={{ color: "var(--text-muted)" }}>
              {isLogin ? t('auth.welcome_back') : t('auth.create_account_prompt')}
            </p>

            {!isLogin && (
              <div className="flex flex-col md:flex-row lg:gap-4">
                <div className={inputCls} style={inputStyle}>
                  <UserSvg />
                  <input type="text" placeholder={t('auth.first_name_placeholder')} value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required={!isLogin} className={textInputCls} style={textInputStyle} />
                </div>
                <div className={inputCls} style={inputStyle}>
                  <UserSvg />
                  <input type="text" placeholder={t('auth.last_name_placeholder')} value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    required={!isLogin} className={textInputCls} style={textInputStyle} />
                </div>
              </div>
            )}

            <div className={inputCls} style={inputStyle}>
              <EmailSvg />
              <input type="email" placeholder={t('auth.email_placeholder')} value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required className={textInputCls} style={textInputStyle} />
            </div>

            <div className="relative w-full mt-4">
              <div className="flex items-center w-full h-12 rounded-full overflow-hidden pl-6 gap-3 transition-all duration-300 focus-within:border-[var(--accent)]"
                style={inputStyle}>
                <LockSvg />
                <input type={showPassword ? 'text' : 'password'} placeholder={t('auth.password_placeholder')}
                  value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required minLength="6" className={`${textInputCls} pr-12`} style={textInputStyle} />
                <button type="button" onClick={toggleVisibility}
                  className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors duration-200 hover:text-[var(--accent)]"
                  style={{ color: "var(--text-muted)" }}
                  aria-label={showPassword ? t('auth.hide_password') : t('auth.show_password')}>
                  {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                </button>
              </div>
            </div>

            {isLogin && (
              <div className="w-full flex justify-end mt-3">
                <a href="/forgot-password"
                  className="text-sm underline hover:text-[var(--accent)] transition-colors duration-200"
                  style={{ color: "var(--text-muted)" }}>
                  {t('auth.forgot_password')}
                </a>
              </div>
            )}

            {/* Case obligatoire (inscription uniquement) : acceptation des CGU
                et de la politique de confidentialité, placée avant le bouton. */}
            {!isLogin && (
              <label className="flex items-start gap-3 mt-4 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  required={!isLogin}
                  className="mt-0.5 w-4 h-4 shrink-0 accent-[var(--accent)] cursor-pointer"
                />
                <span className="text-sm" style={{ color: "var(--text-muted)" }}>
                  {t('auth.accept_terms')}{' '}
                  <a href="/terms-of-use" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: "var(--accent)" }}>{t('auth.terms_link')}</a>{' '}
                  {t('auth.and')}{' '}
                  <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: "var(--accent)" }}>{t('auth.privacy_link')}</a>{' '}
                  {t('auth.of')}{' '}
                  <span style={{ color: "var(--accent)" }}>Cyna</span>.
                </span>
              </label>
            )}

            <button type="submit"
              className="mt-4 w-full h-12 rounded-full text-white font-medium shadow-[var(--shadow-accent)] transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
              style={{ background: "var(--accent)" }}>
              {isLogin ? t('auth.login_btn') : t('auth.signup_btn')}
            </button>

            <p className="text-sm mt-4 text-center" style={{ color: "var(--text-muted)" }}>
              {isLogin ? t('auth.no_account') : t('auth.already_account')}{' '}
              <button type="button" onClick={() => { setIsLogin(!isLogin); setAcceptedTerms(false); }}
                className="font-medium hover:underline" style={{ color: "var(--accent)" }}>
                {isLogin ? t('auth.sign_up_link') : t('auth.sign_in_link')}
              </button>
            </p>

            {/* En inscription, l'acceptation passe par la case à cocher ci-dessus. */}
            {isLogin && (
              <p className="text-sm mt-4 text-center" style={{ color: "var(--text-muted)" }}>
                {t('auth.terms_agreement')}{' '}
                <a href="/terms-of-use" style={{ color: "var(--accent)" }}>{t('auth.terms_link')}</a>{' '}
                {t('auth.and')}{' '}
                <a href="/privacy-policy" style={{ color: "var(--accent)" }}>{t('auth.privacy_link')}</a>{' '}
                {t('auth.of')}{' '}
                <span style={{ color: "var(--accent)" }}>Cyna</span>.
              </p>
            )}

          </form>
        </div>
      </div>
    </div>
  );
}

function UserSvg() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ color: "var(--text-muted)", flexShrink: 0 }}>
      <path d="M20 21V19C20 15.6863 17.3137 13 14 13H10C6.68629 13 4 15.6863 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function EmailSvg() {
  return (
    <svg width="16" height="11" viewBox="0 0 16 11" fill="none" style={{ color: "var(--text-muted)", flexShrink: 0 }}>
      <path fillRule="evenodd" clipRule="evenodd" d="M0 .55.571 0H15.43l.57.55v9.9l-.571.55H.57L0 10.45zm1.143 1.138V9.9h13.714V1.69l-6.503 4.8h-.697zM13.749 1.1H2.25L8 5.356z" fill="currentColor" />
    </svg>
  );
}

function LockSvg() {
  return (
    <svg width="13" height="17" viewBox="0 0 13 17" fill="none" style={{ color: "var(--text-muted)", flexShrink: 0 }}>
      <path d="M13 8.5c0-.938-.729-1.7-1.625-1.7h-.812V4.25C10.563 1.907 8.74 0 6.5 0S2.438 1.907 2.438 4.25V6.8h-.813C.729 6.8 0 7.562 0 8.5v6.8c0 .938.729 1.7 1.625 1.7h9.75c.896 0 1.625-.762 1.625-1.7zM4.063 4.25c0-1.406 1.093-2.55 2.437-2.55s2.438 1.144 2.438 2.55V6.8H4.061z" fill="currentColor" />
    </svg>
  );
}
