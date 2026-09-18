import { api } from "@/lib/api";
import {
  PERMIT_TYPES as STORE_PERMIT_TYPES,
  type TradePermit as StoreTradePermit,
  type CreatePermitInput,
} from "@/lib/store";

export type TradePermit = StoreTradePermit;
export type PermitTypeConfig = (typeof STORE_PERMIT_TYPES)[number];

export const permitsService = {
  listPermits: async (filters?: Record<string, unknown>): Promise<TradePermit[]> => {
    return api.get<TradePermit[]>("/permits", { params: filters });
  },

  getPermit: async (id: string): Promise<TradePermit> => {
    return api.get<TradePermit>(`/permits/${id}`);
  },

  createPermit: async (
    data: Partial<TradePermit> & Partial<CreatePermitInput>,
  ): Promise<TradePermit> => {
    return api.post<TradePermit>("/permits", data);
  },

  issuePermit: async (id: string, actor: string, actorRole: string): Promise<TradePermit> => {
    return api.post<TradePermit>(`/permits/${id}/issue`, { actor, actorRole });
  },

  approvePermit: async (id: string): Promise<TradePermit> => {
    return api.post<TradePermit>(`/permits/${id}/approve`);
  },

  verifyByToken: async (token: string): Promise<TradePermit | null> => {
    return api.get<TradePermit | null>(`/permits/verify/${encodeURIComponent(token)}`);
  },

  listPermitTypes: async (): Promise<readonly PermitTypeConfig[]> => {
    return api.get<readonly PermitTypeConfig[]>("/permit-types");
  },
};
