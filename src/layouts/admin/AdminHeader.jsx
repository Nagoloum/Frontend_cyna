// src/layouts/admin/AdminHeader.jsx
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Shield, ChevronDown, User, LogOut, Settings, X } from 'lucide-react';

// ── Utilitaire : lire le user depuis le token JWT ─────────────────────────────
const getUserFromToken = () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    // Adapte selon la structure de ton JWT (payload.name | payload.user?.name | payload.email)
    return {
      name: payload?.name ?? payload?.user?.name ?? payload?.email ?? 'Admin',
      email: payload?.email ?? payload?.user?.email ?? '',
      role: payload?.role ?? payload?.user?.role ?? 'ADMIN',
    };
  } catch {
    return { name: 'Admin', email: '', role: 'ADMIN' };
  }
};

// ── Composant ─────────────────────────────────────────────────────────────────
export default function AdminHeader() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifications] = useState(3); // TODO: fetch depuis API
  const userMenuRef = useRef(null);
  const navigate = useNavigate();

  const user = getUserFromToken();

  // Close le menu si clic en dehors
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/auth');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    // TODO: implement global search (products/orders)
    console.log('Recherche globale :', searchQuery);
  };

  // Admin initials for avatar
  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'AD';

  return (
    <header className="
      h-16 flex-shrink-0 flex items-center justify-between
      px-6 gap-4
      bg-white dark:bg-gray-900
      border-b border-gray-200 dark:border-gray-700/60
    ">
      {/* ── Global search bar ── */}
      <form onSubmit={handleSearch} className="flex-1 max-w-md">
        <div className="
          relative flex items-center
          bg-gray-50 dark:bg-gray-800
          border border-gray-200 dark:border-gray-700
          rounded-xl h-9 px-3 gap-2
          focus-within:ring-2 focus-within:ring-indigo-500/30
          focus-within:border-indigo-400 dark:focus-within:border-indigo-500
          transition-all duration-200
        ">
          <Search size={15} className="text-gray-400 dark:text-gray-500 flex-shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products, orders…"
            className="
              bg-transparent text-sm text-gray-700 dark:text-gray-300
              placeholder-gray-400 dark:placeholder-gray-500
              outline-none w-full
            "
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </form>

      {/* ── Actions droite ── */}
      <div className="flex items-center gap-3">

        {/* Badge 2FA */}
        <div className="
          hidden sm:flex items-center gap-1.5
          bg-green-50 dark:bg-green-500/10
          border border-green-200 dark:border-green-500/20
          px-2.5 py-1 rounded-full
        ">
          <Shield size={12} className="text-green-500" />
          <span className="text-xs font-semibold text-green-600 dark:text-green-400">2FA</span>
        </div>

        {/* Notifications */}
        <button className="relative p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-200 transition-all duration-200">
          <Bell size={18} />
          {notifications > 0 && (
            <span className="
              absolute top-1 right-1
              w-4 h-4 rounded-full
              bg-indigo-500 text-white
              text-[10px] font-bold
              flex items-center justify-center
            ">
              {notifications > 9 ? '9+' : notifications}
            </span>
          )}
        </button>

        {/* Menu utilisateur */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="
              flex items-center gap-2.5 pl-1 pr-2.5 py-1
              rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800
              transition-all duration-200 group
            "
          >
            {/* Avatar initials */}
            <div className="
              w-8 h-8 rounded-lg
              bg-gradient-to-br from-indigo-500 to-violet-600
              flex items-center justify-center
              text-white text-xs font-bold flex-shrink-0
            ">
              {initials}
            </div>

            {/* Nom + rôle */}
            <div className="hidden md:flex flex-col items-start leading-none">
              <span className="text-sm font-semibold text-gray-800 dark:text-gray-100 leading-tight">
                {user?.name}
              </span>
              <span className="text-[10px] text-indigo-500 font-medium uppercase tracking-wide">
                {user?.role}
              </span>
            </div>

            <ChevronDown
              size={14}
              className={`text-gray-400 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`}
            />
          </button>

          {/* Dropdown menu */}
          {showUserMenu && (
            <div className="
              absolute right-0 top-full mt-2 w-52
              bg-white dark:bg-gray-800
              border border-gray-200 dark:border-gray-700
              rounded-2xl shadow-xl shadow-black/10 dark:shadow-black/30
              py-1.5 z-50
              animate-in fade-in slide-in-from-top-2 duration-150
            ">
              {/* Info user */}
              <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
              </div>

              {/* Actions */}
              <div className="py-1">
                <button
                  onClick={() => { setShowUserMenu(false); navigate('/admin/settings'); }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <Settings size={15} className="text-gray-400" />
                  Settings
                </button>
                <button
                  onClick={() => { setShowUserMenu(false); navigate('/admin/profile'); }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <User size={15} className="text-gray-400" />
                  My Profile
                </button>
              </div>

              {/* Logout */}
              <div className="border-t border-gray-100 dark:border-gray-700 py-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                >
                  <LogOut size={15} />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
