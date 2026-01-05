// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Pages publiques
import GetStartedPage from './pages/GetStarted';
import AuthPage from './pages/Auth';
import ForgotPassword from './pages/ForgotPassword';
import VerificationCode from './pages/VerificationCode';
import ResetPassword from './pages/ResetPassword';
import TermsOfUseComponent from './components/TermOfUseComponent';
import PrivacyPolicyComponent from './components/PrivacyPolicyComponent';
import ErrorPage from './pages/ErrorPage';

// Pages privées
import HomePage from './pages/Home';

// Layouts
import RouteLayout from './layouts/RouteLayout';     // Gère loader + auth + transitions
import Layout from './components/Layout';             // Sidebar + NewTaskFloating + structure 3 colonnes

// Composants globaux
import ThemeToggle from './components/ThemeToggle';

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
          <Route path="/verification-code" element={<VerificationCode />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/terms-of-use" element={<TermsOfUseComponent />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyComponent />} />

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