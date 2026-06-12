import { adressesAPI, cartesAPI, commandesAPI, getApiErrorMessage } from "@/services/api";
import {
    AlertCircle, ArrowLeft, CheckCircle, ChevronRight, CreditCard,
    Loader2, Lock, MapPin, Plus, Shield,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { Elements, CardNumberElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { stripePromise } from "@/lib/stripe";
import StripeCardFields from "@/components/ui/StripeCardFields";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { clearCart } from "@/store/slices/cartSlice";
import { computeTotals, TVA_PERCENT } from "@/lib/pricing";
import { getAppliedCoupon, clearAppliedCoupon } from "@/lib/coupon";

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
  return (
    <Elements stripe={stripePromise}>
      <CheckoutRouter />
    </Elements>
  );
}

// Un invité (non connecté) suit le flux d'achat invité ; un utilisateur
// connecté garde le flux complet (adresses/cartes enregistrées).
function CheckoutRouter() {
  const isAuthed =
    typeof window !== "undefined" && !!localStorage.getItem("token");
  return isAuthed ? <AuthedCheckoutForm /> : <GuestCheckoutForm />;
}

function AuthedCheckoutForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const stripe = useStripe();
  const elements = useElements();

  const STEPS = [t("checkout.step_address"), t("checkout.step_payment"), t("checkout.step_confirmation")];

  const [step, setStep] = useState(0);

  // ── Address ───────────────────────────────────────────────────────────────
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [newAddress, setNewAddress] = useState(false);
  const [addr, setAddr] = useState({
    firstName: "", lastName: "", adresse: "", complementAdresse: "",
    city: "", region: "", country: "France", codePostal: "", phone: "",
  });

  // ── Payment cards ─────────────────────────────────────────────────────────
  const [savedCards, setSavedCards] = useState([]);
  const [loadingCards, setLoadingCards] = useState(true);
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [newCard, setNewCard] = useState(false);
  const [savingCard, setSavingCard] = useState(false);
  const [pay, setPay] = useState({ carteName: "" });

  // ── Submission ────────────────────────────────────────────────────────────
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Source unique : Redux (synchronisé avec localStorage par le middleware).
  const cart = useAppSelector((s) => s.cart.items);

  const total = cart.reduce((s, i) => {
    const price = i.billingPeriod === "monthly" ? i.priceMonth : i.priceYear;
    return s + (Number(price) || 0) * (i.qty || 1);
  }, 0);
  // TTC affiche = HT + TVA (le serveur fait foi sur le montant debite).
  const appliedCoupon = getAppliedCoupon();
  const { tva: tvaAmount, ttc: totalTTC, discount: discountAmount } = computeTotals(total, appliedCoupon?.discount || 0);

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
    return missing ? t("checkout.error_field_required", { field: missing }) : null;
  };

  const validatePayment = () => {
    if (selectedCardId && !newCard) return null;
    if (!pay.carteName.trim()) return t("checkout.error_cardholder");
    return null; // Stripe Elements validates the card itself on confirmation.
  };

  const goNext = async () => {
    if (step === 0) {
      const err = validateAddress();
      if (err) { setError(err); return; }
      setError(null);
      setStep(1);
      return;
    }

    // Step 1 (payment). Validate, then — for a NEW card — save it to Stripe
    // (SetupIntent, no charge) + DB now, while the Stripe fields are still mounted.
    const err = validatePayment();
    if (err) { setError(err); return; }
    setError(null);

    if (newCard || !selectedCardId) {
      if (!stripe || !elements) { setError(t("account.stripe_unavailable")); return; }
      setSavingCard(true);
      try {
        const si = await cartesAPI.createSetupIntent();
        const clientSecret = si?.data?.data?.clientSecret;
        if (!clientSecret) throw new Error(t("checkout.error_save_card"));

        const { error: stripeErr, setupIntent } = await stripe.confirmCardSetup(clientSecret, {
          payment_method: {
            card: elements.getElement(CardNumberElement),
            billing_details: { name: pay.carteName },
          },
        });
        if (stripeErr) { setError(stripeErr.message || t("checkout.error_save_card")); setSavingCard(false); return; }

        const res = await cartesAPI.create({
          carteName: pay.carteName,
          stripePaymentMethodId: setupIntent.payment_method,
          isDefault: savedCards.length === 0,
        });
        const created = res.data?.data ?? res.data;
        if (res?.data?.success === false || !created?._id) {
          setError(res?.data?.message || t("checkout.error_save_card"));
          setSavingCard(false);
          return;
        }
        setSavedCards(prev => [...prev, created]);
        setSelectedCardId(created._id);
        setNewCard(false);
      } catch (e) {
        setError(e.response?.data?.message ?? e.message ?? t("checkout.error_save_card"));
        setSavingCard(false);
        return;
      }
      setSavingCard(false);
    }

    setStep(2);
  };

  // ── Confirm purchase ──────────────────────────────────────────────────────
  const handleConfirm = async () => {
    if (!cart.length) { setError(t("checkout.empty_cart")); return; }
    if (!selectedCardId) { setError(t("checkout.error_save_card")); return; }
    setSubmitting(true);
    setError(null);

    try {
      // 1) Résoudre l'adresse de facturation (la créer si l'utilisateur en a saisi une).
      let adresseFacturationId = selectedAddressId;
      if (newAddress || !adresseFacturationId) {
        const aRes = await adressesAPI.create(addr);
        const createdAddr = aRes.data?.data ?? aRes.data;
        if (aRes?.data?.success === false || !createdAddr?._id) {
          throw new Error(aRes?.data?.message || t("checkout.error_address"));
        }
        adresseFacturationId = createdAddr._id;
      }

      const abonnements = cart.map(item => ({
        productId: item._id,
        quantity: Number(item.qty || 1),
        periode: billingPeriodToPeriode(item.billingPeriod),
      }));

      const intervals = new Set(abonnements.map(a => a.periode));
      if (intervals.size > 1) {
        throw new Error(t("checkout.mixed_billing"));
      }

      // 2) Créer la commande → débit direct de la carte enregistrée (off-session).
      const orderRes = await commandesAPI.create({
        cbId: selectedCardId,
        adresseFacturationId,
        abonnements,
        couponCode: appliedCoupon?.code,
      });
      const body = orderRes.data;
      if (!body?.success) {
        throw new Error(body?.message || t("checkout.error_create_order"));
      }
      const payload = body.data ?? {};

      // 3) Carte nécessitant une authentification 3-D Secure → confirmation on-session.
      if (payload.status === "REQUIRES_ACTION" && payload.clientSecret) {
        if (!stripe) throw new Error(t("account.stripe_unavailable"));
        const { error: scaErr, paymentIntent } = await stripe.confirmCardPayment(payload.clientSecret);
        if (scaErr) throw new Error(scaErr.message || t("checkout.error_payment_failed"));
        if (paymentIntent?.status !== "succeeded") throw new Error(t("checkout.error_payment_failed"));
        const confirmRes = await commandesAPI.paymentSuccess(payload.orderId, undefined, paymentIntent.id);
        if (confirmRes?.data?.success === false) {
          throw new Error(confirmRes.data.message || t("checkout.error_payment_failed"));
        }
      } else if (payload.status !== "PAID") {
        // PENDING / processing / statut inattendu.
        throw new Error(body?.message || t("checkout.error_payment_failed"));
      }

      // 4) Succès → vider le panier (Redux + localStorage via middleware) et confirmer.
      dispatch(clearCart());
      clearAppliedCoupon();
      navigate("/checkout/confirmation");
    } catch (err) {
      // Jamais de message technique brut (réseau, 5xx) à l'utilisateur.
      const msg = getApiErrorMessage(err, t("checkout.error_order_generic"));
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
      {/* Standard header */}
      <div style={{ background: "var(--bg-subtle)", borderBottom: "1px solid var(--border)" }}>
        <div className="cyna-container py-10 sm:py-14">
          <p className="section-label">{t("checkout.badge")}</p>
          <h1 className="section-title mb-2">{t("checkout.complete_order")}</h1>
          <p
            className="text-sm max-w-xl lg:mb-0 mb-6"
            style={{ color: "var(--text-secondary)", fontFamily: "'Kumbh Sans', sans-serif" }}
          >
            {t("checkout.subtitle")}
          </p>
        </div>
      </div>

      <div className="cyna-container py-10 max-w-5xl ">
        {/* Back to cart */}
        <Link
          to="/cart"
          className="inline-flex items-center gap-1.5 text-sm mb-8 mt-8 hover:text-[var(--accent)] transition-colors"
          style={{ color: "var(--text-muted)" }}
        >
          <ArrowLeft size={15} /> {t("checkout.back_to_cart")}
        </Link>

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
          <div className="lg:col-span-2 lg:mb-8 mb-0">
            {/* ── Step 0: Address ── */}
            {step === 0 && (
              <div className="cyna-card p-6">
                <div className="flex items-center gap-2 mb-6">
                  <MapPin size={18} style={{ color: "var(--accent)" }} />
                  <h2 className="font-[Kumbh Sans] font-700 text-base" style={{ color: "var(--text-primary)" }}>
                    {t("checkout.billing_address")}
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
                          <Plus size={14} /> {t("checkout.use_new_address")}
                        </button>
                      </div>
                    )}

                    {(newAddress || savedAddresses.length === 0) && (
                      <div className="grid grid-cols-2 gap-4">
                        <InputField label={t("checkout.field_first_name")} value={addr.firstName} onChange={v => setAddr({ ...addr, firstName: v })} placeholder={t("checkout.placeholder_first_name")} required half />
                        <InputField label={t("checkout.field_last_name")} value={addr.lastName} onChange={v => setAddr({ ...addr, lastName: v })} placeholder={t("checkout.placeholder_last_name")} required half />
                        <InputField label={t("checkout.field_address")} value={addr.adresse} onChange={v => setAddr({ ...addr, adresse: v })} placeholder={t("checkout.placeholder_address")} required />
                        <InputField label={t("checkout.field_complement")} value={addr.complementAdresse} onChange={v => setAddr({ ...addr, complementAdresse: v })} placeholder={t("checkout.placeholder_complement")} />
                        <InputField label={t("checkout.field_city")} value={addr.city} onChange={v => setAddr({ ...addr, city: v })} placeholder={t("checkout.placeholder_city")} required half />
                        <InputField label={t("checkout.field_postal_code")} value={addr.codePostal} onChange={v => setAddr({ ...addr, codePostal: v })} placeholder={t("checkout.placeholder_postal_code")} required half />
                        <InputField label={t("checkout.field_region")} value={addr.region} onChange={v => setAddr({ ...addr, region: v })} placeholder={t("checkout.placeholder_region")} required half />
                        <InputField label={t("checkout.field_country")} value={addr.country} onChange={v => setAddr({ ...addr, country: v })} placeholder={t("checkout.placeholder_country")} required half />
                        <InputField label={t("checkout.field_phone")} type="tel" value={addr.phone} onChange={v => setAddr({ ...addr, phone: v })} placeholder={t("checkout.placeholder_phone")} required />
                      </div>
                    )}
                  </>
                )}

                <button onClick={goNext} className="btn-primary mt-6 gap-2 w-full sm:w-auto justify-center py-3">
                  {t("checkout.continue_to_payment")} <ChevronRight size={16} />
                </button>
              </div>
            )}

            {/* ── Step 1: Payment ── */}
            {step === 1 && (
              <div className="cyna-card p-6">
                <div className="flex items-center gap-2 mb-6">
                  <CreditCard size={18} style={{ color: "var(--accent)" }} />
                  <h2 className="font-[Kumbh Sans] font-700 text-base" style={{ color: "var(--text-primary)" }}>
                    {t("checkout.payment_method")}
                  </h2>
                  <div className="ml-auto flex items-center gap-1.5 text-xs" style={{ color: "var(--text-muted)" }}>
                    <Lock size={12} /> {t("checkout.ssl_secured")}
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
                              <p className="text-xs text-[var(--text-muted)]">{c.carteName} {c.carteDate}</p>
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
                          <Plus size={14} /> {t("checkout.use_new_card")}
                        </button>
                      </div>
                    )}

                    {(newCard || savedCards.length === 0) && (
                      <div className="space-y-3">
                        <InputField label={t("checkout.field_cardholder")} value={pay.carteName} onChange={v => setPay({ ...pay, carteName: v })} placeholder={t("checkout.placeholder_cardholder")} required />
                        <StripeCardFields />
                      </div>
                    )}
                  </>
                )}

                <div className="flex items-center gap-2 mt-4 p-3 rounded-xl text-xs" style={{ background: "var(--bg-subtle)", border: "1px solid var(--border)" }}>
                  <Shield size={14} style={{ color: "var(--success)" }} />
                  <span style={{ color: "var(--text-secondary)", fontFamily: "'DM Sans',sans-serif" }}>
                    {t("checkout.stripe_redirect")}
                  </span>
                </div>

                <div className="flex gap-3 mt-6">
                  <button onClick={() => { setError(null); setStep(0); }} disabled={savingCard} className="btn-ghost py-3 gap-1.5 disabled:opacity-50">
                    <ArrowLeft size={16} /> {t("checkout.back")}
                  </button>
                  <button onClick={goNext} disabled={savingCard} className="btn-primary py-3 gap-2 flex-1 justify-center disabled:opacity-50">
                    {savingCard
                      ? <><Loader2 size={16} className="animate-spin" /> {t("checkout.saving_card")}</>
                      : <>{t("checkout.review_order")} <ChevronRight size={16} /></>}
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
                    {t("checkout.order_confirmation")}
                  </h2>
                </div>

                {/* Address recap */}
                <div className="p-4 rounded-xl mb-4" style={{ background: "var(--bg-subtle)", border: "1px solid var(--border)" }}>
                  <p className="text-xs font-[Kumbh Sans] font-600 mb-2" style={{ color: "var(--text-muted)" }}>
                    {t("checkout.billing_address_header")}
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
                    {t("checkout.payment_header")}
                  </p>
                  <p className="text-sm flex items-center gap-2" style={{ color: "var(--text-primary)", fontFamily: "'DM Sans',sans-serif" }}>
                    <CreditCard size={14} />
                    {maskCard(selectedCard?.carteNumber)}
                  </p>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setStep(1)} disabled={submitting} className="btn-ghost py-3 gap-1.5 disabled:opacity-50">
                    <ArrowLeft size={16} /> {t("checkout.back")}
                  </button>
                  <button
                    onClick={handleConfirm}
                    disabled={submitting}
                    className="btn-primary py-3 gap-2 flex-1 justify-center text-base disabled:opacity-50"
                  >
                    {submitting ? <Loader2 size={18} className="animate-spin" /> : <Shield size={18} />}
                    {submitting ? t("checkout.processing_payment") : t("checkout.pay_btn", { total: totalTTC.toFixed(2) })}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order summary */}
          <div className="cyna-card p-5 h-fit sticky top-24 lg:mb-0 mb-8">
            <h3 className="font-[Kumbh Sans] font-700 mb-4" style={{ color: "var(--text-primary)" }}>
              {t("checkout.your_order")}
            </h3>
            <div className="space-y-3 mb-4 pb-4" style={{ borderBottom: "1px solid var(--border)" }}>
              {cart.map((item, i) => {
                const p = item.billingPeriod === "monthly" ? item.priceMonth : item.priceYear;
                return (
                  <div key={i} className="flex justify-between gap-2 text-xs">
                    <span className="line-clamp-2 flex-1" style={{ color: "var(--text-secondary)" }}>
                      {item.name} ×{item.qty || 1}
                      <span className="block text-[10px] text-[var(--text-muted)]">
                        {item.billingPeriod === "monthly" ? t("checkout.monthly") : t("checkout.yearly")}
                      </span>
                    </span>
                    <span className="font-[Kumbh Sans] font-600 flex-shrink-0" style={{ color: "var(--text-primary)" }}>
                      {(Number(p) * (item.qty || 1)).toFixed(2)} €
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="space-y-1.5 mb-3">
              <div className="flex justify-between text-xs">
                <span style={{ color: "var(--text-muted)" }}>{t("checkout.subtotal")}</span>
                <span style={{ color: "var(--text-primary)" }}>{total.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between text-xs">
                <span style={{ color: "var(--text-muted)" }}>{`${t("checkout.vat")} (${TVA_PERCENT}%)`}</span>
                <span style={{ color: "var(--text-primary)" }}>{tvaAmount.toFixed(2)} €</span>
              </div>
            </div>
            <div className="flex justify-between items-center pt-3" style={{ borderTop: "1px solid var(--border)" }}>
              <span className="font-[Kumbh Sans] font-700 text-sm" style={{ color: "var(--text-primary)" }}>{t("checkout.total")}</span>
              <span className="font-[Kumbh Sans] font-800 text-xl" style={{ color: "var(--accent)" }}>
                {totalTTC.toFixed(2)} €
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Flux d'achat invité (sans compte) ───────────────────────────────────────
function GuestCheckoutForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const stripe = useStripe();
  const elements = useElements();
  const cart = useAppSelector((s) => s.cart.items);

  const [form, setForm] = useState({
    email: "", firstName: "", lastName: "",
    adresse: "", complementAdresse: "", city: "", region: "",
    country: "France", codePostal: "", phone: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const total = cart.reduce((s, i) => {
    const price = i.billingPeriod === "monthly" ? i.priceMonth : i.priceYear;
    return s + (Number(price) || 0) * (i.qty || 1);
  }, 0);
  const appliedCoupon = getAppliedCoupon();
  const { tva: tvaAmount, ttc: totalTTC, discount: discountAmount } = computeTotals(total, appliedCoupon?.discount || 0);

  const setField = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const requiredFilled = [
    "email", "firstName", "lastName", "adresse", "city", "region", "country", "codePostal", "phone",
  ].every((k) => String(form[k]).trim());

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    if (!cart.length) { setError(t("checkout.empty_cart")); return; }
    if (!requiredFilled) { setError(t("checkout.fill_required")); return; }
    if (!stripe || !elements) { setError(t("account.stripe_unavailable")); return; }

    setSubmitting(true);
    setError(null);
    try {
      // 1) Création d'un PaymentMethod Stripe (aucune donnée carte ne transite par nous).
      const { error: pmErr, paymentMethod } = await stripe.createPaymentMethod({
        type: "card",
        card: elements.getElement(CardNumberElement),
        billing_details: {
          name: `${form.firstName} ${form.lastName}`.trim(),
          email: form.email,
        },
      });
      if (pmErr) throw new Error(pmErr.message || t("checkout.error_save_card"));

      const abonnements = cart.map((item) => ({
        productId: item._id,
        quantity: Number(item.qty || 1),
        periode: billingPeriodToPeriode(item.billingPeriod),
      }));
      if (new Set(abonnements.map((a) => a.periode)).size > 1) {
        throw new Error(t("checkout.mixed_billing"));
      }

      // 2) Achat invité : le backend crée le compte + la commande et débite la carte.
      const res = await commandesAPI.guestCheckout({
        ...form,
        stripePaymentMethodId: paymentMethod.id,
        abonnements,
        couponCode: appliedCoupon?.code,
      });
      const body = res.data;
      if (!body?.success) throw new Error(body?.message || t("checkout.error_create_order"));
      const payload = body.data ?? {};

      // 3) 3-D Secure : on confirme côté client ; le webhook Stripe finalise la
      //    commande côté serveur (l'invité n'est pas encore authentifié).
      if (payload.status === "REQUIRES_ACTION" && payload.clientSecret) {
        const { error: scaErr, paymentIntent } = await stripe.confirmCardPayment(payload.clientSecret);
        if (scaErr) throw new Error(scaErr.message || t("checkout.error_payment_failed"));
        if (paymentIntent?.status !== "succeeded") throw new Error(t("checkout.error_payment_failed"));
      } else if (payload.status !== "PAID") {
        throw new Error(body?.message || t("checkout.error_payment_failed"));
      }

      dispatch(clearCart());
      clearAppliedCoupon();
      navigate("/checkout/confirmation");
    } catch (err) {
      setError(getApiErrorMessage(err, t("checkout.error_order_generic")));
      setSubmitting(false);
    }
  };

  if (!cart.length) {
    return (
      <div className="cyna-container py-16 text-center" style={{ minHeight: "60vh" }}>
        <p className="mb-4" style={{ color: "var(--text-secondary)" }}>{t("checkout.empty_cart")}</p>
        <Link to="/products" className="btn-primary inline-flex gap-2">{t("orderConfirmation.continue")}</Link>
      </div>
    );
  }

  return (
    <div className="page-enter" style={{ background: "var(--bg-base)", minHeight: "70vh" }}>
      <div className="cyna-container py-10">
        <h1 className="section-title mb-1">{t("checkout.guest_title")}</h1>
        <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
          {t("checkout.guest_subtitle")}{" "}
          <Link to="/auth?next=/checkout" className="underline" style={{ color: "var(--accent)" }}>
            {t("checkout.guest_login_link")}
          </Link>
        </p>

        <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Compte */}
            <div className="cyna-card p-5">
              <h3 className="font-[Kumbh Sans] font-700 mb-4 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                <Lock size={16} /> {t("checkout.guest_account")}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <InputField label={t("checkout.field_email")} type="email" value={form.email} onChange={setField("email")} required half />
                <InputField label={t("checkout.field_phone")} value={form.phone} onChange={setField("phone")} required half />
              </div>
            </div>

            {/* Adresse de facturation */}
            <div className="cyna-card p-5">
              <h3 className="font-[Kumbh Sans] font-700 mb-4 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                <MapPin size={16} /> {t("checkout.billing_address")}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <InputField label={t("checkout.field_first_name")} value={form.firstName} onChange={setField("firstName")} required half />
                <InputField label={t("checkout.field_last_name")} value={form.lastName} onChange={setField("lastName")} required half />
                <InputField label={t("checkout.field_address")} value={form.adresse} onChange={setField("adresse")} required />
                <InputField label={t("checkout.field_complement")} value={form.complementAdresse} onChange={setField("complementAdresse")} />
                <InputField label={t("checkout.field_city")} value={form.city} onChange={setField("city")} required half />
                <InputField label={t("checkout.field_postal_code")} value={form.codePostal} onChange={setField("codePostal")} required half />
                <InputField label={t("checkout.field_region")} value={form.region} onChange={setField("region")} required half />
                <InputField label={t("checkout.field_country")} value={form.country} onChange={setField("country")} required half />
              </div>
            </div>

            {/* Paiement */}
            <div className="cyna-card p-5">
              <h3 className="font-[Kumbh Sans] font-700 mb-4 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                <Shield size={16} /> {t("checkout.payment_header")}
              </h3>
              <div className="space-y-3">
                <StripeCardFields />
              </div>
              <p className="flex items-center gap-1.5 text-xs mt-3" style={{ color: "var(--text-muted)" }}>
                <Lock size={12} /> {t("checkout.ssl_secured")}
              </p>
            </div>
          </div>

          {/* Récapitulatif */}
          <div className="cyna-card p-5 h-fit lg:sticky lg:top-24">
            <h3 className="font-[Kumbh Sans] font-700 mb-4" style={{ color: "var(--text-primary)" }}>
              {t("checkout.your_order")}
            </h3>
            <div className="space-y-3 mb-4 pb-4" style={{ borderBottom: "1px solid var(--border)" }}>
              {cart.map((item, i) => {
                const p = item.billingPeriod === "monthly" ? item.priceMonth : item.priceYear;
                return (
                  <div key={i} className="flex justify-between gap-2 text-xs">
                    <span className="line-clamp-2 flex-1" style={{ color: "var(--text-secondary)" }}>
                      {item.name} ×{item.qty || 1}
                    </span>
                    <span style={{ color: "var(--text-primary)" }}>{(Number(p) * (item.qty || 1)).toFixed(2)} €</span>
                  </div>
                );
              })}
            </div>
            <div className="space-y-1.5 mb-3">
              <div className="flex justify-between text-xs">
                <span style={{ color: "var(--text-muted)" }}>{t("checkout.subtotal")}</span>
                <span style={{ color: "var(--text-primary)" }}>{total.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between text-xs">
                <span style={{ color: "var(--text-muted)" }}>{`${t("checkout.vat")} (${TVA_PERCENT}%)`}</span>
                <span style={{ color: "var(--text-primary)" }}>{tvaAmount.toFixed(2)} €</span>
              </div>
            </div>
            <div className="flex justify-between items-center pt-3 mb-4" style={{ borderTop: "1px solid var(--border)" }}>
              <span className="font-[Kumbh Sans] font-700 text-sm" style={{ color: "var(--text-primary)" }}>{t("checkout.total")}</span>
              <span className="font-[Kumbh Sans] font-800 text-xl" style={{ color: "var(--accent)" }}>{totalTTC.toFixed(2)} €</span>
            </div>

            {error && (
              <p className="text-red-500 text-xs mb-3 flex items-center gap-1.5">
                <AlertCircle size={14} /> {error}
              </p>
            )}

            <button type="submit" disabled={submitting}
              className="btn-primary w-full justify-center gap-2 disabled:opacity-60">
              {submitting && <Loader2 size={16} className="animate-spin" />}
              {submitting ? t("checkout.processing_payment") : t("checkout.pay_btn", { total: totalTTC.toFixed(2) })}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
