import { ArrowLeft, CheckCircle, ChevronRight, CreditCard, Lock, MapPin, Shield } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const STEPS = ["Address", "Payment", "Confirmation"];

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
  const [step, setStep] = useState(0);
  const [addr, setAddr] = useState({
    firstName: "", 
    lastName: "", 
    address1: "", 
    address2: "", 
    city: "", 
    region: "", 
    zip: "", 
    country: "France", 
    phone: "" 
  });
  const [pay, setPay] = useState({ name: "", number: "", expiry: "", cvv: "" });

  const cart = (() => { 
    try { 
      return JSON.parse(localStorage.getItem("cart") || "[]"); 
    } catch { 
      return []; 
    } 
  })();

  const total = cart.reduce((s, i) => {
    const price = i.billingPeriod === "monthly" ? i.priceMonth : i.priceYear;
    return s + (Number(price) || 0) * (i.qty || 1);
  }, 0);

  const handleConfirm = () => {
    localStorage.removeItem("cart");
    window.dispatchEvent(new Event("cart-updated"));
    navigate("/checkout/confirmation");
  };

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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            {step === 0 && (
              <div className="cyna-card p-6">
                <div className="flex items-center gap-2 mb-6">
                  <MapPin size={18} style={{ color: "var(--accent)" }} />
                  <h2 className="font-[Kumbh Sans] font-700 text-base" style={{ color: "var(--text-primary)" }}>
                    Billing Address
                  </h2>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <InputField 
                    label="First Name" 
                    value={addr.firstName} 
                    onChange={v => setAddr({...addr, firstName: v})} 
                    placeholder="John" 
                    required 
                    half 
                  />
                  <InputField 
                    label="Last Name" 
                    value={addr.lastName} 
                    onChange={v => setAddr({...addr, lastName: v})} 
                    placeholder="Doe" 
                    required 
                    half 
                  />
                  <InputField 
                    label="Address" 
                    value={addr.address1} 
                    onChange={v => setAddr({...addr, address1: v})} 
                    placeholder="12 rue de la Paix" 
                    required 
                  />
                  <InputField 
                    label="Address Line 2" 
                    value={addr.address2} 
                    onChange={v => setAddr({...addr, address2: v})} 
                    placeholder="Apt, office…" 
                  />
                  <InputField 
                    label="City" 
                    value={addr.city} 
                    onChange={v => setAddr({...addr, city: v})} 
                    placeholder="Paris" 
                    required 
                    half 
                  />
                  <InputField 
                    label="Postal Code" 
                    value={addr.zip} 
                    onChange={v => setAddr({...addr, zip: v})} 
                    placeholder="75001" 
                    required 
                    half 
                  />
                  <InputField 
                    label="Region" 
                    value={addr.region} 
                    onChange={v => setAddr({...addr, region: v})} 
                    placeholder="Île-de-France" 
                    half 
                  />
                  <InputField 
                    label="Country" 
                    value={addr.country} 
                    onChange={v => setAddr({...addr, country: v})} 
                    placeholder="France" 
                    required 
                    half 
                  />
                  <InputField 
                    label="Phone" 
                    type="tel" 
                    value={addr.phone} 
                    onChange={v => setAddr({...addr, phone: v})} 
                    placeholder="+33 6 12 34 56 78" 
                  />
                </div>
                <button 
                  onClick={() => setStep(1)} 
                  className="btn-primary mt-6 gap-2 w-full sm:w-auto justify-center py-3"
                >
                  Continue to Payment <ChevronRight size={16} />
                </button>
              </div>
            )}

            {step === 1 && (
              <div className="cyna-card p-6">
                <div className="flex items-center gap-2 mb-6">
                  <CreditCard size={18} style={{ color: "var(--accent)" }} />
                  <h2 className="font-[Kumbh Sans] font-700 text-base" style={{ color: "var(--text-primary)" }}>
                    Payment Information
                  </h2>
                  <div className="ml-auto flex items-center gap-1.5 text-xs" style={{ color: "var(--text-muted)" }}>
                    <Lock size={12} /> SSL Secured
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <InputField 
                    label="Name on Card" 
                    value={pay.name} 
                    onChange={v => setPay({...pay, name: v})} 
                    placeholder="John Doe" 
                    required 
                  />
                  <InputField 
                    label="Card Number" 
                    value={pay.number} 
                    onChange={v => setPay({...pay, number: v})} 
                    placeholder="1234 5678 9012 3456" 
                    required 
                  />
                  <InputField 
                    label="Expiry Date" 
                    value={pay.expiry} 
                    onChange={v => setPay({...pay, expiry: v})} 
                    placeholder="MM/YY" 
                    required 
                    half 
                  />
                  <InputField 
                    label="CVV" 
                    value={pay.cvv} 
                    onChange={v => setPay({...pay, cvv: v})} 
                    placeholder="123" 
                    required 
                    half 
                  />
                </div>
                <div className="flex items-center gap-2 mt-4 p-3 rounded-xl text-xs" style={{ background: "var(--bg-subtle)", border: "1px solid var(--border)" }}>
                  <Shield size={14} style={{ color: "var(--success)" }} />
                  <span style={{ color: "var(--text-secondary)", fontFamily: "'DM Sans',sans-serif" }}>
                    Your payment details are encrypted and secure. We never store your card number.
                  </span>
                </div>
                <div className="flex gap-3 mt-6">
                  <button onClick={() => setStep(0)} className="btn-ghost py-3 gap-1.5">
                    <ArrowLeft size={16} /> Back
                  </button>
                  <button 
                    onClick={() => setStep(2)} 
                    className="btn-primary py-3 gap-2 flex-1 justify-center"
                  >
                    Review Order <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}

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
                    {addr.firstName} {addr.lastName}<br />
                    {addr.address1}{addr.address2 && `, ${addr.address2}`}<br />
                    {addr.zip} {addr.city}, {addr.country}
                  </p>
                </div>

                {/* Payment recap */}
                <div className="p-4 rounded-xl mb-6" style={{ background: "var(--bg-subtle)", border: "1px solid var(--border)" }}>
                  <p className="text-xs font-[Kumbh Sans] font-600 mb-2" style={{ color: "var(--text-muted)" }}>
                    PAYMENT
                  </p>
                  <p className="text-sm flex items-center gap-2" style={{ color: "var(--text-primary)", fontFamily: "'DM Sans',sans-serif" }}>
                    <CreditCard size={14} /> **** **** **** {pay.number.slice(-4) || "xxxx"}
                  </p>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setStep(1)} className="btn-ghost py-3 gap-1.5">
                    <ArrowLeft size={16} /> Back
                  </button>
                  <button 
                    onClick={handleConfirm} 
                    className="btn-primary py-3 gap-2 flex-1 justify-center text-base"
                  >
                    <Shield size={18} /> Confirm Purchase — {total.toFixed(2)} €
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