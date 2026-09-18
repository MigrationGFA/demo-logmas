import { api } from "../lib/api";
enum BillingCycle {
  one_time,
  daily,
  weekly,
  monthly,
  yearly,
}

interface LevyConfigs {
  id: string;
  name: string;
  amount: true;
  billingCycle: BillingCycle;
  isActive: boolean;
  type:string
}
interface PernitConfigs {
  id: string;
  name: string;
  baseAmount: number;
  isActive: boolean;
  type:string
}


// Types based on your controller and schema
export interface RevenueCategory {
  id: string;
  name: string;
  type:string
  slug: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    levyConfigs: number;
    permitConfigs: number;
    invoices: number;
  };
  levyConfigs: LevyConfigs[];
  permitConfigs: PernitConfigs[];
}

export interface CreateCategoryData {
  name: string;
  description?: string;
}

export interface UpdateCategoryData {
  name?: string;
  description?: string;
  isActive?: boolean;
}

export interface CategoriesListResponse {
  data: RevenueCategory[];
}

export interface CategoryResponse {
  id: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Service functions
export const revenueCategoriesService = {
  // Get all categories (unpaginated)
  listCategories: async (type?: "LEVY" | "PERMIT"): Promise<RevenueCategory[]> => {
    void type;
    return await api.get<RevenueCategory[]>(`/categories`);
  },

  // Create new category
  createCategory: async (data: CreateCategoryData): Promise<CategoryResponse> => {
    return await api.post<CategoryResponse>("/categories", data);
  },

  // Update category
  updateCategory: async (id: string, data: UpdateCategoryData): Promise<CategoryResponse> => {
    return await api.patch<CategoryResponse>(`/categories/${id}`, data);
  },

  // Delete category
  deleteCategory: async (id: string): Promise<{ message: string }> => {
    return await api.delete<{ message: string }>(`/categories/${id}`);
  },
};
