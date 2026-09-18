import { api } from "@/lib/api";
import { MOCK_MODE, tick } from "./_mock";
import {
  addCustomer as storeAddCustomer,
  upsertLevy as storeUpsertLevy,
  deleteLevy as storeDeleteLevy,
  upsertPermitConfig as storeUpsertPermitConfig,
  deletePermitConfig as storeDeletePermitConfig,
  togglePermitConfigActive as storeTogglePermitConfigActive,
  type Customer as StoreCustomer,
  type LevyPrice as StoreLevyPrice,
  type PermitConfig as StorePermitConfig,
} from "@/lib/store";

// Re-export the canonical (frontend-authored) shapes. The Node/Prisma backend
// MUST match these  -  see backend-reference/schema.prisma.
export type Customer = StoreCustomer;
export type LevyPrice = StoreLevyPrice;
export type PermitConfig = StorePermitConfig;

import { getStoreSnapshot } from "@/lib/store";

export const businessService = {
  listCustomers: async (params?: Record<string, unknown>): Promise<Customer[]> => {
    if (MOCK_MODE) {
      const q = ((params?.search as string) || "").toLowerCase();
      const all = getStoreSnapshot().customers;
      return tick(q ? all.filter((c) => (c.name + (c.phone ?? "") + (c.businessName ?? "")).toLowerCase().includes(q)) : all);
    }
    return api.get<Customer[]>("/customers", { params });
  },

  getCustomer: async (id: string): Promise<Customer> => {
    if (MOCK_MODE) {
      const c = getStoreSnapshot().customers.find((x) => x.id === id);
      if (!c) throw new Error("Customer not found");
      return tick(c);
    }
    return api.get<Customer>(`/customers/${id}`);
  },

  createCustomer: async (data: Partial<Customer>): Promise<Customer> => {
    if (MOCK_MODE) {
      const c = storeAddCustomer({
        name: data.name ?? "Unnamed",
        phone: data.phone ?? "",
        email: data.email,
        address: data.address,
        businessName: data.businessName,
        ward: data.ward,
      });
      return tick(c);
    }
    return api.post<Customer>("/customers", data);
  },

  updateCustomer: async (id: string, data: Partial<Customer>): Promise<Customer> => {
    if (MOCK_MODE) {
      // Minimal in-memory patch  -  refetch will pick it up via snapshot.
      throw new Error("Mock mode does not implement updateCustomer yet");
    }
    return api.put<Customer>(`/customers/${id}`, data);
  },

  deleteCustomer: async (id: string): Promise<void> => {
    if (MOCK_MODE) {
      throw new Error("Mock mode does not implement deleteCustomer yet");
    }
    return api.delete<void>(`/customers/${id}`);
  },

  listLevies: async (): Promise<LevyPrice[]> => {
    if (MOCK_MODE) return tick(getStoreSnapshot().levies);
    return api.get<LevyPrice[]>("/levy-prices");
  },

  upsertLevy: async (data: LevyPrice): Promise<LevyPrice> => {
    if (MOCK_MODE) {
      storeUpsertLevy(data);
      return tick(data);
    }
    if (data.id) return api.put<LevyPrice>(`/levy-prices/${data.id}`, data);
    return api.post<LevyPrice>("/levy-prices", data);
  },

  deleteLevy: async (id: string): Promise<void> => {
    if (MOCK_MODE) {
      storeDeleteLevy(id);
      return tick(undefined as unknown as void);
    }
    return api.delete<void>(`/levy-prices/${id}`);
  },

  listPermitConfigs: async (): Promise<PermitConfig[]> => {
    if (MOCK_MODE) return tick(getStoreSnapshot().permitConfigs);
    return api.get<PermitConfig[]>("/permit-configs");
  },

  upsertPermitConfig: async (data: PermitConfig): Promise<PermitConfig> => {
    if (MOCK_MODE) {
      storeUpsertPermitConfig(data);
      return tick(data);
    }
    if (data.id) return api.put<PermitConfig>(`/permit-configs/${data.id}`, data);
    return api.post<PermitConfig>("/permit-configs", data);
  },

  togglePermitConfig: async (id: string): Promise<void> => {
    if (MOCK_MODE) {
      storeTogglePermitConfigActive(id);
      return tick(undefined as unknown as void);
    }
    return api.post<void>(`/permit-configs/${id}/toggle`, {});
  },

  deletePermitConfig: async (id: string): Promise<void> => {
    if (MOCK_MODE) {
      storeDeletePermitConfig(id);
      return tick(undefined as unknown as void);
    }
    return api.delete<void>(`/permit-configs/${id}`);
  },
};

