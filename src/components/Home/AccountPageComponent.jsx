import { adressesAPI, authAPI, cartesAPI, commandesAPI, usersAPI } from "@/services/api";
import {
  AlertCircle, CheckCircle2, ChevronRight, CreditCard,
  Edit2, Eye, EyeOff, Lock, LogOut, MapPin, Package,
  Plus, Save, Star, Trash2, User, X,
  Sparkles, Receipt, Calendar, Copy, KeyRound, Clock, Check,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

// ── Auth helpers ──────────────────────────────────────────────────────────────
const getUser = () => {
  try {
    const t = localStorage.getItem("token");
    if (!t) return null;
    return JSON.parse(atob(t.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
  } catch { return null; }
};

// ── Sub-components ────────────────────────────────────────────────────────────
const TABS = [
  { id: "profile",       label: "My Profile",      icon: User       },
  { id: "password",      label: "Password",        icon: Lock       },
  { id: "addresses",     label: "Addresses",       icon: MapPin     },
  { id: "cards",         label: "Payment",         icon: CreditCard },
  { id: "subscriptions", label: "Subscriptions",   icon: Sparkles   },
  { id: "history",       label: "Billing history", icon: Receipt    },
  { id: "orders",        label: "My Orders",       icon: Package    },
];

// ─── Mock data (UI only — backend integration pending) ───────────────────────
// These shapes mirror what we'll consume from the API once it lands. The keys
// (`reference`, `product`, `licenseCode`, `dateDebut`, `dateFin`, `periode`,
// `statut`, `price`) intentionally match the backend Abonnement/Commande
// entities so the wiring will be a one-line swap.
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

const MOCK_HISTORY = [
  {
    _id: "pay_demo_1",
    reference: "INV-2026-04127",
    product: { name: "EDR Pro Plan" },
    date:    "2026-04-15T10:14:00.000Z",
    method:  "Visa •••• 4242",
    periode: "MOIS",
    amount:  49.90,
    statut:  "PAID",
  },
  {
    _id: "pay_demo_2",
    reference: "INV-2026-03127",
    product: { name: "EDR Pro Plan" },
    date:    "2026-03-15T10:14:00.000Z",
    method:  "Visa •••• 4242",
    periode: "MOIS",
    amount:  49.90,
    statut:  "PAID",
  },
  {
    _id: "pay_demo_3",
    reference: "INV-2025-11098",
    product: { name: "SOC Monitoring" },
    date:    "2025-11-01T08:32:00.000Z",
    method:  "Mastercard •••• 8129",
    periode: "ANNEE",
    amount:  4470.00,
    statut:  "PAID",
  },
  {
    _id: "pay_demo_4",
    reference: "INV-2025-09017",
    product: { name: "XDR Starter" },
    date:    "2025-09-12T09:05:00.000Z",
    method:  "Visa •••• 4242",
    periode: "MOIS",
    amount:  79.00,
    statut:  "REFUNDED",
  },
];

// ─── Utils used by the new tabs ──────────────────────────────────────────────
const fmtDateLong = (iso) => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      day: "2-digit", month: "short", year: "numeric",
    });
  } catch { return "—"; }
};

const fmtEur = (n) =>
  Number(n ?? 0).toLocaleString("fr-FR", { minimumFractionDigits: 2 }) + " €";

const periodeLabel = (p) => (String(p).toUpperCase() === "ANNEE" ? "Yearly" : "Monthly");

const daysBetween = (from, to) => {
  if (!from || !to) return null;
  const ms = new Date(to).getTime() - new Date(from).getTime();
  if (Number.isNaN(ms)) return null;
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
};

const Field = ({ label, type = "text", value, onChange, placeholder, disabled }) => (
  <div>
    <label className="block text-xs font-[Kumbh Sans] font-600 mb-1.5" style={{ color: "var(--text-muted)" }}>{label}</label>
    <input
      type={type}
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
  });

  const set = (k) => (v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const required = ["firstName","lastName","adresse","city","region","country","codePostal","phone"];
    const missing = required.find(k => !form[k].trim());
    if (missing) { setError(`Field "${missing}" is required.`); return; }
    setSaving(true);
    try {
      isEdit
        ? await adressesAPI.update(address._id, form)
        : await adressesAPI.create(form);
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message ?? "Error saving address.");
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
          <h3 className="font-semibold text-[var(--text-primary)]">{isEdit ? "Edit address" : "New address"}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-muted)] transition-colors"><X size={15} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-3">
          {error && <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>}
          <div className="grid grid-cols-2 gap-3">
            <Field label="First name *" value={form.firstName} onChange={set("firstName")} />
            <Field label="Last name *"  value={form.lastName}  onChange={set("lastName")}  />
          </div>
          <Field label="Address *"      value={form.adresse}    onChange={set("adresse")}   />
          <Field label="Complement"     value={form.complementAdresse} onChange={set("complementAdresse")} />
          <div className="grid grid-cols-2 gap-3">
            <Field label="City *"       value={form.city}       onChange={set("city")}      />
            <Field label="Region *"     value={form.region}     onChange={set("region")}    />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Postal code *" value={form.codePostal} onChange={set("codePostal")} />
            <Field label="Country *"    value={form.country}    onChange={set("country")}   />
          </div>
          <Field label="Phone *"        value={form.phone}      onChange={set("phone")}     />
          <div className="flex gap-3 pt-2 border-t border-[var(--border)]">
            <button type="button" onClick={onClose} disabled={saving}
              className="flex-1 h-10 rounded-xl text-sm font-medium border border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--bg-muted)] disabled:opacity-50 transition-all">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 h-10 rounded-xl text-sm font-medium bg-[var(--accent)] text-white hover:opacity-90 disabled:opacity-50 transition-all">
              {saving ? "Saving…" : isEdit ? "Save changes" : "Add address"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Card form modal ───────────────────────────────────────────────────────────
function CardModal({ card, onClose, onSaved }) {
  const isEdit = !!card;
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState(null);
  const [show, setShow]     = useState(false);
  const [form, setForm] = useState({
    carteName:   card?.carteName   ?? "",
    carteNumber: card?.carteNumber ?? "",
    carteDate:   card?.carteDate   ?? "",
    carteCVV:    card?.carteCVV    ?? "",
  });

  const set = (k) => (v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.carteName.trim()) { setError("Card holder name is required."); return; }
    if (!form.carteNumber.trim()) { setError("Card number is required."); return; }
    if (!form.carteDate.trim())   { setError("Expiry date is required."); return; }
    if (!form.carteCVV.trim())    { setError("CVV is required."); return; }
    setSaving(true);
    try {
      isEdit
        ? await cartesAPI.update(card._id, form)
        : await cartesAPI.create(form);
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message ?? "Error saving card.");
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
          <h3 className="font-semibold text-[var(--text-primary)]">{isEdit ? "Edit card" : "New payment card"}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-muted)] transition-colors"><X size={15} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-3">
          {error && <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>}
          <Field label="Cardholder name *" value={form.carteName} onChange={set("carteName")} placeholder="John Doe" />
          <div className="relative">
            <Field
              label="Card number *"
              type={show ? "text" : "password"}
              value={form.carteNumber}
              onChange={set("carteNumber")}
              placeholder="•••• •••• •••• ••••"
            />
            <button type="button" onClick={() => setShow(v => !v)}
              className="absolute right-3 top-8 text-[var(--text-muted)] hover:text-[var(--text-primary)]">
              {show ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Expiry date (MM/YY) *" value={form.carteDate} onChange={set("carteDate")} placeholder="12/27" />
            <Field label="CVV *" type="password" value={form.carteCVV} onChange={set("carteCVV")} placeholder="•••" />
          </div>
          <p className="text-xs text-[var(--text-muted)]">🔒 Your payment details are encrypted and stored securely.</p>
          <div className="flex gap-3 pt-2 border-t border-[var(--border)]">
            <button type="button" onClick={onClose} disabled={saving}
              className="flex-1 h-10 rounded-xl text-sm font-medium border border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--bg-muted)] disabled:opacity-50 transition-all">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 h-10 rounded-xl text-sm font-medium bg-[var(--accent)] text-white hover:opacity-90 disabled:opacity-50 transition-all">
              {saving ? "Saving…" : isEdit ? "Save changes" : "Add card"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Addresses tab ─────────────────────────────────────────────────────────────
function AddressesTab() {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [modal, setModal]         = useState(null); // null | { type: 'create'|'edit'|'delete', data? }
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
      setMsg({ type: "success", text: "Address deleted." });
      load();
    } catch {
      setMsg({ type: "error", text: "Error deleting address." });
    }
    setTimeout(() => setMsg(null), 3000);
  };

  return (
    <div>
      <Notify msg={msg} />
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Your billing addresses</p>
        <button onClick={() => setModal({ type: "create" })} className="btn-primary gap-2 h-9 px-4 text-sm">
          <Plus size={14} /> Add address
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">{[0,1].map(i => <div key={i} className="skeleton h-24 rounded-2xl" />)}</div>
      ) : addresses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--border)] p-10 text-center">
          <MapPin size={28} style={{ color: "var(--text-muted)", margin: "0 auto 8px" }} />
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>No addresses saved yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {addresses.map(a => (
            <div key={a._id} className="cyna-card p-4 flex items-start gap-3">
              <MapPin size={16} style={{ color: "var(--accent)", marginTop: 2, flexShrink: 0 }} />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-[var(--text-primary)]">{a.firstName} {a.lastName}</p>
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
  return (
    <div
      className="flex items-start gap-2.5 p-3 rounded-xl text-xs mb-4"
      style={{ background: "var(--bg-subtle)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}
    >
      <AlertCircle size={13} className="flex-shrink-0 mt-0.5" style={{ color: "var(--accent)" }} />
      <span>
        Preview interface — real data will appear here once your purchases are processed.
      </span>
    </div>
  );
}

// ── Subscription detail modal ────────────────────────────────────────────────
function SubscriptionDetailModal({ subscription, onClose }) {
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 px-6 py-4 border-b border-[var(--border)]">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider"
                style={{ background: "var(--bg-subtle)", color: "var(--accent)" }}>
                <Sparkles size={10} /> Active
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
              <KeyRound size={11} className="inline mr-1" /> License code
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
              Use this key to activate the product on your devices.
            </p>
          </div>

          {/* Progress bar */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-[Kumbh Sans] font-600" style={{ color: "var(--text-muted)" }}>Period progress</span>
              <span className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
                {remaining != null && remaining > 0 ? `${remaining} day${remaining > 1 ? "s" : ""} remaining` : "Expired"}
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
            <DetailCell icon={Calendar} label="Start date" value={fmtDateLong(subscription.dateDebut)} />
            <DetailCell icon={Clock}    label="Expires on" value={fmtDateLong(subscription.dateFin)} />
            <DetailCell icon={Receipt}  label="Plan"       value={periodeLabel(subscription.periode)} />
            <DetailCell icon={Package}  label="Quantity"   value={`× ${subscription.quantity ?? 1}`} />
          </div>

          {/* Pricing */}
          <div
            className="flex items-center justify-between p-4 rounded-xl"
            style={{ background: "var(--bg-subtle)", border: "1px solid var(--border)" }}
          >
            <div>
              <p className="text-xs font-[Kumbh Sans] font-600" style={{ color: "var(--text-muted)" }}>
                {subscription.autoRenew ? "Next renewal" : "Subscription cost"}
              </p>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
                {subscription.autoRenew
                  ? `Auto-renews on ${fmtDateLong(subscription.dateFin)}`
                  : "Auto-renewal disabled"}
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

// ── Subscriptions tab (active) ───────────────────────────────────────────────
function SubscriptionsTab() {
  const [subs] = useState(MOCK_SUBSCRIPTIONS);
  const [selected, setSelected] = useState(null);

  const statusPill = (statut) => {
    const map = {
      ACTIVE:  { label: "Active",  cls: "bg-green-50 text-green-600 border-green-200" },
      PENDING: { label: "Pending", cls: "bg-amber-50 text-amber-600 border-amber-200" },
      EXPIRED: { label: "Expired", cls: "bg-red-50 text-red-600 border-red-200" },
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
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Active subscriptions</h2>
        <div className="rounded-2xl border border-dashed border-[var(--border)] p-10 text-center">
          <Sparkles size={28} style={{ color: "var(--text-muted)", margin: "0 auto 8px" }} />
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>You don't have any active subscriptions yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <MockBanner />
      <div className="cyna-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-[var(--text-primary)]">Active subscriptions</h2>
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>{subs.length} active</span>
        </div>

        <div className="space-y-3">
          {subs.map((s) => {
            const remaining = daysBetween(new Date(), s.dateFin);
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
                        <Clock size={11} />
                        {remaining != null && remaining > 0 ? `${remaining} day${remaining > 1 ? "s" : ""} left` : "Expired"}
                      </span>
                      <span style={{ color: "var(--text-muted)" }}>·</span>
                      <span>Until {fmtDateLong(s.dateFin)}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className="font-[Kumbh Sans] font-700 text-sm" style={{ color: "var(--accent)" }}>
                      {fmtEur(s.price)}
                    </span>
                    <span className="text-[11px] flex items-center gap-1 transition-colors group-hover:text-[var(--accent)]" style={{ color: "var(--text-muted)" }}>
                      View details <ChevronRight size={11} />
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

// ── Billing history detail modal ─────────────────────────────────────────────
function PaymentDetailModal({ payment, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] shadow-2xl">
        <div className="flex items-start justify-between gap-3 px-6 py-4 border-b border-[var(--border)]">
          <div className="min-w-0">
            <p className="text-[10px] font-mono mb-1" style={{ color: "var(--text-muted)" }}>{payment.reference}</p>
            <h3 className="font-semibold text-[var(--text-primary)] truncate">{payment.product?.name}</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-muted)] transition-colors flex-shrink-0">
            <X size={15} />
          </button>
        </div>

        <div className="p-6 space-y-3">
          <DetailCell icon={Calendar}   label="Date"           value={fmtDateLong(payment.date)} />
          <DetailCell icon={CreditCard} label="Payment method" value={payment.method ?? "—"} />
          <DetailCell icon={Receipt}    label="Plan"           value={periodeLabel(payment.periode)} />

          <div className="flex items-center justify-between p-4 rounded-xl"
            style={{ background: "var(--bg-subtle)", border: "1px solid var(--border)" }}>
            <span className="text-xs font-[Kumbh Sans] font-600" style={{ color: "var(--text-muted)" }}>Amount charged</span>
            <span className="font-[Kumbh Sans] font-700 text-lg" style={{ color: "var(--accent)" }}>{fmtEur(payment.amount)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Billing history tab ──────────────────────────────────────────────────────
function HistoryTab() {
  const [history] = useState(MOCK_HISTORY);
  const [selected, setSelected] = useState(null);

  const statusPill = (statut) => {
    const map = {
      PAID:     { label: "Paid",     cls: "bg-green-50 text-green-600 border-green-200" },
      REFUNDED: { label: "Refunded", cls: "bg-blue-50 text-blue-600 border-blue-200"   },
      FAILED:   { label: "Failed",   cls: "bg-red-50 text-red-600 border-red-200"      },
      PENDING:  { label: "Pending",  cls: "bg-amber-50 text-amber-600 border-amber-200" },
    };
    const m = map[statut] ?? { label: statut, cls: "bg-gray-50 text-gray-600 border-gray-200" };
    return (
      <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${m.cls}`}>
        {m.label}
      </span>
    );
  };

  if (history.length === 0) {
    return (
      <div className="cyna-card p-6">
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Billing history</h2>
        <div className="rounded-2xl border border-dashed border-[var(--border)] p-10 text-center">
          <Receipt size={28} style={{ color: "var(--text-muted)", margin: "0 auto 8px" }} />
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>No payment recorded yet.</p>
        </div>
      </div>
    );
  }

  const totalPaid = history
    .filter((p) => p.statut === "PAID")
    .reduce((s, p) => s + Number(p.amount ?? 0), 0);

  return (
    <div>
      <MockBanner />
      <div className="cyna-card p-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h2 className="font-semibold text-[var(--text-primary)]">Billing history</h2>
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            Total paid · <strong style={{ color: "var(--accent)" }}>{fmtEur(totalPaid)}</strong>
          </span>
        </div>

        <div className="rounded-2xl overflow-hidden border border-[var(--border)]">
          {history.map((p, i) => (
            <button
              key={p._id}
              type="button"
              onClick={() => setSelected(p)}
              className={`w-full text-left p-4 flex items-center gap-3 transition-colors hover:bg-[var(--bg-subtle)] ${i > 0 ? "border-t border-[var(--border)]" : ""}`}
              style={{ background: "var(--bg-card)" }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "var(--bg-subtle)" }}
              >
                <Receipt size={14} style={{ color: "var(--accent)" }} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium text-sm text-[var(--text-primary)] truncate">{p.product?.name}</p>
                  {statusPill(p.statut)}
                </div>
                <p className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>
                  <span className="font-mono">{p.reference}</span>
                  <span className="mx-1.5">·</span>
                  {fmtDateLong(p.date)}
                  <span className="mx-1.5">·</span>
                  {p.method}
                </p>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="font-[Kumbh Sans] font-700 text-sm" style={{ color: "var(--text-primary)" }}>
                  {fmtEur(p.amount)}
                </span>
                <ChevronRight size={13} style={{ color: "var(--text-muted)" }} />
              </div>
            </button>
          ))}
        </div>
      </div>

      {selected && (
        <PaymentDetailModal payment={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

// ── Orders tab ────────────────────────────────────────────────────────────────
function OrdersTab() {
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
      PAID:   { label: "Paid",     cls: "bg-green-50 text-green-600 border-green-200" },
      PENDING:{ label: "Pending",  cls: "bg-amber-50 text-amber-600 border-amber-200" },
      CANCEL: { label: "Cancelled",cls: "bg-red-50 text-red-600 border-red-200"       },
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
        <h2 className="font-semibold text-[var(--text-primary)] mb-4">Order history</h2>
        <div className="rounded-2xl border border-dashed border-[var(--border)] p-10 text-center">
          <Package size={32} style={{ color: "var(--text-muted)", margin: "0 auto 8px" }} />
          <p className="font-[Kumbh Sans] font-600 mb-1" style={{ color: "var(--text-secondary)" }}>No orders yet</p>
          <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>
            Your orders will appear here once you have made a purchase.
          </p>
          <Link to="/categories" className="btn-primary gap-2 inline-flex items-center">
            <Star size={14} /> Explore our solutions
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cyna-card p-6">
      <h2 className="font-semibold text-[var(--text-primary)] mb-4">Order history</h2>
      <div className="space-y-3">
        {orders.map(order => (
          <div key={order._id ?? order.reference} className="rounded-2xl border border-[var(--border)] p-4">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="min-w-0">
                <p className="font-medium text-sm text-[var(--text-primary)]">
                  Order #{order.reference}
                </p>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : ""}
                  {order.nbreProducts ? ` · ${order.nbreProducts} item${order.nbreProducts > 1 ? "s" : ""}` : ""}
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
                        <span className="text-[var(--text-muted)] ml-1">({ab.periode === "ANNEE" ? "yearly" : "monthly"})</span>
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
      setMsg({ type: "success", text: "Card removed." });
      load();
    } catch {
      setMsg({ type: "error", text: "Error removing card." });
    }
    setTimeout(() => setMsg(null), 3000);
  };

  const mask = (n) => n ? `•••• •••• •••• ${String(n).slice(-4)}` : "•••• •••• •••• ••••";

  return (
    <div>
      <Notify msg={msg} />
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Your saved payment methods</p>
        <button onClick={() => setModal({ type: "create" })} className="btn-primary gap-2 h-9 px-4 text-sm">
          <Plus size={14} /> Add card
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">{[0,1].map(i => <div key={i} className="skeleton h-20 rounded-2xl" />)}</div>
      ) : cards.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--border)] p-10 text-center">
          <CreditCard size={28} style={{ color: "var(--text-muted)", margin: "0 auto 8px" }} />
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>No payment methods saved yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {cards.map(c => (
            <div key={c._id} className="cyna-card p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--bg-muted)] flex items-center justify-center flex-shrink-0">
                <CreditCard size={18} style={{ color: "var(--accent)" }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-[var(--text-primary)]">{mask(c.carteNumber)}</p>
                <p className="text-xs text-[var(--text-muted)]">{c.carteName} — Expires {c.carteDate}</p>
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
  const navigate   = useNavigate();
  const tokenUser  = getUser();
  const [tab, setTab]       = useState("profile");
  const [profile, setProfile] = useState({ firstName: "", lastName: "", email: "" });
  const [pwd, setPwd]       = useState({ new: "", confirm: "" });
  const [showPwd, setShowPwd] = useState(false);
  const [msg, setMsg]       = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!tokenUser) { navigate("/auth"); return; }
    authAPI.me()
      .then(u => setProfile({
        firstName: u.firstName || "",
        lastName:  u.lastName  || "",
        email:     u.email     || "",
      }))
      .catch(() => {});
  }, [navigate, tokenUser]);

  const notify = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 3500);
  };

  const handleSaveProfile = async () => {
    if (!tokenUser?.id) return;
    setSaving(true);
    try {
      await usersAPI.updateProfile(tokenUser.id, {
        firstName: profile.firstName,
        lastName:  profile.lastName,
      });
      notify("success", "Profile updated successfully!");
    } catch {
      notify("error", "Error updating profile.");
    }
    setSaving(false);
  };

  const handleChangePassword = async () => {
    if (pwd.new !== pwd.confirm) { notify("error", "Passwords do not match."); return; }
    if (pwd.new.length < 8)      { notify("error", "Password must be at least 8 characters."); return; }
    if (!tokenUser?.id) return;
    setSaving(true);
    try {
      // PATCH /users/profil/:id  { password: newPwd }
      await usersAPI.updateProfile(tokenUser.id, { password: pwd.new });
      notify("success", "Password changed successfully!");
      setPwd({ new: "", confirm: "" });
    } catch {
      notify("error", "Error updating password.");
    }
    setSaving(false);
  };

  return (
    <div className="page-enter" style={{ background: "var(--bg-base)", minHeight: "70vh" }}>
      {/* Header */}
      <div style={{ background: "var(--bg-subtle)", borderBottom: "1px solid var(--border)" }}>
        <div className="cyna-container py-10 sm:py-14">
          <p className="section-label">Account Settings</p>
          <h1 className="section-title mb-2">Account</h1>
          <p className="text-sm mb-6" style={{ color: "var(--text-secondary)", fontFamily: "'Kumbh Sans', sans-serif" }}>
            Manage your personal information, password and view your order history.
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
                <LogOut size={15} /> Sign out
              </button>
            </nav>
          </aside>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <Notify msg={msg} />

            {/* ── Profile ── */}
            {tab === "profile" && (
              <div className="cyna-card p-6 space-y-4">
                <h2 className="font-semibold text-[var(--text-primary)] mb-4">Personal information</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="First name" value={profile.firstName} onChange={v => setProfile(p => ({ ...p, firstName: v }))} />
                  <Field label="Last name"  value={profile.lastName}  onChange={v => setProfile(p => ({ ...p, lastName:  v }))} />
                </div>
                <Field label="Email (read-only)" value={profile.email} onChange={() => {}} disabled />
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  To change your email, please contact support.
                </p>
                <div className="flex justify-end">
                  <button onClick={handleSaveProfile} disabled={saving} className="btn-primary gap-2">
                    <Save size={14} />
                    {saving ? "Saving…" : "Save changes"}
                  </button>
                </div>
              </div>
            )}

            {/* ── Password ── */}
            {tab === "password" && (
              <div className="cyna-card p-6 space-y-4">
                <h2 className="font-semibold text-[var(--text-primary)] mb-4">Change password</h2>
                <Field
                  label="New password"
                  type={showPwd ? "text" : "password"}
                  value={pwd.new}
                  onChange={v => setPwd(p => ({ ...p, new: v }))}
                  placeholder="At least 8 characters"
                />
                <Field
                  label="Confirm new password"
                  type={showPwd ? "text" : "password"}
                  value={pwd.confirm}
                  onChange={v => setPwd(p => ({ ...p, confirm: v }))}
                  placeholder="Repeat new password"
                />
                <button onClick={() => setShowPwd(v => !v)} className="text-xs flex items-center gap-1.5" style={{ color: "var(--text-muted)" }}>
                  {showPwd ? <EyeOff size={12} /> : <Eye size={12} />}
                  {showPwd ? "Hide" : "Show"} passwords
                </button>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  The password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character.
                </p>
                <div className="flex justify-end">
                  <button onClick={handleChangePassword} disabled={saving || !pwd.new || !pwd.confirm} className="btn-primary gap-2">
                    <Lock size={14} />
                    {saving ? "Saving…" : "Change password"}
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

            {/* ── Billing history ── */}
            {tab === "history" && <HistoryTab />}

            {/* ── Orders ── */}
            {tab === "orders" && <OrdersTab />}
          </div>
        </div>
      </div>
    </div>
  );
}
