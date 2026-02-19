// src/layouts/AdminLayout.jsx
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './admin/AdminSidebar';
import AdminHeader from './admin/AdminHeader';
import AdminFooter from './admin/AdminFooter';
import { Menu, X } from 'lucide-react';

export default function AdminLayout() {
  // Contrôle du drawer mobile
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950 transition-colors duration-300">

      {/* ── Sidebar desktop (toujours visible ≥ lg) ── */}
      <div className="hidden lg:flex flex-col h-full">
        <AdminSidebar />
      </div>

      {/* ── Drawer sidebar mobile ── */}
      {mobileMenuOpen && (
        <>
          {/* Overlay foncé */}
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          {/* Sidebar en overlay */}
          <div className="fixed inset-y-0 left-0 z-50 flex flex-col lg:hidden shadow-2xl">
            <AdminSidebar />
          </div>
        </>
      )}

      {/* ── Zone principale (header + contenu + footer) ── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

        {/* Header avec bouton burger mobile intégré */}
        <div className="flex items-center">
          {/* Bouton burger (mobile uniquement) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="
              lg:hidden flex-shrink-0
              ml-4 p-2 rounded-xl
              text-gray-500 dark:text-gray-400
              hover:bg-gray-100 dark:hover:bg-gray-800
              hover:text-gray-700 dark:hover:text-gray-200
              transition-all duration-200
            "
            aria-label="Ouvrir le menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Header occupe le reste de la largeur */}
          <div className="flex-1">
            <AdminHeader />
          </div>
        </div>

        {/* ── Zone de contenu scrollable ── */}
        <main className="
          flex-1 overflow-y-auto
          bg-gray-50 dark:bg-gray-950
          px-6 py-6
        ">
          {/*
            <Outlet /> : react-router injecte ici la page active
            ex: DashboardPage, ProductsPage, OrdersPage…
          */}
          <Outlet />
        </main>

        {/* Footer */}
        <AdminFooter />
      </div>
    </div>
  );
}
