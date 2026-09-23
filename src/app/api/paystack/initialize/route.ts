import { NextRequest, NextResponse } from "next/server";
import {
  paystackInitialize,
  buildPaystackReference,
  hasPaystackConfig,
  type PaystackInitializeResponse,
} from "@/lib/paystack";

// NOTE: this route handler runs on the server. It must stay stateless — the
// demo store (`@/lib/store`) and applications store are "use client" modules
// backed by window.localStorage, so they cannot be imported here.
export const dynamic = "force-dynamic";

/** Absolute origin of the running app (works on any port, incl. 3000/3100). */
function resolveOrigin(req: NextRequest): string {
  const envUrl =
    process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL;
  if (envUrl) return envUrl.replace(/\/$/, "");
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  const proto = req.headers.get("x-forwarded-proto") || "http";
  if (host) return `${proto}://${host}`;
  return req.nextUrl.origin.replace(/\/$/, "");
}

export async function POST(req: NextRequest) {
  // Body: { invoiceId?, invoiceNumber?, amount?, email?, applicationId? }
  let body: any = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const origin = resolveOrigin(req);
  const invoiceNumber = String(
    body.invoiceNumber || body.invoiceId || body.reference || ""
  ).trim();
  const amountInNaira = Number(body.amount || 0);
  const applicationId = body.applicationId || undefined;
  const email = String(body.email || "").trim() || "demo@logmas.gov.ng";

  if (!invoiceNumber) {
    return NextResponse.json(
      {
        status: false,
        message: "Invoice number is required.",
        error: "Missing invoice number",
      },
      { status: 400 }
    );
  }

  if (!amountInNaira || amountInNaira <= 0) {
    return NextResponse.json(
      {
        status: false,
        message: "Could not determine the payable amount for this invoice.",
        error: "Invalid amount",
      },
      { status: 400 }
    );
  }

  const reference = buildPaystackReference(invoiceNumber, applicationId);

    // Paystack keys not configured — signal "no checkout URL" so the client-side
  // hook falls back to the local simulated settlement, keeping the demo
  // end-to-end without real gateway credentials. (The reference is still
  // minted so the result/verify page can reconcile the invoice.)
  if (!hasPaystackConfig()) {
    return NextResponse.json(
      {
        status: true,
        message:
          "Paystack is not configured. Add PAYSTACK_SECRET_KEY and PAYSTACK_PUBLIC_KEY to .env.local to use real checkout.",
        data: {
          authorization_url: null,
          payment_url: null,
          access_code: null,
          reference,
          configured: false,
          amount: amountInNaira,
          invoiceNumber,
          applicationId,
        },
      },
      { status: 200 }
    );
  }

  // Paystack appends ?trxref=<ref>&reference=<ref> to this URL after checkout.
  const callbackUrl = `${origin}/payment/result`;

  const initResult: PaystackInitializeResponse = await paystackInitialize({
    amount: amountInNaira,
    email,
    reference,
    callback_url: callbackUrl,
    channel: body.channel || "card",
    metadata: {
      invoiceId: body.invoiceId || invoiceNumber,
      invoiceNumber,
      applicationId: applicationId || undefined,
      source: "logmas_demo_portal",
    },
  });

  if (!initResult.status || !initResult.data?.authorization_url) {
    return NextResponse.json(
      {
        status: false,
        message:
          initResult.message ||
          "Paystack could not initialize this transaction. Check your keys.",
        error: initResult.error || "Paystack initialize failed",
      },
      { status: 502 }
    );
  }

  return NextResponse.json(initResult);
}
