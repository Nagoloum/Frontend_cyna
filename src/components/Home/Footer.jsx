import { Github, Linkedin, Mail, Shield, Twitter } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { openCookieBanner } from "@/lib/cookieConsent";

const CynaLogo = () => (
  <svg
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ width: 28, height: 28 }}
  >
    <path
      d="M16.87 0C17.51.10 18.17.15 18.81.29 24.82 1.55 28.82 5.06 30.91 10.64c.28.78.41 1.61.58 2.43.09.43 0 .51-.46.51-1.33 0-2.66.08-3.98-.02-3-.24-5.88-.92-8.52-2.41-1.69-.96-3.4-.99-5.1.0-1.79 1.03-2.90 2.47-2.88 4.56 0 .37.09.77.21 1.11.73 1.71 1.84 3.07 3.74 3.64 1.51.44 2.94.12 4.28-.59 2.0-.95 4.1-1.71 6.35-1.95 1.79-.19 3.6-.24 5.4-.31.74-.03.97.26.91 1.0-.21 2.45-1.23 4.58-2.84 6.45-2.34 2.72-5.2 4.70-8.8 5.58-3.33.80-6.66.84-9.84-.52C5.34 28.04 1.96 24.79.63 19.98-1.80 11.11 3.04 3.48 10.79.90c1.4-.47 2.86-.73 4.34-.83.10.0.20-.03.31-.07H16.87z"
      fill="url(#g)"
    />
    <defs>
      <linearGradient
        id="g"
        x1="0"
        y1="16"
        x2="32"
        y2="16"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#7c3aed" />
        <stop offset="1" stopColor="#a78bfa" />
      </linearGradient>
    </defs>
  </svg>
);

export default function Footer() {
  const { t } = useTranslation();

  const links = {
    [t("footer.solutions")]: [
      { label: t("footer.links.soc"), href: "/categories" },
      { label: t("footer.links.edr"), href: "/categories" },
      { label: t("footer.links.xdr"), href: "/categories" },
      { label: t("footer.links.all_products"), href: "/products" },
    ],
    [t("footer.company")]: [
      { label: t("footer.links.about"), href: "/about" },
      { label: t("footer.links.blog"), href: "/blog" },
      { label: t("footer.links.contact"), href: "/contact" },
      { label: t("footer.links.support"), href: "/contact" },
    ],
    [t("footer.legal")]: [
      { label: t("footer.links.terms"), href: "/terms-of-use" },
      { label: t("footer.links.privacy"), href: "/privacy-policy" },
      { label: t("footer.links.cookies"), href: "/cookie-policy" },
      // Rouvre le bandeau de consentement (promis par la politique de cookies).
      { label: t("footer.links.cookie_prefs"), onClick: openCookieBanner },
      { label: t("footer.links.legal"), href: "/legal" },
    ],
  };

  return (
    <footer
      style={{
        background: "var(--bg-card)",
        borderTop: "1px solid var(--border)",
      }}
      className="lg:pt-0 pt-12"
    >
      {/* Main */}
      <div className="cyna-container py-12 sm:py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            
            <Link
              to="/home"
              className="flex items-center gap-2.5 shrink-0 mr-2 mb-4"
            >
              <img
                src="/logo.png"
                alt="Cyna"
                className="h-8 w-auto object-contain"
              />
              <span
                className="hidden sm:block font-[Kumbh Sans] font-800 font-bold text-lg tracking-tight"
                style={{ color: "var(--text-primary)" }}
              >
                Cyna
              </span>
            </Link>
            <p
              className="text-sm leading-relaxed mb-5"
              style={{
                color: "var(--text-secondary)",
                fontFamily: "'Kumbh Sans', sans-serif",
              }}
            >
              {t("footer.brand_description")}
            </p>
            {/* Socials */}
            <div className="flex items-center gap-2">
              {[
                { icon: Twitter, href: "#", label: "Twitter" },
                { icon: Linkedin, href: "#", label: "LinkedIn" },
                { icon: Github, href: "#", label: "GitHub" },
                { icon: Mail, href: "#", label: "Email" },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl flex items-center justify-center border border-[var(--text-muted)] transition-all hover:border-[var(--accent)] hover:text-[var(--accent)] hover:bg-[var(--accent-light)]"
                  style={{ color: "var(--text-muted)" }}
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([title, items]) => (
            <div key={title}>
              <h4
                className="font-[Kumbh Sans] font-700 text-sm mb-4 uppercase tracking-wide"
                style={{ color: "var(--text-primary)" }}
              >
                {title}
              </h4>
              <ul className="space-y-2.5">
                {items.map((item) => (
                  <li key={item.label}>
                    {item.onClick ? (
                      <button
                        type="button"
                        onClick={item.onClick}
                        className="text-sm hover:text-purple-900 hover:underline hover:underline-offset-4 hover:pl-0.5 transition-all"
                        style={{
                          color: "var(--text-secondary)",
                          fontFamily: "'Kumbh Sans', sans-serif",
                        }}
                      >
                        {item.label}
                      </button>
                    ) : (
                      <Link
                        to={item.href}
                        className="text-sm hover:text-purple-900 hover:underline hover:underline-offset-4 hover:pl-0.5 transition-all"
                        style={{
                          color: "var(--text-secondary)",
                          fontFamily: "'Kumbh Sans', sans-serif",
                        }}
                      >
                        {item.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[var(--border)] lg:py-5">
        <div className="cyna-container py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p
            className="text-xs"
            style={{
              color: "var(--text-muted)",
              fontFamily: "'Kumbh Sans', sans-serif",
            }}
          >
            © {new Date().getFullYear()} Cyna-IT 10 Rue de Penthièvre, 75008
            Paris
          </p>
          <div className="flex items-center gap-1.5">
            <Shield size={12} style={{ color: "var(--success)" }} />
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
              {t("footer.ssl")}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
