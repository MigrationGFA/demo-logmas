import { api } from "@/lib/api";
import {
  type FieldOfficer as StoreFieldOfficer,
  type OfficerStatus,
} from "@/lib/store";

export type FieldOfficer = StoreFieldOfficer;

export interface Contractor {
  id: string;
  name: string;
  contactName?: string;
  phone?: string;
  email?: string;
  active?: boolean;
}

export interface Ward {
  id: string;
  name: string;
  code?: string;
  councillorName?: string;
}

export const sooService = {
  listFieldOfficers: async (): Promise<FieldOfficer[]> => {
    return api.get<FieldOfficer[]>("/field-officers");
  },

  createFieldOfficer: async (
    data: Omit<FieldOfficer, "id" | "createdAt" | "totalCollected" | "invoicesIssued">,
  ): Promise<FieldOfficer> => {
    return api.post<FieldOfficer>("/field-officers", data);
  },

  setFieldOfficerStatus: async (
    id: string,
    status: OfficerStatus,
    actor: string,
    actorRole: string,
  ): Promise<void> => {
    void actor;
    void actorRole;
    return api.post<void>(`/field-officers/${id}/status`, { status });
  },

  listContractors: async (): Promise<Contractor[]> => {
    return api.get<Contractor[]>("/contractors");
  },

  listWards: async (): Promise<Ward[]> => {
    return api.get<Ward[]>("/wards");
  },
};
