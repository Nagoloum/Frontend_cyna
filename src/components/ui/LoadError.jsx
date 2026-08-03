import { RefreshCw, WifiOff } from "lucide-react";
import { useTranslation } from "react-i18next";

/**
 * État d'erreur de chargement réutilisable pour les pages publiques.
 * Affiche un message générique traduit et, si onRetry est fourni, un bouton
 * pour relancer le chargement. Aucun détail technique n'est montré.
 */
export default function LoadError({ onRetry, className = "" }) {
  const { t } = useTranslation();
  return (
    <div
      role="alert"
      className={`rounded-2xl border border-dashed border-[var(--border)] p-6 sm:p-12 text-center ${className}`}
      style={{ background: "var(--bg-subtle)" }}
    >
      <WifiOff size={28} style={{ color: "var(--text-muted)", margin: "0 auto 10px" }} />
      <p className="text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>
        {t("errors.load_failed")}
      </p>
      <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
        {t("errors.load_failed_msg")}
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="btn-ghost gap-2 mt-4 py-2 px-4 text-sm inline-flex"
        >
          <RefreshCw size={14} />
          {t("errors.retry")}
        </button>
      )}
    </div>
  );
}
