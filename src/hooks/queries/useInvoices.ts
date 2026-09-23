/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  GetInvoicesParams,
  invoicesService,
  PaymentData,
  type InvoiceStatus,
} from "@/services/apiInvoice";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

export const invoicesKeys = {
  all: ["invoices"] as const,
  hub: () => [...invoicesKeys.all, "hub"] as const,
  filteredHub: (params?: GetInvoicesParams) =>
    [...invoicesKeys.hub(), params] as const,
  detail: (id: string) => [...invoicesKeys.all, "detail", id] as const,
};

// Hook for invoices list/hub
export function useInvoices(params?: GetInvoicesParams) {
  const queryClient = useQueryClient();

  const {
    data: response,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: invoicesKeys.filteredHub(params),
    queryFn: () => invoicesService.getInvoicesHub(params),
    staleTime: 30 * 1000,
  });

  const stats = response?.stats || {
    outstanding: 0,
    totalCollected: 0,
    transactions: 0,
    avgPayment: 0,
  };

  const invoices = response?.invoices || [];

  return {
    outstanding: stats.outstanding,
    collected: stats.totalCollected,
    transactions: stats.transactions,
    avgPayment: stats.avgPayment,
    invoices,
    isLoading,
    error,
    refetch,
  };
}

// Hook for single invoice details
export function useInvoiceDetails(invoiceId: string) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: invoicesKeys.detail(invoiceId),
    queryFn: () => invoicesService.getInvoiceById(invoiceId),
    enabled: !!invoiceId,
    staleTime: 60 * 1000,
  });
  const invoice = data;

  const isPayable = invoice
    ? String(invoice.paymentStatus) !== "confirmed" &&
      String(invoice.paymentStatus) !== "cancelled"
    : false;

  const paymentProgress = invoice
    ? (invoice.amountPaid / invoice.totalAmount) * 100
    : 0;

  return {
    invoice,
    isLoading,
    error,
    refetch,
    isPayable,
    paymentProgress,
  };
}

// Hook for invoice payments
export function useInvoicePayment(invoiceId: string) {
  const queryClient = useQueryClient();
  const [paystackUrl, setPaystackUrl] = useState<string | null>(null);

  // Record cash/POS payment (field officer only)
  const recordPaymentMutation = useMutation({
    mutationFn: (data: PaymentData) =>
      invoicesService.recordPayment(invoiceId, data),
    onSuccess: (response) => {
      toast.success(response.message);
      queryClient.invalidateQueries({
        queryKey: invoicesKeys.detail(invoiceId),
      });
      queryClient.invalidateQueries({ queryKey: invoicesKeys.hub() });

      if (response.isFullPayment && response.receipt) {
        toast.success("Receipt generated successfully!");
      }
    },
    onError: (error: any) => {
      toast.error(error.message || "Payment failed");
    },
  });

  // Initialize online payment — hits the Next.js Paystack API route, then
  // redirects the payer to Paystack's hosted checkout (or the local
  // simulated gateway page when PAYSTACK_SECRET_KEY is not configured).
  const initializeOnlinePaymentMutation = useMutation({
    mutationFn: async () => {
      const inv: any = await invoicesService.getInvoiceById(invoiceId);
      const amount = Number(inv?.totalAmount || inv?.amount || 0);
      const email = inv?.customerEmail || inv?.email || "demo@logmas.gov.ng";
      const invoiceNumber = inv?.invoiceNumber || inv?.reference || invoiceId;

      const res = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceId,
          invoiceNumber,
          amount,
          email,
          applicationId: inv?.applicationId || undefined,
        }),
      });
      const json = await res.json().catch(() => null);

      // Real Paystack gateway initialised successfully — hand the payer off to
      // Paystack's hosted checkout.
      if (res.ok && json?.status && json?.data?.authorization_url) {
        return {
          reference: String(json.data.reference || ""),
          paymentUrl: String(json.data.authorization_url || json.data.payment_url || ""),
        };
      }

      // --- No-env / demo fallback ------------------------------------------------
      // Paystack is not configured yet. Keep the demo fully functional by settling
      // the invoice locally (issues the receipt + confirms the application) and
      // redirecting to the payment result page, which verifies the reference.
      // We verify against the *invoice* reference (slash-free) so the local mock
      // `/payments/verify/:ref` can resolve it.
      await invoicesService.simulatePayment(invoiceId);
      return {
        reference: invoiceNumber,
        paymentUrl: `/payment/result?reference=${encodeURIComponent(invoiceNumber)}`,
        configured: false,
      };
    },
    onSuccess: (response) => {
      // Stash the reference so the page can verify on return from Paystack's redirect.
      if (response.reference) {
        sessionStorage.setItem("pendingPaymentReference", response.reference);
      }
      if (response.paymentUrl) {
        window.location.href = response.paymentUrl;
      }
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to initialize payment");
    },
  });

  // Field officer sends the Paystack link to the business via SMS + email
  // (currently routed to a fixed test contact server-side, not the real business)
  const sendPaymentLinkMutation = useMutation({
    mutationFn: () => invoicesService.sendPaymentLink(invoiceId),
    onSuccess: (response) => {
      if (response.smsSent) toast.success("SMS sent");
      else toast.error("SMS failed to send");

      if (response.emailSent) toast.success("Email sent");
      else toast.error("Email failed to send");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to send payment link");
    },
  });

  // Verify payment directly against Paystack  -  call on mount if a reference is
  // pending (e.g. after redirect back), or manually via a "Refresh status" button.
  const verifyPaymentMutation = useMutation({
    mutationFn: (reference: string) => invoicesService.verifyPayment(reference),
    onSuccess: (response) => {
      if (response.status === "confirmed") {
        toast.success("Payment confirmed!");
        sessionStorage.removeItem("pendingPaymentReference");
      }
      queryClient.invalidateQueries({
        queryKey: invoicesKeys.detail(invoiceId),
      });
      queryClient.invalidateQueries({ queryKey: invoicesKeys.hub() });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to verify payment");
    },
  });

  // DEV ONLY: Simulate payment
  const simulatePaymentMutation = useMutation({
    mutationFn: () => invoicesService.simulatePayment(invoiceId),
    onSuccess: (res: any) => {
      toast.success("Payment confirmed! Receipt & Certificate generated.");
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("logmas:store-change"));
      }
      queryClient.invalidateQueries({
        queryKey: invoicesKeys.detail(invoiceId),
      });
      queryClient.invalidateQueries({ queryKey: invoicesKeys.hub() });
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      queryClient.invalidateQueries({ queryKey: ["overview"] });

      const ref = res?.invoice?.invoiceNumber || res?.invoiceNumber || res?.invoice?.reference || invoiceId;
      if (typeof window !== "undefined") {
        window.location.href = `/payment/result?reference=${encodeURIComponent(ref)}`;
      }
    },
    onError: (error: any) => {
      toast.error(error.message || "Simulation failed");
    },
  });

  return {
    paystackUrl,
    recordPayment: recordPaymentMutation.mutate,
    recordPaymentAsync: recordPaymentMutation.mutateAsync,
    isRecordingPayment: recordPaymentMutation.isPending,
    recordPaymentError: recordPaymentMutation.error,

    initializeOnlinePayment: initializeOnlinePaymentMutation.mutate,
    isInitializingPayment: initializeOnlinePaymentMutation.isPending,

    sendPaymentLink: sendPaymentLinkMutation.mutate,
    isSendingPaymentLink: sendPaymentLinkMutation.isPending,

    verifyPayment: verifyPaymentMutation.mutate,
    isVerifyingPayment: verifyPaymentMutation.isPending,

    simulatePayment: simulatePaymentMutation.mutate,
    isSimulatingPayment: simulatePaymentMutation.isPending,
  };
}

