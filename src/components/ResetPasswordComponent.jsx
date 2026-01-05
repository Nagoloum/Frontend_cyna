/* eslint-disable no-unused-vars */
// src/pages/ResetPassword.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import PasswordInput from '../components/PasswordInput';

export default function ResetPasswordComponent() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      alert('The passwords do not match. Please try again.');
      return;
    }

    if (newPassword.length < 6) {
      alert('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      // À remplacer par ton vrai appel API
      // await fetch('http://localhost:5000/api/auth/reset-password', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ token: 'from-url-or-state', newPassword })
      // });

      // Simulation de succès
      await new Promise(resolve => setTimeout(resolve, 1500));

      setIsSuccess(true);

      // Redirection automatique vers login après 3 secondes
      setTimeout(() => {
        navigate('/auth');
      }, 3000);
    } catch (err) {
      alert('Error resetting password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-6 transition-colors duration-700">
      {/* Card principale */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden max-w-5xl w-full flex flex-col md:flex-row transition-all duration-700">

        {/* Image à gauche */}
        <div className="md:w-1/2 w-full">
          <img
            src="./images/img2.jpg"
            alt="Nouveau mot de passe"
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
                Set New Password
              </h2>
            </div>

            {/* Message d'explication */}
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-8">
              Your new password must be different from previously used passwords.
            </p>

            {/* État de succès */}
            {isSuccess ? (
              <div className="text-center py-4">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <svg className="w-12 h-12 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  Password Updated!
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-8">
                  Your password has been successfully changed.
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Redirecting to login in 3 seconds...
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Nouveau mot de passe */}
                <div>
                  <PasswordInput
                    placeholder="New password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength="6"
                    className="bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 outline-none text-base w-full"
                  />
                </div>

                {/* Confirmation mot de passe */}
                <div>

                  <PasswordInput
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength="6"
                    className="bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 outline-none text-base w-full"
                  />
                </div>

                {/* Bouton de confirmation */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-14 rounded-full text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400 font-medium shadow-lg hover:shadow-xl transition-all duration-500 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? (
                    <span className="flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Updating...
                    </span>
                  ) : (
                    'Update Password'
                  )}
                </button>
              </form>
            )}

            {/* Lien retour login */}
            {!isSuccess && (
              <p className="text-center mt-10">
                <Link
                  to="/auth"
                  className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium transition-colors duration-500"
                >
                  ← Back to Login
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}