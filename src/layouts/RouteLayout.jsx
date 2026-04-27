/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { ShieldAlert, ShieldOff, Loader2, Lock } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// JWT utilities (client-side read only — real validation stays on backend)
// ─────────────────────────────────────────────────────────────────────────────

const decodeToken = (token) => {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
};

const isTokenExpired = (token) => {
  const payload = decodeToken(token);
  if (!payload?.exp) return true;
  // 10s grace margin to avoid false positives at the edge
  return payload.exp * 1000 < Date.now() - 10_000;
};

const getRoleFromToken = (token) => {
  const payload = decodeToken(token);
  return payload?.role ?? payload?.user?.role ?? null;
};

// ─────────────────────────────────────────────────────────────────────────────
// Cyna logo SVG
// ─────────────────────────────────────────────────────────────────────────────

const CynaLogo = ({ className = '' }) => (
  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path
      d="M16.8693 0.0138722C17.512 0.0971052 18.169 0.152594 18.8117 0.291316C24.8246 1.55368 28.8237 5.06334 30.9089 10.64C31.1946 11.4168 31.3231 12.2491 31.4945 13.0676C31.5802 13.4976 31.4945 13.5809 31.0374 13.5809C29.7092 13.5809 28.3809 13.6641 27.0527 13.567C24.0534 13.3312 21.1683 12.6514 18.5261 11.1671C16.8408 10.2099 15.1269 10.1822 13.4273 11.1671C11.642 12.1936 10.5279 13.6363 10.5422 15.731C10.5422 16.1056 10.6279 16.5079 10.7707 16.8408C11.4991 18.5471 12.6132 19.9066 14.5127 20.4753C16.0267 20.9192 17.4549 20.6002 18.7974 19.8927C20.797 18.8384 22.8965 18.0754 25.1531 17.8396C26.9384 17.6454 28.7523 17.5899 30.5518 17.5206C31.2945 17.4928 31.523 17.7841 31.4659 18.5194C31.2517 20.9747 30.2376 23.0972 28.6237 24.9699C26.2814 27.6889 23.4249 29.6726 19.8258 30.5465C16.498 31.3511 13.1702 31.3927 9.98521 30.0333C5.34344 28.0357 1.95852 24.7896 0.630254 19.9759C-1.79775 11.1116 3.04398 3.48192 10.785 0.901691C12.1847 0.430037 13.6415 0.166466 15.1269 0.0693609C15.2268 0.0693609 15.3268 0.0277443 15.4411 0H16.8836L16.8693 0.0138722Z"
      fill="url(#cynaGradRL)"
    />
    <defs>
      <linearGradient id="cynaGradRL" x1="0" y1="16" x2="32" y2="16" gradientUnits="userSpaceOnUse">
        <stop stopColor="#302082" />
        <stop offset="1" stopColor="#7C00FF" />
      </linearGradient>
    </defs>
  </svg>
);

// ─────────────────────────────────────────────────────────────────────────────
// Shared full-screen wrapper
// ─────────────────────────────────────────────────────────────────────────────

function FullScreen({ children }) {
  return (
    <div className="
      min-h-screen w-full flex flex-col items-center justify-center
      bg-gray-50 dark:bg-gray-950
      px-4
      transition-colors duration-300
    ">
      {/* Subtle radial glow behind card */}
      <div className="
        absolute inset-0 pointer-events-none overflow-hidden
      ">
        <div className="
          absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
          w-[600px] h-[600px] rounded-full
          bg-indigo-500/5 dark:bg-indigo-500/10
          blur-3xl
        " />
      </div>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Loading screen — shown while verifying token
// ─────────────────────────────────────────────────────────────────────────────

function LoadingScreen() {
  return (
    <FullScreen>
      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <CynaLogo className="w-10 h-10" />
          <span className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Cyna
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-widest text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 px-2 py-0.5 rounded-full">
            Auth
          </span>
        </div>

        {/* Card */}
        <div className="
          flex flex-col items-center gap-5
          bg-white dark:bg-gray-900
          border border-gray-200 dark:border-gray-700/60
          rounded-2xl shadow-xl shadow-black/5 dark:shadow-black/30
          px-10 py-8
          w-full max-w-xs
        ">
          {/* Animated icon */}
          <div className="relative p-3">
            <div className="
              w-14 h-14 rounded-2xl
              bg-indigo-50 dark:bg-indigo-500/10
              border border-indigo-100 dark:border-indigo-500/20
              flex items-center justify-center
            ">
              <Lock size={22} className="text-indigo-500" />
            </div>
            {/* Spinning ring */}
            <div className="
              absolute -inset-1.5 rounded-[100%]
              border-2 border-transparent
              border-t-indigo-500 border-r-indigo-400
              animate-spin
            " />
          </div>

          <div className="text-center space-y-1">
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
              Verifying access
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Checking your credentials…
            </p>
          </div>

          {/* Progress dots */}
          <div className="flex items-center gap-1.5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-indigo-400 dark:bg-indigo-500 animate-bounce"
                style={{ animationDelay: `${i * 150}ms` }}
              />
            ))}
          </div>
        </div>
      </div>
    </FullScreen>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Expired session screen
// ─────────────────────────────────────────────────────────────────────────────

function ExpiredScreen({ redirectTo, countdown }) {
  return (
    <FullScreen>
      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <CynaLogo className="w-10 h-10" />
          <span className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">Cyna</span>
          <span className="text-[10px] font-semibold uppercase tracking-widest text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 px-2 py-0.5 rounded-full">
            Auth
          </span>
        </div>

        {/* Card */}
        <div className="
          flex flex-col items-center gap-5
          bg-white dark:bg-gray-900
          border border-amber-200 dark:border-amber-500/20
          rounded-2xl shadow-xl shadow-black/5 dark:shadow-black/30
          px-8 py-8
          w-full max-w-sm
          text-center
        ">
          {/* Icon */}
          <div className="
            w-14 h-14 rounded-2xl
            bg-amber-50 dark:bg-amber-500/10
            border border-amber-100 dark:border-amber-500/20
            flex items-center justify-center
          ">
            <ShieldOff size={22} className="text-amber-500" />
          </div>

          <div className="space-y-1.5">
            <p className="text-base font-bold text-gray-900 dark:text-white">
              Session Expired
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              Your session has timed out for security reasons. Please sign in again to continue.
            </p>
          </div>

          {/* Countdown pill */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
            <Loader2 size={12} className="text-amber-500 animate-spin flex-shrink-0" />
            <span className="text-xs text-amber-700 dark:text-amber-400 font-medium">
              Redirecting in {countdown}s…
            </span>
          </div>

          {/* Manual link */}
          <a
            href={redirectTo}
            className="text-xs text-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 underline underline-offset-2 transition-colors"
          >
            Sign in now
          </a>
        </div>
      </div>
    </FullScreen>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Access denied screen (wrong role)
// ─────────────────────────────────────────────────────────────────────────────

function AccessDeniedScreen({ countdown }) {
  return (
    <FullScreen>
      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <CynaLogo className="w-10 h-10" />
          <span className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">Cyna</span>
          <span className="text-[10px] font-semibold uppercase tracking-widest text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 px-2 py-0.5 rounded-full">
            Auth
          </span>
        </div>

        {/* Card */}
        <div className="
          flex flex-col items-center gap-5
          bg-white dark:bg-gray-900
          border border-red-200 dark:border-red-500/20
          rounded-2xl shadow-xl shadow-black/5 dark:shadow-black/30
          px-8 py-8
          w-full max-w-sm
          text-center
        ">
          {/* Icon */}
          <div className="
            w-14 h-14 rounded-2xl
            bg-red-50 dark:bg-red-500/10
            border border-red-100 dark:border-red-500/20
            flex items-center justify-center
          ">
            <ShieldAlert size={22} className="text-red-500" />
          </div>

          <div className="space-y-1.5">
            <p className="text-base font-bold text-gray-900 dark:text-white">
              Access Denied
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              You don't have the required permissions to access this area.
            </p>
          </div>

          {/* Role badge */}
          <div className="px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Admin privileges required
            </p>
          </div>

          {/* Countdown pill */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20">
            <Loader2 size={12} className="text-red-500 animate-spin flex-shrink-0" />
            <span className="text-xs text-red-700 dark:text-red-400 font-medium">
              Redirecting in {countdown}s…
            </span>
          </div>

          {/* Manual link */}
          <a
            href="/home"
            className="text-xs text-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 underline underline-offset-2 transition-colors"
          >
            Go to homepage
          </a>
        </div>
      </div>
    </FullScreen>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// RouteLayout — Universal route guard with beautiful Cyna-branded feedback
//
// Props:
//   requireAuth   {boolean}   – route requires authentication
//   allowedRoles  {string[]}  – allowed roles (e.g. ['ADMIN', 'SUPERADMIN'])
//   redirectTo    {string}    – redirect if not authenticated (default: '/auth')
//   children      {ReactNode}
//
// Usage:
//   // Public route
//   <RouteLayout><LoginPage /></RouteLayout>
//
//   // Admin-only route
//   <RouteLayout requireAuth allowedRoles={['ADMIN']}>
//     <AdminLayout />
//   </RouteLayout>
//
//   // Any authenticated user
//   <RouteLayout requireAuth>
//     <ProfilePage />
//   </RouteLayout>
// ─────────────────────────────────────────────────────────────────────────────

export default function RouteLayout({
  children,
  requireAuth = false,
  allowedRoles = [],
  redirectTo = '/auth',
}) {
  const location = useLocation();

  // Countdown state for redirect screens (3 → 0)
  const [countdown, setCountdown]     = useState(3);
  const [authState, setAuthState]     = useState('checking'); // 'checking' | 'ok' | 'expired' | 'denied' | 'redirect' | 'twoFA'
  const [redirectTarget, setRedirectTarget] = useState(redirectTo);

  // Stabilise allowedRoles : on ne garde que la version sérialisée pour éviter
  // qu'un nouveau tableau littéral (["ADMIN"]) ne re-déclenche l'effet à chaque render.
  const allowedRolesKey = JSON.stringify(allowedRoles);

  useEffect(() => {
    // ── Public route: skip all checks immediately
    if (!requireAuth) {
      setAuthState('ok');
      return;
    }

    const token = localStorage.getItem('token');

    // ── 1. No token → redirect to login
    if (!token) {
      setRedirectTarget(redirectTo);
      setAuthState('redirect');
      return;
    }

    // ── 2. Token expired
    if (isTokenExpired(token)) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setAuthState('expired');
      return;
    }

    // ── 3. Role check
    const parsedRoles = JSON.parse(allowedRolesKey);
    const role = getRoleFromToken(token);
    if (parsedRoles.length > 0) {
      if (!role || !parsedRoles.includes(role)) {
        setAuthState('denied');
        return;
      }
    }

    // ── 4. 2FA check (admin only). When the route allows ADMIN access, the
    // admin must have completed the 6-digit email verification step before
    // entering /admin/*. Customers are not affected.
    if (role === 'ADMIN' && parsedRoles.includes('ADMIN')) {
      const verified = localStorage.getItem('twoFAVerified') === '1';
      if (!verified) {
        setRedirectTarget('/2FA');
        setAuthState('twoFA');
        return;
      }
    }

    // ── All good
    // Small intentional delay (2000ms) so the loading screen doesn't flash
    const t = setTimeout(() => setAuthState('ok'), 2000);
    return () => clearTimeout(t);
// eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requireAuth, redirectTo, allowedRolesKey]);

  // ── Countdown timer for expired / denied screens
  useEffect(() => {
    if (authState !== 'expired' && authState !== 'denied') return;

    const destination = authState === 'expired' ? redirectTo : '/home';

    if (countdown <= 0) {
      window.location.href = destination;
      return;
    }

    const t = setTimeout(() => setCountdown((c) => c - 1), 2000);
    return () => clearTimeout(t);
  }, [authState, countdown, redirectTo]);

  // ── Render states ──────────────────────────────────────────────────────────

  // Silent redirect (no token, or admin without 2FA verification) — no UI needed
  if (authState === 'redirect' || authState === 'twoFA') {
    return <Navigate to={redirectTarget} replace state={{ from: location }} />;
  }

  // Checking (brief loading screen)
  if (authState === 'checking') {
    return <LoadingScreen />;
  }

  // Session expired
  if (authState === 'expired') {
    return <ExpiredScreen redirectTo={redirectTo} countdown={countdown} />;
  }

  // Access denied (wrong role)
  if (authState === 'denied') {
    return <AccessDeniedScreen countdown={countdown} />;
  }

  // ── All verified: render the route
  return <>{children}</>;
}