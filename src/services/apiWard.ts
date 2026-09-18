
import { api } from "../lib/api";

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

// Service functions
export const wardsService = {
  // Get all active wards (public endpoint)
  getWardsList: async (): Promise<Ward[]> => {
    return await api.get<Ward[]>("/general/wards");
  },
};