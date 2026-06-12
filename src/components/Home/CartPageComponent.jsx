import { buildImageUrl, couponsAPI } from "@/services/api";
import {
  AlertCircle, ArrowRight, LogIn, Minus, Package,
  Plus, ShoppingBag, Trash2, Tag, X, Loader2,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { updateCartItem, removeCartItem } from "@/store/slices/cartSlice";
import { computeTotals, TVA_PERCENT } from "@/lib/pricing";
import { getAppliedCoupon, setAppliedCoupon } from "@/lib/coupon";
import { useTranslation } from "react-i18next";

const getUser = () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;
    return JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
  } catch { return null; }
};

const fmtEur = (n) =>
  Number(n ?? 0).toLocaleString("fr-FR", { minimumFractionDigits: 2 }) + " €";

function CartItem({ item, onUpdate, onRemove }) {
  const { t } = useTranslation();
  const img    = buildImageUrl(item.images?.[0]?.path ?? item.images?.[0]);
  const isOut  = item.stock === 0;
  const isYear = item.billingPeriod === "yearly";
  const price  = isYear ? item.priceYear : item.priceMonth;
  const qty    = item.qty || 1;

  return (
    <div
      className={`cyna-card p-4 sm:p-5 ${isOut ? "opacity-70" : ""}`}
      style={isOut ? { borderColor: "var(--danger)" } : undefined}
    >
      <div className="flex gap-4">
        <div
          className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden flex-shrink-0 border border-[var(--border)]"
          style={{ background: "var(--bg-muted)" }}
        >
          {img ? (
            <img src={img} alt={item.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package size={24} style={{ color: "var(--text-muted)" }} />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0 flex flex-col">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3
                className="font-[Kumbh Sans] font-700 text-sm sm:text-base line-clamp-2"
                style={{ color: "var(--text-primary)" }}
              >
                {item.name}
              </h3>
              {item.service?.name && (
                <p className="text-xs mt-0.5 truncate" style={{ color: "var(--text-muted)" }}>
                  {item.service.name}
                </p>
              )}
              {isOut && (
                <p
                  className="text-xs mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full"
                  style={{ background: "rgba(239,68,68,.1)", color: "var(--danger)" }}
                >
                  <AlertCircle size={11} /> {t("cart.service_unavailable")}
                </p>
              )}
            </div>
            <button
              onClick={() => onRemove(item._id, item.billingPeriod)}
              aria-label={t("cart.remove_item")}
              className="p-1.5 rounded-lg transition-colors hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 flex-shrink-0"
              style={{ color: "var(--text-muted)" }}
            >
              <Trash2 size={15} />
            </button>
          </div>

          <div className="flex items-end justify-between gap-3 mt-3 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Billing toggle */}
              <div
                className="inline-flex rounded-lg overflow-hidden text-xs"
                style={{ border: "1px solid var(--border)", background: "var(--bg-subtle)" }}
              >
                {[
                  { v: "monthly", l: t("cart.billing_monthly") },
                  { v: "yearly",  l: t("cart.billing_yearly")  },
                ].map(({ v, l }) => {
                  const active = item.billingPeriod === v;
                  return (
                    <button
                      key={v}
                      onClick={() => onUpdate(item._id, item.billingPeriod, { billingPeriod: v })}
                      className="px-3 py-1.5 font-[Kumbh Sans] font-600 transition-all"
                      style={{
                        background: active ? "var(--accent)" : "transparent",
                        color: active ? "#fff" : "var(--text-muted)",
                      }}
                    >
                      {l}
                    </button>
                  );
                })}
              </div>

              {/* Quantity stepper */}
              <div
                className="inline-flex items-center rounded-lg overflow-hidden text-xs"
                style={{ border: "1px solid var(--border)", background: "var(--bg-subtle)" }}
              >
                <button
                  onClick={() => onUpdate(item._id, item.billingPeriod, { qty: Math.max(1, qty - 1) })}
                  disabled={qty <= 1}
                  aria-label={t("cart.decrease_qty")}
                  className="w-8 h-8 flex items-center justify-center transition-colors hover:bg-[var(--bg-muted)] disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ color: "var(--text-secondary)" }}
                >
                  <Minus size={12} />
                </button>
                <span
                  className="w-8 text-center font-[Kumbh Sans] font-700 tabular-nums"
                  style={{ color: "var(--text-primary)" }}
                >
                  {qty}
                </span>
                <button
                  onClick={() => onUpdate(item._id, item.billingPeriod, { qty: qty + 1 })}
                  aria-label={t("cart.increase_qty")}
                  className="w-8 h-8 flex items-center justify-center transition-colors hover:bg-[var(--bg-muted)]"
                  style={{ color: "var(--text-secondary)" }}
                >
                  <Plus size={12} />
                </button>
              </div>
            </div>

            {price != null && (
              <div className="text-right">
                <p
                  className="font-[Kumbh Sans] font-800 text-base sm:text-lg leading-none"
                  style={{ color: "var(--accent)" }}
                >
                  {fmtEur(Number(price) * qty)}
                </p>
                <p className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>
                  {fmtEur(price)} / {isYear ? t("cart.per_year") : t("cart.per_month")}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CartPage() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const cart     = useAppSelector((s) => s.cart.items);
  const navigate = useNavigate();
  const user     = getUser();

  const handleUpdate = (id, billingPeriod, patch) => {
    dispatch(updateCartItem({ id, billingPeriod, patch }));
  };

  const handleRemove = (id, billingPeriod) => {
    dispatch(removeCartItem({ id, billingPeriod }));
  };

  const itemCount = cart.reduce((s, i) => s + (Number(i.qty) || 1), 0);
  const total = cart.reduce((sum, i) => {
    const p = i.billingPeriod === "monthly" ? i.priceMonth : i.priceYear;
    return sum + (Number(p) || 0) * (i.qty || 1);
  }, 0);
  // ── Code promo ────────────────────────────────────────────────────────────
  const [coupon, setCoupon] = useState(() => getAppliedCoupon());
  const [couponInput, setCouponInput] = useState("");
  const [couponMsg, setCouponMsg] = useState("");
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  const applyCoupon = async () => {
    const code = couponInput.trim();
    if (!code || applyingCoupon) return;
    setApplyingCoupon(true);
    setCouponMsg("");
    try {
      const res = await couponsAPI.validate(code, total);
      const body = res.data;
      if (body?.success && body?.data?.valid) {
        const applied = { code: body.data.code, discount: Number(body.data.discount) || 0 };
        setCoupon(applied);
        setAppliedCoupon(applied);
        setCouponInput("");
      } else {
        setCouponMsg(body?.message || t("cart.coupon_invalid"));
      }
    } catch (err) {
      setCouponMsg(err.response?.data?.message || t("cart.coupon_invalid"));
    } finally {
      setApplyingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
    setAppliedCoupon(null);
    setCouponMsg("");
  };

  // Decomposition TVA + remise pour l'affichage (le serveur recalcule a la commande).
  const { tva, ttc, discount } = computeTotals(total, coupon?.discount || 0);
  const hasUnavailable = cart.some(i => i.stock === 0);

  return (
    <div className="page-enter" style={{ background: "var(--bg-base)", minHeight: "70vh" }}>

      {/* Hero header */}
      <div style={{ background: "var(--bg-subtle)", borderBottom: "1px solid var(--border)" }}>
        <div className="cyna-container py-10 sm:py-14">
          <p className="section-label">{t("cart.badge")}</p>
          <h1 className="section-title mb-2">{t("cart.title")}</h1>
          <p
            className="text-sm max-w-xl lg:mb-0 mb-6"
            style={{ color: "var(--text-secondary)", fontFamily: "'Kumbh Sans', sans-serif" }}
          >
            {cart.length === 0
              ? t("cart.empty_subtitle")
              : t(itemCount > 1 ? "cart.subtitle_plural" : "cart.subtitle", { count: itemCount })}
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="cyna-container py-10 ">
        {cart.length === 0 ? (
          <div
            className="rounded-2xl border mb-10 mt-10 border-dashed border-[var(--border)] p-10 sm:p-16 text-center max-w-lg mx-auto"
            style={{ background: "var(--bg-subtle)" }}
          >
            <div
              className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
            >
              <ShoppingBag size={28} style={{ color: "var(--text-muted)" }} />
            </div>
            <p className="font-[Kumbh Sans] font-700 text-lg mb-2" style={{ color: "var(--text-primary)" }}>
              {t("cart.empty_title")}
            </p>
            <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
              {t("cart.empty_desc")}
            </p>
            <Link to="/products" className="btn-primary gap-2 inline-flex">
              {t("cart.browse")} <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mt-10 mb-10">

            {/* Items column */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h2
                  className="font-[Kumbh Sans] font-700 text-sm uppercase tracking-wider"
                  style={{ color: "var(--text-muted)" }}
                >
                  {t("cart.items_header", { count: itemCount })}
                </h2>

              </div>

              <div className="space-y-3">
                {cart.map((item, i) => (
                  <CartItem
                    key={`${item._id}-${item.billingPeriod}-${i}`}
                    item={item}
                    onUpdate={handleUpdate}
                    onRemove={handleRemove}
                  />
                ))}
              </div>
            </div>

            {/* Summary column */}
            <div className="lg:col-span-1">
              <div className="cyna-card p-6 lg:sticky lg:top-24">
                <h2
                  className="font-[Kumbh Sans] font-700 text-sm uppercase tracking-wider mb-4"
                  style={{ color: "var(--text-muted)" }}
                >
                  {t("cart.order_summary")}
                </h2>

                {/* Line items */}
                <div className="space-y-2.5 mb-4 pb-4" style={{ borderBottom: "1px solid var(--border)" }}>
                  {cart.map((item, i) => {
                    const p = item.billingPeriod === "monthly" ? item.priceMonth : item.priceYear;
                    return (
                      <div key={i} className="flex justify-between gap-2 text-xs">
                        <span className="line-clamp-1 flex-1" style={{ color: "var(--text-secondary)" }}>
                          {item.name} ×{item.qty || 1}
                          <span className="block text-[10px]" style={{ color: "var(--text-muted)" }}>
                            {item.billingPeriod === "monthly" ? t("cart.billing_monthly") : t("cart.billing_yearly")}
                          </span>
                        </span>
                        <span
                          className="font-[Kumbh Sans] font-600 flex-shrink-0"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {fmtEur(Number(p ?? 0) * (item.qty || 1))}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Code promo */}
                <div className="mb-4">
                  {coupon ? (
                    <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl text-xs"
                      style={{ background: "rgba(34,197,94,.08)", border: "1px solid rgba(34,197,94,.25)" }}>
                      <span className="inline-flex items-center gap-1.5 font-medium" style={{ color: "var(--text-primary)" }}>
                        <Tag size={13} /> {coupon.code}
                      </span>
                      <button type="button" onClick={removeCoupon} aria-label={t("cart.coupon_remove")}
                        className="inline-flex items-center gap-1 text-[var(--text-muted)] hover:text-[var(--danger)]">
                        <X size={13} /> {t("cart.coupon_remove")}
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={couponInput}
                          onChange={(e) => setCouponInput(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); applyCoupon(); } }}
                          placeholder={t("cart.coupon_placeholder")}
                          className="flex-1 h-10 px-3 rounded-xl text-sm outline-none"
                          style={{ background: "var(--bg-subtle)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                        />
                        <button type="button" onClick={applyCoupon} disabled={applyingCoupon || !couponInput.trim()}
                          className="btn-ghost px-4 text-sm disabled:opacity-50">
                          {applyingCoupon ? <Loader2 size={14} className="animate-spin" /> : t("cart.coupon_apply")}
                        </button>
                      </div>
                      {couponMsg && <p className="text-xs mt-1.5" style={{ color: "var(--danger)" }}>{couponMsg}</p>}
                    </div>
                  )}
                </div>

                {/* Totals */}
                <div className="space-y-2 mb-5">
                  <div className="flex justify-between text-xs">
                    <span style={{ color: "var(--text-muted)" }}>{t("cart.subtotal")}</span>
                    <span style={{ color: "var(--text-primary)" }}>{fmtEur(total)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-xs">
                      <span style={{ color: "var(--text-muted)" }}>{t("cart.discount")}</span>
                      <span style={{ color: "#16a34a" }}>- {fmtEur(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xs">
                    <span style={{ color: "var(--text-muted)" }}>{`${t("cart.vat")} (${TVA_PERCENT}%)`}</span>
                    <span style={{ color: "var(--text-primary)" }}>{fmtEur(tva)}</span>
                  </div>
                </div>

                <div
                  className="flex justify-between items-center pt-4 mb-5"
                  style={{ borderTop: "1px solid var(--border)" }}
                >
                  <span className="font-[Kumbh Sans] font-700 text-sm" style={{ color: "var(--text-primary)" }}>
                    {t("cart.total")}
                  </span>
                  <span className="font-[Kumbh Sans] font-800 text-2xl" style={{ color: "var(--accent)" }}>
                    {fmtEur(ttc)}
                  </span>
                </div>

                {/* Sign-in banner */}
                {!user && (
                  <div
                    className="flex items-start gap-2.5 p-3 rounded-xl mb-3 text-xs"
                    style={{ background: "var(--bg-subtle)", border: "1px solid var(--border)" }}
                  >
                    <LogIn size={14} style={{ color: "var(--accent)", flexShrink: 0, marginTop: 1 }} />
                    <p style={{ color: "var(--text-secondary)" }}>
                      <strong style={{ color: "var(--accent)" }}>{t("cart.sign_in")}</strong>{" "}
                      {t("cart.sign_in_prompt")}
                    </p>
                  </div>
                )}

                {/* Unavailable warning */}
                {hasUnavailable && (
                  <div
                    className="flex items-start gap-2.5 p-3 rounded-xl mb-3 text-xs"
                    style={{ background: "rgba(239,68,68,.08)", border: "1px solid rgba(239,68,68,.2)" }}
                  >
                    <AlertCircle size={14} style={{ color: "var(--danger)", flexShrink: 0, marginTop: 1 }} />
                    <p style={{ color: "var(--danger)" }}>{t("cart.unavailable_warning")}</p>
                  </div>
                )}

                <button
                  onClick={() => navigate("/checkout")}
                  disabled={hasUnavailable}
                  className="w-full btn-primary py-3 gap-2 text-sm justify-center disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {t("cart.proceed_checkout")}
                  <ArrowRight size={16} />
                </button>

                <Link
                  to="/products"
                  className="block text-center text-xs mt-3 hover:text-[var(--accent)] transition-colors"
                  style={{ color: "var(--text-muted)" }}
                >
                  {t("cart.continue_shopping")}
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
