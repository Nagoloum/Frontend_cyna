import { useTranslation } from 'react-i18next';
import LegalLayout from './LegalLayout';

export default function TermsOfUseComponent() {
  const { t } = useTranslation();

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
    <LegalLayout badge={t('terms.badge')} title={t('terms.title')} subtitle={t('terms.subtitle')}>
      <div className="cyna-card p-6 sm:p-8 legal-prose">
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

          <div className="pt-8 mt-4 border-t border-[var(--border)]">
            <p className="text-center text-sm" style={{ color: "var(--text-muted)" }}>
              {t('terms.last_updated')}
            </p>
          </div>
      </div>
    </LegalLayout>
  );
}
