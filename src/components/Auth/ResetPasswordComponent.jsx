/* eslint-disable no-unused-vars */
// src/pages/ResetPassword.jsx
import { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import PasswordInput from './PasswordInput.jsx';

export default function ResetPasswordComponent() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      alert('Reset token is missing.');
      return;
    }

    if (newPassword !== confirmPassword) {
      alert('The passwords do not match. Please try again.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('http://localhost:3000/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await res.json();

      if (!res.ok || !data?.success) {
        alert(data?.message || 'Error resetting password. Please try again.');
        return;
      }

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
            src="./images/img.jpg"
            alt="Nouveau mot de passe"
            className="w-full h-full object-cover md:rounded-l-3xl md:rounded-tr-none rounded-t-3xl"
          />
        </div>

        {/* Formulaire à droite */}
        <div className="md:w-1/2 w-full flex items-center justify-center p-10 md:p-12">
          <div className="w-full max-w-md flex flex-col">
            {/* Logo + Titre */}
            <div className="flex flex-col lg:items-start text-center items-center mb-8">
              <div className="flex lg:text-start text-center mb-8 gap-4">
                <svg
                  viewBox="0 0 32 32"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-full w-16 lg:w-16 object-contain"
                  alt="CYNA Logo"
                >
                  <path
                    d="M16.8693 0.0138722C17.512 0.0971052 18.169 0.152594 18.8117 0.291316C24.8246 1.55368 28.8237 5.06334 30.9089 10.64C31.1946 11.4168 31.3231 12.2491 31.4945 13.0676C31.5802 13.4976 31.4945 13.5809 31.0374 13.5809C29.7092 13.5809 28.3809 13.6641 27.0527 13.567C24.0534 13.3312 21.1683 12.6514 18.5261 11.1671C16.8408 10.2099 15.1269 10.1822 13.4273 11.1671C11.642 12.1936 10.5279 13.6363 10.5422 15.731C10.5422 16.1056 10.6279 16.5079 10.7707 16.8408C11.4991 18.5471 12.6132 19.9066 14.5127 20.4753C16.0267 20.9192 17.4549 20.6002 18.7974 19.8927C20.797 18.8384 22.8965 18.0754 25.1531 17.8396C26.9384 17.6454 28.7523 17.5899 30.5518 17.5206C31.2945 17.4928 31.523 17.7841 31.4659 18.5194C31.2517 20.9747 30.2376 23.0972 28.6237 24.9699C26.2814 27.6889 23.4249 29.6726 19.8258 30.5465C16.498 31.3511 13.1702 31.3927 9.98521 30.0333C5.34344 28.0357 1.95852 24.7896 0.630254 19.9759C-1.79775 11.1116 3.04398 3.48192 10.785 0.901691C12.1847 0.430037 13.6415 0.166466 15.1269 0.0693609C15.2268 0.0693609 15.3268 0.0277443 15.4411 0H16.8836L16.8693 0.0138722Z"
                    fill="url(#paint0)"
                  />
                  <defs>
                    <linearGradient id="paint0" x1="0" y1="16" x2="32" y2="16" gradientUnits="userSpaceOnUse">
                      <stop stop-color="#302082" />
                      <stop offset="1" stop-color="#7C00FF" />
                    </linearGradient>
                  </defs>
                </svg>
                <h1 className="text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white mb-6 leading-tight">
                  Cyna
                </h1>

              </div>
              <h2 className="text-4xl font-semibold text-gray-900 dark:text-white lg:text-start text-center">
                Set New Password
              </h2>
            </div>

            {/* Message d'explication */}
            <p className="text-sm text-gray-500 dark:text-gray-400 lg:text-start text-center mb-8">
              {!token
                ? 'Reset token is missing. Please use the link from your email.'
                : 'Your new password must be different from previously used passwords.'}
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
                  disabled={loading || !token}
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
