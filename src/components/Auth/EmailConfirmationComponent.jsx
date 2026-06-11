import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authAPI } from '@/services/api';

export default function EmailConfirmationComponent() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const run = async () => {
      if (!token) {
        setSuccess(false);
        setMessage(t('emailConfirmation.missing_token'));
        setLoading(false);
        return;
      }

      try {
        const res = await authAPI.emailConfirmation(token);
        const data = res.data;

        if (!data?.success) {
          setSuccess(false);
          setMessage(data?.message || t('emailConfirmation.confirmation_failed'));
          setLoading(false);
          return;
        }

        setSuccess(true);
        setMessage(data?.message || t('emailConfirmation.confirmed'));
      } catch (err) {
        setSuccess(false);
        const msg = err.response?.data?.message ?? t('emailConfirmation.network_error');
        setMessage(msg);
      } finally {
        setLoading(false);
      }
    };

    run();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-6 transition-colors duration-700">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden max-w-3xl w-full flex flex-col md:flex-row transition-all duration-700">
        {/* Image : masquée en mobile (visible à partir de md) */}
        <div className="md:w-1/2 w-full hidden md:block">
          <img
            src="./images/img.jpg"
            alt={t('emailConfirmation.title')}
            className="w-full h-full object-cover md:rounded-l-3xl md:rounded-tr-none rounded-t-3xl"
          />
        </div>

        <div className="md:w-1/2 w-full flex items-center justify-center p-10 md:p-12">
          <div className="w-full max-w-md flex flex-col">
            <h2 className="text-4xl font-semibold text-gray-900 dark:text-white text-center">
              {t('emailConfirmation.title')}
            </h2>

            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-6">
              {loading ? t('emailConfirmation.loading') : message}
            </p>

            {!loading && (
              <div className="mt-8">
                <div
                  className={`w-full rounded-2xl px-4 py-3 text-center ${
                    success
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
                  }`}
                >
                  {success ? t('emailConfirmation.success_badge') : t('emailConfirmation.error_badge')}
                </div>

                <Link
                  to="/auth"
                  className="mt-6 flex justify-center items-center w-full h-12 rounded-full text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400 transition-all duration-500 font-medium shadow-lg hover:shadow-xl"
                >
                  {t('emailConfirmation.go_to_login')}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
