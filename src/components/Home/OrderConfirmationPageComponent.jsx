import { ArrowRight, CheckCircle2, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function OrderConfirmationPage() {
  const { t } = useTranslation();
  return (
    <div className="page-enter cyna-container py-20 flex flex-col items-center text-center" style={{ minHeight: "70vh" }}>
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-[var(--shadow-accent)]"
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
        className="text-sm mb-10"
        style={{ color: "var(--text-muted)" }}
      >
        {t("orderConfirmation.activation")}
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link to="/account" className="btn-primary gap-2">
          <ShoppingBag size={16} /> {t("orderConfirmation.my_orders")}
        </Link>
        <Link to="/products" className="btn-ghost gap-2">
          <ArrowRight size={16} /> {t("orderConfirmation.continue")}
        </Link>
      </div>
    </div>
  );
}
