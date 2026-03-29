import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Search, ShoppingBag, User, Menu, X, LogOut, Shield, ChevronRight } from "lucide-react";

const getUser = () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;
    return JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
  } catch { return null; }
};

const NavLink = ({ to, children, active }) => (
  <Link
    to={to}
    className={`relative px-3 py-2 text-sm font-semibold font-[Poppins] transition-colors duration-200 ${
      active
        ? "text-[var(--accent)]"
        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
    }`}
  >
    {children}
    {active && (
      <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-[var(--accent)] rounded-full" />
    )}
  </Link>
);

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const user = getUser();
  const isLoggedIn = !!user;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/home");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/search?q=${encodeURIComponent(search.trim())}`);
  };

  const navLinks = [
    { to: "/home", label: "Home" },
    { to: "/categories", label: "Solutions" },
    { to: "/products", label: "Products" },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled
            ? "bg-[var(--bg-card)] border-b border-[var(--border)] shadow-[var(--shadow-md)]"
            : "bg-[var(--bg-base)] border-b border-[var(--border)]"
        }`}
        style={{ height: "var(--navbar-h)" }}
      >
        <div className="cyna-container h-full flex items-center gap-3">
          {/* Logo */}
          <Link to="/home" className="flex items-center gap-2.5 shrink-0 mr-2">
            <img src="/logo.png" alt="Cyna" className="h-8 w-auto object-contain" />
            <span
              className="hidden sm:block font-[Syne] font-800 text-lg tracking-tight"
              style={{ color: "var(--text-primary)" }}
            >
              Cyna
            </span>
            <span className="badge badge-accent text-[10px] hidden sm:inline-flex">Security</span>
          </Link>

          {/* Nav links desktop */}
          <nav className="hidden lg:flex items-center gap-1 shrink-0">
            {navLinks.map((l) => (
              <NavLink key={l.to} to={l.to} active={location.pathname === l.to}>
                {l.label}
              </NavLink>
            ))}
          </nav>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 max-w-md mx-auto hidden sm:flex relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search for a solution..."
              className="w-full pl-4 pr-10 h-10 rounded-full border border-[var(--border)] bg-[var(--bg-subtle)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] focus:bg-[var(--bg-card)] transition-all"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            />
            <button
              type="submit"
              className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
              style={{ background: "var(--accent)", color: "#fff" }}
            >
              <Search size={14} />
            </button>
          </form>

          {/* Actions */}
          <div className="flex items-center gap-1 ml-auto lg:ml-0 shrink-0">
            {isLoggedIn ? (
              <>
                <Link
                  to={user?.role === "ADMIN" ? "/admin/dashboard" : "/account"}
                  className="p-2.5 rounded-xl transition-colors hover:bg-[var(--bg-muted)]"
                  style={{ color: "var(--text-secondary)" }}
                  title="My Account"
                >
                  <User size={20} strokeWidth={1.75} />
                </Link>
                <Link
                  to="/cart"
                  className="relative p-2.5 rounded-xl transition-colors hover:bg-[var(--bg-muted)]"
                  style={{ color: "var(--text-secondary)" }}
                >
                  <ShoppingBag size={20} strokeWidth={1.75} />
                </Link>
                <button
                  onClick={handleLogout}
                  className="hidden sm:flex p-2.5 rounded-xl transition-colors hover:bg-red-50 dark:hover:bg-red-500/10"
                  style={{ color: "var(--text-muted)" }}
                  title="Logout"
                >
                  <LogOut size={20} strokeWidth={1.75} />
                </button>
              </>
            ) : (
              <>
                <Link to="/auth" className="btn-ghost hidden sm:inline-flex py-2 px-4 text-sm">
                  Sign In
                </Link>
                <Link to="/auth" className="btn-primary py-2 px-4 text-sm">
                  Sign Up
                </Link>
              </>
            )}

            {/* Burger */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="lg:hidden p-2.5 rounded-xl ml-1 transition-colors hover:bg-[var(--bg-muted)]"
              style={{ color: "var(--text-primary)" }}
              aria-label="Menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>

      {/* Spacer */}
      <div style={{ height: "var(--navbar-h)" }} />

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <nav
            className="absolute top-[var(--navbar-h)] left-0 right-0 border-b border-[var(--border)] shadow-[var(--shadow-lg)]"
            style={{ background: "var(--bg-card)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile search */}
            <div className="p-4 border-b border-[var(--border)]">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search..."
                  className="w-full pl-4 pr-10 h-11 rounded-full border border-[var(--border)] bg-[var(--bg-subtle)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-all"
                />
                <button
                  type="submit"
                  className="absolute right-1 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center"
                  style={{ background: "var(--accent)", color: "#fff" }}
                >
                  <Search size={14} />
                </button>
              </form>
            </div>

            {/* Nav links */}
            <div className="py-2">
              {navLinks.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  className="flex items-center justify-between px-5 py-3.5 text-sm font-semibold font-[Syne] transition-colors hover:bg-[var(--bg-subtle)]"
                  style={{
                    color: location.pathname === l.to ? "var(--accent)" : "var(--text-primary)",
                  }}
                >
                  {l.label}
                  <ChevronRight size={16} style={{ color: "var(--text-muted)" }} />
                </Link>
              ))}
            </div>

            {/* Auth section */}
            <div className="border-t border-[var(--border)] p-4">
              {isLoggedIn ? (
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center font-[Syne] font-bold text-sm text-white"
                    style={{ background: "var(--accent)" }}
                  >
                    {user?.email?.[0]?.toUpperCase() || "U"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                      {user?.email}
                    </p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {user?.role}
                    </p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-lg transition-colors"
                    style={{ color: "var(--danger)" }}
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Link to="/auth" className="btn-ghost py-2.5 text-sm justify-center">
                    Sign In
                  </Link>
                  <Link to="/auth" className="btn-primary py-2.5 text-sm justify-center">
                    Sign Up
                  </Link>
                </div>
              )}
            </div>

            {/* Footer links */}
            <div
              className="px-5 py-4 border-t border-[var(--border)] flex flex-wrap gap-x-5 gap-y-2"
              style={{ background: "var(--bg-subtle)" }}
            >
              {["Terms of Use", "Legal Notice", "Contact", "About"].map((l) => (
                <span key={l} className="text-xs cursor-pointer" style={{ color: "var(--text-muted)" }}>
                  {l}
                </span>
              ))}
            </div>
          </nav>
        </div>
      )}
    </>
  );
}