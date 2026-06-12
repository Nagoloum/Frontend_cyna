import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import LegalLayout from './LegalLayout';

export default function AboutComponent() {
  const { t } = useTranslation();

  return (
    <LegalLayout badge={t('about.badge')} title={t('about.title')} subtitle={t('about.subtitle')}>
      <div className="cyna-card p-6 sm:p-8 legal-prose">
        <section>
          <h2 className="text-2xl font-semibold text-indigo-600 dark:text-indigo-400 mb-4">{t('about.mission_title')}</h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{t('about.mission_body')}</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-indigo-600 dark:text-indigo-400 mb-4">{t('about.offer_title')}</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-2">{t('about.offer_intro')}</p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
            <li>{t('about.offer_soc')}</li>
            <li>{t('about.offer_edr')}</li>
            <li>{t('about.offer_xdr')}</li>
            <li>{t('about.offer_audit')}</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-indigo-600 dark:text-indigo-400 mb-4">{t('about.values_title')}</h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
            <li>{t('about.values_trust')}</li>
            <li>{t('about.values_expertise')}</li>
            <li>{t('about.values_proximity')}</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-indigo-600 dark:text-indigo-400 mb-4">{t('about.contact_title')}</h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {t('about.contact_body')}{' '}
            <Link to="/contact" className="text-indigo-600 dark:text-indigo-400 underline">
              {t('about.contact_link')}
            </Link>.
          </p>
        </section>
      </div>
    </LegalLayout>
  );
}
