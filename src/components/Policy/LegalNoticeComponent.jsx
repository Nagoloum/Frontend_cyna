import { useTranslation } from 'react-i18next';
import LegalLayout from './LegalLayout';

export default function LegalNoticeComponent() {
  const { t } = useTranslation();

  return (
    <LegalLayout badge={t('legal.badge')} title={t('legal.title')} subtitle={t('legal.subtitle')}>
      <div className="cyna-card p-6 sm:p-8 legal-prose">
        <section>
          <h2 className="text-2xl font-semibold text-indigo-600 dark:text-indigo-400 mb-4">{t('legal.editor_title')}</h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">{t('legal.editor_body')}</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-indigo-600 dark:text-indigo-400 mb-4">{t('legal.publication_title')}</h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{t('legal.publication_body')}</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-indigo-600 dark:text-indigo-400 mb-4">{t('legal.host_title')}</h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">{t('legal.host_body')}</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-indigo-600 dark:text-indigo-400 mb-4">{t('legal.ip_title')}</h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{t('legal.ip_body')}</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-indigo-600 dark:text-indigo-400 mb-4">{t('legal.liability_title')}</h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{t('legal.liability_body')}</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-indigo-600 dark:text-indigo-400 mb-4">{t('legal.data_title')}</h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{t('legal.data_body')}</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-indigo-600 dark:text-indigo-400 mb-4">{t('legal.contact_title')}</h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {t('legal.contact_body')}{' '}
            <a href="mailto:support@cyna-it.fr" className="text-indigo-600 dark:text-indigo-400 underline">
              support@cyna-it.fr
            </a>
          </p>
        </section>

        <div className="pt-8 mt-4 border-t border-[var(--border)]">
          <p className="text-center text-sm" style={{ color: 'var(--text-muted)' }}>
            {t('legal.last_updated')}
          </p>
        </div>
      </div>
    </LegalLayout>
  );
}
