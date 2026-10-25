import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { payments } from "@/db/schema";
import { PAID_PLANS, isPaidPlan, razorpayConfigured, razorpayKeyId, razorpaySecret } from "@/lib/plans";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Creates a Razorpay order server-side so the amount can't be tampered with in
 * the browser. The secret never leaves the server.
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const planId = body?.planId;

  if (!isPaidPlan(planId)) {
    return NextResponse.json({ error: "Choose a paid plan (pro or premium)." }, { status: 400 });
  }

  if (!razorpayConfigured()) {
    return NextResponse.json(
      {
        error:
          "Razorpay is not fully configured. NEXT_PUBLIC_RAZORPAY_KEY_ID is set, but RAZORPAY_KEY_SECRET is missing — add it to .env (Vercel: Environment Variables) and restart.",
        code: "RAZORPAY_NOT_CONFIGURED",
      },
      { status: 503 },
    );
  }

  const plan = PAID_PLANS[planId];

  try {
    const auth = Buffer.from(`${razorpayKeyId}:${razorpaySecret}`).toString("base64");
    const res = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: plan.amount,
        currency: plan.currency,
        receipt: `${plan.id}-${Date.now()}`,
        notes: { planId: plan.id, product: "ScholarAI" },
      }),
      cache: "no-store",
    });

    const order = (await res.json().catch(() => null)) as
      | { id?: string; amount?: number; currency?: string; error?: { description?: string } }
      | null;

    if (!res.ok || !order?.id) {
      const description = order?.error?.description ?? `Razorpay responded ${res.status}`;
      return NextResponse.json(
        { error: `Could not create the order. ${description}`, code: "RAZORPAY_ORDER_FAILED" },
        { status: 502 },
      );
    }

    await db.insert(payments).values({
      planId: plan.id,
      amount: order.amount ?? plan.amount,
      currency: order.currency ?? plan.currency,
      razorpayOrderId: order.id,
      status: "created",
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount ?? plan.amount,
      currency: order.currency ?? plan.currency,
      keyId: razorpayKeyId,
      plan: { id: plan.id, name: plan.name, priceUsd: plan.priceUsd },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: `Payment could not be started: ${error instanceof Error ? error.message : "unknown error"}`,
        code: "RAZORPAY_UNREACHABLE",
      },
      { status: 502 },
    );
  }
}
