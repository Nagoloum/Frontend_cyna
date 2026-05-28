import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export default function CookiePolicyComponent() {
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
          {t('cookies.back')}
        </button>

        <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white text-center mb-12">
          {t('cookies.title')}
        </h1>

        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-10 lg:p-14 space-y-12">

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

          <div className="pt-12 border-t border-gray-200 dark:border-gray-700">
            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
              {t('cookies.last_updated')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
