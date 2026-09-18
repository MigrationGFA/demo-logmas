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

  // Initialize online payment  -  real Paystack now, always redirects on success.
  const initializeOnlinePaymentMutation = useMutation({
    mutationFn: () => invoicesService.initializeOnlinePayment(invoiceId),
    onSuccess: (response) => {
      // Stash the reference so the page can verify on return from Paystack's redirect.
      sessionStorage.setItem("pendingPaymentReference", response.reference);

      console.log(response.paymentUrl,"paymentUrl")

      window.location.href = `${response.paymentUrl}/payment/verify`;
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
    onSuccess: () => {
      toast.success("Payment simulated successfully!");
      queryClient.invalidateQueries({
        queryKey: invoicesKeys.detail(invoiceId),
      });
      queryClient.invalidateQueries({ queryKey: invoicesKeys.hub() });
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

