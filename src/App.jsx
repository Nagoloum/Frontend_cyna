import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";

// Layouts (eager : coquilles partagées, présentes sur quasi toutes les routes)
import AdminLayout from "./layouts/AdminLayout";
import Layout from "./layouts/Layout";
import RouteLayout from "./layouts/RouteLayout";

// Composants globaux (eager)
import ThemeToggle from "./components/Kit/ThemeToggle";
import PrivacyBanner from "./components/ui/PrivacyBanner";
import { NotifyProvider } from "./components/ui/feedback";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

// Pages (lazy : code-splitting par route → bundle initial réduit)
const CookiePolicyComponent = lazy(() => import("./components/Policy/CookiePolicyComponent"));
const PrivacyPolicyComponent = lazy(() => import("./components/Policy/PrivacyPolicyComponent"));
const TermsOfUseComponent = lazy(() => import("./components/Policy/TermOfUseComponent"));
const AboutComponent = lazy(() => import("./components/Policy/AboutComponent"));
const LegalNoticeComponent = lazy(() => import("./components/Policy/LegalNoticeComponent"));
const AuthPage = lazy(() => import("./pages/Auth/Auth"));
const EmailConfirmation = lazy(() => import("./pages/Auth/EmailConfirmation"));
const ForgotPassword = lazy(() => import("./pages/Auth/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/Auth/ResetPassword"));
const ErrorPage = lazy(() => import("./pages/ErrorPage"));
const AccountPage = lazy(() => import("./pages/User/AccountPage"));
const CartPage = lazy(() => import("./pages/User/CartPage"));
const CategoriesPage = lazy(() => import("./pages/User/CategoriesPage"));
const CategoryDetailPage = lazy(() => import("./pages/User/CategoryDetailPage"));
const CheckoutPage = lazy(() => import("./pages/User/CheckoutPage"));
const ContactPage = lazy(() => import("./pages/User/ContactPage"));
const HomePage = lazy(() => import("./pages/User/Home"));
const OrderConfirmationPage = lazy(() => import("./pages/User/OrderConfirmationPage"));
const ProductDetailPage = lazy(() => import("./pages/User/ProductDetailPage"));
const ProductsPage = lazy(() => import("./pages/User/ProductsPage"));
const SearchPage = lazy(() => import("./pages/User/SearchPage"));
const Dashboard = lazy(() => import("./pages/Admin/Dashboard"));
const MyProfile = lazy(() => import("./pages/Admin/MyProfilePage"));
const OrdersPage = lazy(() => import("./pages/Admin/OrdersPage"));
const UsersPage = lazy(() => import("./pages/Admin/UsersPage"));
const AuditPage = lazy(() => import("./pages/Admin/AuditPage"));
const PromotionsPage = lazy(() => import("./pages/Admin/PromotionsPage"));
const AdminProductsPage = lazy(() => import("./pages/Admin/ProductsPage"));
const Settings = lazy(() => import("./pages/Admin/SettingsPage"));
const Messages = lazy(() => import("./pages/Admin/MessagesPage"));
const TwoFactor = lazy(() => import("./pages/Auth/TwoFactor"));
const Logout = lazy(() => import("./pages/Auth/Logout"));

const PageLoader = () => (
  <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
    <div
      className="animate-spin"
      style={{ width: 28, height: 28, border: "3px solid var(--border)", borderTopColor: "var(--accent)", borderRadius: "50%" }}
    />
  </div>
);

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
        <Suspense fallback={<PageLoader />}>
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
            <Route path="promotions" element={<PromotionsPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="messages" element={<Messages />} />
            <Route path="audit" element={<AuditPage />} />
            <Route path="profile" element={<MyProfile />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<ErrorPage />} />
        </Routes>
        </Suspense>

        <AuthOnlyThemeToggle />
        <UserPagesCookieBanner />
        <Analytics />
        <SpeedInsights />
      </BrowserRouter>
    </NotifyProvider>
  );
}

export default App;
