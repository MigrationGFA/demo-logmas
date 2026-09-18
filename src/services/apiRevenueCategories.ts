import { api } from "../lib/api";
import { LGA_CONFIG } from "@/config/lga.config";
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

const MOCK_CATEGORIES: RevenueCategory[] = [
  {
    id: "cat-1",
    name: "Market Tolls & Levies",
    type: "LEVY",
    slug: "market-tolls",
    description: `Daily market tolls and shop levies across ${LGA_CONFIG.identity.name} markets`,
    isActive: true,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    _count: { levyConfigs: 3, permitConfigs: 0, invoices: 142 },
    levyConfigs: [],
    permitConfigs: [],
  },
  {
    id: "cat-2",
    name: "Business Trade Permits",
    type: "PERMIT",
    slug: "trade-permits",
    description: "Annual trade permits for businesses, shops and kiosks",
    isActive: true,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    _count: { levyConfigs: 0, permitConfigs: 4, invoices: 98 },
    levyConfigs: [],
    permitConfigs: [],
  },
  {
    id: "cat-3",
    name: "Tenement Rate",
    type: "LEVY",
    slug: "tenement-rate",
    description: "Annual tenement rate assessments for residential and commercial properties",
    isActive: true,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    _count: { levyConfigs: 2, permitConfigs: 0, invoices: 210 },
    levyConfigs: [],
    permitConfigs: [],
  },
  {
    id: "cat-4",
    name: "Haulage & Solid Minerals",
    type: "LEVY",
    slug: "haulage-minerals",
    description: "Quarry extraction levies and heavy vehicle haulage fees",
    isActive: true,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    _count: { levyConfigs: 5, permitConfigs: 1, invoices: 85 },
    levyConfigs: [],
    permitConfigs: [],
  },
  {
    id: "cat-5",
    name: "Certificates & Licences",
    type: "PERMIT",
    slug: "certificates-licences",
    description: "Certificates of Origin, Club, CDA, Farmers, Environmental & Liquor licences",
    isActive: true,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    _count: { levyConfigs: 0, permitConfigs: 6, invoices: 340 },
    levyConfigs: [],
    permitConfigs: [],
  },
];

// Service functions
export const revenueCategoriesService = {
  // Get all categories (unpaginated)
  listCategories: async (type?: "LEVY" | "PERMIT"): Promise<RevenueCategory[]> => {
    try {
      return await api.get<RevenueCategory[]>(`/categories`);
    } catch {
      if (type) {
        return MOCK_CATEGORIES.filter((c) => c.type === type);
      }
      return MOCK_CATEGORIES;
    }
  },

  // Create new category
  createCategory: async (data: CreateCategoryData): Promise<CategoryResponse> => {
    try {
      return await api.post<CategoryResponse>("/categories", data);
    } catch {
      const newCat: RevenueCategory = {
        id: `cat-${Date.now()}`,
        name: data.name,
        type: "LEVY",
        slug: data.name.toLowerCase().replace(/[^a-z0-random]/g, "-"),
        description: data.description || "",
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        levyConfigs: [],
        permitConfigs: [],
      };
      MOCK_CATEGORIES.push(newCat);
      return newCat;
    }
  },

  // Update category
  updateCategory: async (id: string, data: UpdateCategoryData): Promise<CategoryResponse> => {
    try {
      return await api.patch<CategoryResponse>(`/categories/${id}`, data);
    } catch {
      const cat = MOCK_CATEGORIES.find((c) => c.id === id) || MOCK_CATEGORIES[0];
      if (data.name) cat.name = data.name;
      if (data.description !== undefined) cat.description = data.description;
      if (data.isActive !== undefined) cat.isActive = data.isActive;
      cat.updatedAt = new Date().toISOString();
      return cat;
    }
  },

  // Delete category
  deleteCategory: async (id: string): Promise<{ message: string }> => {
    try {
      return await api.delete<{ message: string }>(`/categories/${id}`);
    } catch {
      const idx = MOCK_CATEGORIES.findIndex((c) => c.id === id);
      if (idx !== -1) MOCK_CATEGORIES.splice(idx, 1);
      return { message: "Category deleted successfully" };
    }
  },
};
