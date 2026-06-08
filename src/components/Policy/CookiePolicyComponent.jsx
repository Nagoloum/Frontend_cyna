import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import LegalLayout from './LegalLayout';

export default function CookiePolicyComponent() {
  const { t } = useTranslation();

  return (
    <LegalLayout badge={t('cookies.badge')} title={t('cookies.title')} subtitle={t('cookies.subtitle')}>
      <div className="cyna-card p-6 sm:p-8 legal-prose">

          {/* 1 */}
          <section>
            <h2 className="text-2xl font-semibold text-indigo-600 dark:text-indigo-400 mb-4">{t('cookies.s1_title')}</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {t('cookies.s1_body')}{' '}
              <Link to="/privacy-policy" className="text-indigo-600 dark:text-indigo-400 underline">
                {t('cookies.s1_privacy_link')}
              </Link>.
            </p>
          </section>

          {/* 2 */}
          <section>
            <h2 className="text-2xl font-semibold text-indigo-600 dark:text-indigo-400 mb-4">{t('cookies.s2_title')}</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{t('cookies.s2_body')}</p>
          </section>

          {/* 3 */}
          <section>
            <h2 className="text-2xl font-semibold text-indigo-600 dark:text-indigo-400 mb-4">{t('cookies.s3_title')}</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-2">{t('cookies.s3_intro')}</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
              <li>{t('cookies.s3_necessary')}</li>
              <li>{t('cookies.s3_functional')}</li>
              <li>{t('cookies.s3_analytics')}</li>
              <li>{t('cookies.s3_advertising')}</li>
              <li>{t('cookies.s3_third_party')}</li>
            </ul>
          </section>

          {/* 4 */}
          <section>
            <h2 className="text-2xl font-semibold text-indigo-600 dark:text-indigo-400 mb-4">{t('cookies.s4_title')}</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-2">{t('cookies.s4_intro')}</p>
            <ul className="list-disc pl-6 space-y-1 text-gray-700 dark:text-gray-300">
              <li>{t('cookies.s4_accept')}</li>
              <li>{t('cookies.s4_reject')}</li>
              <li>{t('cookies.s4_customize')}</li>
            </ul>
            <p className="mt-3 text-gray-700 dark:text-gray-300">{t('cookies.s4_note')}</p>
          </section>

          {/* 5 */}
          <section>
            <h2 className="text-2xl font-semibold text-indigo-600 dark:text-indigo-400 mb-4">{t('cookies.s5_title')}</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-2">{t('cookies.s5_intro')}</p>
            <ul className="list-disc pl-6 space-y-1 text-gray-700 dark:text-gray-300">
              <li>{t('cookies.s5_banner')}</li>
              <li>{t('cookies.s5_browser')}</li>
              <li>{t('cookies.s5_gpc')}</li>
            </ul>
            <p className="mt-3 text-gray-700 dark:text-gray-300">{t('cookies.s5_note')}</p>
          </section>

          {/* 6 */}
          <section>
            <h2 className="text-2xl font-semibold text-indigo-600 dark:text-indigo-400 mb-4">{t('cookies.s6_title')}</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{t('cookies.s6_body')}</p>
          </section>

          {/* 7 */}
          <section>
            <h2 className="text-2xl font-semibold text-indigo-600 dark:text-indigo-400 mb-4">{t('cookies.s7_title')}</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{t('cookies.s7_body')}</p>
          </section>

          {/* 8 */}
          <section>
            <h2 className="text-2xl font-semibold text-indigo-600 dark:text-indigo-400 mb-4">{t('cookies.s8_title')}</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {t('cookies.s8_body')}{' '}
              <a href="mailto:support@cyna-it.fr" className="text-indigo-600 dark:text-indigo-400 underline">
                support@cyna-it.fr
              </a>
              <br />
              {t('cookies.address')}
            </p>
          </section>

          <div className="pt-8 mt-4 border-t border-[var(--border)]">
            <p className="text-center text-sm" style={{ color: "var(--text-muted)" }}>
              {t('cookies.last_updated')}
            </p>
          </div>
      </div>
    </LegalLayout>
  );
}
