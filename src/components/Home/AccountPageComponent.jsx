import { adressesAPI, authAPI, cartesAPI, commandesAPI, usersAPI } from "@/services/api";
import { Elements, CardNumberElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { stripePromise } from "@/lib/stripe";
import StripeCardFields from "@/components/ui/StripeCardFields";
import {
    AlertCircle,
    Ban,
    Calendar,
    Check,
    CheckCircle2, ChevronRight,
    Clock,
    Copy,
    CreditCard,
    Edit2, Eye, EyeOff,
    KeyRound,
    Lock, LogOut, MapPin, Package,
    Plus,
    Receipt,
    RefreshCw,
    Save,
    Sparkles,
    Star, Trash2, User, X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";

// ── Auth helpers ──────────────────────────────────────────────────────────────
const getUser = () => {
  try {
    const t = localStorage.getItem("token");
    if (!t) return null;
    return JSON.parse(atob(t.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
  } catch { return null; }
};

/**
 * Extract a clean, user-facing message from an axios error.
 * Falls back to a generic message so users never see raw/technical errors.
 */
const apiMessage = (err, fallback) => {
  const m = err?.response?.data?.message;
  if (Array.isArray(m)) return m[0] || fallback;
  if (typeof m === "string" && m.trim()) return m;
  return fallback;
};


// ── Reusable "set as default" switch (addresses / cards) ──────────────────────
const DefaultToggle = ({ checked, onChange, label }) => (
  <label className="flex items-center gap-2.5 cursor-pointer pt-1">
    <div className="relative">
      <input
        type="checkbox"
        checked={!!checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only peer"
      />
      <div className="w-9 h-5 rounded-full bg-gray-200 dark:bg-gray-600 peer-checked:bg-[var(--accent)] after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:w-4 after:h-4 after:transition-all peer-checked:after:translate-x-4 transition-colors duration-200" />
    </div>
    <span className="text-sm" style={{ color: "var(--text-primary)" }}>{label}</span>
  </label>
);

// ─── Utils ───────────────────────────────────────────────────────────────────
const fmtDateLong = (iso) => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      day: "2-digit", month: "short", year: "numeric",
    });
  } catch { return "—"; }
};

const fmtEur = (n) =>
  Number(n ?? 0).toLocaleString("fr-FR", { minimumFractionDigits: 2 }) + " €";

const daysBetween = (from, to) => {
  if (!from || !to) return null;
  const ms = new Date(to).getTime() - new Date(from).getTime();
  if (Number.isNaN(ms)) return null;
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
};

const Field = ({ label, type = "text", value, onChange, placeholder, disabled, inputMode }) => (
  <div>
    <label className="block text-xs font-[Kumbh Sans] font-600 mb-1.5" style={{ color: "var(--text-muted)" }}>{label}</label>
    <input
      type={type}
      inputMode={inputMode}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-all disabled:opacity-50"
      style={{ fontFamily: "'Kumbh Sans', sans-serif" }}
    />
  </div>
);

const Notify = ({ msg }) => {
  if (!msg) return null;
  const isErr = msg.type === "error";
  return (
    <div className={`flex items-center gap-2 p-3 rounded-xl text-sm mb-4 ${
      isErr
        ? "bg-red-50 dark:bg-red-500/10 border border-red-200 text-red-600"
        : "bg-green-50 dark:bg-green-500/10 border border-green-200 text-green-600"
    }`}>
      {isErr ? <AlertCircle size={14} /> : <CheckCircle2 size={14} />}
      {msg.text}
    </div>
  );
};

// ── Address form modal ────────────────────────────────────────────────────────
function AddressModal({ address, onClose, onSaved }) {
  const { t } = useTranslation();
  const isEdit = !!address;
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState(null);
  const [form, setForm] = useState({
    firstName:        address?.firstName        ?? "",
    lastName:         address?.lastName         ?? "",
    adresse:          address?.adresse          ?? "",
    complementAdresse:address?.complementAdresse?? "",
    city:             address?.city             ?? "",
    region:           address?.region           ?? "",
    country:          address?.country          ?? "",
    codePostal:       address?.codePostal       ?? "",
    phone:            address?.phone            ?? "",
    isDefault:        address?.isDefault        ?? false,
  });

  const set = (k) => (v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const required = ["firstName","lastName","adresse","city","region","country","codePostal","phone"];
    const missing = required.find(k => !String(form[k] ?? "").trim());
    if (missing) { setError(t("account.fill_required")); return; }
    setSaving(true);
    try {
      const res = isEdit
        ? await adressesAPI.update(address._id, form)
        : await adressesAPI.create(form);
      if (res?.data?.success === false) {
        setError(res.data.message || t("account.address_error"));
        return;
      }
      // create()/update() ne désactivent pas les autres « par défaut » :
      // si l'utilisateur coche « par défaut », on passe par l'endpoint dédié
      // qui garantit une seule adresse par défaut.
      if (form.isDefault) {
        const saved = res.data?.data ?? res.data;
        const savedId = saved?._id ?? address?._id;
        if (savedId) {
          try { await adressesAPI.setDefault(savedId); } catch { /* non-bloquant */ }
        }
      }
      onSaved();
    } catch (err) {
      setError(apiMessage(err, t("account.address_error")));
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
          <h3 className="font-semibold text-[var(--text-primary)]">{isEdit ? t("account.edit_address") : t("account.new_address")}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-muted)] transition-colors"><X size={15} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-3">
          {error && <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>}
          <div className="grid grid-cols-2 gap-3">
            <Field label={t("account.field_fn")} value={form.firstName} onChange={set("firstName")} placeholder={t("account.ph_fn")} />
            <Field label={t("account.field_ln")} value={form.lastName}  onChange={set("lastName")}  placeholder={t("account.ph_ln")} />
          </div>
          <Field label={t("account.field_addr")}       value={form.adresse}    onChange={set("adresse")}   placeholder={t("account.ph_addr")} />
          <Field label={t("account.field_complement")} value={form.complementAdresse} onChange={set("complementAdresse")} placeholder={t("account.ph_complement")} />
          <div className="grid grid-cols-2 gap-3">
            <Field label={t("account.field_city")}   value={form.city}   onChange={set("city")}   placeholder={t("account.ph_city")} />
            <Field label={t("account.field_region")} value={form.region} onChange={set("region")} placeholder={t("account.ph_region")} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label={t("account.field_postal")}  value={form.codePostal} onChange={set("codePostal")} placeholder={t("account.ph_postal")} inputMode="numeric" />
            <Field label={t("account.field_country")} value={form.country}    onChange={set("country")}   placeholder={t("account.ph_country")} />
          </div>
          <Field label={t("account.field_phone")} value={form.phone} onChange={set("phone")} placeholder={t("account.ph_phone")} inputMode="tel" />
          <DefaultToggle checked={form.isDefault} onChange={set("isDefault")} label={t("account.default_address")} />
          <div className="flex gap-3 pt-2 border-t border-[var(--border)]">
            <button type="button" onClick={onClose} disabled={saving}
              className="flex-1 h-10 rounded-xl text-sm font-medium border border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--bg-muted)] disabled:opacity-50 transition-all">
              {t("account.cancel")}
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 h-10 rounded-xl text-sm font-medium bg-[var(--accent)] text-white hover:opacity-90 disabled:opacity-50 transition-all">
              {saving ? t("account.saving") : t("account.save_address")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Card form modal (Stripe Elements — saves the card without charging) ───────
function CardModal(props) {
  return (
    <Elements stripe={stripePromise}>
      <CardModalForm {...props} />
    </Elements>
  );
}

function CardModalForm({ card, onClose, onSaved }) {
  const { t } = useTranslation();
  const stripe = useStripe();
  const elements = useElements();
  const isEdit = !!card;
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState(null);
  const [carteName, setCarteName] = useState(card?.carteName ?? "");
  const [isDefault, setIsDefault] = useState(card?.isDefault ?? false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!carteName.trim()) { setError(t("checkout.error_cardholder")); return; }

    // En édition, la carte est déjà tokenisée chez Stripe : on ne modifie que
    // le nom du titulaire et le statut « par défaut ».
    if (isEdit) {
      setSaving(true);
      try {
        const res = await cartesAPI.update(card._id, { carteName, isDefault });
        if (res?.data?.success === false) { setError(res.data.message || t("account.card_error")); return; }
        onSaved();
      } catch (err) {
        setError(apiMessage(err, t("account.card_error")));
      } finally { setSaving(false); }
      return;
    }

    // Création : SetupIntent (0 €) → confirmation Stripe → enregistrement en base.
    if (!stripe || !elements) { setError(t("account.stripe_unavailable")); return; }
    setSaving(true);
    try {
      const si = await cartesAPI.createSetupIntent();
      const clientSecret = si?.data?.data?.clientSecret;
      if (!clientSecret) { setError(t("account.card_error")); return; }

      const { error: stripeErr, setupIntent } = await stripe.confirmCardSetup(clientSecret, {
        payment_method: {
          card: elements.getElement(CardNumberElement),
          billing_details: { name: carteName },
        },
      });
      if (stripeErr) { setError(stripeErr.message || t("account.card_error")); return; }

      const res = await cartesAPI.create({
        carteName,
        stripePaymentMethodId: setupIntent.payment_method,
        isDefault,
      });
      if (res?.data?.success === false) { setError(res.data.message || t("account.card_error")); return; }
      onSaved();
    } catch (err) {
      setError(apiMessage(err, t("account.card_error")));
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
          <h3 className="font-semibold text-[var(--text-primary)]">{isEdit ? t("account.edit_card") : t("account.new_card")}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-muted)] transition-colors"><X size={15} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-3">
          {error && <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>}

          <Field label={t("account.field_cardholder")} value={carteName} onChange={setCarteName} placeholder="John Doe" />

          {isEdit ? (
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>{t("account.card_edit_hint")}</p>
          ) : (
            <StripeCardFields />
          )}

          <DefaultToggle checked={isDefault} onChange={setIsDefault} label={t("account.default_card")} />
          <p className="text-xs text-[var(--text-muted)]">🔒 {t("account.card_security")}</p>
          <div className="flex gap-3 pt-2 border-t border-[var(--border)]">
            <button type="button" onClick={onClose} disabled={saving}
              className="flex-1 h-10 rounded-xl text-sm font-medium border border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--bg-muted)] disabled:opacity-50 transition-all">
              {t("account.cancel")}
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 h-10 rounded-xl text-sm font-medium bg-[var(--accent)] text-white hover:opacity-90 disabled:opacity-50 transition-all">
              {saving ? t("account.saving") : t("account.save_card")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Addresses tab ─────────────────────────────────────────────────────────────
function AddressesTab() {
  const { t } = useTranslation();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [modal, setModal]         = useState(null);
  const [msg, setMsg]             = useState(null);

  const load = () => {
    setLoading(true);
    adressesAPI.getByUser()
      .then(r => setAddresses(r.data?.data ?? r.data ?? []))
      .catch(() => setAddresses([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    try {
      await adressesAPI.delete(id);
      setMsg({ type: "success", text: t("account.address_removed") });
      load();
    } catch {
      setMsg({ type: "error", text: t("account.address_error") });
    }
    setTimeout(() => setMsg(null), 3000);
  };

  // Choisir l'adresse par défaut parmi les adresses existantes (le backend
  // retire automatiquement le flag des autres → une seule par défaut).
  const handleSetDefault = async (id) => {
    try {
      const res = await adressesAPI.setDefault(id);
      if (res?.data?.success === false) {
        setMsg({ type: "error", text: res.data.message || t("account.address_error") });
      } else {
        setMsg({ type: "success", text: t("account.default_updated") });
        load();
      }
    } catch {
      setMsg({ type: "error", text: t("account.address_error") });
    }
    setTimeout(() => setMsg(null), 3000);
  };

  return (
    <div>
      <Notify msg={msg} />
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{t("account.addresses_title")}</p>
        <button onClick={() => setModal({ type: "create" })} className="btn-primary gap-2 h-9 px-4 text-sm">
          <Plus size={14} /> {t("account.add_address")}
        </button>
      </div>

      {loading ? (
        <div className="space-y-3 mb-6 lg:mb-0">{[0,1].map(i => <div key={i} className="skeleton h-24 rounded-2xl" />)}</div>
      ) : addresses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--border)] p-10 text-center mb-6 lg:mb-0">
          <MapPin size={28} style={{ color: "var(--text-muted)", margin: "0 auto 8px" }} />
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>{t("account.no_addresses")}</p>
        </div>
      ) : (
        <div className="space-y-3 mb-6 lg:mb-0">
          {addresses.map(a => (
            <div key={a._id} className="cyna-card p-4 flex items-start gap-3">
              <MapPin size={16} style={{ color: "var(--accent)", marginTop: 2, flexShrink: 0 }} />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-[var(--text-primary)] flex items-center gap-2 flex-wrap">
                  {a.firstName} {a.lastName}
                  {a.isDefault && <span className="badge badge-accent text-[10px] px-2 py-0.5">{t("account.default_badge")}</span>}
                </p>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">{a.adresse}{a.complementAdresse ? `, ${a.complementAdresse}` : ""}</p>
                <p className="text-xs text-[var(--text-secondary)]">{a.codePostal} {a.city}, {a.region}, {a.country}</p>
                <p className="text-xs text-[var(--text-muted)]">{a.phone}</p>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                {!a.isDefault && (
                  <button onClick={() => handleSetDefault(a._id)} title={t("account.set_default")} aria-label={t("account.set_default")}
                    className="p-1.5 rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-muted)] hover:text-[var(--accent)] transition-colors">
                    <Star size={13} />
                  </button>
                )}
                <button onClick={() => setModal({ type: "edit", data: a })}
                  className="p-1.5 rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-muted)] hover:text-[var(--accent)] transition-colors">
                  <Edit2 size={13} />
                </button>
                <button onClick={() => handleDelete(a._id)}
                  className="p-1.5 rounded-lg text-[var(--text-muted)] hover:bg-red-50 hover:text-red-500 transition-colors">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal?.type === "create" && <AddressModal onClose={() => setModal(null)} onSaved={() => { setModal(null); load(); }} />}
      {modal?.type === "edit"   && <AddressModal address={modal.data} onClose={() => setModal(null)} onSaved={() => { setModal(null); load(); }} />}
    </div>
  );
}

// ── Subscription status pill ──────────────────────────────────────────────────
const SUB_STATUS = {
  ACTIF:    { key: "status_active",   cls: "bg-green-50 text-green-600 border-green-200" },
  PENDING:  { key: "status_pending",  cls: "bg-amber-50 text-amber-600 border-amber-200" },
  CANCELED: { key: "status_canceled", cls: "bg-red-50 text-red-600 border-red-200" },
  DESACTIF: { key: "status_inactive", cls: "bg-gray-50 text-gray-600 border-gray-200" },
  FINISHED: { key: "status_expired",  cls: "bg-gray-50 text-gray-600 border-gray-200" },
};
function SubStatusPill({ statut }) {
  const { t } = useTranslation();
  const m = SUB_STATUS[statut] ?? SUB_STATUS.ACTIF;
  return (
    <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${m.cls}`}>
      {t(`account.${m.key}`)}
    </span>
  );
}

const subPeriodeLabel = (p, t) => String(p).toUpperCase() === "ANNEE" ? t("account.yearly") : t("account.monthly");

// ── Subscription detail modal ────────────────────────────────────────────────
function SubscriptionDetailModal({ subscription, onClose }) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const remaining = daysBetween(new Date(), subscription.dateFin);
  const total     = daysBetween(subscription.dateDebut, subscription.dateFin) ?? 1;
  const elapsed   = Math.max(0, total - (remaining ?? 0));
  const progress  = Math.min(100, Math.max(0, (elapsed / total) * 100));

  const copyLicense = async () => {
    try {
      await navigator.clipboard.writeText(subscription.keyLicence);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch { /* clipboard unavailable */ }
  };

  const daysLabel = (n) => n != null && n > 0
    ? `${n} ${n > 1 ? t("account.days_remaining") : t("account.day_remaining")}`
    : t("account.status_expired");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] shadow-2xl">
        <div className="flex items-start justify-between gap-3 px-6 py-4 border-b border-[var(--border)]">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <SubStatusPill statut={subscription.statut} />
              <span className="text-[10px] font-mono text-[var(--text-muted)]">{subscription.commandeReference}</span>
            </div>
            <h3 className="font-semibold text-[var(--text-primary)] truncate">{subscription.product?.name}</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-muted)] transition-colors flex-shrink-0">
            <X size={15} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* License code */}
          <div>
            <label className="block text-xs font-[Kumbh Sans] font-600 mb-1.5" style={{ color: "var(--text-muted)" }}>
              <KeyRound size={11} className="inline mr-1" /> {t("account.license_label")}
            </label>
            <div className="flex items-stretch gap-2">
              <code
                className="flex-1 px-3 py-2.5 rounded-xl font-mono text-sm tracking-wider truncate"
                style={{ background: "var(--bg-subtle)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
              >
                {subscription.keyLicence}
              </code>
              <button
                onClick={copyLicense}
                className="px-3 rounded-xl text-xs font-medium transition-colors"
                style={{
                  background: copied ? "var(--success, #10b981)" : "var(--accent)",
                  color: "#fff",
                }}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>
            <p className="text-[11px] mt-1.5" style={{ color: "var(--text-muted)" }}>
              {t("account.license_hint")}
            </p>
          </div>

          {/* Progress bar */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-[Kumbh Sans] font-600" style={{ color: "var(--text-muted)" }}>{t("account.period_progress")}</span>
              <span className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
                {daysLabel(remaining)}
              </span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--bg-muted)" }}>
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${progress}%`, background: "linear-gradient(90deg, rgba(99,102,241,0.95), rgba(139,92,246,0.95))" }}
              />
            </div>
          </div>

          {/* Grid: details */}
          <div className="grid grid-cols-2 gap-3">
            <DetailCell icon={Calendar} label={t("account.start_date")} value={fmtDateLong(subscription.dateDebut)} />
            <DetailCell icon={Clock}    label={t("account.expires_on")} value={fmtDateLong(subscription.dateFin)} />
            <DetailCell icon={Receipt}  label={t("account.plan_label")} value={subPeriodeLabel(subscription.periode, t)} />
            <DetailCell icon={Package}  label={t("account.quantity_label")} value={`× ${subscription.quantity ?? 1}`} />
          </div>

          {/* Pricing */}
          <div
            className="flex items-center justify-between p-4 rounded-xl"
            style={{ background: "var(--bg-subtle)", border: "1px solid var(--border)" }}
          >
            <p className="text-xs font-[Kumbh Sans] font-600" style={{ color: "var(--text-muted)" }}>
              {t("account.subscription_cost")}
            </p>
            <span className="font-[Kumbh Sans] font-700 text-lg" style={{ color: "var(--accent)" }}>
              {fmtEur(subscription.price)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailCell({ icon: Icon, label, value }) {
  return (
    <div className="p-3 rounded-xl" style={{ background: "var(--bg-subtle)", border: "1px solid var(--border)" }}>
      <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>
        <Icon size={11} /> {label}
      </p>
      <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{value}</p>
    </div>
  );
}

// ── Edit subscription modal (quantity + period; price recomputed) ─────────────
function SubEditModal({ subscription, onClose, onSaved }) {
  const { t } = useTranslation();
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState(null);
  const [quantity, setQuantity] = useState(String(subscription.quantity ?? 1));
  const [periode, setPeriode]   = useState(subscription.periode ?? "MOIS");

  const unitPrice = periode === "ANNEE"
    ? Number(subscription.product?.priceYear ?? 0)
    : Number(subscription.product?.priceMonth ?? 0);
  const newTotal = unitPrice * Math.max(1, Number(quantity) || 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const q = Number(quantity);
    if (!Number.isFinite(q) || q <= 0) { setError(t("account.invalid_quantity")); return; }
    setSaving(true);
    try {
      const res = await commandesAPI.updateAbonnement(subscription._id, { quantity: q, periode });
      if (res?.data?.success === false) { setError(res.data.message || t("account.subscription_error")); return; }
      onSaved();
    } catch (err) {
      setError(apiMessage(err, t("account.subscription_error")));
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
          <h3 className="font-semibold text-[var(--text-primary)]">{t("account.modify_subscription")}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-muted)] transition-colors"><X size={15} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>}
          <p className="text-sm font-medium text-[var(--text-primary)]">{subscription.product?.name}</p>

          <Field label={t("account.quantity_label")} type="number" inputMode="numeric" value={quantity} onChange={setQuantity} />

          <div>
            <label className="block text-xs font-[Kumbh Sans] font-600 mb-1.5" style={{ color: "var(--text-muted)" }}>{t("account.plan_label")}</label>
            <div className="flex gap-2">
              {["MOIS", "ANNEE"].map((p) => (
                <button key={p} type="button" onClick={() => setPeriode(p)}
                  className={`flex-1 h-10 rounded-xl border text-sm font-medium transition-all ${periode === p ? "border-[var(--accent)] bg-[var(--accent-light)] text-[var(--accent)]" : "border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)]"}`}>
                  {p === "ANNEE" ? t("account.yearly") : t("account.monthly")}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: "var(--bg-subtle)", border: "1px solid var(--border)" }}>
            <span className="text-xs font-[Kumbh Sans] font-600" style={{ color: "var(--text-muted)" }}>{t("account.new_total")}</span>
            <span className="font-[Kumbh Sans] font-700 text-base" style={{ color: "var(--accent)" }}>{fmtEur(newTotal)}</span>
          </div>

          <div className="flex gap-3 pt-2 border-t border-[var(--border)]">
            <button type="button" onClick={onClose} disabled={saving}
              className="flex-1 h-10 rounded-xl text-sm font-medium border border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--bg-muted)] disabled:opacity-50 transition-all">
              {t("account.cancel")}
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 h-10 rounded-xl text-sm font-medium bg-[var(--accent)] text-white hover:opacity-90 disabled:opacity-50 transition-all">
              {saving ? t("account.saving") : t("account.save")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Reusable confirm modal (résilier / renouveler) ────────────────────────────
function ConfirmActionModal({ title, body, confirmLabel, busy, danger, onCancel, onConfirm }) {
  const { t } = useTranslation();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !busy && onCancel()} />
      <div className="relative w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] shadow-2xl p-6">
        <h3 className="font-semibold mb-2" style={{ color: danger ? "var(--danger)" : "var(--text-primary)" }}>{title}</h3>
        <p className="text-sm mb-5" style={{ color: "var(--text-secondary)" }}>{body}</p>
        <div className="flex gap-3">
          <button type="button" onClick={onCancel} disabled={busy}
            className="flex-1 h-10 rounded-xl text-sm font-medium border border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--bg-muted)] disabled:opacity-50 transition-all">
            {t("account.cancel")}
          </button>
          <button type="button" onClick={onConfirm} disabled={busy}
            className={`flex-1 h-10 rounded-xl text-sm font-medium text-white disabled:opacity-50 transition-all inline-flex items-center justify-center gap-2 ${danger ? "bg-red-600 hover:bg-red-700" : "bg-[var(--accent)] hover:opacity-90"}`}>
            {busy ? <RefreshCw size={14} className="animate-spin" /> : null}
            {busy ? t("account.processing") : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Subscriptions tab ─────────────────────────────────────────────────────────
function SubscriptionsTab() {
  const { t } = useTranslation();
  const [subs, setSubs]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg]         = useState(null);
  const [selected, setSelected] = useState(null); // detail modal
  const [editing, setEditing]   = useState(null); // edit modal
  const [confirm, setConfirm]   = useState(null); // { type: 'resilier' | 'renew', sub }
  const [busy, setBusy]         = useState(false);

  const load = () => {
    setLoading(true);
    commandesAPI.getAbonnements()
      .then(r => setSubs(r.data?.data ?? r.data ?? []))
      .catch(() => setSubs([]))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const flash = (type, text) => { setMsg({ type, text }); setTimeout(() => setMsg(null), 3500); };

  const doResilier = async (sub) => {
    setBusy(true);
    try {
      const res = await commandesAPI.resilierAbonnement(sub._id);
      if (res?.data?.success === false) flash("error", res.data.message || t("account.subscription_error"));
      else { flash("success", t("account.resilier_success")); load(); }
    } catch (e) {
      flash("error", apiMessage(e, t("account.subscription_error")));
    } finally { setBusy(false); setConfirm(null); }
  };

  const doRenew = async (sub) => {
    setBusy(true);
    try {
      const res = await commandesAPI.renouvelerAbonnement(sub._id);
      const body = res?.data;
      if (!body?.success) { flash("error", body?.message || t("account.subscription_error")); return; }
      const payload = body.data ?? {};

      if (payload.status === "REQUIRES_ACTION" && payload.clientSecret) {
        const stripe = await stripePromise;
        if (!stripe) { flash("error", t("account.stripe_unavailable")); return; }
        const { error: scaErr, paymentIntent } = await stripe.confirmCardPayment(payload.clientSecret);
        if (scaErr) { flash("error", scaErr.message || t("account.subscription_error")); return; }
        if (paymentIntent?.status !== "succeeded") { flash("error", t("account.subscription_error")); return; }
        const cRes = await commandesAPI.confirmRenouvellement(sub._id, paymentIntent.id);
        if (cRes?.data?.success === false) { flash("error", cRes.data.message || t("account.subscription_error")); return; }
      } else if (payload.status !== "PAID") {
        flash("error", body?.message || t("account.subscription_error")); return;
      }

      flash("success", t("account.renew_success")); load();
    } catch (e) {
      flash("error", apiMessage(e, t("account.subscription_error")));
    } finally { setBusy(false); setConfirm(null); }
  };

  const actionBtn = "inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-[var(--border)] transition-colors disabled:opacity-50";

  return (
    <div>
      <Notify msg={msg} />
      <div className="cyna-card p-6 mb-6 lg:mb-0">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-[var(--text-primary)]">{t("account.subscriptions_title")}</h2>
          {!loading && subs.length > 0 && (
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>{t("account.subscriptions_count", { count: subs.length })}</span>
          )}
        </div>

        {loading ? (
          <div className="space-y-3">{[0, 1].map(i => <div key={i} className="skeleton h-28 rounded-2xl" />)}</div>
        ) : subs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--border)] p-10 text-center">
            <Sparkles size={28} style={{ color: "var(--text-muted)", margin: "0 auto 8px" }} />
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>{t("account.no_subscriptions")}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {subs.map((s) => {
              const remaining = daysBetween(new Date(), s.dateFin);
              const daysLeft = remaining != null && remaining > 0
                ? `${remaining} ${remaining > 1 ? t("account.days_remaining") : t("account.day_remaining")}`
                : t("account.status_expired");
              const isCanceled = s.statut === "CANCELED";
              return (
                <div key={s._id} className="rounded-2xl border border-[var(--border)] p-4" style={{ background: "var(--bg-card)" }}>
                  <div className="flex items-start gap-3 flex-wrap">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "var(--bg-subtle)" }}>
                      <Sparkles size={16} style={{ color: "var(--accent)" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <p className="font-medium text-sm text-[var(--text-primary)] truncate">{s.product?.name}</p>
                        <SubStatusPill statut={s.statut} />
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full" style={{ background: "var(--bg-subtle)", color: "var(--text-secondary)" }}>
                          {subPeriodeLabel(s.periode, t)}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs" style={{ color: "var(--text-secondary)" }}>
                        <span className="inline-flex items-center gap-1"><Clock size={11} /> {daysLeft}</span>
                        <span style={{ color: "var(--text-muted)" }}>·</span>
                        <span>{fmtDateLong(s.dateFin)}</span>
                      </div>
                    </div>
                    <span className="font-[Kumbh Sans] font-700 text-sm flex-shrink-0" style={{ color: "var(--accent)" }}>{fmtEur(s.price)}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-3 pt-3 flex-wrap" style={{ borderTop: "1px solid var(--border)" }}>
                    <button onClick={() => setSelected(s)} className="text-xs font-medium inline-flex items-center gap-1" style={{ color: "var(--text-muted)" }}>
                      {t("account.view_details")} <ChevronRight size={12} />
                    </button>
                    <div className="ml-auto flex items-center gap-1.5 flex-wrap">
                      {!isCanceled && (
                        <button onClick={() => setEditing(s)} className={`${actionBtn} text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--accent)]`}>
                          <Edit2 size={12} /> {t("account.modify")}
                        </button>
                      )}
                      <button onClick={() => setConfirm({ type: "renew", sub: s })} className={`${actionBtn} text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--accent)]`}>
                        <RefreshCw size={12} /> {t("account.renew")}
                      </button>
                      {!isCanceled && (
                        <button onClick={() => setConfirm({ type: "resilier", sub: s })} className={`${actionBtn} text-red-500 hover:border-red-300 hover:bg-red-50 dark:hover:bg-red-500/10`}>
                          <Ban size={12} /> {t("account.resilier")}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selected && <SubscriptionDetailModal subscription={selected} onClose={() => setSelected(null)} />}

      {editing && (
        <SubEditModal
          subscription={editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); flash("success", t("account.modify_success")); load(); }}
        />
      )}

      {confirm?.type === "resilier" && (
        <ConfirmActionModal
          title={t("account.confirm_resilier_title")}
          body={t("account.confirm_resilier_body")}
          confirmLabel={t("account.resilier")}
          busy={busy}
          danger
          onCancel={() => setConfirm(null)}
          onConfirm={() => doResilier(confirm.sub)}
        />
      )}

      {confirm?.type === "renew" && (
        <ConfirmActionModal
          title={t("account.confirm_renew_title")}
          body={t("account.confirm_renew_body", { price: fmtEur(confirm.sub.price) })}
          confirmLabel={t("account.renew")}
          busy={busy}
          onCancel={() => setConfirm(null)}
          onConfirm={() => doRenew(confirm.sub)}
        />
      )}
    </div>
  );
}

// ── Orders tab ────────────────────────────────────────────────────────────────
function OrdersTab() {
  const { t } = useTranslation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    commandesAPI.getByUser({ limit: 50 })
      .then(r => {
        const payload = r.data?.data ?? r.data ?? {};
        const list = payload?.data ?? payload;
        setOrders(Array.isArray(list) ? list : []);
      })
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  const statusBadge = (statut) => {
    const map = {
      PAID:   { label: "Paid",      cls: "bg-green-50 text-green-600 border-green-200" },
      PENDING:{ label: "Pending",   cls: "bg-amber-50 text-amber-600 border-amber-200" },
      CANCEL: { label: "Cancelled", cls: "bg-red-50 text-red-600 border-red-200"       },
    };
    const m = map[statut] ?? { label: statut, cls: "bg-gray-50 text-gray-600 border-gray-200" };
    return (
      <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${m.cls}`}>
        {m.label}
      </span>
    );
  };

  if (loading) {
    return <div className="space-y-3">{[0, 1, 2].map(i => <div key={i} className="skeleton h-24 rounded-2xl" />)}</div>;
  }

  if (orders.length === 0) {
    return (
      <div className="cyna-card p-6 mb-5 lg:mb-0">
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">{t("account.orders_title")}</h2>
        <div className="rounded-2xl border border-dashed border-[var(--border)] p-10 text-center">
          <Package size={32} style={{ color: "var(--text-muted)", margin: "0 auto 8px" }} />
          <p className="font-[Kumbh Sans] font-600 mb-1" style={{ color: "var(--text-secondary)" }}>{t("account.no_orders")}</p>
          <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>
            {t("account.no_orders_hint")}
          </p>
          <Link to="/categories" className="btn-primary gap-2 inline-flex items-center">
            <Star size={14} /> {t("account.explore_solutions")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cyna-card p-6 mb-5 lg:mb-0">
      <h2 className="font-semibold text-[var(--text-primary)] mb-4">{t("account.orders_title")}</h2>
      <div className="space-y-3">
        {orders.map(order => (
          <div key={order._id ?? order.reference} className="rounded-2xl border border-[var(--border)] p-4">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="min-w-0">
                <p className="font-medium text-sm text-[var(--text-primary)]">
                  {t("account.order_prefix")}{order.reference}
                </p>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : ""}
                  {order.nbreProducts ? ` · ${order.nbreProducts} ${order.nbreProducts > 1 ? t("account.items") : t("account.item")}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {statusBadge(order.statut)}
                <span className="font-[Kumbh Sans] font-700 text-sm text-[var(--accent)]">
                  {Number(order.totalPrice ?? 0).toFixed(2)} €
                </span>
              </div>
            </div>

            {Array.isArray(order.abonnements) && order.abonnements.length > 0 && (
              <div className="mt-3 pt-3 border-t border-[var(--border)] space-y-1.5">
                {order.abonnements.map((ab, idx) => {
                  const pname = ab.product?.name ?? "Product";
                  return (
                    <div key={idx} className="flex justify-between text-xs">
                      <span className="text-[var(--text-secondary)]">
                        {pname} ×{ab.quantity ?? 1}
                        <span className="text-[var(--text-muted)] ml-1">
                          ({ab.periode === "ANNEE" ? t("account.yearly") : t("account.monthly")})
                        </span>
                      </span>
                      <span className="text-[var(--text-primary)] font-medium">
                        {Number(ab.price ?? 0).toFixed(2)} €
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Payment cards tab ─────────────────────────────────────────────────────────
function CardsTab() {
  const { t } = useTranslation();
  const [cards, setCards]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]     = useState(null);
  const [msg, setMsg]         = useState(null);

  const load = () => {
    setLoading(true);
    cartesAPI.getByUser()
      .then(r => setCards(r.data?.data ?? r.data ?? []))
      .catch(() => setCards([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    try {
      await cartesAPI.delete(id);
      setMsg({ type: "success", text: t("account.card_removed") });
      load();
    } catch {
      setMsg({ type: "error", text: t("account.card_remove_error") });
    }
    setTimeout(() => setMsg(null), 3000);
  };

  // Choisir le moyen de paiement par défaut (le backend retire le flag des
  // autres cartes → une seule par défaut).
  const handleSetDefault = async (id) => {
    try {
      const res = await cartesAPI.update(id, { isDefault: true });
      if (res?.data?.success === false) {
        setMsg({ type: "error", text: res.data.message || t("account.card_error") });
      } else {
        setMsg({ type: "success", text: t("account.default_updated") });
        load();
      }
    } catch {
      setMsg({ type: "error", text: t("account.card_error") });
    }
    setTimeout(() => setMsg(null), 3000);
  };

  const mask = (n) => n ? `•••• •••• •••• ${String(n).slice(-4)}` : "•••• •••• •••• ••••";

  return (
    <div>
      <Notify msg={msg} />
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{t("account.payment_title")}</p>
        <button onClick={() => setModal({ type: "create" })} className="btn-primary gap-2 h-9 px-4 text-sm">
          <Plus size={14} /> {t("account.add_card")}
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">{[0,1].map(i => <div key={i} className="skeleton h-20 rounded-2xl" />)}</div>
      ) : cards.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--border)] p-10 text-center mb-6 lg:mb-0">
          <CreditCard size={28} style={{ color: "var(--text-muted)", margin: "0 auto 8px" }} />
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>{t("account.no_cards")}</p>
        </div>
      ) : (
        <div className="space-y-3 mb-6 lg:mb-0">
          {cards.map(c => (
            <div key={c._id} className="cyna-card p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--bg-muted)] flex items-center justify-center flex-shrink-0">
                <CreditCard size={18} style={{ color: "var(--accent)" }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-[var(--text-primary)] flex items-center gap-2 flex-wrap">
                  {mask(c.carteNumber)}
                  {c.isDefault && <span className="badge badge-accent text-[10px] px-2 py-0.5">{t("account.default_badge")}</span>}
                </p>
                <p className="text-xs text-[var(--text-muted)]">{c.carteName} {t("account.card_expires")} {c.carteDate}</p>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                {!c.isDefault && (
                  <button onClick={() => handleSetDefault(c._id)} title={t("account.set_default")} aria-label={t("account.set_default")}
                    className="p-1.5 rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-muted)] hover:text-[var(--accent)] transition-colors">
                    <Star size={13} />
                  </button>
                )}
                <button onClick={() => setModal({ type: "edit", data: c })}
                  className="p-1.5 rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-muted)] hover:text-[var(--accent)] transition-colors">
                  <Edit2 size={13} />
                </button>
                <button onClick={() => handleDelete(c._id)}
                  className="p-1.5 rounded-lg text-[var(--text-muted)] hover:bg-red-50 hover:text-red-500 transition-colors">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal?.type === "create" && <CardModal onClose={() => setModal(null)} onSaved={() => { setModal(null); load(); }} />}
      {modal?.type === "edit"   && <CardModal card={modal.data} onClose={() => setModal(null)} onSaved={() => { setModal(null); load(); }} />}
    </div>
  );
}

// ── Main AccountPage ──────────────────────────────────────────────────────────
export default function AccountPage() {
  const { t } = useTranslation();
  const navigate   = useNavigate();
  const tokenUser  = getUser();
  const [tab, setTab]       = useState("profile");
  const [profile, setProfile] = useState({ firstName: "", lastName: "", email: "" });
  const [pwd, setPwd]       = useState({ current: "", new: "", confirm: "" });
  const [showPwd, setShowPwd] = useState(false);
  const [msg, setMsg]       = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const TABS = [
    { id: "profile",       label: t("account.tab_profile"),       icon: User       },
    { id: "password",      label: t("account.tab_password"),      icon: Lock       },
    { id: "addresses",     label: t("account.tab_addresses"),     icon: MapPin     },
    { id: "cards",         label: t("account.tab_payment"),       icon: CreditCard },
    { id: "subscriptions", label: t("account.tab_subscriptions"), icon: Sparkles   },
    { id: "orders",        label: t("account.tab_orders"),        icon: Package    },
  ];

  // Load the profile once on mount. We must NOT depend on `tokenUser`: getUser()
  // returns a fresh object every render, which would re-run this effect in a loop
  // and overwrite the fields with server data on every keystroke.
  useEffect(() => {
    if (!getUser()) { navigate("/auth"); return; }
    authAPI.me()
      .then(u => setProfile({
        firstName: u.firstName || "",
        lastName:  u.lastName  || "",
        email:     u.email     || "",
      }))
      .catch(() => {});
  }, [navigate]);

  const notify = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 3500);
  };

  const handleSaveProfile = async () => {
    if (!tokenUser?.id) return;
    const email = profile.email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      notify("error", t("account.invalid_email"));
      return;
    }
    setSaving(true);
    try {
      const res = await usersAPI.updateProfile(tokenUser.id, {
        firstName: profile.firstName.trim(),
        lastName:  profile.lastName.trim(),
        email,
      });
      if (res?.data?.success === false) {
        notify("error", res.data.message || t("account.profile_error"));
      } else {
        notify("success", t("account.profile_success"));
      }
    } catch (err) {
      notify("error", apiMessage(err, t("account.profile_error")));
    }
    setSaving(false);
  };

  const handleChangePassword = async () => {
    if (!pwd.current || !pwd.new || !pwd.confirm) { notify("error", t("account.fill_required")); return; }
    if (pwd.new !== pwd.confirm) { notify("error", t("account.password_mismatch")); return; }
    if (pwd.new.length < 8)      { notify("error", t("account.password_too_short")); return; }
    setSaving(true);
    try {
      const res = await usersAPI.changePassword({
        currentPassword: pwd.current,
        newPassword:     pwd.new,
        confirmPassword: pwd.confirm,
      });
      if (res?.data?.success === false) {
        notify("error", res.data.message || t("account.password_error"));
      } else {
        notify("success", t("account.password_success"));
        setPwd({ current: "", new: "", confirm: "" });
      }
    } catch (err) {
      notify("error", apiMessage(err, t("account.password_error")));
    }
    setSaving(false);
  };

  const handleDeleteAccount = async () => {
    if (!tokenUser?.id) return;
    setDeleting(true);
    try {
      const res = await usersAPI.delete(tokenUser.id);
      if (res?.data?.success === false) {
        notify("error", res.data.message || t("account.delete_account_error"));
        setDeleting(false);
        return;
      }
      // Compte supprimé → page de déconnexion (nettoie la session + redirige).
      navigate("/logout");
    } catch (err) {
      notify("error", apiMessage(err, t("account.delete_account_error")));
      setDeleting(false);
    }
  };

  return (
    <div className="page-enter" style={{ background: "var(--bg-base)", minHeight: "70vh" }}>
      {/* Header */}
      <div style={{ background: "var(--bg-subtle)", borderBottom: "1px solid var(--border)" }}>
        <div className="cyna-container py-10 sm:py-14">
          <p className="section-label">{t("account.title")}</p>
          <h1 className="section-title mb-2">{t("account.title")}</h1>
          <p className="text-sm mb-6" style={{ color: "var(--text-secondary)", fontFamily: "'Kumbh Sans', sans-serif" }}>
            {t("account.subtitle")}
          </p>
        </div>
      </div>

      <div className="cyna-container py-8 sm:py-12">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Sidebar */}
          <aside className="lg:w-64 flex-shrink-0 lg:mt-0 mt-8">
            <nav className="space-y-1">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    tab === id
                      ? "bg-[var(--accent)] text-white"
                      : "text-[var(--text-secondary)] hover:bg-[var(--bg-muted)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  <Icon size={15} />
                  {label}
                  {tab !== id && <ChevronRight size={13} className="ml-auto opacity-40" />}
                </button>
              ))}
              <button
                onClick={() => navigate("/logout")}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
              >
                <LogOut size={15} /> {t("account.sign_out")}
              </button>
            </nav>
          </aside>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <Notify msg={msg} />

            {/* ── Profile ── */}
            {tab === "profile" && (
              <div className="space-y-6 mb-6 lg:mb-0">
                <div className="cyna-card p-6 space-y-4">
                  <h2 className="font-semibold text-[var(--text-primary)] mb-4">{t("account.personal_info")}</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label={t("account.field_first_name")} value={profile.firstName} onChange={v => setProfile(p => ({ ...p, firstName: v }))} />
                    <Field label={t("account.field_last_name")}  value={profile.lastName}  onChange={v => setProfile(p => ({ ...p, lastName:  v }))} />
                  </div>
                  <Field label={t("account.field_email")} type="email" value={profile.email} onChange={v => setProfile(p => ({ ...p, email: v }))} />
                  <div className="flex justify-end">
                    <button onClick={handleSaveProfile} disabled={saving} className="btn-primary gap-2">
                      <Save size={14} />
                      {saving ? t("account.saving") : t("account.save")}
                    </button>
                  </div>
                </div>

                {/* Danger zone */}
                <div className="cyna-card p-6" style={{ borderColor: "rgba(239,68,68,0.4)" }}>
                  <h2 className="font-semibold mb-1 flex items-center gap-2" style={{ color: "var(--danger)" }}>
                    <AlertCircle size={16} /> {t("account.danger_zone")}
                  </h2>
                  <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
                    {t("account.delete_account_desc")}
                  </p>
                  <button
                    onClick={() => setDeleteOpen(true)}
                    className="inline-flex items-center gap-2 h-10 px-4 rounded-xl text-sm font-medium border border-red-300 dark:border-red-500/40 text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
                  >
                    <Trash2 size={14} /> {t("account.delete_account")}
                  </button>
                </div>
              </div>
            )}

            {/* ── Password ── */}
            {tab === "password" && (
              <div className="cyna-card p-6 space-y-4 mb-6 lg:mb-0">
                <h2 className="font-semibold text-[var(--text-primary)] mb-4">{t("account.change_password")}</h2>
                <Field
                  label={t("account.current_password")}
                  type={showPwd ? "text" : "password"}
                  value={pwd.current}
                  onChange={v => setPwd(p => ({ ...p, current: v }))}
                  placeholder={t("account.current_password_placeholder")}
                />
                <Field
                  label={t("account.new_password")}
                  type={showPwd ? "text" : "password"}
                  value={pwd.new}
                  onChange={v => setPwd(p => ({ ...p, new: v }))}
                  placeholder={t("account.password_hint")}
                />
                <Field
                  label={t("account.confirm_password")}
                  type={showPwd ? "text" : "password"}
                  value={pwd.confirm}
                  onChange={v => setPwd(p => ({ ...p, confirm: v }))}
                  placeholder={t("account.repeat_password")}
                />
                <button onClick={() => setShowPwd(v => !v)} className="text-xs flex items-center gap-1.5" style={{ color: "var(--text-muted)" }}>
                  {showPwd ? <EyeOff size={12} /> : <Eye size={12} />}
                  {showPwd ? t("account.hide_passwords") : t("account.show_passwords")}
                </button>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {t("account.password_requirement")}
                </p>
                <div className="flex justify-end">
                  <button onClick={handleChangePassword} disabled={saving || !pwd.current || !pwd.new || !pwd.confirm} className="btn-primary gap-2">
                    <Lock size={14} />
                    {saving ? t("account.saving") : t("account.change_password_btn")}
                  </button>
                </div>
              </div>
            )}

            {/* ── Addresses ── */}
            {tab === "addresses" && <AddressesTab />}

            {/* ── Payment cards ── */}
            {tab === "cards" && <CardsTab />}

            {/* ── Active subscriptions ── */}
            {tab === "subscriptions" && <SubscriptionsTab />}

            {/* ── Orders ── */}
            {tab === "orders" && <OrdersTab />}
          </div>
        </div>
      </div>

      {/* ── Delete account confirmation ── */}
      {deleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !deleting && setDeleteOpen(false)} />
          <div className="relative w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] shadow-2xl p-6">
            <div className="flex items-center gap-2 mb-2" style={{ color: "var(--danger)" }}>
              <AlertCircle size={18} />
              <h3 className="font-semibold">{t("account.delete_account_confirm_title")}</h3>
            </div>
            <p className="text-sm mb-5" style={{ color: "var(--text-secondary)" }}>
              {t("account.delete_account_confirm_body")}
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setDeleteOpen(false)}
                disabled={deleting}
                className="flex-1 h-10 rounded-xl text-sm font-medium border border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--bg-muted)] disabled:opacity-50 transition-all"
              >
                {t("account.cancel")}
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="flex-1 h-10 rounded-xl text-sm font-medium bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-all inline-flex items-center justify-center gap-2"
              >
                <Trash2 size={14} /> {deleting ? t("account.deleting") : t("account.delete_account")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
