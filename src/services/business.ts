import { api } from "@/lib/api";
import {
  type Customer as StoreCustomer,
  type LevyPrice as StoreLevyPrice,
  type PermitConfig as StorePermitConfig,
} from "@/lib/store";

// Re-export the canonical (frontend-authored) shapes. The Node/Prisma backend
// MUST match these  -  see backend-reference/schema.prisma.
export type Customer = StoreCustomer;
export type LevyPrice = StoreLevyPrice;
export type PermitConfig = StorePermitConfig;

export const businessService = {
  listCustomers: async (params?: Record<string, unknown>): Promise<Customer[]> => {
    return api.get<Customer[]>("/customers", { params });
  },

  getCustomer: async (id: string): Promise<Customer> => {
    return api.get<Customer>(`/customers/${id}`);
  },

  createCustomer: async (data: Partial<Customer>): Promise<Customer> => {
    return api.post<Customer>("/customers", data);
  },

  updateCustomer: async (id: string, data: Partial<Customer>): Promise<Customer> => {
    return api.put<Customer>(`/customers/${id}`, data);
  },

  deleteCustomer: async (id: string): Promise<void> => {
    return api.delete<void>(`/customers/${id}`);
  },

  listLevies: async (): Promise<LevyPrice[]> => {
    return api.get<LevyPrice[]>("/levy-prices");
  },

  upsertLevy: async (data: LevyPrice): Promise<LevyPrice> => {
    if (data.id) return api.put<LevyPrice>(`/levy-prices/${data.id}`, data);
    return api.post<LevyPrice>("/levy-prices", data);
  },

  deleteLevy: async (id: string): Promise<void> => {
    return api.delete<void>(`/levy-prices/${id}`);
  },

  listPermitConfigs: async (): Promise<PermitConfig[]> => {
    return api.get<PermitConfig[]>("/permit-configs");
  },

  upsertPermitConfig: async (data: PermitConfig): Promise<PermitConfig> => {
    if (data.id) return api.put<PermitConfig>(`/permit-configs/${data.id}`, data);
    return api.post<PermitConfig>("/permit-configs", data);
  },

  togglePermitConfig: async (id: string): Promise<void> => {
    return api.post<void>(`/permit-configs/${id}/toggle`, {});
  },

  deletePermitConfig: async (id: string): Promise<void> => {
    return api.delete<void>(`/permit-configs/${id}`);
  },
};

