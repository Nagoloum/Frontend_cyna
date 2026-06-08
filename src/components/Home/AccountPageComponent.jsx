import { adressesAPI, authAPI, cartesAPI, commandesAPI, usersAPI } from "@/services/api";
import {
  AlertCircle, CheckCircle2, ChevronRight, CreditCard,
  Edit2, Eye, EyeOff, Lock, LogOut, MapPin, Package,
  Plus, Save, Star, Trash2, User, X,
  Sparkles, Receipt, Calendar, Copy, KeyRound, Clock, Check,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

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

// ── Card input formatters (digits only + auto spacing) ────────────────────────
/** "1234567812345678" → "1234 5678 1234 5678" (max 19 digits) */
const formatCardNumber = (v) =>
  String(v ?? "").replace(/\D/g, "").slice(0, 19).replace(/(\d{4})(?=\d)/g, "$1 ");
/** "1227" → "12/27" (max 4 digits, MM/YY) */
const formatExpiry = (v) => {
  const d = String(v ?? "").replace(/\D/g, "").slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
};
/** Keep digits only, capped at `max` characters. */
const onlyDigits = (v, max) => String(v ?? "").replace(/\D/g, "").slice(0, max);

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

// ─── Mock data (UI only — backend integration pending) ───────────────────────
const MOCK_SUBSCRIPTIONS = [
  {
    _id: "sub_demo_1",
    reference: "SUB-2026-04127",
    product: { name: "EDR Pro Plan", slug: "edr-pro-plan" },
    licenseCode: "CYNA-EDR-7F9K-3X2P-LM84",
    dateDebut: "2026-01-15T00:00:00.000Z",
    dateFin:   "2026-07-15T00:00:00.000Z",
    periode: "MOIS",
    statut: "ACTIVE",
    price: 49.90,
    quantity: 1,
    autoRenew: true,
  },
  {
    _id: "sub_demo_2",
    reference: "SUB-2026-04098",
    product: { name: "SOC Monitoring", slug: "soc-monitoring" },
    licenseCode: "CYNA-SOC-X42M-9KQ7-VB13",
    dateDebut: "2025-11-01T00:00:00.000Z",
    dateFin:   "2026-11-01T00:00:00.000Z",
    periode: "ANNEE",
    statut: "ACTIVE",
    price: 1490.00,
    quantity: 3,
    autoRenew: true,
  },
];

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

// ── Card form modal ───────────────────────────────────────────────────────────
function CardModal({ card, onClose, onSaved }) {
  const { t } = useTranslation();
  const isEdit = !!card;
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState(null);
  const [show, setShow]     = useState(false);
  const [form, setForm] = useState({
    carteName:   card?.carteName   ?? "",
    carteNumber: card?.carteNumber ?? "",
    carteDate:   card?.carteDate   ?? "",
    carteCVV:    card?.carteCVV    ?? "",
    isDefault:   card?.isDefault   ?? false,
  });

  const set = (k) => (v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.carteName.trim())   { setError(t("checkout.error_cardholder")); return; }
    if (!form.carteNumber.trim()) { setError(t("checkout.error_card_number")); return; }
    if (!form.carteDate.trim())   { setError(t("checkout.error_expiry")); return; }
    if (!form.carteCVV.trim())    { setError(t("checkout.error_cvv")); return; }
    setSaving(true);
    try {
      const res = isEdit
        ? await cartesAPI.update(card._id, form)
        : await cartesAPI.create(form);
      if (res?.data?.success === false) {
        setError(t("account.card_error"));
        return;
      }
      onSaved();
    } catch {
      setError(t("account.card_error"));
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
          <Field label={t("account.field_cardholder")} value={form.carteName} onChange={set("carteName")} placeholder="John Doe" />
          <div className="relative">
            <Field
              label={t("account.field_card_number")}
              type="text"
              inputMode="numeric"
              value={form.carteNumber}
              onChange={(v) => set("carteNumber")(formatCardNumber(v))}
              placeholder="1234 5678 9012 3456"
            />

          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label={t("account.field_expiry")} inputMode="numeric" value={form.carteDate} onChange={(v) => set("carteDate")(formatExpiry(v))} placeholder="12/27" />
            <Field label={t("account.field_cvv")} type="password" inputMode="numeric" value={form.carteCVV} onChange={(v) => set("carteCVV")(onlyDigits(v, 4))} placeholder="123" />
          </div>
          <DefaultToggle checked={form.isDefault} onChange={set("isDefault")} label={t("account.default_card")} />
          <p className="text-xs text-[var(--text-muted)]">🔒 {t("account.card_security")}</p>
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
        <div className="space-y-3">{[0,1].map(i => <div key={i} className="skeleton h-24 rounded-2xl" />)}</div>
      ) : addresses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--border)] p-10 text-center">
          <MapPin size={28} style={{ color: "var(--text-muted)", margin: "0 auto 8px" }} />
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>{t("account.no_addresses")}</p>
        </div>
      ) : (
        <div className="space-y-3">
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

// ── Reusable info banner (backend integration pending) ───────────────────────
function MockBanner() {
  const { t } = useTranslation();
  return (
    <div
      className="flex items-start gap-2.5 p-3 rounded-xl text-xs mb-4"
      style={{ background: "var(--bg-subtle)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}
    >
      <AlertCircle size={13} className="flex-shrink-0 mt-0.5" style={{ color: "var(--accent)" }} />
      <span>{t("account.preview_note")}</span>
    </div>
  );
}

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
      await navigator.clipboard.writeText(subscription.licenseCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch { /* clipboard unavailable */ }
  };

  const periodeLabel = (p) => String(p).toUpperCase() === "ANNEE" ? t("account.yearly") : t("account.monthly");
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
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider"
                style={{ background: "var(--bg-subtle)", color: "var(--accent)" }}>
                <Sparkles size={10} /> {t("account.status_active")}
              </span>
              <span className="text-[10px] font-mono text-[var(--text-muted)]">{subscription.reference}</span>
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
                {subscription.licenseCode}
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
            <DetailCell icon={Receipt}  label={t("account.plan_label")} value={periodeLabel(subscription.periode)} />
            <DetailCell icon={Package}  label={t("account.quantity_label")} value={`× ${subscription.quantity ?? 1}`} />
          </div>

          {/* Pricing */}
          <div
            className="flex items-center justify-between p-4 rounded-xl"
            style={{ background: "var(--bg-subtle)", border: "1px solid var(--border)" }}
          >
            <div>
              <p className="text-xs font-[Kumbh Sans] font-600" style={{ color: "var(--text-muted)" }}>
                {subscription.autoRenew ? t("account.next_renewal") : t("account.subscription_cost")}
              </p>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
                {subscription.autoRenew
                  ? `${t("account.auto_renews")} ${fmtDateLong(subscription.dateFin)}`
                  : t("account.no_auto_renewal")}
              </p>
            </div>
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

// ── Subscriptions tab ─────────────────────────────────────────────────────────
function SubscriptionsTab() {
  const { t } = useTranslation();
  const [subs] = useState(MOCK_SUBSCRIPTIONS);
  const [selected, setSelected] = useState(null);

  const periodeLabel = (p) => String(p).toUpperCase() === "ANNEE" ? t("account.yearly") : t("account.monthly");

  const statusPill = (statut) => {
    const map = {
      ACTIVE:  { label: t("account.status_active"),  cls: "bg-green-50 text-green-600 border-green-200" },
      PENDING: { label: t("account.status_pending"), cls: "bg-amber-50 text-amber-600 border-amber-200" },
      EXPIRED: { label: t("account.status_expired"), cls: "bg-red-50 text-red-600 border-red-200" },
    };
    const m = map[statut] ?? map.ACTIVE;
    return (
      <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${m.cls}`}>
        {m.label}
      </span>
    );
  };

  if (subs.length === 0) {
    return (
      <div className="cyna-card p-6">
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">{t("account.subscriptions_title")}</h2>
        <div className="rounded-2xl border border-dashed border-[var(--border)] p-10 text-center">
          <Sparkles size={28} style={{ color: "var(--text-muted)", margin: "0 auto 8px" }} />
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>{t("account.no_subscriptions")}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <MockBanner />
      <div className="cyna-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-[var(--text-primary)]">{t("account.subscriptions_title")}</h2>
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>{t("account.subscriptions_count", { count: subs.length })}</span>
        </div>

        <div className="space-y-3">
          {subs.map((s) => {
            const remaining = daysBetween(new Date(), s.dateFin);
            const daysLeft = remaining != null && remaining > 0
              ? `${remaining} ${remaining > 1 ? t("account.days_remaining") : t("account.day_remaining")}`
              : t("account.status_expired");
            return (
              <button
                key={s._id}
                type="button"
                onClick={() => setSelected(s)}
                className="w-full text-left rounded-2xl border border-[var(--border)] hover:border-[var(--accent)] transition-all p-4 group"
                style={{ background: "var(--bg-card)" }}
              >
                <div className="flex items-start gap-3 flex-wrap">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "var(--bg-subtle)" }}
                  >
                    <Sparkles size={16} style={{ color: "var(--accent)" }} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <p className="font-medium text-sm text-[var(--text-primary)] truncate">{s.product?.name}</p>
                      {statusPill(s.statut)}
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
                        style={{ background: "var(--bg-subtle)", color: "var(--text-secondary)" }}>
                        {periodeLabel(s.periode)}
                      </span>
                    </div>
                    <p className="text-xs mb-2 font-mono" style={{ color: "var(--text-muted)" }}>
                      {s.reference}
                    </p>
                    <div className="flex items-center gap-3 text-xs" style={{ color: "var(--text-secondary)" }}>
                      <span className="inline-flex items-center gap-1">
                        <Clock size={11} /> {daysLeft}
                      </span>
                      <span style={{ color: "var(--text-muted)" }}>·</span>
                      <span>{fmtDateLong(s.dateFin)}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className="font-[Kumbh Sans] font-700 text-sm" style={{ color: "var(--accent)" }}>
                      {fmtEur(s.price)}
                    </span>
                    <span className="text-[11px] flex items-center gap-1 transition-colors group-hover:text-[var(--accent)]" style={{ color: "var(--text-muted)" }}>
                      {t("account.view_details")} <ChevronRight size={11} />
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {selected && (
        <SubscriptionDetailModal subscription={selected} onClose={() => setSelected(null)} />
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
      <div className="cyna-card p-6">
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
    <div className="cyna-card p-6">
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
        <div className="rounded-2xl border border-dashed border-[var(--border)] p-10 text-center">
          <CreditCard size={28} style={{ color: "var(--text-muted)", margin: "0 auto 8px" }} />
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>{t("account.no_cards")}</p>
        </div>
      ) : (
        <div className="space-y-3">
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
                <p className="text-xs text-[var(--text-muted)]">{c.carteName} — {t("account.card_expires")} {c.carteDate}</p>
              </div>
              <div className="flex gap-1 flex-shrink-0">
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
      // Session cleared + redirect to /auth.
      authAPI.logout();
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
          <aside className="lg:w-56 flex-shrink-0">
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
                onClick={() => authAPI.logout()}
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
              <div className="space-y-6">
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
              <div className="cyna-card p-6 space-y-4">
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
