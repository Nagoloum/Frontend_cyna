import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function TermsOfUseComponent() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const sections = [
    { title: t('terms.s1_title'),  body: t('terms.s1_body')  },
    { title: t('terms.s2_title'),  body: t('terms.s2_body')  },
    { title: t('terms.s3_title'),  body: t('terms.s3_body')  },
    { title: t('terms.s4_title'),  body: t('terms.s4_body')  },
    { title: t('terms.s5_title'),  body: t('terms.s5_body')  },
    { title: t('terms.s6_title'),  body: t('terms.s6_body')  },
    { title: t('terms.s7_title'),  body: t('terms.s7_body')  },
    { title: t('terms.s8_title'),  body: t('terms.s8_body')  },
    { title: t('terms.s9_title'),  body: t('terms.s9_body')  },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="mb-10 flex items-center gap-3 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium transition-colors duration-200 group"
        >
          <ArrowLeft className="w-6 h-6 transition-transform group-hover:-translate-x-1" />
          {t('terms.back')}
        </button>

        <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white text-center mb-12">
          {t('terms.title')}
        </h1>

        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-10 lg:p-14 space-y-12">
          {sections.map((s) => (
            <section key={s.title}>
              <h2 className="text-2xl lg:text-3xl font-semibold text-indigo-600 dark:text-indigo-400 mb-4">
                {s.title}
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{s.body}</p>
            </section>
          ))}

          <section>
            <h2 className="text-2xl lg:text-3xl font-semibold text-indigo-600 dark:text-indigo-400 mb-4">
              {t('terms.s10_title')}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {t('terms.s10_body')}{' '}
              <a href="mailto:support@cyna-it.fr" className="text-indigo-600 dark:text-indigo-400 underline">
                support@cyna-it.fr
              </a>
              <br />
              {t('terms.address')}
            </p>
          </section>

          <div className="pt-12 border-t border-gray-200 dark:border-gray-700">
            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
              {t('terms.last_updated')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
