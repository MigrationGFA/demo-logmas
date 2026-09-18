/* eslint-disable @typescript-eslint/no-explicit-any */
import { ServiceType } from "@/config/lgaServices";
import { api } from "../lib/api";

export interface CreateServiceFeeConfig {
  amount: number;
  expiryDate?: string | null;
  notes?: string;
}

export interface CreateServicePayload {
  code: string;
  name: string;
  category: string;
  revenueHead: string;
  description: string;
  requirements: string[];
  estimatedDays: number;
  certificateType: string;
  supportsRenewal: boolean;
  isActive: boolean;
  feeConfig: CreateServiceFeeConfig;
}

export interface UpdateServiceFeeConfig {
  amount?: number;
  expiryDate?: string | null;
  status?: "ACTIVE" | "INACTIVE";
  notes?: string;
}

export interface UpdateServicePayload {
  code?: string;
  name?: string;
  category?: string;
  revenueHead?: string;
  description?: string;
  requirements?: string[];
  estimatedDays?: number;
  certificateType?: string;
  supportsRenewal?: boolean;
  isActive?: boolean;
  feeConfig?: UpdateServiceFeeConfig;
}

// Service functions
export const services = {
  listServices: () => api.get<ServiceType[]>("/services"),

  getServiceBySlug: (slug: string) =>
    api.get<ServiceType>(`/services/${slug}`),

  createService: (payload: CreateServicePayload) =>
    api.post<any>("/services", payload),

  updateService: (serviceId: string, payload: UpdateServicePayload) =>
    api.patch<any>(`/services/${serviceId}`, payload),
};

