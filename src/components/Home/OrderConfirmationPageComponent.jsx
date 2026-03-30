import { ArrowRight, CheckCircle2, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";

export default function OrderConfirmationPage() {
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
        Order Confirmed!
      </h1>
      
      <p 
        className="text-base mb-2 max-w-md" 
        style={{ color: "var(--text-secondary)", fontFamily: "'DM Sans',sans-serif" }}
      >
        Thank you for your subscription. A confirmation email has been sent to you with all the details.
      </p>
      
      <p 
        className="text-sm mb-10" 
        style={{ color: "var(--text-muted)" }}
      >
        Your services will be activated within the next 48 hours.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-3">
        <Link to="/account/orders" className="btn-primary gap-2">
          <ShoppingBag size={16} /> My Orders
        </Link>
        <Link to="/products" className="btn-ghost gap-2">
          <ArrowRight size={16} /> Continue Shopping
        </Link>
      </div>
    </div>
  );
}