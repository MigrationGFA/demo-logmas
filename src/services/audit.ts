import { api } from "@/lib/api";
import { type AuditLog as StoreAuditLog } from "@/lib/store";

export type AuditLog = StoreAuditLog;
export type ActivityLog = StoreAuditLog;

export interface ReportFilters {
  from?: string;
  to?: string;
  ward?: string;
  levy?: string;
  channel?: string;
}

export const auditService = {
  listActivity: async (_filters?: ReportFilters): Promise<ActivityLog[]> => {
    return api.get<ActivityLog[]>("/activity-logs", { params: _filters });
  },

  listAudit: async (_filters?: ReportFilters): Promise<AuditLog[]> => {
    return api.get<AuditLog[]>("/audit-logs", { params: _filters });
  },

  collectionsReport: async (_filters?: ReportFilters) => {
    return api.get<{ total: number; rows: Array<Record<string, unknown>> }>(
      "/reports/collections",
      { params: _filters },
    );
  },
};
