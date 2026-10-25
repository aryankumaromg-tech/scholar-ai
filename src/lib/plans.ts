export interface PaidPlan {
  id: "pro" | "premium";
  name: string;
  priceUsd: number;
  /** Razorpay amount in the smallest currency unit (cents / paise). */
  amount: number;
  currency: "USD" | "INR";
  period: string;
  tagline: string;
}

/**
 * Razorpay expects the amount in the currency's smallest unit. Test accounts are
 * commonly INR-only; set `RAZORPAY_CURRENCY=INR` to bill ₹499 / ₹1,499 instead of
 * the USD list price. The pricing page always displays the USD list price.
 */
const currency = (process.env.RAZORPAY_CURRENCY ?? "USD").toUpperCase() === "INR" ? "INR" : "USD";

const amountFor = (usd: number) => (currency === "INR" ? usd * 100 : usd * 100);

export const PAID_PLANS: Record<PaidPlan["id"], PaidPlan> = {
  pro: {
    id: "pro",
    name: "Pro",
    priceUsd: 5,
    amount: amountFor(5),
    currency,
    period: "month",
    tagline: "Higher limits, math deep dives and multi-paper comparison.",
  },
  premium: {
    id: "premium",
    name: "Premium",
    priceUsd: 15,
    amount: amountFor(15),
    currency,
    period: "month",
    tagline: "Unlimited analyses plus shared workspaces and collaboration.",
  },
};

export function isPaidPlan(value: unknown): value is PaidPlan["id"] {
  return value === "pro" || value === "premium";
}

export const razorpayKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? "";
export const razorpaySecret = process.env.RAZORPAY_KEY_SECRET ?? "";

/** Both keys are required to create orders and verify signatures. */
export function razorpayConfigured(): boolean {
  return Boolean(razorpayKeyId) && Boolean(razorpaySecret);
}

export function formatAmount(amount: number, curr: string): string {
  const value = amount / 100;
  if (curr === "INR") return `₹${value.toLocaleString("en-IN")}`;
  return `$${value.toLocaleString("en-US")}`;
}
