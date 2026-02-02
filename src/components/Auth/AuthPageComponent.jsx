// src/pages/AuthPage.jsx (ou AuthPageComponent.jsx)
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

export default function AuthPageComponent() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'CUSTOMER',
  });

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const url = isLogin
      ? 'http://localhost:3000/api/auth/login'
      : 'http://localhost:3000/api/auth/register';

    const body = isLogin
      ? { email: formData.email, password: formData.password }
      : {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      };

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        alert(data.message || 'Erreur lors de la tentative');
        return;
      }

      if (isLogin) {
        const { token, user } = data.data; // structure de ta réponse ApiResponse

        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        // Redirection selon le rôle
        if (user.role === 'ADMIN') {
          navigate('/dashboard', { replace: true });
        } else {
          // CUSTOMER ou autre rôle par défaut
          navigate('/home', { replace: true });
        }

        // Optionnel : message pour les non-confirmés
        if (!user.confirmed) {
          setTimeout(() => {
            alert("Votre compte n'est pas encore confirmé.\nVeuillez vérifier votre boîte mail (et vos spams).");
          }, 800);
        }
      }

      // ── REGISTER ────────────────────────────────────
      else {
        alert(data.message || "Inscription réussie ! Vérifiez votre email pour confirmer votre compte.");
        setIsLogin(true); // on repasse en mode login après inscription
      }

    } catch (err) {
      console.error('Erreur fetch:', err);
      alert('Erreur connexion - voir console');
    }
  };

  const [showPassword, setShowPassword] = useState(false);

  const toggleVisibility = () => setShowPassword(!showPassword);


  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4 transition-colors duration-700">
      {/* Card principale */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden max-w-5xl w-full flex flex-col md:flex-row transition-all duration-700">

        {/* Image à gauche (desktop) ou en haut (mobile) */}
        <div className="md:w-1/2 w-full">
          <img
            src="./images/img.jpg"
            alt="Illustration"
            className="w-full h-full object-cover md:rounded-l-3xl md:rounded-tr-none rounded-t-3xl"
          />
        </div>

        {/* Formulaire à droite */}
        <div className="md:w-1/2 w-full flex items-center justify-center p-10 md:p-12">
          <form onSubmit={handleSubmit} className="w-full max-w-md flex flex-col">
            {/* Titre */}
            <div className="flex flex-row lg:items-center lg:justify-center items-center justify-center gap-8 mb-1">
              <div className="order-1 md:order-1">
                <img
                  src="/logo.png"
                  alt="Page not found illustration"
                  className="w-14 h-14 md:w-14 md:h-14 object-contain"
                />
              </div>

              <h2 className="text-4xl text-gray-900 dark:text-white order-2 md:order-2 font-semibold text-center transition-colors duration-700">
                {isLogin ? 'Sign In' : 'Sign Up'}
              </h2>

            </div>

            <p className="text-sm text-gray-500 my-5 dark:text-gray-400 lg:text-center text-center transition-colors duration-700">
              {isLogin
                ? 'Welcome back! Please sign in to continue'
                : 'Create an account to get centered'}
            </p>

            {/* Champ Nom (seulement en inscription) */}
            {!isLogin && (
              <div className="flex flex-col md:flex-row lg:gap-4">
                <div className="flex items-center w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 h-12 rounded-full overflow-hidden pl-6 gap-3 mt-4 transition-all duration-500 focus-within:ring-2 focus-within:ring-indigo-500/30 focus-within:border-indigo-500 dark:focus-within:border-indigo-400">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 21V19C20 15.6863 17.3137 13 14 13H10C6.68629 13 4 15.6863 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 dark:text-gray-400" />
                    <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" className="text-gray-500 dark:text-gray-400" />
                  </svg>
                  <input
                    type="text"
                    placeholder="First name"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required={!isLogin}
                    className="bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 outline-none text-sm w-full transition-colors duration-500"
                  />
                </div>

                <div className="flex items-center w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 h-12 rounded-full overflow-hidden pl-6 gap-3 mt-4 transition-all duration-500 focus-within:ring-2 focus-within:ring-indigo-500/30 focus-within:border-indigo-500 dark:focus-within:border-indigo-400">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 21V19C20 15.6863 17.3137 13 14 13H10C6.68629 13 4 15.6863 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 dark:text-gray-400" />
                    <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" className="text-gray-500 dark:text-gray-400" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Last name"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    required={!isLogin}
                    className="bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 outline-none text-sm w-full transition-colors duration-500"
                  />
                </div>
              </div>
            )}

            {!isLogin && (
              <div className="flex items-center w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 h-12 rounded-full overflow-hidden pl-6 pr-4 gap-3 mt-4 transition-all duration-500 focus-within:ring-2 focus-within:ring-indigo-500/30 focus-within:border-indigo-500 dark:focus-within:border-indigo-400">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 dark:text-gray-400" />
                  <path d="M18 20a6 6 0 0 0-12 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 dark:text-gray-400" />
                </svg>
                <div className="flex-1">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      id="role-customer"
                      type="radio"
                      name="role"
                      value="CUSTOMER"
                      checked={formData.role === 'CUSTOMER'}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="sr-only peer/roleCustomer"
                    />
                    <label
                      htmlFor="role-customer"
                      className="h-9 rounded-full flex items-center justify-center text-xs font-medium cursor-pointer select-none border border-gray-200 dark:border-gray-600 bg-white/70 dark:bg-gray-800/40 text-gray-700 dark:text-gray-200 transition-all duration-300 peer-checked/roleCustomer:bg-indigo-600 peer-checked/roleCustomer:text-white peer-checked/roleCustomer:border-indigo-600"
                    >
                      Utilisateur
                    </label>

                    <input
                      id="role-admin"
                      type="radio"
                      name="role"
                      value="ADMIN"
                      checked={formData.role === 'ADMIN'}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="sr-only peer/roleAdmin"
                    />
                    <label
                      htmlFor="role-admin"
                      className="h-9 rounded-full flex items-center justify-center text-xs font-medium cursor-pointer select-none border border-gray-200 dark:border-gray-600 bg-white/70 dark:bg-gray-800/40 text-gray-700 dark:text-gray-200 transition-all duration-300 peer-checked/roleAdmin:bg-indigo-600 peer-checked/roleAdmin:text-white peer-checked/roleAdmin:border-indigo-600"
                    >
                      Administrateur
                    </label>
                  </div>
                </div>
              </div>
            )}


            {/* Email */}
            <div className="flex items-center w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 h-12 rounded-full overflow-hidden pl-6 gap-3 mt-4 transition-all duration-500 focus-within:ring-2 focus-within:ring-indigo-500/30 focus-within:border-indigo-500 dark:focus-within:border-indigo-400">
              <svg width="16" height="11" viewBox="0 0 16 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M0 .55.571 0H15.43l.57.55v9.9l-.571.55H.57L0 10.45zm1.143 1.138V9.9h13.714V1.69l-6.503 4.8h-.697zM13.749 1.1H2.25L8 5.356z" fill="currentColor" className="text-gray-500 dark:text-gray-400" />
              </svg>
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 outline-none text-sm w-full transition-colors duration-500"
              />
            </div>

            {/* Mot de passe */}
            <div className="relative w-full mt-4">
              <div className="flex items-center w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 h-12 rounded-full overflow-hidden pl-6 gap-3 transition-all duration-500 focus-within:ring-2 focus-within:ring-indigo-500/30 focus-within:border-indigo-500 dark:focus-within:border-indigo-400">

                <svg width="13" height="17" viewBox="0 0 13 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13 8.5c0-.938-.729-1.7-1.625-1.7h-.812V4.25C10.563 1.907 8.74 0 6.5 0S2.438 1.907 2.438 4.25V6.8h-.813C.729 6.8 0 7.562 0 8.5v6.8c0 .938.729 1.7 1.625 1.7h9.75c.896 0 1.625-.762 1.625-1.7zM4.063 4.25c0-1.406 1.093-2.55 2.437-2.55s2.438 1.144 2.438 2.55V6.8H4.061z" fill="currentColor" className="text-gray-500 dark:text-gray-400" />
                </svg>

                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength="6"
                  className="bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 outline-none text-sm w-full transition-colors pr-12 duration-500"
                />
                {/* Bouton œil / œil barré */}
                <button
                  type="button"
                  onClick={toggleVisibility}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-300"
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                </button>
              </div>
            </div>

            {/* Forgot password */}
            {isLogin && (
              <div className="w-full flex justify-end mt-3">
                <a className="text-sm text-gray-500 dark:text-gray-400 underline hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors duration-500" href="/forgot-password">
                  Forgot password?
                </a>
              </div>
            )}

            {/* Bouton principal */}
            <button
              type="submit"
              className="mt-4 w-full h-12 rounded-full text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400 transition-all duration-500 font-medium shadow-lg hover:shadow-xl"
            >
              {isLogin ? 'Login' : 'Sign up'}
            </button>

            {/* Lien bascule */}
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-4 text-center transition-colors duration-700">
              {isLogin ? "Don’t have an account?" : "Already have an account?"}{' '}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium transition-colors duration-500"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </p>


            <p className="text-gray-500 dark:text-gray-400 text-sm mt-4 text-center transition-colors duration-700">
              By continuing, you agree to the <a href="/terms-of-use" className="text-indigo-600 dark:text-indigo-400">Terms of Use</a> and the <a href="/privacy-policy" className="text-indigo-600 dark:text-indigo-400">Privacy Policy</a> of <span className="text-indigo-600 dark:text-indigo-400">Cyna</span>.
            </p>

          </form>
        </div>  
      </div>
    </div>
  );
}
