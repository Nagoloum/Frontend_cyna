import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Cookie } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getCookieConsent, setCookieConsent } from '@/lib/privacyPrefs';

/**
 * Bandeau de consentement cookies (RGPD), fixé en bas des pages utilisateur.
 * Affiché une seule fois : dès qu'un choix est fait (accepter ou refuser),
 * il est mémorisé et le bandeau ne réapparaît plus — sauf réouverture
 * explicite via openCookieBanner() (footer ou tentative de connexion).
 *
 * ⚠️ NE PAS renommer ce fichier avec un nom contenant « cookie » ou
 * « consent » : en dev, Vite sert le module par son URL réelle et les
 * bloqueurs de publicité (listes EasyList) la bloqueraient
 * (ERR_BLOCKED_BY_CLIENT).
 */
export default function PrivacyBanner() {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(() => getCookieConsent() === null);

  useEffect(() => {
    const reopen = () => setVisible(true);
    window.addEventListener('cookie-consent-reopen', reopen);
    return () => window.removeEventListener('cookie-consent-reopen', reopen);
  }, []);

  if (!visible) return null;

  const choose = (value) => {
    setCookieConsent(value);
    setVisible(false);
  };

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label={t('cookie_banner.title')}
      className="fixed bottom-0 inset-x-0 z-50 p-4 sm:p-6 pointer-events-none"
    >
      <div
        className="pointer-events-auto mx-auto max-w-3xl rounded-3xl border p-5 sm:p-6 shadow-2xl page-enter"
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div
            className="w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center shadow-[var(--shadow-accent)]"
            style={{ background: 'linear-gradient(135deg, var(--accent), #a78bfa)' }}
          >
            <Cookie size={24} color="#fff" />
          </div>

          <div className="flex-1">
            <h3 className="font-semibold text-base mb-1" style={{ color: 'var(--text-primary)' }}>
              {t('cookie_banner.title')}
            </h3>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {t('cookie_banner.message')}{' '}
              <Link to="/cookie-policy" className="underline hover:opacity-80" style={{ color: 'var(--accent)' }}>
                {t('cookie_banner.policy_link')}
              </Link>
            </p>
          </div>

          <div className="flex gap-3 shrink-0">
            <button
              type="button"
              onClick={() => choose('refused')}
              className="h-11 px-5 rounded-full text-sm font-medium border transition-all duration-200 hover:opacity-80 active:scale-[0.98]"
              style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)', background: 'var(--bg-subtle)' }}
            >
              {t('cookie_banner.refuse')}
            </button>
            <button
              type="button"
              onClick={() => choose('accepted')}
              className="h-11 px-5 rounded-full text-sm font-medium text-white shadow-[var(--shadow-accent)] transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
              style={{ background: 'var(--accent)' }}
            >
              {t('cookie_banner.accept')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
