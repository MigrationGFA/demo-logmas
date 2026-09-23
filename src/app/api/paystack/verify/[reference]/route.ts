import { NextRequest, NextResponse } from "next/server";
import { paystackVerify, isPaystackPaidStatus } from "@/lib/paystack";

// NOTE: this route handler runs on the server and MUST stay stateless.
// `@/lib/store` and `@/lib/applicationsStore` are "use client" modules backed by
// window.localStorage, so they cannot be imported here. Paystack is the single
// source of truth for the transaction; the browser mirrors the settlement into
// localStorage afterwards via `POST /invoices/:id/simulate-payment`.
export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ reference: string }> }
) {
  const { reference } = await params;
  const ref = decodeURIComponent((reference || "").trim());

  if (!ref) {
    return NextResponse.json(
      {
        status: "unpaid",
        paid: false,
        source: "paystack",
        message: "Reference is required.",
        error: "Missing reference",
      },
      { status: 400 }
    );
  }

  // Paystack keys not configured yet — tell the browser to fall back to the
  // fully-local simulation so the demo flow never dead-ends.
  if (!process.env.PAYSTACK_SECRET_KEY) {
    return NextResponse.json(
      {
        status: "unpaid",
        paid: false,
        source: "unconfigured",
        reference: ref,
        message:
          "Paystack is not configured. Add PAYSTACK_SECRET_KEY and PAYSTACK_PUBLIC_KEY to .env.local.",
      },
      { status: 200 }
    );
  }

  const result = await paystackVerify(ref);

  if (!result.status || !result.data) {
    return NextResponse.json(
      {
        status: "unpaid",
        paid: false,
        source: "paystack",
        reference: ref,
        message: result.message || "Could not verify this transaction with Paystack.",
      },
      { status: 200 }
    );
  }

  const gatewayStatus = result.data.status || "pending";
  const paid = isPaystackPaidStatus(gatewayStatus);
  const amountNaira = result.data.amount ? result.data.amount / 100 : 0;

  return NextResponse.json({
    // "confirmed" is what the client and /payment/result expect on success.
    status: paid ? "confirmed" : gatewayStatus,
    paid,
    gatewayStatus,
    source: "paystack",
    reference: result.data.reference || ref,
    paid_at: result.data.paid_at,
    amount: amountNaira,
    currency: result.data.currency || "NGN",
    channel: result.data.channel,
    gateway_response: result.data.gateway_response,
    customer: result.data.customer,
    metadata: result.data.metadata,
  });
}
