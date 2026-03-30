import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Layouts
import Layout from "./layouts/Layout";
import RouteLayout from "./layouts/RouteLayout";
import AdminLayout from "./layouts/AdminLayout";

// Pages publiques
import AuthPage from "./pages/Auth/Auth";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import ResetPassword from "./pages/Auth/ResetPassword";
import EmailConfirmation from "./pages/Auth/EmailConfirmation";
import TermsOfUseComponent from "./components/Policy/TermOfUseComponent";
import PrivacyPolicyComponent from "./components/Policy/PrivacyPolicyComponent";
import CookiePolicyComponent from "./components/Policy/CookiePolicyComponent";
import ErrorPage from "./pages/ErrorPage";

// Pages utilisateur
import HomePage from "./pages/User/Home";
import CategoriesPage from "./pages/User/CategoriesPage";
import CategoryDetailPage from "./pages/User/CategoryDetailPage";
import ProductsPage from "./pages/User/ProductsPage";
import ProductDetailPage from "./pages/User/ProductDetailPage";
import CartPage from "./pages/User/CartPage";
import CheckoutPage from "./pages/User/CheckoutPage";
import OrderConfirmationPage from "./pages/User/OrderConfirmationPage";
import SearchPage from "./pages/User/SearchPage";
import AccountPage from "./pages/User/AccountPage";

// Pages admin
import Dashboard from "./pages/Admin/Dashboard";
import AdminProductsPage from "./pages/Admin/ProductsPage";
// import OrdersPage from "./pages/Admin/OrdersPage";
// import SupportPage from "./pages/Admin/SupportPage";
// import ReportsPage from "./pages/Admin/ReportsPage";
import MyProfile from "./pages/Admin/MyProfilePage";
import Settings from "./pages/Admin/SettingsPage";

// Composants globaux
import ThemeToggle from "./components/Kit/ThemeToggle";

// Wrapper avec Navbar + Footer
const PublicPage = ({ children }) => (
  <Layout>{children}</Layout>
);

function App() {
  return (
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

        {/* ── Routes privées utilisateur ── */}
        <Route path="/checkout" element={
          <RouteLayout requireAuth redirectTo="/auth">
            <PublicPage><CheckoutPage /></PublicPage>
          </RouteLayout>
        } />
        <Route path="/checkout/confirmation" element={
          <RouteLayout requireAuth redirectTo="/auth">
            <PublicPage><OrderConfirmationPage /></PublicPage>
          </RouteLayout>
        } />
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

        {/* ── Pages légales ── */}
        <Route path="/terms-of-use" element={<PublicPage><TermsOfUseComponent /></PublicPage>} />
        <Route path="/privacy-policy" element={<PublicPage><PrivacyPolicyComponent /></PublicPage>} />
        <Route path="/cookie-policy" element={<PublicPage><CookiePolicyComponent /></PublicPage>} />

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
          {/* <Route path="orders" element={<OrdersPage />} /> */}
          {/* <Route path="support" element={<SupportPage />} /> */}
          {/* <Route path="reports" element={<ReportsPage />} /> */}
          <Route path="profile" element={<MyProfile />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<ErrorPage />} />
      </Routes>

      <ThemeToggle />
    </BrowserRouter>
  );
}

export default App;