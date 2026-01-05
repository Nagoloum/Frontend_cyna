// src/pages/VerificationCode.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function VerificationCodeComponent() {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const inputsRef = useRef([]);

  // Décompte de 60 secondes
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  // Focus automatique sur l'input suivant
  const handleChange = (index, value) => {
    if (!/^\d?$/.test(value)) return; // Accepte seulement un chiffre ou vide

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Passer à l'input suivant si un chiffre est saisi
    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  // Gestion du backspace pour revenir à l'input précédent
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  // Simulation de vérification du code (à remplacer par ton appel API)
  const handleVerify = async (e) => {
    e.preventDefault();
    const fullCode = code.join('');

    if (fullCode.length !== 6) {
      alert('Please enter the full 6-digit code');
      return;
    }

    setLoading(true);
    try {
      // Simulation succès
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Redirige vers la page de nouveau mot de passe
      navigate('/reset-password', { state: { email: 'user@example.com' } }); // Tu peux passer l'email si besoin
      // eslint-disable-next-line no-unused-vars
    } catch (err) {
      alert('Invalid code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Renvoi du code
  const handleResend = async () => {
    setLoading(true);
    try {
      // Appel à ton endpoint /api/auth/resend-code
      await new Promise(resolve => setTimeout(resolve, 1000));
      setCountdown(60);
      setCanResend(false);
      alert('A new code has been sent to your email');

      // eslint-disable-next-line no-unused-vars
    } catch (err) {
      alert('Error resending code');
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
            alt="Vérification code"
            className="w-full h-full object-cover md:rounded-l-3xl md:rounded-tr-none rounded-t-3xl"
          />
        </div>

        {/* Formulaire à droite */}
        <div className="md:w-1/2 w-full flex items-center justify-center p-10 md:p-12">
          <div className="w-full max-w-md flex flex-col">
            {/* Logo + Titre */}
            <div className="flex flex-col lg:items-start items-center mb-8">
              <div className="flex justify-center lg:justify-start mb-8 gap-4">
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
              <h2 className="text-4xl font-semibold text-gray-900 dark:text-white text-center">
                Enter Verification Code
              </h2>
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400 lg:text-start text-center mb-8">
              We sent a 6-digit code to your email. Please enter it below to continue.
            </p>

            {/* 6 inputs pour le code */}
            <form onSubmit={handleVerify} className="space-y-8">
              <div className="flex items-center justify-center lg:gap-3 gap-1.5">
                {/* 3 premiers chiffres */}
                {code.slice(0, 3).map((digit, index) => (
                  <input
                    key={index}
                    ref={el => inputsRef.current[index] = el}
                    type="text"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="lg:w-14 lg:h-14 h-10 w-10 text-center text-black dark:text-white text-2xl font-bold bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all duration-300"
                    required
                  />
                ))}
                <span className="lg:text-3xl text-lg text-gray-400 dark:text-gray-500">-</span>
                {/* 3 derniers chiffres */}
                {code.slice(3, 6).map((digit, index) => (
                  <input
                    key={index + 3}
                    ref={el => inputsRef.current[index + 3] = el}
                    type="text"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleChange(index + 3, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index + 3, e)}
                    className="lg:w-14 lg:h-14 h-10 w-10 text-center text-2xl text-black dark:text-white font-bold bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all duration-300"
                    required
                  />
                ))}
              </div>

              {/* Bouton vérifier */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-14 rounded-full text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400 font-medium shadow-lg hover:shadow-xl transition-all duration-500 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <span className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Verifying...
                  </span>
                ) : (
                  'Verify Code'
                )}
              </button>
            </form>

            {/* Resend code */}
            <div className="text-center mt-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Didn't receive the code?
              </p>
              <button
                onClick={handleResend}
                disabled={!canResend || loading}
                className="mt-3 text-indigo-600 dark:text-indigo-400 font-medium hover:underline disabled:text-gray-400 dark:disabled:text-gray-600 disabled:cursor-not-allowed transition-colors"
              >
                {canResend ? 'Resend Code' : `Resend in ${countdown}s`}
              </button>
            </div>

            {/* Retour login */}
            <p className="text-center mt-6">
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