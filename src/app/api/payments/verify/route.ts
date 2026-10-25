import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import { db } from "@/db";
import { payments } from "@/db/schema";
import { eq } from "drizzle-orm";
import { razorpayConfigured, razorpaySecret } from "@/lib/plans";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Verifies the checkout signature: HMAC-SHA256 of `${order_id}|${payment_id}`
 * keyed with the Razorpay secret. Never trust the browser's success callback
 * without this check.
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const orderId = typeof body?.razorpay_order_id === "string" ? body.razorpay_order_id : "";
  const paymentId = typeof body?.razorpay_payment_id === "string" ? body.razorpay_payment_id : "";
  const signature = typeof body?.razorpay_signature === "string" ? body.razorpay_signature : "";

  if (!orderId || !paymentId || !signature) {
    return NextResponse.json({ error: "Missing order, payment or signature." }, { status: 400 });
  }

  if (!razorpayConfigured()) {
    return NextResponse.json(
      { error: "Razorpay secret is not configured, so the payment cannot be verified.", code: "RAZORPAY_NOT_CONFIGURED" },
      { status: 503 },
    );
  }

  const expected = createHmac("sha256", razorpaySecret).update(`${orderId}|${paymentId}`).digest("hex");

  let valid = false;
  try {
    const a = Buffer.from(expected, "utf8");
    const b = Buffer.from(signature, "utf8");
    valid = a.length === b.length && timingSafeEqual(a, b);
  } catch {
    valid = false;
  }

  const [record] = await db
    .update(payments)
    .set({
      razorpayPaymentId: paymentId,
      razorpaySignature: signature,
      status: valid ? "paid" : "failed",
    })
    .where(eq(payments.razorpayOrderId, orderId))
    .returning();

  if (!valid) {
    return NextResponse.json({ error: "Payment signature did not verify.", code: "SIGNATURE_MISMATCH" }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    status: "paid",
    planId: record?.planId ?? null,
    paymentId,
    amount: record?.amount ?? null,
    currency: record?.currency ?? null,
  });
}
