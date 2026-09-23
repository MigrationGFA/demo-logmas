import { api } from "../lib/api";
import { ApiResponse } from "./apiAuth";

// Types based on your controller
export type InvoiceStatus = "sent" | "paid" | "partially_paid" | "overdue" | "cancelled" | "pending";
export type PaymentMethod = "cash" | "pos" | "bank_transfer" | "online" | "virtual_account";

export interface Payment {
  id: string;
  amount: number;
  method: PaymentMethod;
  status: string;
  reference: string;
  confirmedAt: string;
  createdAt: string;
}

export interface Receipt {
  id: string;
  receiptNumber: string;
  verificationCode: string;
  qrToken: string;
  issuedAt: string;
}

export interface Permit {
  id: string;
  permitNumber: string;
  status: string;
}

export interface VirtualAccount {
  accountNumber: string;
  bankName: string;
  accountName: string;
  reference: string;
}

export interface InvoiceDetails {
  id: string;
  invoiceNumber: string;
  status: InvoiceStatus;
  issuedAt: string;
  dueDate: string;
  paidAt: string | null;
  invoiceType: string;

  // Amounts
  totalAmount: number;
  amountPaid: number;
  balanceDue: number;
  subtotal: number;
  penaltyAmount: number;

  // Customer
  customerName: string;
  customerPhone: string | null;

  // Levy details
  levyType: string;
  description: string;
  frequency: string;
  unitPrice: number;
  quantity: number;

  // Officer
  fieldOfficer: string | null;

  // QR
  qrData: string;

  // Receipt (null until paid)
  receipt: Receipt | null;

  // Permit (null if not a permit invoice)
  permit: Permit | null;

  // Virtual account
  virtualAccount: VirtualAccount | null;

  // Payment history
  payments: Payment[];

  // Payment options available
  paymentOptions: string[];

  // ---------------------------------------------------------------------------
  // DEMO / MOCK COMPATIBILITY FIELDS
  // The original (backend) schema used balanceDue/status. The standalone demo
  // mock also returns a few convenience aliases that older screens still read.
  // Everything below is optional so real backend payloads stay valid.
  // ---------------------------------------------------------------------------

  /** Total amount alias (same value as `totalAmount`). */
  amount?: number;
  /** Human readable payment state: "paid" | "pending" | "confirmed"... */
  paymentStatus?: string | null;
  /** Creation timestamp (alias of `issuedAt`). */
  createdAt?: string;
  /** Flat virtual account number (alias of `virtualAccount.accountNumber`). */
  virtualAccountNumber?: string | null;
  /** Flat virtual bank name (alias of `virtualAccount.bankName`). */
  virtualBankName?: string | null;
  /** Multiple receipts (some legacy screens render a list). */
  receipts?: Receipt[] | null;
  /** Linked statutory application, enriched by the demo mock. */
  application?: {
    id?: string;
    applicationNumber?: string;
    applicationNo?: string;
    status?: string;
    feeAmount?: number;
    revenueHead?: string;
    ward?: string;
    createdAt?: string;
    submittedAt?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    formData?: Record<string, any> | null;
    applicant?: { fullName?: string; phone?: string; email?: string } | null;
    service?: {
      id?: string;
      name?: string;
      code?: string;
      revenueHead?: string;
    } | null;
  } | null;
}

export interface InvoiceStats {
  outstanding: number;
  totalCollected: number;
  transactions: number;
  avgPayment: number;
}

export interface InvoiceList {
  id: string;
  reference: string;
  customerName: string;
  levyType: string;
  invoiceType: string;
  dueDate: string;
  amount: number;
  status: InvoiceStatus;
  receiptId: string | null;
}

export interface InvoicesHubResponse {
  success: boolean;
  stats: InvoiceStats;
  invoices: InvoiceList[];
}

export interface GetInvoicesParams {
  tab?: string;
  search?: string;
}

export interface PaymentData {
  method: PaymentMethod;
  amount?: number;
  reference?: string;
  narration?: string;
}

export interface PaymentResponse {
  payment: Payment;
  invoice: InvoiceDetails;
  receipt: Receipt | null;
  isFullPayment: boolean;
  message: string;
}

export interface SimulatePaymentResponse {
  payment: Payment;
  invoice: InvoiceDetails;
  receipt: Receipt;
}

// Matches paystack.controller.ts's initializePaystackPayment response exactly  - 
// no more "stub" field, this is the real thing now.
export interface OnlinePaymentInitResponse {
  paymentUrl: string;
  reference: string;
  message: string;
  // authorizationUrl: string;
}

export interface PublicPaymentInitRequest {
  serviceId: string;
  fullName: string;
  email: string;
  phone: string;
}

export interface PublicPaymentInitResponse {
  paymentUrl: string;
  reference: string;
  accessCode?: string;
  message?: string;
}

// Matches sendPaymentLinkToBusiness's response
export interface SendPaymentLinkResponse {
  reference: string;
  checkoutLink: string;
  smsSent: boolean;
  emailSent: boolean;
}

export interface VerifyPaymentResponse {
  status: "confirmed" | "success" | "failed" | "abandoned" | string;
  payment?: Payment;
  invoice?: InvoiceDetails;
  receipt?: Receipt | null;
  message?: string;
  application?: any;
  user?: any;
  data?: any;
}

// Service functions
export const invoicesService = {
  // Get unified invoices hub data (stats + ledger)
  getInvoicesHub: async (params?: GetInvoicesParams): Promise<InvoicesHubResponse> => {
    let statusParam: string | undefined;
    if (params?.tab && params.tab !== "all") {
      if (params.tab === "unpaid") {
        statusParam = "sent";
      } else {
        statusParam = params.tab;
      }
    }

    try {
      return await api.get<InvoicesHubResponse>("/invoices/hub", {
        params: {
          tab: statusParam,
          search: params?.search,
        },
      });
    } catch {
      throw new Error("Unable to fetch invoice hub data from backend");
    }
  },

  // Get single invoice by ID with full details
  getInvoiceById: async (id: string): Promise<InvoiceDetails> => {
      return await api.get<InvoiceDetails>(`/invoices/${id}`);
  },

  // Record payment (cash/POS - field officer only)
  recordPayment: async (id: string, data: PaymentData): Promise<PaymentResponse> => {
   
      return await api.post<PaymentResponse>(`/invoices/${id}/pay`, data);

  },

  
  // Public payment initialization for citizen apply flow
  initializePublicPayment: async (
    data: PublicPaymentInitRequest
  ): Promise<PublicPaymentInitResponse> => {
    return await api.post<PublicPaymentInitResponse>(
      "/invoices/public/initialize",
      data,
      {
        headers: {
          "skip-auth": "true",
        },
      }
    );
  },

  initializeOnlinePayment: async (id: string): Promise<OnlinePaymentInitResponse> => {
  return await api.post<OnlinePaymentInitResponse>(`/invoices/${id}/pay-online`, {});
},

  verifyPayment: async (reference: string): Promise<VerifyPaymentResponse> => {
    // Prefer the server-side Paystack verification route (real gateway when
    // PAYSTACK_SECRET_KEY is configured). Falls back to the in-browser mock.
    try {
      const res = await fetch(
        `/api/paystack/verify/${encodeURIComponent(reference)}`,
      );
      if (res.ok) {
        const json: any = await res.json();

        if (json?.paid) {
          // Gateway confirmed. Mirror the settlement into the local demo store so
          // receipts, dashboards and the linked application all update.
          //
          // IMPORTANT: the Paystack reference (LOGMAS-<invoice>-<ts>-<rnd>) is NOT
          // the invoice number, so we resolve the real invoice from the metadata
          // Paystack echoes back (set during initialize).
          const mirrorKey =
            json?.metadata?.invoiceNumber ||
            json?.metadata?.invoiceId ||
            reference;

          let mirrored: any = null;
          try {
            mirrored = await api.post(
              `/invoices/${encodeURIComponent(String(mirrorKey))}/simulate-payment`,
              {},
            );
          } catch {
            /* ignore — the gateway result is still authoritative */
          }

          // Merge so /payment/result can show invoice + receipt + application.
          return {
            ...(mirrored || {}),
            ...json,
            status: "confirmed",
            success: true,
            flow: json?.flow || "new_application",
            reference: json?.reference || reference,
          } as unknown as VerifyPaymentResponse;
        }

        if (json?.source === "paystack" || json?.source === "unconfigured") {
          // Genuine gateway failure/abandoned/pending, or Paystack not configured
          // yet — for "unconfigured" we still let the local mock settle below.
          if (json?.source === "paystack") {
            return json as VerifyPaymentResponse;
          }
        }
      }
    } catch {
      /* route unavailable — use the mock below */
    }

    // Local (no-gateway) path: the mock settles the invoice and issues the receipt.
    const mock: any = await api.get<VerifyPaymentResponse>(
      `/payments/verify/${encodeURIComponent(reference)}`,
    );
    if (mock && (mock.verified || mock.status === "paid")) {
      return {
        ...mock,
        status: "confirmed",
        success: true,
        flow: mock.flow || "new_application",
      } as unknown as VerifyPaymentResponse;
    }
    return mock as VerifyPaymentResponse;
  },

   // Field officer sends Paystack link via SMS + email
  sendPaymentLink: async (id: string): Promise<SendPaymentLinkResponse> => {
    return await api.post<SendPaymentLinkResponse>(`/invoices/${id}/send-payment-link`, {});
  },


  // DEV ONLY: Simulate payment
  simulatePayment: async (id: string): Promise<SimulatePaymentResponse> => {

      return await api.post<SimulatePaymentResponse>(`/invoices/${id}/simulate-payment`, {});
   
  },
};
