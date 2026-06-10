import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, LogOut } from "lucide-react";
import { authAPI } from "@/services/api";

/**
 * Standalone logout screen: clears the session, shows a polished loading
 * state, then does a clean full reload to the homepage (so every
 * auth-dependent component resets).
 */
export default function Logout() {
  const { t } = useTranslation();

  useEffect(() => {
    authAPI.clearSession();
    const timer = setTimeout(() => {
      window.location.href = "/home";
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-7 p-6"
      style={{ background: "var(--bg-base)" }}
    >
      {/* Animated badge */}
      <div className="relative">
        <div
          className="w-20 h-20 rounded-3xl flex items-center justify-center shadow-[var(--shadow-lg)]"
          style={{ background: "linear-gradient(135deg, var(--accent), #a78bfa)" }}
        >
          <LogOut size={32} color="#fff" />
        </div>
        {/* Spinning ring */}
        <div
          className="absolute -inset-2 rounded-[28px] border-2 animate-spin"
          style={{
            borderColor: "transparent",
            borderTopColor: "var(--accent)",
            borderRightColor: "var(--accent)",
            animationDuration: "0.9s",
          }}
        />
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
