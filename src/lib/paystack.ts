/* eslint-disable @typescript-eslint/no-explicit-any */

const PUBLIC_KEY = (process.env.PAYSTACK_PUBLIC_KEY || "").trim();
const SECRET_KEY = (process.env.PAYSTACK_SECRET_KEY || "").trim();
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  "http://localhost:3000";

export const PAYSTACK_PUBLIC_KEY = PUBLIC_KEY;
/** Paystack REST API host. The correct host is api.paystack.co (NOT paystackafrica). */
export const PAYSTACK_BASE_URL = "https://api.paystack.co";
/** Paystack transaction endpoints live under the singular /transaction path. */
export const PAYSTACK_TRANSACTION_URL = `${PAYSTACK_BASE_URL}/transaction`;
export const SITE_ORIGIN = SITE_URL.replace(/\/$/, "");

export function hasPaystackConfig(): boolean {
  return Boolean(PUBLIC_KEY && SECRET_KEY);
}

export function toKobo(amountInNaira: number): number {
  return Math.round(Number(amountInNaira) * 100);
}
export function fromKobo(amountInKobo: number): number {
  return Math.round(Number(amountInKobo)) / 100;
}

/** Only [A-Z0-9-] survive — Paystack references reject slashes and spaces. */
export function sanitizeReferencePart(value: string): string {
  return String(value || "")
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toUpperCase();
}

export const PAYSTACK_REF_PREFIX = "LOGMAS";

/** Strip every non-alphanumeric character so refs can be compared loosely. */
export function normalizeReference(value: string): string {
  return String(value || "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
}

export function buildPaystackReference(
  invoiceNumber: string,
  applicationId?: string
): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rnd = Math.random().toString(36).slice(2, 7).toUpperCase();
  const safeInvoice = sanitizeReferencePart(invoiceNumber) || "UNKNOWN";
  return `${PAYSTACK_REF_PREFIX}-${safeInvoice}-${ts}-${rnd}`;
}

export interface PaystackInitializePayload {
  amount: number;
  email: string;
  reference: string;
  callback_url: string;
  metadata?: Record<string, any>;
  channel?: string | string[];
  bearer?: string;
}

export interface PaystackInitializeResponse {
  status: boolean;
  message: string;
  data?: { authorization_url?: string; reference?: string; access_code?: string; payment_url?: string };
  error?: string;
}

export async function paystackInitialize(
  payload: PaystackInitializePayload
): Promise<PaystackInitializeResponse> {
  if (!SECRET_KEY) {
    return {
      status: false,
      message: "Paystack is not configured. Set PAYSTACK_SECRET_KEY and PAYSTACK_PUBLIC_KEY in your .env.local.",
      error: "Paystack not configured",
    };
  }
  const callbackUrl = payload.callback_url || `${SITE_ORIGIN}/payment/result?from=paystack`;
  const body: PaystackInitializePayload = {
    amount: toKobo(payload.amount),
    email: payload.email,
    reference: payload.reference,
    callback_url: callbackUrl,
    channel: payload.channel || "card",
    metadata: { ...payload.metadata, source: "logmas_demo_portal" },
  };
  if (payload.bearer) (body as any).bearer = payload.bearer;
  try {
    const res = await fetch(`${PAYSTACK_TRANSACTION_URL}/initialize`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${SECRET_KEY}`,
        "content-type": "application/json",
        "cache-control": "no-cache",
      },
      body: JSON.stringify(body),
    });
    const json: any = await res.json();
    if (!res.ok || !json.status) {
      return {
        status: false,
        message: json?.message || `Paystack initialize failed (HTTP ${res.status})`,
        error: json?.message || "Paystack initialize failed",
      };
    }
    return {
      status: true,
      message: "Payment initialized",
      data: {
        authorization_url: json.data?.authorization_url || "",
        reference: json.data?.reference || payload.reference,
        access_code: json.data?.access_code || "",
        payment_url: json.data?.payment_url || json.data?.authorization_url || "",
      },
    };
  } catch (err: any) {
    return {
      status: false,
      message: err?.message || "Network error calling Paystack",
      error: err?.message || "Network error",
    };
  }
}

export interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  error?: string;
  data?: {
    id?: number | string;
    reference?: string;
    /** Paystack gateway status: success | failed | abandoned | ongoing | pending */
    status?: string;
    /** Amount in KOBO (Paystack always returns the smallest currency unit). */
    amount?: number;
    currency?: string;
    paid_at?: string | null;
    created_at?: string;
    customer?: any;
    metadata?: any;
    gateway_response?: string;
    channel?: string;
  };
}

export async function paystackVerify(
  reference: string
): Promise<PaystackVerifyResponse> {
  if (!SECRET_KEY) {
    return { status: false, message: "Paystack is not configured.", error: "Paystack not configured" };
  }
  try {
    const res = await fetch(`${PAYSTACK_TRANSACTION_URL}/verify/${reference}`, {
      method: "GET",
      headers: { authorization: `Bearer ${SECRET_KEY}`, "cache-control": "no-cache" },
    });
    const json: any = await res.json();
    if (!res.ok || !json.status) {
      return {
        status: false,
        message: json?.message || `Paystack verify failed (HTTP ${res.status})`,
        error: json?.message || "Paystack verify failed",
      };
    }
    return {
      status: true,
      message: "Transaction found",
      data: {
        id: json.data?.id,
        reference: json.data?.reference,
        status: json.data?.status || "pending",
        amount: json.data?.amount ?? 0,
        currency: json.data?.currency || "NGN",
        paid_at: json.data?.paid_at || undefined,
        created_at: json.data?.created_at || new Date().toISOString(),
        customer: json.data?.customer || undefined,
        metadata: json.data?.metadata || undefined,
        gateway_response: json.data?.gateway_response || undefined,
        channel: json.data?.channel || undefined,
      },
    };
  } catch (err: any) {
    return {
      status: false,
      message: err?.message || "Network error calling Paystack",
      error: err?.message || "Network error",
    };
  }
}

export function isPaystackPaidStatus(status: string): boolean {
  return status === "success";
}

export function paystackRedirectUrl(reference: string, succeeded: boolean): string {
  const params = new URLSearchParams({
    reference,
    trxref: reference,
    status: succeeded ? "success" : "failed",
    source: "paystack",
  });
  return `${SITE_ORIGIN}/payment/result?${params.toString()}`;
}

