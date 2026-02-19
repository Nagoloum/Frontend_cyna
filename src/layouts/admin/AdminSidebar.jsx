// src/layouts/admin/AdminSidebar.jsx
import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  HeadphonesIcon,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Shield,
} from 'lucide-react';

// ── Logo CYNA SVG (réutilisé depuis tes composants Toth) ──────────────────────
const CynaLogo = ({ className = '' }) => (
  <svg
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M16.8693 0.0138722C17.512 0.0971052 18.169 0.152594 18.8117 0.291316C24.8246 1.55368 28.8237 5.06334 30.9089 10.64C31.1946 11.4168 31.3231 12.2491 31.4945 13.0676C31.5802 13.4976 31.4945 13.5809 31.0374 13.5809C29.7092 13.5809 28.3809 13.6641 27.0527 13.567C24.0534 13.3312 21.1683 12.6514 18.5261 11.1671C16.8408 10.2099 15.1269 10.1822 13.4273 11.1671C11.642 12.1936 10.5279 13.6363 10.5422 15.731C10.5422 16.1056 10.6279 16.5079 10.7707 16.8408C11.4991 18.5471 12.6132 19.9066 14.5127 20.4753C16.0267 20.9192 17.4549 20.6002 18.7974 19.8927C20.797 18.8384 22.8965 18.0754 25.1531 17.8396C26.9384 17.6454 28.7523 17.5899 30.5518 17.5206C31.2945 17.4928 31.523 17.7841 31.4659 18.5194C31.2517 20.9747 30.2376 23.0972 28.6237 24.9699C26.2814 27.6889 23.4249 29.6726 19.8258 30.5465C16.498 31.3511 13.1702 31.3927 9.98521 30.0333C5.34344 28.0357 1.95852 24.7896 0.630254 19.9759C-1.79775 11.1116 3.04398 3.48192 10.785 0.901691C12.1847 0.430037 13.6415 0.166466 15.1269 0.0693609C15.2268 0.0693609 15.3268 0.0277443 15.4411 0H16.8836L16.8693 0.0138722Z"
      fill="url(#cynaGrad)"
    />
    <defs>
      <linearGradient id="cynaGrad" x1="0" y1="16" x2="32" y2="16" gradientUnits="userSpaceOnUse">
        <stop stopColor="#302082" />
        <stop offset="1" stopColor="#7C00FF" />
      </linearGradient>
    </defs>
  </svg>
);

// ── Liens de navigation ────────────────────────────────────────────────────────
const NAV_ITEMS = [
  {
    label: 'Dashboard',
    to: '/admin/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'SaaS Products',
    to: '/admin/products',
    icon: Package,
  },
  {
    label: 'Orders',
    to: '/admin/orders',
    icon: ShoppingCart,
  },
  {
    label: 'Support',
    to: '/admin/support',
    icon: HeadphonesIcon,
  },
  {
    label: 'Reports',
    to: '/admin/reports',
    icon: BarChart3,
  },
  {
    label: 'Settings',
    to: '/admin/settings',
    icon: Settings,
  },
];

// ── Composant principal ────────────────────────────────────────────────────────
export default function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/auth');
  };

  return (
    <aside
      className={`
        relative flex flex-col h-full
        bg-white dark:bg-gray-900
        border-r border-gray-200 dark:border-gray-700/60
        transition-all duration-300 ease-in-out
        ${collapsed ? 'w-[72px]' : 'w-64'}
      `}
    >
      {/* ── Logo & Titre ── */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-gray-200 dark:border-gray-700/60 ${collapsed ? 'justify-center' : ''}`}>
        <CynaLogo className="w-8 h-8 flex-shrink-0" />
        {!collapsed && (
          <div>
            <span className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Cyna
            </span>
            <span className="ml-2 text-[10px] font-semibold uppercase tracking-widest text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 px-1.5 py-0.5 rounded-full">
              Admin
            </span>
          </div>
        )}
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {!collapsed && (
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 px-3 mb-3">
            Navigation
          </p>
        )}

        {NAV_ITEMS.map(({ label, to, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `
              group flex items-center gap-3 px-3 py-2.5 rounded-xl
              text-sm font-medium transition-all duration-200
              ${collapsed ? 'justify-center' : ''}
              ${
                isActive
                  ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
              }
            `}
            title={collapsed ? label : undefined}
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={18}
                  className={`flex-shrink-0 transition-colors duration-200 ${
                    isActive
                      ? 'text-indigo-600 dark:text-indigo-400'
                      : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300'
                  }`}
                />
                {!collapsed && <span>{label}</span>}

                {/* Indicateur actif */}
                {isActive && !collapsed && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* ── Section admin info + Logout ── */}
      <div className={`border-t border-gray-200 dark:border-gray-700/60 p-3 space-y-1`}>
        {/* Badge sécurité 2FA */}
        {!collapsed && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-green-50 dark:bg-green-500/10">
            <Shield size={14} className="text-green-500 flex-shrink-0" />
            <span className="text-xs text-green-600 dark:text-green-400 font-medium">
              2FA Enabled
            </span>
          </div>
        )}

        {/* Bouton Logout */}
        <button
          onClick={handleLogout}
          className={`
            w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
            text-sm font-medium text-gray-600 dark:text-gray-400
            hover:bg-red-50 dark:hover:bg-red-500/10
            hover:text-red-600 dark:hover:text-red-400
            transition-all duration-200 group
            ${collapsed ? 'justify-center' : ''}
          `}
          title={collapsed ? 'Sign Out' : undefined}
        >
          <LogOut size={18} className="flex-shrink-0 transition-colors duration-200" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>

      {/* ── Bouton collapse ── */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="
          absolute -right-3 top-[72px]
          w-6 h-6 rounded-full
          bg-white dark:bg-gray-800
          border border-gray-200 dark:border-gray-700
          flex items-center justify-center
          text-gray-500 dark:text-gray-400
          hover:text-indigo-500 dark:hover:text-indigo-400
          hover:border-indigo-300 dark:hover:border-indigo-500
          transition-all duration-200
          shadow-sm z-10
        "
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
      </button>
    </aside>
  );
}
