



import { api } from "../lib/api";
import { LGA_CONFIG } from "@/config/lga.config";

// Types based on your controller
export interface Ward {
  id: string;
  name: string;
  code: string;
}

export interface WardsListResponse {
  success: boolean;
  count: number;
  data: Ward[];
}

const MOCK_WARDS: Ward[] = LGA_CONFIG.wards.map((w) => ({
  id: w.id,
  name: w.name,
  code: w.code,
}));

// Service functions
export const wardsService = {
  // Get all active wards (public endpoint)
  getWardsList: async (): Promise<Ward[]> => {
    try {
      return await api.get<Ward[]>("/general/wards");
    } catch {
      return MOCK_WARDS;
    }
  },
};