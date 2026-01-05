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
            src="./images/img2.jpg"
            alt="Vérification code"
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
                Enter Verification Code
              </h2>
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-8">
              We sent a 6-digit code to your email. Please enter it below to continue.
            </p>

            {/* 6 inputs pour le code */}
            <form onSubmit={handleVerify} className="space-y-8">
              <div className="flex items-center justify-center gap-3">
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
                    className="w-14 h-14 text-center text-black dark:text-white text-2xl font-bold bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all duration-300"
                    required
                  />
                ))}
                <span className="text-3xl text-gray-400 dark:text-gray-500">-</span>
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
                    className="w-14 h-14 text-center text-2xl text-black dark:text-white font-bold bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all duration-300"
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