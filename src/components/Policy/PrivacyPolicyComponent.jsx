import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export default function PrivacyPolicyComponent() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="mb-10 flex items-center gap-3 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium transition-colors duration-200 group"
        >
          <ArrowLeft className="w-6 h-6 transition-transform group-hover:-translate-x-1" />
          {t('privacy.back')}
        </button>

        <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white text-center mb-12">
          {t('privacy.title')}
        </h1>

        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-10 lg:p-14 space-y-12">

          {/* 1 */}
          <section>
            <h2 className="text-2xl font-semibold text-indigo-600 dark:text-indigo-400 mb-4">{t('privacy.s1_title')}</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{t('privacy.s1_body')}</p>
          </section>

          {/* 2 */}
          <section>
            <h2 className="text-2xl font-semibold text-indigo-600 dark:text-indigo-400 mb-4">{t('privacy.s2_title')}</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{t('privacy.s2_body')}</p>
            <ul className="mt-3 space-y-1 text-gray-700 dark:text-gray-300">
              <li><strong>{t('privacy.s2_company')}</strong></li>
              <li>{t('privacy.s2_address')}</li>
              <li>{t('privacy.s2_siret')}</li>
              <li>{t('privacy.s2_email_label')} <a href="mailto:support@cyna-it.fr" className="text-indigo-600 dark:text-indigo-400 underline">support@cyna-it.fr</a></li>
              <li>{t('privacy.s2_dpo_label')} <a href="mailto:dpo@cyna-it.fr" className="text-indigo-600 dark:text-indigo-400 underline">dpo@cyna-it.fr</a></li>
            </ul>
          </section>

          {/* 3 */}
          <section>
            <h2 className="text-2xl font-semibold text-indigo-600 dark:text-indigo-400 mb-4">{t('privacy.s3_title')}</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-2">{t('privacy.s3_intro')}</p>
            <ul className="list-disc pl-6 space-y-1 text-gray-700 dark:text-gray-300">
              <li>{t('privacy.s3_identity')}</li>
              <li>{t('privacy.s3_billing')}</li>
              <li>{t('privacy.s3_account')}</li>
              <li>{t('privacy.s3_usage')}</li>
              <li>{t('privacy.s3_transaction')}</li>
              <li>{t('privacy.s3_cookies')}</li>
            </ul>
            <p className="mt-3 text-gray-700 dark:text-gray-300">{t('privacy.s3_sensitive')}</p>
          </section>

          {/* 4 */}
          <section>
            <h2 className="text-2xl font-semibold text-indigo-600 dark:text-indigo-400 mb-4">{t('privacy.s4_title')}</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-2">{t('privacy.s4_intro')}</p>
            <ul className="list-disc pl-6 space-y-1 text-gray-700 dark:text-gray-300">
              <li>{t('privacy.s4_contract')}</li>
              <li>{t('privacy.s4_legitimate')}</li>
              <li>{t('privacy.s4_legal')}</li>
              <li>{t('privacy.s4_consent')}</li>
            </ul>
          </section>

          {/* 5 */}
          <section>
            <h2 className="text-2xl font-semibold text-indigo-600 dark:text-indigo-400 mb-4">{t('privacy.s5_title')}</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-2">{t('privacy.s5_intro')}</p>
            <ul className="list-disc pl-6 space-y-1 text-gray-700 dark:text-gray-300">
              <li>{t('privacy.s5_internal')}</li>
              <li>{t('privacy.s5_payment')}</li>
              <li>{t('privacy.s5_hosting')}</li>
              <li>{t('privacy.s5_providers')}</li>
              <li>{t('privacy.s5_authorities')}</li>
            </ul>
            <p className="mt-3 font-medium text-gray-700 dark:text-gray-300">{t('privacy.s5_no_sell')}</p>
          </section>

          {/* 6 */}
          <section>
            <h2 className="text-2xl font-semibold text-indigo-600 dark:text-indigo-400 mb-4">{t('privacy.s6_title')}</h2>
            <ul className="list-disc pl-6 space-y-1 text-gray-700 dark:text-gray-300">
              <li>{t('privacy.s6_active')}</li>
              <li>{t('privacy.s6_invoicing')}</li>
              <li>{t('privacy.s6_logs')}</li>
              <li>{t('privacy.s6_deleted')}</li>
            </ul>
          </section>

          {/* 7 */}
          <section>
            <h2 className="text-2xl font-semibold text-indigo-600 dark:text-indigo-400 mb-4">{t('privacy.s7_title')}</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-2">{t('privacy.s7_intro')}</p>
            <ul className="list-disc pl-6 space-y-1 text-gray-700 dark:text-gray-300">
              <li>{t('privacy.s7_access')}</li>
              <li>{t('privacy.s7_rectify')}</li>
              <li>{t('privacy.s7_erase')}</li>
              <li>{t('privacy.s7_restrict')}</li>
              <li>{t('privacy.s7_portability')}</li>
              <li>{t('privacy.s7_object')}</li>
              <li>{t('privacy.s7_withdraw')}</li>
            </ul>
            <p className="mt-3 text-gray-700 dark:text-gray-300">
              {t('privacy.s7_contact')}{' '}
              <a href="mailto:dpo@cyna-it.fr" className="text-indigo-600 dark:text-indigo-400 underline">dpo@cyna-it.fr</a>
              {t('privacy.s7_response')}
            </p>
            <p className="mt-2 text-gray-700 dark:text-gray-300">
              {t('privacy.s7_cnil')}{' '}
              <a href="https://www.cnil.fr" target="_blank" rel="noreferrer" className="text-indigo-600 dark:text-indigo-400 underline">www.cnil.fr</a>
            </p>
          </section>

          {/* 8 */}
          <section>
            <h2 className="text-2xl font-semibold text-indigo-600 dark:text-indigo-400 mb-4">{t('privacy.s8_title')}</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{t('privacy.s8_body')}</p>
          </section>

          {/* 9 */}
          <section>
            <h2 className="text-2xl font-semibold text-indigo-600 dark:text-indigo-400 mb-4">{t('privacy.s9_title')}</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {t('privacy.s9_body')}{' '}
              {t('privacy.s9_see_more')}{' '}
              <Link to="/cookie-policy" className="text-indigo-600 dark:text-indigo-400 underline">
                {t('privacy.s9_cookie_link')}
              </Link>{' '}
              {t('privacy.s9_for_details')}
            </p>
          </section>

          {/* 10 */}
          <section>
            <h2 className="text-2xl font-semibold text-indigo-600 dark:text-indigo-400 mb-4">{t('privacy.s10_title')}</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{t('privacy.s10_body')}</p>
          </section>

          <div className="pt-12 border-t border-gray-200 dark:border-gray-700">
            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
              {t('privacy.last_updated')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
