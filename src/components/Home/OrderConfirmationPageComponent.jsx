import { AlertCircle, ArrowRight, CheckCircle2, FileDown, Loader2, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { commandesAPI } from "@/services/api";

export default function OrderConfirmationPage() {
  const { t } = useTranslation();
  const location = useLocation();

  // Achat invité : le checkout transmet de quoi télécharger le reçu
  // (clés de licence + reçu de paiement), l'invité n'ayant pas d'espace client.
  const state = location.state ?? {};
  const isGuest = state.guest === true;
  const canDownload = isGuest && state.orderId && state.paymentIntentId;

  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState(false);

  const handleDownloadReceipt = async () => {
    if (!canDownload || downloading) return;
    setDownloading(true);
    setDownloadError(false);
    try {
      const blob = await commandesAPI.downloadGuestReceipt(
        state.orderId,
        state.paymentIntentId,
      );
      const url = URL.createObjectURL(new Blob([blob], { type: "application/pdf" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = `recu-${state.reference ?? state.orderId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      setDownloadError(true);
    }
    setDownloading(false);
  };

  return (
    <div className="page-enter cyna-container py-20 flex flex-col items-center text-center" style={{ minHeight: "70vh" }}>
      <div
        className="w-20 h-20 rounded-full flex items-center mt-20 justify-center mb-6 shadow-[var(--shadow-accent)]"
        style={{ background: "linear-gradient(135deg, var(--accent), #a78bfa)" }}
      >
        <CheckCircle2 size={36} color="#fff" />
      </div>

      <h1
        className="font-[Kumbh Sans] font-800 text-2xl sm:text-3xl mb-3"
        style={{ color: "var(--text-primary)" }}
      >
        {t("orderConfirmation.title")}
      </h1>

      <p
        className="text-base mb-2 max-w-md"
        style={{ color: "var(--text-secondary)", fontFamily: "'DM Sans',sans-serif" }}
      >
        {t("orderConfirmation.message")}
      </p>

      <p
        className="text-sm mb-4"
        style={{ color: "var(--text-muted)" }}
      >
        {t("orderConfirmation.activation")}
      </p>

      {isGuest && (
        <p className="text-sm mb-6 max-w-md" style={{ color: "var(--text-muted)" }}>
          {t("orderConfirmation.guest_receipt_note")}
        </p>
      )}

      {downloadError && (
        <p className="text-xs mb-4 flex items-center gap-1.5" style={{ color: "var(--danger)" }}>
          <AlertCircle size={14} /> {t("orderConfirmation.receipt_error")}
        </p>
      )}

      <div className="flex flex-col sm:flex-row gap-3 mb-20 lg:mb-0">
        {isGuest ? (
          canDownload && (
            <button
              type="button"
              onClick={handleDownloadReceipt}
              disabled={downloading}
              className="btn-primary gap-2 disabled:opacity-60"
            >
              {downloading ? <Loader2 size={16} className="animate-spin" /> : <FileDown size={16} />}
              {t("orderConfirmation.download_receipt")}
            </button>
          )
        ) : (
          <Link to="/account" className="btn-primary gap-2">
            <ShoppingBag size={16} /> {t("orderConfirmation.my_orders")}
          </Link>
        )}
        <Link to="/products" className="btn-ghost gap-2">
          <ArrowRight size={16} /> {t("orderConfirmation.continue")}
        </Link>
      </div>
    </div>
  );
}
