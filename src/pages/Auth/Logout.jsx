import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Loader2, LogOut } from "lucide-react";
import { authAPI } from "@/services/api";

/**
 * Standalone logout screen: clears the session, shows a polished loading
 * state, then does a clean full reload (so every auth-dependent component
 * resets). Destination configurable via `?to=` (chemin interne uniquement) :
 * `/home` par défaut, `/auth` pour la déconnexion admin.
 */
export default function Logout() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();

  const requested = searchParams.get("to") || "/home";
  const target =
    requested.startsWith("/") && !requested.startsWith("//")
      ? requested
      : "/home";

  useEffect(() => {
    authAPI.clearSession();
    const timer = setTimeout(() => {
      window.location.href = target;
    }, 1500);
    return () => clearTimeout(timer);
  }, [target]);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-7 p-6"
      style={{ background: "var(--bg-base)" }}
    >
      {/* Circular spinner + badge */}
      <div className="relative w-24 h-24 flex items-center justify-center">
        {/* Spinning ring (perfect circle) */}
        <div
          className="absolute inset-0 rounded-full border-4 animate-spin"
          style={{
            borderColor: "var(--bg-muted)",
            borderTopColor: "var(--accent)",
            animationDuration: "0.8s",
          }}
        />
        {/* Round gradient badge */}
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center shadow-[var(--shadow-md)]"
          style={{ background: "linear-gradient(135deg, var(--accent), #a78bfa)" }}
        >
          <LogOut size={26} color="#fff" />
        </div>
      </div>

      {/* Text */}
      <div className="text-center">
        <h1
          className="font-[Kumbh Sans] font-800 text-xl sm:text-2xl mb-1.5"
          style={{ color: "var(--text-primary)" }}
        >
          {t("logout.title")}
        </h1>
        <p
          className="text-sm inline-flex items-center gap-2"
          style={{ color: "var(--text-muted)", fontFamily: "'Kumbh Sans', sans-serif" }}
        >
          <Loader2 size={14} className="animate-spin" /> {t("logout.subtitle")}
        </p>
      </div>

      {/* Progress bar */}
      <div className="w-52 h-1 rounded-full overflow-hidden" style={{ background: "var(--bg-muted)" }}>
        <div
          className="h-full rounded-full logout-bar"
          style={{ background: "linear-gradient(90deg, var(--accent), #a78bfa)" }}
        />
      </div>
    </div>
  );
}
