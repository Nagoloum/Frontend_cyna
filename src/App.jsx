// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Pages publiques
import GetStartedPage from './pages/GetStarted';
import AuthPage from './pages/Auth/Auth';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';
import EmailConfirmation from './pages/Auth/EmailConfirmation';
import TermsOfUseComponent from './components/Policy/TermOfUseComponent';
import PrivacyPolicyComponent from './components/Policy/PrivacyPolicyComponent';
import CookiePolicyComponent from './components/Policy/CookiePolicyComponent';
import ErrorPage from './pages/ErrorPage';

// Pages privées utilisateur
// import HomePage from './pages/User/Home';

// Pages admin
import Dashboard from './pages/Admin/Dashboard';
// À ajouter au fur et à mesure :
import ProductsPage from './pages/Admin/ProductsPage';
import OrdersPage from './pages/Admin/OrdersPage';
import SupportPage from './pages/Admin/SupportPage';
import ReportsPage from './pages/Admin/ReportsPage';
import MyProfile   from './pages/Admin/MyProfilePage';
import Settings    from './pages/Admin/SettingsPage';

// Layouts
import RouteLayout from './layouts/RouteLayout';
import AdminLayout from './layouts/AdminLayout';          // Layout admin (sidebar admin, header admin)
// 👆 à créer — on le fera ensemble

// Composants globaux
import ThemeToggle from './components/Kit/ThemeToggle';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Redirection racine ── */}
        <Route path="/" element={<Navigate to="/getstarted" replace />} />

        {/* ── Routes publiques (pas d'auth requise) ── */}
        <Route path="/getstarted"         element={<GetStartedPage />} />
        <Route path="/auth"               element={<AuthPage />} />
        <Route path="/forgot-password"    element={<ForgotPassword />} />
        <Route path="/reset-password"     element={<ResetPassword />} />
        <Route path="/email-confirmation" element={<EmailConfirmation />} />
        <Route path="/terms-of-use"       element={<TermsOfUseComponent />} />
        <Route path="/privacy-policy"     element={<PrivacyPolicyComponent />} />
        <Route path="/cookie-policy"      element={<CookiePolicyComponent />} />

        {/* ── Routes privées utilisateur ── */}
        <Route
          path="/home"
          element={
            <RouteLayout requireAuth={true}>
              {/* <Layout>
                <HomePage />
              </Layout> */}
            </RouteLayout>
          }
        />

        {/* ── Routes admin (rôle ADMIN obligatoire) ── */}
        {/*
          Toutes les routes /admin/* sont protégées par le même RouteLayout.
          L'AdminLayout gère la sidebar admin, le header, etc.
          Pour ajouter une page admin : ajoute simplement une <Route> enfant.
        */}
        <Route
          path="/admin"
          element={
            <RouteLayout requireAuth={true} allowedRoles={['ADMIN']}>
              <AdminLayout />
            </RouteLayout>
          }
        >
          {/* Redirection /admin → /admin/dashboard */}
          <Route index element={<Navigate to="/admin/dashboard" replace />} />

          <Route path="dashboard" element={<Dashboard />} />
          <Route path="products"  element={<ProductsPage />} />
          <Route path="orders"    element={<OrdersPage />} />
          <Route path="support"   element={<SupportPage />} />
          <Route path="reports"   element={<ReportsPage />} />
          <Route path="profile"   element={<MyProfile />} />
          <Route path="settings"  element={<Settings />} />

        </Route>

        {/* ── 404 ── */}
        <Route path="*" element={<ErrorPage />} />
      </Routes>

      {/* Composants visibles sur toutes les pages */}
      <ThemeToggle />
    </BrowserRouter>
  );
}

export default App;
