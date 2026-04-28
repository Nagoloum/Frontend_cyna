import {
  AlertCircle, ArrowLeft, CheckCircle, ChevronRight, CreditCard,
  Loader2, Lock, MapPin, Plus, Shield,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { adressesAPI, cartesAPI, commandesAPI } from "@/services/api";

const getUser = () => {
  try {
    const t = localStorage.getItem("token");
    if (!t) return null;
    return JSON.parse(atob(t.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
  } catch { return null; }
};

const STEPS = ["Address", "Payment", "Confirmation"];

const billingPeriodToPeriode = (bp) =>
  String(bp).toLowerCase() === "yearly" ? "ANNEE" : "MOIS";

const InputField = ({ label, type = "text", value, onChange, placeholder, required, half }) => (
  <div className={half ? "col-span-1" : "col-span-2"}>
    <label className="block text-xs font-[Kumbh Sans] font-600 mb-1.5" style={{ color: "var(--text-muted)" }}>
      {label}{required && " *"}
    </label>
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-all"
      style={{ fontFamily: "'Kumbh Sans', sans-serif" }}
    />
  </div>
);

export default function CheckoutPage() {
  const navigate = useNavigate();
  const user = getUser();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  const [step, setStep] = useState(0);

  // ── Address ───────────────────────────────────────────────────────────────
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [newAddress, setNewAddress] = useState(false);
  const [saveNewAddress, setSaveNewAddress] = useState(true);
  const [setAsDefaultAddress, setSetAsDefaultAddress] = useState(false);
  const [addr, setAddr] = useState({
    firstName: "", lastName: "", adresse: "", complementAdresse: "",
    city: "", region: "", country: "France", codePostal: "", phone: "",
  });

  // ── Payment cards ─────────────────────────────────────────────────────────
  const [savedCards, setSavedCards] = useState([]);
  const [loadingCards, setLoadingCards] = useState(true);
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [newCard, setNewCard] = useState(false);
  const [saveNewCard, setSaveNewCard] = useState(true);
  const [setAsDefaultCard, setSetAsDefaultCard] = useState(false);
  const [pay, setPay] = useState({ carteName: "", carteNumber: "", carteDate: "", carteCVV: "" });

  // ── Submission ────────────────────────────────────────────────────────────
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const cart = (() => {
    try { return JSON.parse(localStorage.getItem("cart") || "[]"); }
    catch { return []; }
  })();

  const total = cart.reduce((s, i) => {
    const price = i.billingPeriod === "monthly" ? i.priceMonth : i.priceYear;
    return s + (Number(price) || 0) * (i.qty || 1);
  }, 0);

  // ── Load saved addresses + cards ──────────────────────────────────────────
  useEffect(() => {
    adressesAPI.getByUser()
      .then(r => {
        const list = r.data?.data ?? r.data ?? [];
        setSavedAddresses(Array.isArray(list) ? list : []);
        if (Array.isArray(list) && list.length > 0) setSelectedAddressId(list[0]._id);
        else setNewAddress(true);
      })
      .catch(() => { setSavedAddresses([]); setNewAddress(true); })
      .finally(() => setLoadingAddresses(false));

    cartesAPI.getByUser()
      .then(r => {
        const list = r.data?.data ?? r.data ?? [];
        setSavedCards(Array.isArray(list) ? list : []);
        if (Array.isArray(list) && list.length > 0) setSelectedCardId(list[0]._id);
        else setNewCard(true);
      })
      .catch(() => { setSavedCards([]); setNewCard(true); })
      .finally(() => setLoadingCards(false));
  }, []);

  // ── Validation per step ───────────────────────────────────────────────────
  const validateAddress = () => {
    if (selectedAddressId && !newAddress) return null;
    const required = ["firstName", "lastName", "adresse", "city", "region", "country", "codePostal", "phone"];
    const missing = required.find(k => !addr[k]?.trim());
    return missing ? `Field "${missing}" is required.` : null;
  };

  const validatePayment = () => {
    if (selectedCardId && !newCard) return null;
    if (!pay.carteName.trim()) return "Cardholder name is required.";
    if (!pay.carteNumber.trim()) return "Card number is required.";
    if (!pay.carteDate.trim()) return "Expiry date is required.";
    if (!pay.carteCVV.trim()) return "CVV is required.";
    return null;
  };

  const goNext = async () => {
    setError(null);
    
    if (step === 0) {
      const err = validateAddress();
      if (err) { setError(err); return; }
      
      if (newAddress && saveNewAddress) {
        setSubmitting(true);
        try {
          const res = await adressesAPI.create({ ...addr, isDefault: setAsDefaultAddress });
          const created = res.data?.data ?? res.data;
          if (created?._id) {
            setSavedAddresses(prev => [...prev, created]);
            setSelectedAddressId(created._id);
            setNewAddress(false);
          }
        } catch (e) {
          setError(e.response?.data?.message || "Erreur lors de la sauvegarde de l'adresse.");
          setSubmitting(false);
          return;
        }
        setSubmitting(false);
      }
      setStep(1);
    } else if (step === 1) {
      const err = validatePayment();
      if (err) { setError(err); return; }

      if (newCard && saveNewCard) {
        setSubmitting(true);
        try {
          const res = await cartesAPI.create({ ...pay, isDefault: setAsDefaultCard });
          const created = res.data?.data ?? res.data;
          if (created?._id) {
            setSavedCards(prev => [...prev, created]);
            setSelectedCardId(created._id);
            setNewCard(false);
          }
        } catch (e) {
          setError(e.response?.data?.message || "Erreur lors de la sauvegarde de la carte bancaire.");
          setSubmitting(false);
          return;
        }
        setSubmitting(false);
      }
      setStep(2);
    }
  };

  // ── Confirm purchase ──────────────────────────────────────────────────────
  const handleConfirm = async () => {
    if (!cart.length) { setError("Your cart is empty."); return; }
    setSubmitting(true);
    setError(null);

    try {
      // 1. Resolve address (create if new) — backend doesn't actually consume it
      //    on commande creation, but the user expects it to be saved in their account.
      if (newAddress && saveNewAddress) {
        try { await adressesAPI.create({ ...addr, isDefault: setAsDefaultAddress }); } catch { /* ignore — non-blocking */ }
      }

      // 2. Resolve card → cbId is required by the backend
      let cbId = selectedCardId;
      if (newCard || !cbId) {
        // Backend commands require a cbId so if not saving, we shouldn't save, but API forces it currently. We pass isDefault anyway.
        const res = await cartesAPI.create({ ...pay, isDefault: setAsDefaultCard });
        const created = res.data?.data ?? res.data;
        cbId = created?._id;
        if (!cbId) throw new Error("Failed to save payment card.");
      }

      // 3. Build abonnements from cart
      //    Backend only supports a single periode per Stripe session — we send
      //    them all but if the cart mixes monthly + yearly the backend will reject.
      const abonnements = cart.map(item => ({
        productId: item._id,
        quantity: Number(item.qty || 1),
        periode: billingPeriodToPeriode(item.billingPeriod),
      }));

      const intervals = new Set(abonnements.map(a => a.periode));
      if (intervals.size > 1) {
        throw new Error("Your cart mixes monthly and yearly subscriptions. Please checkout them separately.");
      }

      // 4. Create commande + Stripe session
      const orderRes = await commandesAPI.create({ cbId, abonnements });
      const payload = orderRes.data?.data ?? orderRes.data;

      if (!orderRes.data?.success || !payload?.url) {
        throw new Error(orderRes.data?.message || "Failed to create order.");
      }

      // 5. Clear cart and redirect to Stripe Checkout
      localStorage.removeItem("cart");
      window.dispatchEvent(new Event("cart-updated"));
      window.location.href = payload.url;
    } catch (err) {
      const msg = err.response?.data?.message ?? err.message ?? "Error creating order.";
      setError(msg);
      setSubmitting(false);
    }
  };

  // ── Helpers for card display ──────────────────────────────────────────────
  const maskCard = (n) => n ? `•••• •••• •••• ${String(n).slice(-4)}` : "•••• •••• •••• ••••";

  const selectedAddress = savedAddresses.find(a => a._id === selectedAddressId);
  const selectedCard = savedCards.find(c => c._id === selectedCardId);

  return (
    <div className="page-enter" style={{ background: "var(--bg-base)", minHeight: "70vh" }}>
      <div className="cyna-container py-10 max-w-5xl">
        {/* Header */}
        <Link
          to="/cart"
          className="inline-flex items-center gap-1.5 text-sm mb-8 hover:text-[var(--accent)] transition-colors"
          style={{ color: "var(--text-muted)" }}
        >
          <ArrowLeft size={15} /> Back to Cart
        </Link>
        <h1 className="section-title mb-8">Complete Your Order</h1>

        {/* Stepper */}
        <div className="flex items-center mb-10">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center">
              <div className={`flex items-center gap-2 text-sm font-[Kumbh Sans] font-600 ${i <= step ? "text-[var(--accent)]" : "text-[var(--text-muted)]"}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-700 transition-all ${i < step ? "bg-[var(--success)] text-white" : i === step ? "bg-[var(--accent)] text-white" : "border-2 border-[var(--border)] text-[var(--text-muted)]"}`}>
                  {i < step ? <CheckCircle size={14} /> : i + 1}
                </div>
                <span className="hidden sm:inline">{s}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`h-px w-12 sm:w-20 mx-3 transition-all ${i < step ? "bg-[var(--accent)]" : "bg-[var(--border)]"}`} />
              )}
            </div>
          ))}
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-xl flex items-center gap-2 text-sm bg-red-50 dark:bg-red-500/10 border border-red-200 text-red-600">
            <AlertCircle size={14} /> {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            {/* ── Step 0: Address ── */}
            {step === 0 && (
              <div className="cyna-card p-6">
                <div className="flex items-center gap-2 mb-6">
                  <MapPin size={18} style={{ color: "var(--accent)" }} />
                  <h2 className="font-[Kumbh Sans] font-700 text-base" style={{ color: "var(--text-primary)" }}>
                    Billing Address
                  </h2>
                </div>

                {loadingAddresses ? (
                  <div className="space-y-3">{[0, 1].map(i => <div key={i} className="skeleton h-20 rounded-2xl" />)}</div>
                ) : (
                  <>
                    {savedAddresses.length > 0 && (
                      <div className="space-y-2 mb-4">
                        {savedAddresses.map(a => (
                          <button
                            key={a._id}
                            type="button"
                            onClick={() => { setSelectedAddressId(a._id); setNewAddress(false); }}
                            className={`w-full text-left p-3 rounded-xl border transition-all ${selectedAddressId === a._id && !newAddress
                              ? "border-[var(--accent)] bg-[var(--bg-subtle)]"
                              : "border-[var(--border)] hover:border-[var(--accent)]/50"
                              }`}
                          >
                            <p className="font-medium text-sm text-[var(--text-primary)]">{a.firstName} {a.lastName}</p>
                            <p className="text-xs text-[var(--text-secondary)]">{a.adresse}{a.complementAdresse ? `, ${a.complementAdresse}` : ""}</p>
                            <p className="text-xs text-[var(--text-secondary)]">{a.codePostal} {a.city}, {a.country}</p>
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() => { setNewAddress(true); setSelectedAddressId(null); }}
                          className={`w-full p-3 rounded-xl border-2 border-dashed text-sm flex items-center justify-center gap-2 transition-all ${newAddress
                            ? "border-[var(--accent)] text-[var(--accent)]"
                            : "border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--accent)]/50"
                            }`}
                        >
                          <Plus size={14} /> Use a new address
                        </button>
                      </div>
                    )}

                    {(newAddress || savedAddresses.length === 0) && (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <InputField label="First Name" value={addr.firstName} onChange={v => setAddr({ ...addr, firstName: v })} placeholder="John" required half />
                          <InputField label="Last Name" value={addr.lastName} onChange={v => setAddr({ ...addr, lastName: v })} placeholder="Doe" required half />
                          <InputField label="Address" value={addr.adresse} onChange={v => setAddr({ ...addr, adresse: v })} placeholder="12 rue de la Paix" required />
                          <InputField label="Complement" value={addr.complementAdresse} onChange={v => setAddr({ ...addr, complementAdresse: v })} placeholder="Apt, office…" />
                          <InputField label="City" value={addr.city} onChange={v => setAddr({ ...addr, city: v })} placeholder="Paris" required half />
                          <InputField label="Postal Code" value={addr.codePostal} onChange={v => setAddr({ ...addr, codePostal: v })} placeholder="75001" required half />
                          <InputField label="Region" value={addr.region} onChange={v => setAddr({ ...addr, region: v })} placeholder="Île-de-France" required half />
                          <InputField label="Country" value={addr.country} onChange={v => setAddr({ ...addr, country: v })} placeholder="France" required half />
                          <InputField label="Phone" type="tel" value={addr.phone} onChange={v => setAddr({ ...addr, phone: v })} placeholder="+33 6 12 34 56 78" required />
                        </div>
                        <div className="flex flex-col gap-2 mt-4 pt-4" style={{ borderTop: "1px solid var(--border)" }}>
                          <label className="flex items-center gap-2 text-sm text-[var(--text-primary)] cursor-pointer select-none">
                            <input 
                              type="checkbox" 
                              checked={saveNewAddress} 
                              onChange={(e) => setSaveNewAddress(e.target.checked)} 
                              className="rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]" 
                            />
                            Sauvegarder cette nouvelle adresse
                          </label>
                          {saveNewAddress && (
                            <label className="flex items-center gap-2 text-sm text-[var(--text-primary)] cursor-pointer select-none ml-6">
                              <input 
                                type="checkbox" 
                                checked={setAsDefaultAddress} 
                                onChange={(e) => setSetAsDefaultAddress(e.target.checked)} 
                                className="rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]" 
                              />
                              Utiliser comme adresse par défaut
                            </label>
                          )}
                        </div>
                      </>
                    )}
                  </>
                )}

                <button onClick={goNext} disabled={submitting} className="btn-primary mt-6 gap-2 w-full sm:w-auto justify-center py-3 disabled:opacity-50">
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : null}
                  Continue to Payment <ChevronRight size={16} />
                </button>
              </div>
            )}

            {/* ── Step 1: Payment ── */}
            {step === 1 && (
              <div className="cyna-card p-6">
                <div className="flex items-center gap-2 mb-6">
                  <CreditCard size={18} style={{ color: "var(--accent)" }} />
                  <h2 className="font-[Kumbh Sans] font-700 text-base" style={{ color: "var(--text-primary)" }}>
                    Payment Method
                  </h2>
                  <div className="ml-auto flex items-center gap-1.5 text-xs" style={{ color: "var(--text-muted)" }}>
                    <Lock size={12} /> SSL Secured
                  </div>
                </div>

                {loadingCards ? (
                  <div className="space-y-3">{[0, 1].map(i => <div key={i} className="skeleton h-16 rounded-2xl" />)}</div>
                ) : (
                  <>
                    {savedCards.length > 0 && (
                      <div className="space-y-2 mb-4">
                        {savedCards.map(c => (
                          <button
                            key={c._id}
                            type="button"
                            onClick={() => { setSelectedCardId(c._id); setNewCard(false); }}
                            className={`w-full text-left p-3 rounded-xl border flex items-center gap-3 transition-all ${selectedCardId === c._id && !newCard
                              ? "border-[var(--accent)] bg-[var(--bg-subtle)]"
                              : "border-[var(--border)] hover:border-[var(--accent)]/50"
                              }`}
                          >
                            <CreditCard size={18} style={{ color: "var(--accent)" }} />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm text-[var(--text-primary)]">{maskCard(c.carteNumber)}</p>
                              <p className="text-xs text-[var(--text-muted)]">{c.carteName} — {c.carteDate}</p>
                            </div>
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() => { setNewCard(true); setSelectedCardId(null); }}
                          className={`w-full p-3 rounded-xl border-2 border-dashed text-sm flex items-center justify-center gap-2 transition-all ${newCard
                            ? "border-[var(--accent)] text-[var(--accent)]"
                            : "border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--accent)]/50"
                            }`}
                        >
                          <Plus size={14} /> Use a new card
                        </button>
                      </div>
                    )}

                    {(newCard || savedCards.length === 0) && (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <InputField label="Cardholder Name" value={pay.carteName} onChange={v => setPay({ ...pay, carteName: v })} placeholder="John Doe" required />
                          <InputField label="Card Number" value={pay.carteNumber} onChange={v => setPay({ ...pay, carteNumber: v })} placeholder="1234 5678 9012 3456" required />
                          <InputField label="Expiry (MM/YY)" value={pay.carteDate} onChange={v => setPay({ ...pay, carteDate: v })} placeholder="MM/YY" required half />
                          <InputField label="CVV" type="password" value={pay.carteCVV} onChange={v => setPay({ ...pay, carteCVV: v })} placeholder="123" required half />
                        </div>
                        <div className="flex flex-col gap-2 mt-4 pt-4" style={{ borderTop: "1px solid var(--border)" }}>
                          <label className="flex items-center gap-2 text-sm text-[var(--text-primary)] cursor-pointer select-none">
                            <input 
                              type="checkbox" 
                              checked={saveNewCard} 
                              onChange={(e) => setSaveNewCard(e.target.checked)} 
                              className="rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]" 
                            />
                            Sauvegarder cette nouvelle carte bancaire
                          </label>
                          {saveNewCard && (
                            <label className="flex items-center gap-2 text-sm text-[var(--text-primary)] cursor-pointer select-none ml-6">
                              <input 
                                type="checkbox" 
                                checked={setAsDefaultCard} 
                                onChange={(e) => setSetAsDefaultCard(e.target.checked)} 
                                className="rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]" 
                              />
                              Utiliser comme carte bancaire par défaut
                            </label>
                          )}
                        </div>
                      </>
                    )}
                  </>
                )}

                <div className="flex items-center gap-2 mt-4 p-3 rounded-xl text-xs" style={{ background: "var(--bg-subtle)", border: "1px solid var(--border)" }}>
                  <Shield size={14} style={{ color: "var(--success)" }} />
                  <span style={{ color: "var(--text-secondary)", fontFamily: "'DM Sans',sans-serif" }}>
                    You will be redirected to Stripe to finalize your payment securely.
                  </span>
                </div>

                <div className="flex gap-3 mt-6">
                  <button onClick={() => { setError(null); setStep(0); }} className="btn-ghost py-3 gap-1.5">
                    <ArrowLeft size={16} /> Back
                  </button>
                  <button onClick={goNext} disabled={submitting} className="btn-primary py-3 gap-2 flex-1 justify-center disabled:opacity-50">
                    {submitting ? <Loader2 size={16} className="animate-spin" /> : null}
                    Review Order <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* ── Step 2: Confirmation ── */}
            {step === 2 && (
              <div className="cyna-card p-6">
                <div className="flex items-center gap-2 mb-6">
                  <CheckCircle size={18} style={{ color: "var(--accent)" }} />
                  <h2 className="font-[Kumbh Sans] font-700 text-base" style={{ color: "var(--text-primary)" }}>
                    Order Confirmation
                  </h2>
                </div>

                {/* Address recap */}
                <div className="p-4 rounded-xl mb-4" style={{ background: "var(--bg-subtle)", border: "1px solid var(--border)" }}>
                  <p className="text-xs font-[Kumbh Sans] font-600 mb-2" style={{ color: "var(--text-muted)" }}>
                    BILLING ADDRESS
                  </p>
                  <p className="text-sm" style={{ color: "var(--text-primary)", fontFamily: "'DM Sans',sans-serif" }}>
                    {selectedAddress && !newAddress ? (
                      <>
                        {selectedAddress.firstName} {selectedAddress.lastName}<br />
                        {selectedAddress.adresse}{selectedAddress.complementAdresse && `, ${selectedAddress.complementAdresse}`}<br />
                        {selectedAddress.codePostal} {selectedAddress.city}, {selectedAddress.country}
                      </>
                    ) : (
                      <>
                        {addr.firstName} {addr.lastName}<br />
                        {addr.adresse}{addr.complementAdresse && `, ${addr.complementAdresse}`}<br />
                        {addr.codePostal} {addr.city}, {addr.country}
                      </>
                    )}
                  </p>
                </div>

                {/* Payment recap */}
                <div className="p-4 rounded-xl mb-6" style={{ background: "var(--bg-subtle)", border: "1px solid var(--border)" }}>
                  <p className="text-xs font-[Kumbh Sans] font-600 mb-2" style={{ color: "var(--text-muted)" }}>
                    PAYMENT
                  </p>
                  <p className="text-sm flex items-center gap-2" style={{ color: "var(--text-primary)", fontFamily: "'DM Sans',sans-serif" }}>
                    <CreditCard size={14} />
                    {selectedCard && !newCard
                      ? maskCard(selectedCard.carteNumber)
                      : maskCard(pay.carteNumber)}
                  </p>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setStep(1)} disabled={submitting} className="btn-ghost py-3 gap-1.5 disabled:opacity-50">
                    <ArrowLeft size={16} /> Back
                  </button>
                  <button
                    onClick={handleConfirm}
                    disabled={submitting}
                    className="btn-primary py-3 gap-2 flex-1 justify-center text-base disabled:opacity-50"
                  >
                    {submitting ? <Loader2 size={18} className="animate-spin" /> : <Shield size={18} />}
                    {submitting ? "Redirecting to Stripe…" : `Pay ${total.toFixed(2)} €`}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order summary */}
          <div className="cyna-card p-5 h-fit sticky top-24">
            <h3 className="font-[Kumbh Sans] font-700 mb-4" style={{ color: "var(--text-primary)" }}>
              Your Order
            </h3>
            <div className="space-y-3 mb-4 pb-4" style={{ borderBottom: "1px solid var(--border)" }}>
              {cart.map((item, i) => {
                const p = item.billingPeriod === "monthly" ? item.priceMonth : item.priceYear;
                return (
                  <div key={i} className="flex justify-between gap-2 text-xs">
                    <span className="line-clamp-2 flex-1" style={{ color: "var(--text-secondary)" }}>
                      {item.name} ×{item.qty || 1}
                      <span className="block text-[10px] text-[var(--text-muted)]">
                        {item.billingPeriod === "monthly" ? "Monthly" : "Yearly"}
                      </span>
                    </span>
                    <span className="font-[Kumbh Sans] font-600 flex-shrink-0" style={{ color: "var(--text-primary)" }}>
                      {(Number(p) * (item.qty || 1)).toFixed(2)} €
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between items-center">
              <span className="font-[Kumbh Sans] font-700 text-sm" style={{ color: "var(--text-primary)" }}>Total</span>
              <span className="font-[Kumbh Sans] font-800 text-xl" style={{ color: "var(--accent)" }}>
                {total.toFixed(2)} €
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
