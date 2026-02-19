/* eslint-disable no-unused-vars */
// src/components/admin/orders/OrderDetailModal.jsx
import { createPortal } from 'react-dom';
import { useState } from 'react';
import {
  X, FileText, RefreshCw, XCircle, RotateCcw,
  Package, User, CreditCard, MapPin, Loader2, ChevronDown,
} from 'lucide-react';
import { ordersAPI } from '../../../services/api';
import StatusBadge from '../shared/StatusBadge';

const STATUS_TRANSITIONS = {
  pending:   ['confirmed', 'cancelled'],
  confirmed: ['cancelled', 'refunded'],
  cancelled: [],
  refunded:  [],
};

const STATUS_ACTIONS = {
  confirmed: { label: 'Confirm',    icon: RefreshCw,  classes: 'bg-blue-500 hover:bg-blue-600 text-white'  },
  cancelled: { label: 'Cancel',      icon: XCircle,    classes: 'bg-red-500 hover:bg-red-600 text-white'    },
  refunded:  { label: 'Refund',   icon: RotateCcw,  classes: 'bg-purple-500 hover:bg-purple-600 text-white' },
};

// ── Section card helper ───────────────────────────────────────────────────────
function Section({ icon: Icon, title, children }) {
  return (
    <div className="bg-gray-50 dark:bg-gray-700/40 rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center">
          <Icon size={13} className="text-indigo-500" />
        </div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-3 py-1">
      <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">{label}</span>
      <span className="text-xs font-medium text-gray-800 dark:text-gray-200 text-right">{value ?? '—'}</span>
    </div>
  );
}

// ── Composant principal ───────────────────────────────────────────────────────
export default function OrderDetailModal({ order, onClose, onStatusUpdated, onRefresh }) {
  const [loadingStatus, setLoadingStatus] = useState(null);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [error, setError] = useState(null);

  const transitions = STATUS_TRANSITIONS[order.status] ?? [];

  const formatCurrency = (v) =>
    v != null ? `${Number(v).toLocaleString('en-US', { minimumFractionDigits: 2 })} €` : '—';

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-US', {
      day: '2-digit', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    }) : '—';

  const formatRef = (id) =>
    id ? `#${String(id).padStart(6, '0')}` : '—';

  // ── Change status ──
  const handleStatusChange = async (newStatus) => {
    setShowStatusMenu(false);
    setError(null);
    setLoadingStatus(newStatus);
    try {
      await ordersAPI.updateStatus(order.id, newStatus);
      onStatusUpdated(order.id, newStatus);
    } catch (err) {
      setError(err.response?.data?.message ?? 'Unable to update status.');
    } finally {
      setLoadingStatus(null);
    }
  };

  // ── Download Invoice ──
  const handleDownloadInvoice = async () => {
    try {
      const res = await ordersAPI.getById(order.id);
      const invoiceUrl = res.data?.data?.invoiceUrl ?? res.data?.invoiceUrl;
      if (invoiceUrl) {
        window.open(invoiceUrl, '_blank');
      } else {
        // Fallback : générer un PDF simple côté client si pas d'URL
        alert('Invoice not available for this order.');
      }
    } catch (err) {
      console.error('Invoice download error:', err);
    }
  };

  const items    = order.items ?? order.products ?? [];
  const customer = order.customer ?? {};
  const address  = order.address ?? order.shippingAddress ?? {};
  const payment  = order.payment ?? {};

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="
        relative w-full max-w-2xl max-h-[90vh] overflow-y-auto
        bg-white dark:bg-gray-800
        rounded-2xl shadow-2xl
        border border-gray-200 dark:border-gray-700
      ">
        {/* ── Header ── */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-gray-900 dark:text-white">
                  Order {formatRef(order.id)}
                </h2>
                <StatusBadge status={order.status ?? 'pending'} />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Placed on {formatDate(order.createdAt)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="p-6 space-y-4">

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 text-sm">
              <span>⚠️</span><span>{error}</span>
            </div>
          )}

          {/* ── Status actions ── */}
          {transitions.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Change status:</span>
              {transitions.map((status) => {
                const action = STATUS_ACTIONS[status];
                if (!action) return null;
                const Icon = action.icon;
                return (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(status)}
                    disabled={loadingStatus !== null}
                    className={`
                      flex items-center gap-1.5 h-8 px-3.5 rounded-xl text-xs font-medium
                      disabled:opacity-50 disabled:cursor-not-allowed
                      transition-all duration-200 ${action.classes}
                    `}
                  >
                    {loadingStatus === status
                      ? <Loader2 size={12} className="animate-spin" />
                      : <Icon size={12} />}
                    {action.label}
                  </button>
                );
              })}
            </div>
          )}

          {/* ── Products commandés ── */}
          <Section icon={Package} title="Products commandés">
            {items.length === 0 ? (
              <p className="text-xs text-gray-400 dark:text-gray-500">No products</p>
            ) : (
              <div className="space-y-2">
                {items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between gap-3 py-1.5 border-b border-gray-200 dark:border-gray-600/40 last:border-0">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
                        <Package size={13} className="text-indigo-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                          {item.name ?? item.product?.name ?? `Product ${i + 1}`}
                        </p>
                        {item.billingPeriod && (
                          <p className="text-xs text-gray-400 dark:text-gray-500 capitalize">{item.billingPeriod}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0">
                      {item.quantity && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">×{item.quantity}</span>
                      )}
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(item.price ?? item.unitPrice)}
                      </span>
                    </div>
                  </div>
                ))}

                {/* Total */}
                <div className="flex items-center justify-between pt-2">
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Total</span>
                  <span className="text-base font-bold text-indigo-600 dark:text-indigo-400">
                    {formatCurrency(order.total ?? order.amount)}
                  </span>
                </div>
              </div>
            )}
          </Section>

          {/* ── Infos client + Payment (2 colonnes) ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Customer */}
            <Section icon={User} title="Customer">
              <InfoRow label="Nom"     value={customer.name   ?? order.customerName}  />
              <InfoRow label="Email"   value={customer.email  ?? order.customerEmail} />
              <InfoRow label="Phone"    value={customer.phone  ?? order.customerPhone} />
              {customer.id && (
                <InfoRow label="ID"    value={`#${customer.id}`} />
              )}
            </Section>

            {/* Payment */}
            <Section icon={CreditCard} title="Payment">
              <InfoRow label="Method"      value={payment.method ?? order.paymentMethod} />
              <InfoRow label="Status"       value={payment.status ?? order.paymentStatus} />
              <InfoRow label="Payment ref." value={payment.reference ?? order.paymentRef} />
              <InfoRow label="Amount payé" value={formatCurrency(order.total ?? order.amount)} />
            </Section>
          </div>

          {/* ── Adresse ── */}
          {(address.street || address.city || order.shippingAddress) && (
            <Section icon={MapPin} title="Billing Address">
              <InfoRow label="Street"       value={address.street ?? address.line1}   />
              <InfoRow label="City"     value={address.city}                      />
              <InfoRow label="Postal code" value={address.postalCode ?? address.zip} />
              <InfoRow label="Country"      value={address.country}                   />
            </Section>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="sticky bottom-0 flex items-center justify-between px-6 py-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 gap-3">
          <button
            onClick={handleDownloadInvoice}
            className="
              flex items-center gap-2 h-9 px-4 rounded-xl text-sm font-medium
              bg-gray-100 dark:bg-gray-700
              text-gray-700 dark:text-gray-300
              hover:bg-gray-200 dark:hover:bg-gray-600
              transition-all duration-200
            "
          >
            <FileText size={14} />
            Download Invoice
          </button>

          <button
            onClick={onClose}
            className="h-9 px-5 rounded-xl text-sm font-medium text-white bg-indigo-500 hover:bg-indigo-600 transition-all duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
