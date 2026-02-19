// src/components/admin/shared/FormFields.jsx
import { useState } from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

// ── Styles communs ────────────────────────────────────────────────────────────
const BASE_INPUT = `
  w-full px-3 rounded-xl text-sm
  bg-gray-50 dark:bg-gray-700
  border text-gray-900 dark:text-white
  placeholder-gray-400 dark:placeholder-gray-500
  focus:outline-none focus:ring-2 focus:ring-indigo-500/30
  focus:border-indigo-400 dark:focus:border-indigo-500
  disabled:opacity-50 disabled:cursor-not-allowed
  transition-all duration-200
`;

const BORDER_DEFAULT = 'border-gray-200 dark:border-gray-600';
const BORDER_ERROR   = 'border-red-400 dark:border-red-500 focus:ring-red-500/30 focus:border-red-400';

// ── Label ─────────────────────────────────────────────────────────────────────
function Label({ htmlFor, children, required }) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5"
    >
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
}

// ── Message d'erreur ──────────────────────────────────────────────────────────
function ErrorMsg({ message }) {
  if (!message) return null;
  return (
    <div className="flex items-center gap-1.5 mt-1.5">
      <AlertCircle size={12} className="text-red-500 flex-shrink-0" />
      <p className="text-xs text-red-600 dark:text-red-400">{message}</p>
    </div>
  );
}

// ── InputField ────────────────────────────────────────────────────────────────
/**
 * InputField
 * Props :
 *   label, id, name, type, value, onChange, placeholder,
 *   required, disabled, error {string}, hint {string},
 *   icon {ReactNode}, iconPos {'left'|'right'},
 *   className
 */
export function InputField({
  label, id, name, type = 'text', value, onChange,
  placeholder, required, disabled, error, hint,
  icon: Icon, iconPos = 'left', className = '',
}) {
  const inputId = id ?? name;
  const hasIcon = !!Icon;

  return (
    <div className={className}>
      {label && <Label htmlFor={inputId} required={required}>{label}</Label>}

      <div className="relative">
        {hasIcon && iconPos === 'left' && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <Icon size={15} className="text-gray-400 dark:text-gray-500" />
          </div>
        )}

        <input
          id={inputId}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`
            h-10 ${BASE_INPUT}
            ${hasIcon && iconPos === 'left'  ? 'pl-9'  : ''}
            ${hasIcon && iconPos === 'right' ? 'pr-9'  : ''}
            ${error ? BORDER_ERROR : BORDER_DEFAULT}
          `}
        />

        {hasIcon && iconPos === 'right' && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <Icon size={15} className="text-gray-400 dark:text-gray-500" />
          </div>
        )}
      </div>

      {hint && !error && (
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">{hint}</p>
      )}
      <ErrorMsg message={error} />
    </div>
  );
}

// ── PasswordField ─────────────────────────────────────────────────────────────
export function PasswordField({
  label, id, name, value, onChange,
  placeholder = 'Mot de passe', required, disabled, error, hint, className = '',
}) {
  const [show, setShow] = useState(false);
  const inputId = id ?? name;

  return (
    <div className={className}>
      {label && <Label htmlFor={inputId} required={required}>{label}</Label>}

      <div className="relative">
        <input
          id={inputId}
          name={name}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`h-10 ${BASE_INPUT} pr-10 ${error ? BORDER_ERROR : BORDER_DEFAULT}`}
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          {show ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>

      {hint && !error && (
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">{hint}</p>
      )}
      <ErrorMsg message={error} />
    </div>
  );
}

// ── SelectField ───────────────────────────────────────────────────────────────
/**
 * SelectField
 * Props :
 *   label, id, name, value, onChange, options [{value, label}],
 *   placeholder, required, disabled, error, hint, className
 */
export function SelectField({
  label, id, name, value, onChange, options = [],
  placeholder, required, disabled, error, hint, className = '',
}) {
  const inputId = id ?? name;

  return (
    <div className={className}>
      {label && <Label htmlFor={inputId} required={required}>{label}</Label>}

      <select
        id={inputId}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={`h-10 ${BASE_INPUT} ${error ? BORDER_ERROR : BORDER_DEFAULT}`}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>

      {hint && !error && (
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">{hint}</p>
      )}
      <ErrorMsg message={error} />
    </div>
  );
}

// ── TextareaField ─────────────────────────────────────────────────────────────
export function TextareaField({
  label, id, name, value, onChange, placeholder,
  required, disabled, error, hint, rows = 4, className = '',
}) {
  const inputId = id ?? name;

  return (
    <div className={className}>
      {label && <Label htmlFor={inputId} required={required}>{label}</Label>}

      <textarea
        id={inputId}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        rows={rows}
        className={`
          py-2.5 resize-none ${BASE_INPUT}
          ${error ? BORDER_ERROR : BORDER_DEFAULT}
        `}
      />

      {hint && !error && (
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">{hint}</p>
      )}
      <ErrorMsg message={error} />
    </div>
  );
}
