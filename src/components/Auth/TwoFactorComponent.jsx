import { useEffect, useRef, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { ShieldCheck, Mail, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { authAPI } from '@/services/api';

const decodeJwt = (token) => {
    try {
        const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
        return JSON.parse(atob(base64));
    } catch { return null; }
};
const isExpired = (token) => {
    const p = decodeJwt(token);
    if (!p?.exp) return true;
    return p.exp * 1000 < Date.now();
};

export default function TwoFactorPageComponent() {
    const { t } = useTranslation();
    const [otp, setOtp] = useState(new Array(6).fill(''));
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const inputRefs = useRef([]);
    const navigate = useNavigate();

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const payload = token ? decodeJwt(token) : null;
    const role = payload?.role ?? payload?.user?.role ?? null;
    const tokenInvalid = !token || isExpired(token);
    const alreadyVerified = localStorage.getItem('twoFAVerified') === '1';
    const method = localStorage.getItem('twoFAMethod') || 'EMAIL';

    useEffect(() => {
        if (!tokenInvalid && role === 'ADMIN' && !alreadyVerified) {
            inputRefs.current[0]?.focus();
        }
    }, [tokenInvalid, role, alreadyVerified]);

    if (tokenInvalid) return <Navigate to="/auth" replace />;
    if (role !== 'ADMIN') return <Navigate to="/home" replace />;
    if (alreadyVerified) return <Navigate to="/admin/dashboard" replace />;

    const handleChange = (element, index) => {
        if (isNaN(element.value)) return false;
        const newOtp = [...otp];
        newOtp[index] = element.value.slice(-1);
        setOtp(newOtp);
        if (element.value !== '' && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (!pasted) return;
        e.preventDefault();
        const newOtp = pasted.split('').concat(new Array(6).fill('')).slice(0, 6);
        setOtp(newOtp);
        const lastIdx = Math.min(pasted.length, 6) - 1;
        inputRefs.current[lastIdx]?.focus();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const finalCode = otp.join('');

        if (finalCode.length < 6) {
            setError(t('twoFactor.enter_digits'));
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const res = method === 'TOTP'
                ? await authAPI.verifyTotp(finalCode)
                : await authAPI.verify2FA(finalCode);
            const result = res.data;

            if (result?.success) {
                localStorage.setItem('twoFAVerified', '1');
                localStorage.removeItem('twoFARequired');
                localStorage.removeItem('twoFAMethod');
                navigate('/admin/dashboard', { replace: true });
            } else {
                setError(result?.message || t('twoFactor.invalid_code'));
            }
        } catch (err) {
            const msg = err.response?.data?.message ?? t('twoFactor.invalid_code');
            setError(msg);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        authAPI.logout();
    };

    const adminEmail = payload?.email ?? '';
    const maskedEmail = adminEmail
        ? adminEmail.replace(/^(.)(.*)(.@.*)$/, (_, a, b, c) => a + '•'.repeat(Math.max(b.length, 1)) + c)
        : '';

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4 transition-colors duration-700">
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 sm:p-10 max-w-md w-full flex flex-col items-center">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 flex items-center justify-center mb-5">
                    <ShieldCheck size={26} className="text-indigo-500" />
                </div>

                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2 text-center">
                    {t('twoFactor.title')}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-2">
                    {method === 'TOTP' ? t('twoFactor.subtitle_totp') : t('twoFactor.subtitle')}
                </p>
                {method === 'TOTP' ? (
                    <p className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 mb-7">
                        <ShieldCheck size={12} /> {t('twoFactor.totp_hint')}
                    </p>
                ) : maskedEmail && (
                    <p className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 mb-7">
                        <Mail size={12} /> {maskedEmail}
                    </p>
                )}

                <form onSubmit={handleSubmit} className="w-full">
                    <div className="flex justify-between gap-2 mb-4" onPaste={handlePaste}>
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                type="text"
                                inputMode="numeric"
                                autoComplete="one-time-code"
                                maxLength={1}
                                ref={(el) => (inputRefs.current[index] = el)}
                                value={digit}
                                onChange={(e) => handleChange(e.target, index)}
                                onKeyDown={(e) => handleKeyDown(e, index)}
                                disabled={isLoading}
                                className={`w-12 h-14 text-center text-2xl font-bold bg-gray-50 dark:bg-gray-700 border-2 rounded-xl text-gray-900 dark:text-white outline-none transition-all disabled:opacity-50 ${error
                                    ? 'border-red-500'
                                    : 'border-gray-200 dark:border-gray-600 focus:border-indigo-500'
                                    }`}
                            />
                        ))}
                    </div>

                    {error && (
                        <p className="text-red-500 text-sm mb-4 text-center flex items-center justify-center gap-1.5">
                            <AlertCircle size={14} /> {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading || otp.join('').length < 6}
                        className={`w-full h-12 rounded-full text-white font-medium shadow-lg transition-all duration-300 flex items-center justify-center gap-2 ${isLoading || otp.join('').length < 6
                            ? 'bg-indigo-400/70 dark:bg-indigo-500/40 cursor-not-allowed'
                            : 'bg-indigo-600 hover:bg-indigo-700'
                            }`}
                    >
                        {isLoading && <Loader2 size={16} className="animate-spin" />}
                        {isLoading ? t('twoFactor.verifying') : t('twoFactor.verify_btn')}
                    </button>
                </form>

                <button
                    type="button"
                    onClick={handleCancel}
                    className="mt-6 inline-flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                    <ArrowLeft size={12} /> {t('twoFactor.cancel')}
                </button>

                <p className="mt-6 text-[11px] text-gray-400 dark:text-gray-500 text-center">
                    {t('twoFactor.expiry_note')}
                </p>
            </div>
        </div>
    );
}
