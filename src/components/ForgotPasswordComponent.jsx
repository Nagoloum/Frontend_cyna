// src/pages/ForgotPassword.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Ici, tu appelleras ton endpoint backend pour envoyer le lien de réinitialisation
    // Exemple : POST /api/auth/forgot-password
    try {
      // const res = await fetch('http://localhost:5000/api/auth/forgot-password', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email })
      // });

      // Simulation d'envoi réussi (à remplacer par le vrai appel)
      await new Promise(resolve => setTimeout(resolve, 1500));

      setIsSubmitted(true);
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      alert('Erreur lors de l’envoi. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-6 transition-colors duration-700">
      {/* Card principale */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden max-w-5xl w-full flex flex-col md:flex-row transition-all duration-700">

        {/* Image à gauche (desktop) ou en haut (mobile) */}
        <div className="md:w-1/2 w-full">
          <img
            src="./images/img2.jpg"
            alt="Réinitialisation mot de passe"
            className="w-full h-full object-cover md:rounded-l-3xl md:rounded-tr-none rounded-t-3xl"
          />
        </div>

        {/* Formulaire à droite */}
        <div className="md:w-1/2 w-full flex items-center justify-center p-10 md:p-12">
          <div className="w-full max-w-md flex flex-col">
            {/* Logo + Titre */}
            <div className="flex flex-col items-center mb-8">
              <img 
                src="/logo.png" 
                alt="RememberMe Logo" 
                className="h-16 w-16 mb-6"
              />
              <h2 className="text-4xl font-semibold text-gray-900 dark:text-white text-center">
                Forgot Password?
              </h2>
            </div>

            {/* Message d'explication */}
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-4">
              No worries! Enter your email address below and we'll send you a code to reset your password.
            </p>

            {/* État après envoi réussi */}
            {isSubmitted ? (
              <div className="text-center py-2">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <svg className="w-10 h-10 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                  Check your email
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  We have sent a reset code to <span className="font-medium">{email}</span>
                </p>
                <button
                  onClick={() => navigate('/verification-code')}
                  className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400 text-white font-medium rounded-full transition"
                >
                  Enter verification code
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Champ Email */}
                <div className="flex items-center w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 h-14 rounded-full overflow-hidden pl-6 gap-3 transition-all duration-500">
                  <svg width="18" height="14" viewBox="0 0 16 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M0 .55.571 0H15.43l.57.55v9.9l-.571.55H.57L0 10.45zm1.143 1.138V9.9h13.714V1.69l-6.503 4.8h-.697zM13.749 1.1H2.25L8 5.356z" fill="currentColor" className="text-gray-500 dark:text-gray-400" />
                  </svg>
                  <input
                    type="email"
                    placeholder="Your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 outline-none text-base w-full"
                  />
                </div>

                {/* Bouton d'envoi */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-14 rounded-full text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400 font-medium shadow-lg hover:shadow-xl transition-all duration-500 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? (
                    <span className="flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending...
                    </span>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              </form>
            )}

            {/* Lien retour connexion */}
            <p className="text-center mt-10">
              <Link
                to="/auth"
                className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium transition-colors duration-500"
              >
                ← Back to Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}