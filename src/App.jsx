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

// Pages privées
import HomePage from './pages/User/Home';
import Dashboard from './pages/Admin/Dashboard';

// Layouts
import RouteLayout from './layouts/RouteLayout';     // Gère loader + auth + transitions
import Layout from './components/Kit/Layout';             // Sidebar + NewTaskFloating + structure 3 colonnes

// Composants globaux
import ThemeToggle from './components/Kit/ThemeToggle';

function App() {
  return (
    <BrowserRouter>
      <RouteLayout>
        <Routes>
          {/* Redirection racine */}
          <Route path="/" element={<Navigate to="/getstarted" replace />} />

          {/* Routes publiques – pas d'auth requise */}
          <Route path="/getstarted" element={<GetStartedPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/email-confirmation" element={<EmailConfirmation />} />
          <Route path="/terms-of-use" element={<TermsOfUseComponent />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyComponent />} />
          <Route path="/cookie-policy" element={<CookiePolicyComponent />} />

          {/* Route protégée – auth vérifiée par RouteLayout + Layout principal (sidebar, etc.) */}
          <Route
            path="/home"
            element={
              <RouteLayout requireAuth={true}>
                <Layout>
                  <HomePage />
                </Layout>
              </RouteLayout>
            }
          />
          <Route
            path="/dashboard"
            element={
              <RouteLayout requireAuth={true} allowedRoles={['ADMIN']}>
                <Layout>
                  <Dashboard />
                </Layout>
              </RouteLayout>
            }
          />

          {/* 404 */}
          <Route path="*" element={<ErrorPage />} />
        </Routes>

        {/* Composants visibles sur toutes les pages */}
        <ThemeToggle />
        {/* Si tu veux d'autres composants globaux plus tard : */}
        {/* <BrowserTranslateToggle /> */}
        {/* <LanguageToggle /> */}
      </RouteLayout>
    </BrowserRouter>
  );
}

export default App;
