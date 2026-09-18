import { api } from "@/lib/api";
import {
  type Invoice as StoreInvoice,
  type Receipt as StoreReceipt,
  type CreateInvoiceInput,
} from "@/lib/store";

export type Invoice = StoreInvoice;
export type Receipt = StoreReceipt;

export interface InvoiceFilters {
  status?: string;
  search?: string;
  ward?: string;
  from?: string;
  to?: string;
}

export const operationsService = {
  listInvoices: async (filters?: InvoiceFilters): Promise<Invoice[]> => {
    return api.get<Invoice[]>("/invoices", { params: filters });
  },

  getInvoice: async (id: string): Promise<Invoice> => {
    return api.get<Invoice>(`/invoices/${id}`);
  },

  createInvoice: async (data: Partial<Invoice> & Partial<CreateInvoiceInput>): Promise<Invoice> => {
    return api.post<Invoice>("/invoices", data);
  },

  payInvoice: async (
    id: string,
    data: {
      channel: string;
      amount?: number;
      reference?: string;
      actor?: string;
      actorRole?: string;
    },
  ): Promise<Receipt> => {
    return api.post<Receipt>(`/invoices/${id}/pay`, data);
  },

  listReceipts: async (): Promise<Receipt[]> => {
    return api.get<Receipt[]>("/receipts");
  },

  getReceipt: async (id: string): Promise<Receipt> => {
    return api.get<Receipt>(`/receipts/${id}`);
  },

  verifyByCode: async (token: string): Promise<{ receipt: Receipt; invoice?: Invoice } | null> => {
    return api.get<{ receipt: Receipt; invoice?: Invoice } | null>(
      `/payments/verify/${encodeURIComponent(token)}`,
    );
  },

  findInvoiceByRef: async (ref: string): Promise<Invoice | null> => {
    return api.get<Invoice | null>(`/invoices/by-ref/${encodeURIComponent(ref)}`);
  },
};
