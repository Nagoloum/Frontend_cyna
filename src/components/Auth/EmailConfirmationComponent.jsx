import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

export default function EmailConfirmationComponent() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const run = async () => {
      if (!token) {
        setSuccess(false);
        setMessage('Token de confirmation manquant.');
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(
          `http://localhost:3000/api/auth/email-confirmation?token=${encodeURIComponent(token)}`,
          { method: 'GET' },
        );
        const data = await res.json();

        if (!res.ok || !data?.success) {
          setSuccess(false);
          setMessage(data?.message || 'Confirmation impossible.');
          setLoading(false);
          return;
        }

        setSuccess(true);
        setMessage(data?.message || 'Email confirmé, vous pouvez vous connecter.');
      } catch {
        setSuccess(false);
        setMessage('Erreur réseau lors de la confirmation.');
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [token]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-6 transition-colors duration-700">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden max-w-3xl w-full flex flex-col md:flex-row transition-all duration-700">
        <div className="md:w-1/2 w-full">
          <img
            src="./images/img.jpg"
            alt="Email confirmation"
            className="w-full h-full object-cover md:rounded-l-3xl md:rounded-tr-none rounded-t-3xl"
          />
        </div>

        <div className="md:w-1/2 w-full flex items-center justify-center p-10 md:p-12">
          <div className="w-full max-w-md flex flex-col">
            <h2 className="text-4xl font-semibold text-gray-900 dark:text-white text-center">
              Confirmation email
            </h2>

            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-6">
              {loading ? 'Vérification en cours…' : message}
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
                  {success ? 'Succès' : 'Erreur'}
                </div>

                <Link
                  to="/auth"
                  className="mt-6 flex justify-center items-center w-full h-12 rounded-full text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400 transition-all duration-500 font-medium shadow-lg hover:shadow-xl "
                >
                  Aller à la connexion
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
