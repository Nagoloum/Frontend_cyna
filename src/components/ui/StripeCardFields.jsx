import {
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
} from "@stripe/react-stripe-js";
import { useTranslation } from "react-i18next";
import { stripeElementOptions } from "@/lib/stripe";

/** Wrapper that makes a Stripe Element look like our other inputs. */
const ElementField = ({ label, children }) => (
  <div>
    <label className="block text-xs font-[Kumbh Sans] font-600 mb-1.5" style={{ color: "var(--text-muted)" }}>{label}</label>
    <div className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--bg-subtle)]">
      {children}
    </div>
  </div>
);

/**
 * Three secure Stripe fields (card number / expiry / CVC), styled to match the app.
 * Must be rendered inside an <Elements> provider. The cardholder name is handled
 * separately by the parent form.
 */
export default function StripeCardFields() {
  const { t } = useTranslation();
  const opts = stripeElementOptions();
  return (
    <>
      <ElementField label={t("account.field_card_number")}>
        <CardNumberElement options={{ ...opts, showIcon: true, placeholder: "1234 5678 9012 3456" }} />
      </ElementField>
      <div className="grid grid-cols-2 gap-3">
        <ElementField label={t("account.field_expiry")}>
          <CardExpiryElement options={opts} />
        </ElementField>
        <ElementField label={t("account.field_cvv")}>
          <CardCvcElement options={opts} />
        </ElementField>
      </div>
    </>
  );
}
