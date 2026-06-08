import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Cookie, FileText, Shield } from "lucide-react";

const LEGAL_LINKS = [
  { to: "/terms-of-use", key: "legal.terms", icon: FileText },
  { to: "/privacy-policy", key: "legal.privacy", icon: Shield },
  { to: "/cookie-policy", key: "legal.cookies", icon: Cookie },
];

/**
 * Shared shell for the legal pages: the standard page header + an <aside> to
 * navigate between the legal pages. Pass the page content as children.
 */
export default function LegalLayout({ badge, title, subtitle, children }) {
  const { t } = useTranslation();

  return (
    <div className="page-enter" style={{ background: "var(--bg-base)", minHeight: "70vh" }}>
      {/* Standard header */}
      <div style={{ background: "var(--bg-subtle)", borderBottom: "1px solid var(--border)" }}>
        <div className="cyna-container py-10 sm:py-14">
          <p className="section-label">{badge}</p>
          <h1 className="section-title mb-2">{title}</h1>
          {subtitle && (
            <p
              className="text-sm max-w-xl"
              style={{ color: "var(--text-secondary)", fontFamily: "'Kumbh Sans', sans-serif" }}
            >
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Body: sidebar + content */}
      <div className="cyna-container py-10">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-60 flex-shrink-0">
            <nav className="lg:sticky lg:top-24 space-y-1">
              <p
                className="text-xs font-[Kumbh Sans] font-700 uppercase tracking-wider mb-3 px-3"
                style={{ color: "var(--text-muted)" }}
              >
                {t("legal.title")}
              </p>
              {LEGAL_LINKS.map((link) => {
                const Icon = link.icon;
                return (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? "bg-[var(--accent)] text-white"
                          : "text-[var(--text-secondary)] hover:bg-[var(--bg-muted)] hover:text-[var(--text-primary)]"
                      }`
                    }
                  >
                    <Icon size={15} /> {t(link.key)}
                  </NavLink>
                );
              })}
            </nav>
          </aside>

          <div className="flex-1 min-w-0">{children}</div>
        </div>
      </div>
    </div>
  );
}
