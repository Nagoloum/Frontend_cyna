import { loadStripe } from "@stripe/stripe-js";

// Publishable key (pk_...) — set VITE_STRIPE_PUBLISHABLE_KEY in the frontend .env.
// When absent, stripePromise is null and callers show a clean "unavailable" message.
const STRIPE_PK = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

export const stripePromise = STRIPE_PK ? loadStripe(STRIPE_PK) : null;

/** Read a CSS variable so Stripe's iframe text matches the current (light/dark) theme. */
export const cssVar = (name, fallback) => {
  try {
    const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return v || fallback;
  } catch {
    return fallback;
  }
};

/** Shared style for Stripe Elements so they match our inputs and theme. */
export const stripeElementOptions = () => ({
  style: {
    base: {
      color: cssVar("--text-primary", "#0f0e1a"),
      fontFamily: "'Kumbh Sans', sans-serif",
      fontSize: "14px",
      "::placeholder": { color: cssVar("--text-muted", "#8b87a8") },
    },
    invalid: { color: "#ef4444" },
  },
});
