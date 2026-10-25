"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle2, CreditCard, Loader2 } from "lucide-react";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

type PlanId = "pro" | "premium";

const CHECKOUT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

function loadCheckout(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if (window.Razorpay) return resolve(true);
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${CHECKOUT_SRC}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve(Boolean(window.Razorpay)));
      existing.addEventListener("error", () => resolve(false));
      return;
    }
    const script = document.createElement("script");
    script.src = CHECKOUT_SRC;
    script.async = true;
    script.onload = () => resolve(Boolean(window.Razorpay));
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function PlanCheckoutButton({
  planId,
  label,
  warm = false,
  priceLabel,
}: {
  planId: PlanId;
  label: string;
  warm?: boolean;
  priceLabel: string;
}) {
  const [status, setStatus] = useState<"idle" | "starting" | "paid" | "error">("idle");
  const [message, setMessage] = useState("");

  async function start() {
    setStatus("starting");
    setMessage("");
    try {
      const res = await fetch("/api/payments/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus("error");
        setMessage(data.error ?? "Could not start checkout.");
        return;
      }

      const ready = await loadCheckout();
      if (!ready || !window.Razorpay) {
        setStatus("error");
        setMessage("Checkout script could not load. Check your network connection and retry.");
        return;
      }

      const checkout = new window.Razorpay({
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "ScholarAI",
        description: `${data.plan.name} plan`,
        order_id: data.orderId,
        theme: { color: "#c25f21" },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          const verify = await fetch("/api/payments/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response),
          });
          const verified = await verify.json();
          if (verify.ok) {
            setStatus("paid");
            setMessage(`Payment verified · ${verified.paymentId}`);
          } else {
            setStatus("error");
            setMessage(verified.error ?? "Payment could not be verified.");
          }
        },
        modal: {
          ondismiss: () => setStatus("idle"),
        },
      });

      checkout.open();
      setStatus("idle");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Checkout failed.");
    }
  }

  return (
    <div className="mt-6">
      <button
        type="button"
        onClick={start}
        disabled={status === "starting" || status === "paid"}
        className={
          warm
            ? "inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#fdf6ea] px-4 py-3 text-[12.5px] font-semibold text-[#3b2415] transition-transform hover:-translate-y-0.5 disabled:opacity-60"
            : "btn-warm w-full"
        }
      >
        {status === "starting" ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : status === "paid" ? (
          <CheckCircle2 className="h-3.5 w-3.5" />
        ) : (
          <CreditCard className="h-3.5 w-3.5" />
        )}
        {status === "paid" ? "Payment verified" : `${label} · ${priceLabel}`}
      </button>
      {message && (
        <p
          className={`mt-2 flex items-start gap-1.5 rounded-xl px-2.5 py-2 text-[10.5px] leading-relaxed ${
            status === "paid"
              ? "bg-[#e7efe3]/80 text-[#41633a]"
              : warm
                ? "bg-[#3d1c06]/25 text-[#ffe3c4]"
                : "bg-[#f4ded6]/80 text-[#8f3a24]"
          }`}
        >
          {status === "paid" ? <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0" /> : <AlertCircle className="mt-0.5 h-3 w-3 shrink-0" />}
          {message}
        </p>
      )}
    </div>
  );
}
