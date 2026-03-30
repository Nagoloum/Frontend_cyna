import { buildImageUrl } from "@/services/api";
import { AlertCircle, ArrowRight, LogIn, Package, ShoppingBag, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const getUser = () => {
  try {
    const t = localStorage.getItem("token");
    if (!t) return null;
    return JSON.parse(atob(t.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
  } catch { return null; }
};

const CartItem = ({ item, onUpdate, onRemove }) => {
  const img = buildImageUrl(item.images?.[0]?.path ?? item.images?.[0]);
  const isOut = item.stock === 0;
  const price = item.billingPeriod === "monthly" ? item.priceMonth : item.priceYear;

  return (
    <div className={`cyna-card p-4 flex gap-4 ${isOut ? "border-[var(--danger)] opacity-70" : ""}`}>
      {/* Image */}
      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden flex-shrink-0 border border-[var(--border)]" style={{ background: "var(--bg-muted)" }}>
        {img ? (
          <img src={img} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package size={24} style={{ color: "var(--text-muted)" }} />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-[Kumbh Sans] font-700 text-sm line-clamp-2" style={{ color: "var(--text-primary)" }}>
              {item.name}
            </h3>
            {isOut && (
              <p className="text-xs mt-0.5 flex items-center gap-1" style={{ color: "var(--danger)" }}>
                <AlertCircle size={11} /> Service unavailable
              </p>
            )}
          </div>
          <button
            onClick={() => onRemove(item._id, item.billingPeriod)}
            className="p-1.5 rounded-lg transition-colors hover:bg-red-50 dark:hover:bg-red-500/10 flex-shrink-0"
            style={{ color: "var(--text-muted)" }}
          >
            <Trash2 size={15} />
          </button>
        </div>

        {/* Billing Period */}
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <div className="inline-flex rounded-lg border border-[var(--border)] overflow-hidden text-xs" style={{ background: "var(--bg-subtle)" }}>
            {[
              { v: "monthly", l: "Monthly" },
              { v: "yearly", l: "Yearly" }
            ].map(({ v, l }) => (
              <button
                key={v}
                onClick={() => onUpdate(item._id, { billingPeriod: v })}
                className={`px-3 py-1 font-[Kumbh Sans] font-600 transition-all ${item.billingPeriod === v ? "text-white" : "text-[var(--text-muted)]"}`}
                style={item.billingPeriod === v ? { background: "var(--accent)" } : {}}
              >
                {l}
              </button>
            ))}
          </div>

          {/* Quantity */}
          <div className="flex items-center rounded-lg border border-[var(--border)] overflow-hidden text-xs" style={{ background: "var(--bg-subtle)" }}>
            <button
              onClick={() => onUpdate(item._id, { qty: Math.max(1, (item.qty || 1) - 1) })}
              className="w-7 h-7 flex items-center justify-center hover:bg-[var(--bg-muted)] transition-colors"
              style={{ color: "var(--text-secondary)" }}
            >
              −
            </button>
            <span className="w-7 text-center font-[Kumbh Sans] font-700" style={{ color: "var(--text-primary)" }}>
              {item.qty || 1}
            </span>
            <button
              onClick={() => onUpdate(item._id, { qty: (item.qty || 1) + 1 })}
              className="w-7 h-7 flex items-center justify-center hover:bg-[var(--bg-muted)] transition-colors"
              style={{ color: "var(--text-secondary)" }}
            >
              +
            </button>
          </div>
        </div>

        {/* Price */}
        <div className="mt-2">
          {price != null && (
            <p className="font-[Kumbh Sans] font-700 text-base" style={{ color: "var(--text-primary)" }}>
              {(Number(price) * (item.qty || 1)).toFixed(2)} €
              <span className="text-xs font-normal ml-1" style={{ color: "var(--text-muted)" }}>
                / {item.billingPeriod === "monthly" ? "month" : "year"}
              </span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default function CartPage() {
  const [cart, setCart] = useState([]);
  const navigate = useNavigate();
  const user = getUser();

  const loadCart = () => {
    try {
      setCart(JSON.parse(localStorage.getItem("cart") || "[]"));
    } catch {
      setCart([]);
    }
  };

  useEffect(() => {
    loadCart();
    window.addEventListener("cart-updated", loadCart);
    return () => window.removeEventListener("cart-updated", loadCart);
  }, []);

  const saveCart = (newCart) => {
    localStorage.setItem("cart", JSON.stringify(newCart));
    setCart(newCart);
    window.dispatchEvent(new Event("cart-updated"));
  };

  const handleUpdate = (id, billingPeriod, patch) => {
    saveCart(cart.map(i =>
      (i._id === id && i.billingPeriod === billingPeriod)
        ? { ...i, ...patch }
        : i
    ));
  };

  const handleRemove = (id, billingPeriod) =>
    saveCart(cart.filter(i => !(i._id === id && i.billingPeriod === billingPeriod)));

  const total = cart.reduce((sum, i) => {
    const p = i.billingPeriod === "monthly" ? i.priceMonth : i.priceYear;
    return sum + (Number(p) || 0) * (i.qty || 1);
  }, 0);

  const hasUnavailable = cart.some(i => i.stock === 0);

  return (
    <div className="page-enter" style={{ background: "var(--bg-base)", minHeight: "70vh" }}>
      <div style={{ background: "var(--bg-subtle)", borderBottom: "1px solid var(--border)" }}>
        <div className="cyna-container py-10 sm:py-14">
          <p className="section-label">Order</p>
          <h1 className="section-title">My Cart</h1>
        </div>
      </div>

      {cart.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--border)] p-16 my-10 text-center max-w-md mx-auto" style={{ background: "var(--bg-subtle)" }}>
          <ShoppingBag size={48} style={{ color: "var(--text-muted)", margin: "0 auto 16px" }} />
          <p className="font-[Kumbh Sans] font-700 text-lg mb-2" style={{ color: "var(--text-secondary)" }}>
            Your cart is empty
          </p>
          <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
            Browse our catalog to find your solution
          </p>
          <Link to="/products" className="btn-primary gap-2">
            View Products <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item, i) => (
              <CartItem
                key={`${item._id}-${item.billingPeriod}-${i}`}
                item={item}
                onUpdate={(id, patch) => handleUpdate(id, item.billingPeriod, patch)}
                onRemove={handleRemove}
              />
            ))}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="cyna-card p-6 sticky top-24">
              <h2 className="font-[Kumbh Sans] font-700 text-lg mb-5" style={{ color: "var(--text-primary)" }}>
                Summary
              </h2>
              <div className="space-y-3 mb-5 pb-5" style={{ borderBottom: "1px solid var(--border)" }}>
                {cart.map((item, i) => {
                  const p = item.billingPeriod === "monthly" ? item.priceMonth : item.priceYear;
                  return (
                    <div key={i} className="flex justify-between text-sm gap-2">
                      <span className="line-clamp-1 flex-1" style={{ color: "var(--text-secondary)", fontFamily: "'DM Sans',sans-serif" }}>
                        {item.name} ×{item.qty || 1}
                      </span>
                      <span className="font-[Kumbh Sans] font-600 flex-shrink-0" style={{ color: "var(--text-primary)" }}>
                        {(Number(p) * (item.qty || 1)).toFixed(2)} €
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between items-center mb-6">
                <span className="font-[Kumbh Sans] font-700" style={{ color: "var(--text-primary)" }}>Total</span>
                <span className="font-[Kumbh Sans] font-800 text-2xl" style={{ color: "var(--accent)" }}>
                  {total.toFixed(2)} €
                </span>
              </div>

              {/* Auth reminder */}
              {!user && (
                <div className="flex items-start gap-2.5 p-3 rounded-xl mb-4 text-sm" style={{ background: "var(--accent-light)", border: "1px solid var(--border-strong)" }}>
                  <LogIn size={15} style={{ color: "var(--accent)", flexShrink: 0, marginTop: 1 }} />
                  <p style={{ color: "var(--accent)", fontFamily: "'DM Sans',sans-serif" }}>
                    <strong>Sign in</strong> to complete your order and manage your subscriptions.
                  </p>
                </div>
              )}

              {hasUnavailable && (
                <div className="flex items-start gap-2.5 p-3 rounded-xl mb-4 text-sm" style={{ background: "rgba(239,68,68,.08)", border: "1px solid rgba(239,68,68,.2)" }}>
                  <AlertCircle size={15} style={{ color: "var(--danger)", flexShrink: 0, marginTop: 1 }} />
                  <p style={{ color: "var(--danger)", fontFamily: "'DM Sans',sans-serif" }}>
                    Some unavailable services are in your cart.
                  </p>
                </div>
              )}

              <button
                onClick={() => user ? navigate("/checkout") : navigate("/auth")}
                disabled={hasUnavailable}
                className="w-full btn-primary py-3 gap-2 text-base disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
              >
                {user ? "Proceed to Checkout" : "Sign in to Order"}
                <ArrowRight size={18} />
              </button>

              <Link
                to="/products"
                className="block text-center text-sm mt-3 hover:text-[var(--accent)] transition-colors"
                style={{ color: "var(--text-muted)" }}
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}