// src/components/PasswordInput.jsx
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react'; // Icônes élégantes (installe lucide-react si pas déjà fait)

export default function PasswordInput({
  placeholder = "Password",
  value,
  onChange,
  required = false,
  className = ""
}) {
  const [showPassword, setShowPassword] = useState(false);

  const toggleVisibility = () => setShowPassword(!showPassword);

  return (
    <div className={`relative flex items-center w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 h-14 rounded-full overflow-hidden pl-6 gap-3 transition-all duration-500 ${className}`}>
      {/* Icône cadenas */}
      <svg width="14" height="18" viewBox="0 0 13 17" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M13 8.5c0-.938-.729-1.7-1.625-1.7h-.812V4.25C10.563 1.907 8.74 0 6.5 0S2.438 1.907 2.438 4.25V6.8h-.813C.729 6.8 0 7.562 0 8.5v6.8c0 .938.729 1.7 1.625 1.7h9.75c.896 0 1.625-.762 1.625-1.7zM4.063 4.25c0-1.406 1.093-2.55 2.437-2.55s2.438 1.144 2.438 2.55V6.8H4.061z"
          fill="currentColor"
          className="text-gray-500 dark:text-gray-400"
        />
      </svg>

      {/* Input mot de passe */}
      <input
        type={showPassword ? 'text' : 'password'}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        className="bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 outline-none text-base w-full pr-14"
      />

      {/* Bouton œil / œil barré */}
      <button
        type="button"
        onClick={toggleVisibility}
        className="absolute right-4 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-300"
        aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
      >
        {showPassword ? (
          <EyeOff size={22} />
        ) : (
          <Eye size={22} />
        )}
      </button>
      
    </div>
  );
}