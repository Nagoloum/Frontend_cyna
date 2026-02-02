import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LogOut,
  Settings,
  ChevronLeft,
  ChevronRight,
  Home,
  Clock,
  Calendar,
  ListTodo,
} from 'lucide-react';

export default function SideBarComponent() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/auth', { replace: true });
  };

  return (
    <aside
      className={`${
        collapsed ? 'w-auto min-w-20' : 'w-72'
      } transition-all duration-300 ease-in-out bg-white dark:bg-gray-800 shadow-2xl rounded-3xl m-4 flex flex-col h-[calc(100vh-2rem)]`}
    >
      {/* Header */}
      <div className="p-5 flex items-center justify-between">
        <NavLink to="/home" className="flex items-center gap-3">
          {/* Logo */}
          <div className="w-9 h-9  flex items-center justify-center overflow-hidden">
            <img src="/logo.png" alt="RememberMe" className="w-full h-full object-cover" />
          </div>

          {/* Titre */}
          <h1
            className={`font-bold text-xl text-indigo-600 dark:text-indigo-400 transition-opacity overflow-hidden ${
              collapsed ? 'opacity-0 w-0' : 'opacity-100'
            }`}
          >
            RememberMe
          </h1>
        </NavLink>

        {/* Bouton collapse */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="w-4.5 h-4.5 text-gray-600 dark:text-gray-300" />
          ) : (
            <ChevronLeft className="w-4.5 h-4.5 text-gray-600 dark:text-gray-300" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-5 space-y-6 overflow-y-auto">
        {/* Section Tasks */}
        <div>
          <h3
            className={`text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 transition-opacity ${
              collapsed ? 'opacity-0 h-0 mb-0' : 'opacity-100'
            }`}
          >
            Tasks
          </h3>
          <ul className="space-y-1.5">
            {[
              { icon: Home, label: 'Upcoming', href: '/upcoming' },
              { icon: Clock, label: 'Today', href: '/today' },
              { icon: Calendar, label: 'Calendar', href: '/calendar' },
              { icon: ListTodo, label: 'Sticky Wall', href: '/sticky-wall' },
            ].map((item) => (
              <li key={item.label}>
                <NavLink
                  to={item.href}
                  className={({ isActive }) =>
                    `w-full flex items-center transition-all group rounded-xl ${
                      collapsed ? 'justify-center px-0' : 'justify-start px-3'
                    } py-2.5 ${
                      isActive
                        ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-medium'
                        : 'hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-gray-700 dark:text-gray-200'
                    }`
                  }
                >
                  <div className={`flex items-center ${collapsed ? 'justify-center w-full' : 'gap-3'}`}>
                    <item.icon className="w-4.5 h-4.5 flex-shrink-0 text-gray-600 dark:text-gray-300" />
                    {!collapsed && (
                      <span className="text-sm font-medium overflow-hidden transition-opacity">
                        {item.label}
                      </span>
                    )}
                  </div>
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        {/* Section Lists */}
        <div>
          <h3
            className={`text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 transition-opacity ${
              collapsed ? 'opacity-0 h-0 mb-0' : 'opacity-100'
            }`}
          >
            Lists
          </h3>
          <ul className="space-y-1.5">
            {['Home', 'School', 'Project', 'Health', 'Work', 'Personal'].map((list) => (
              <li key={list}>
                <button
                  className={`w-full flex items-center transition-all group rounded-xl ${
                    collapsed ? 'justify-center px-0' : 'justify-start px-3'
                  } py-2.5 hover:bg-indigo-50 dark:hover:bg-indigo-900/30`}
                >
                  <div className={`flex items-center ${collapsed ? 'justify-center w-full' : 'gap-3'}`}>
                    <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 flex-shrink-0" />
                    {!collapsed && (
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-200 overflow-hidden transition-opacity">
                        {list}
                      </span>
                    )}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Footer */}
      <div className="p-5 space-y-2 border-t border-gray-200 dark:border-gray-700">
        {/* Settings */}
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `w-full flex items-center transition-all group rounded-xl ${
              collapsed ? 'justify-center px-0' : 'justify-start px-3'
            } py-2.5 ${
              isActive
                ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-medium'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200'
            }`
          }
        >
          <div className={`flex items-center ${collapsed ? 'justify-center w-full' : 'gap-3'}`}>
            <Settings className="w-4.5 h-4.5 text-gray-600 dark:text-gray-300 flex-shrink-0" />
            {!collapsed && (
              <span className="text-sm font-medium overflow-hidden transition-opacity">
                Settings
              </span>
            )}
          </div>
        </NavLink>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className={`w-full flex items-center transition-all group rounded-xl ${
            collapsed ? 'justify-center px-0' : 'justify-start px-3'
          } py-2.5 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400`}
        >
          <div className={`flex items-center ${collapsed ? 'justify-center w-full' : 'gap-3'}`}>
            <LogOut className="w-4.5 h-4.5 flex-shrink-0" />
            {!collapsed && (
              <span className="text-sm font-medium overflow-hidden transition-opacity">
                Logout
              </span>
            )}
          </div>
        </button>
      </div>
    </aside>
  );
}