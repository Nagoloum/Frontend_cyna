import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";

// Layouts
import AdminLayout from "./layouts/AdminLayout";
import Layout from "./layouts/Layout";
import RouteLayout from "./layouts/RouteLayout";

// Pages publiques
import CookiePolicyComponent from "./components/Policy/CookiePolicyComponent";
import PrivacyPolicyComponent from "./components/Policy/PrivacyPolicyComponent";
import TermsOfUseComponent from "./components/Policy/TermOfUseComponent";
import AboutComponent from "./components/Policy/AboutComponent";
import LegalNoticeComponent from "./components/Policy/LegalNoticeComponent";
import AuthPage from "./pages/Auth/Auth";
import EmailConfirmation from "./pages/Auth/EmailConfirmation";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import ResetPassword from "./pages/Auth/ResetPassword";
import ErrorPage from "./pages/ErrorPage";

// Pages utilisateur
import AccountPage from "./pages/User/AccountPage";
import CartPage from "./pages/User/CartPage";
import CategoriesPage from "./pages/User/CategoriesPage";
import CategoryDetailPage from "./pages/User/CategoryDetailPage";
import CheckoutPage from "./pages/User/CheckoutPage";
import ContactPage from "./pages/User/ContactPage";
import HomePage from "./pages/User/Home";
import OrderConfirmationPage from "./pages/User/OrderConfirmationPage";
import ProductDetailPage from "./pages/User/ProductDetailPage";
import ProductsPage from "./pages/User/ProductsPage";
import SearchPage from "./pages/User/SearchPage";

// Pages admin
import Dashboard from "./pages/Admin/Dashboard";
import MyProfile from "./pages/Admin/MyProfilePage";
import OrdersPage from "./pages/Admin/OrdersPage";
import UsersPage from "./pages/Admin/UsersPage";
import AuditPage from "./pages/Admin/AuditPage";
import AdminProductsPage from "./pages/Admin/ProductsPage";
import Settings from "./pages/Admin/SettingsPage";
import Messages from "./pages/Admin/MessagesPage";

// Auth admin-only 2FA verification step
import TwoFactor from "./pages/Auth/TwoFactor";
import Logout from "./pages/Auth/Logout";

// Composants globaux
import ThemeToggle from "./components/Kit/ThemeToggle";
import PrivacyBanner from "./components/ui/PrivacyBanner";
import { NotifyProvider } from "./components/ui/feedback";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

const PublicPage = ({ children }) => (
  <Layout>{children}</Layout>
);

// Bandeau cookies : pages utilisateur uniquement (jamais sur l'admin).
// Inclut les pages d'auth pour que l'utilisateur puisse accepter avant de se
// connecter (la connexion nécessite le stockage de session).
const UserPagesCookieBanner = () => {
  const { pathname } = useLocation();
  if (pathname.startsWith('/admin')) return null;
  return <PrivacyBanner />;
};

const AUTH_PATHS = ['/auth', '/forgot-password', '/reset-password', '/email-confirmation', '/2FA'];
const AuthOnlyThemeToggle = () => {
  const { pathname } = useLocation();
  const onAuthPage = AUTH_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  if (!onAuthPage) return null;
  return <ThemeToggle variant="fixed" />;
};

function App() {
  return (
    // NotifyProvider reads from Redux and renders toast/confirm portals into <body>
    <NotifyProvider>
      <BrowserRouter>
        <Routes>
          {/* Redirect racine */}
          <Route path="/" element={<Navigate to="/home" replace />} />

          {/* ── Routes publiques (avec layout Navbar+Footer) ── */}
          <Route path="/home" element={<PublicPage><HomePage /></PublicPage>} />
          <Route path="/categories" element={<PublicPage><CategoriesPage /></PublicPage>} />
          <Route path="/categories/:slug" element={<PublicPage><CategoryDetailPage /></PublicPage>} />
          <Route path="/products" element={<PublicPage><ProductsPage /></PublicPage>} />
          <Route path="/products/:slug" element={<PublicPage><ProductDetailPage /></PublicPage>} />
          <Route path="/cart" element={<PublicPage><CartPage /></PublicPage>} />
          <Route path="/search" element={<PublicPage><SearchPage /></PublicPage>} />
          <Route path="/contact" element={<PublicPage><ContactPage /></PublicPage>} />

          {/* ── Checkout : accessible aux invités (achat invité) comme aux
               utilisateurs connectés. Le composant gère les deux flux. ── */}
          <Route path="/checkout" element={<PublicPage><CheckoutPage /></PublicPage>} />
          <Route path="/checkout/confirmation" element={<PublicPage><OrderConfirmationPage /></PublicPage>} />

          {/* ── Routes privées utilisateur ── */}
          <Route path="/account" element={
            <RouteLayout requireAuth redirectTo="/auth">
              <PublicPage><AccountPage /></PublicPage>
            </RouteLayout>
          } />
          <Route path="/compte" element={<Navigate to="/account" replace />} />

          {/* ── Auth ── */}
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/email-confirmation" element={<EmailConfirmation />} />
          <Route path="/2FA" element={<TwoFactor />} />
          <Route path="/logout" element={<Logout />} />

          {/* ── Pages légales ── */}
          <Route path="/terms-of-use" element={<PublicPage><TermsOfUseComponent /></PublicPage>} />
          <Route path="/privacy-policy" element={<PublicPage><PrivacyPolicyComponent /></PublicPage>} />
          <Route path="/cookie-policy" element={<PublicPage><CookiePolicyComponent /></PublicPage>} />
          <Route path="/about" element={<PublicPage><AboutComponent /></PublicPage>} />
          <Route path="/legal" element={<PublicPage><LegalNoticeComponent /></PublicPage>} />

          {/* ── Admin (rôle ADMIN obligatoire) ── */}
          <Route
            path="/admin"
            element={
              <RouteLayout requireAuth allowedRoles={["ADMIN"]}>
                <AdminLayout />
              </RouteLayout>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="products" element={<AdminProductsPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="messages" element={<Messages />} />
            <Route path="audit" element={<AuditPage />} />
            <Route path="profile" element={<MyProfile />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<ErrorPage />} />
        </Routes>

        <AuthOnlyThemeToggle />
        <UserPagesCookieBanner />
        <Analytics />
        <SpeedInsights />
      </BrowserRouter>
    </NotifyProvider>
  );
}

export default App;
