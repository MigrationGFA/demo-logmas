/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery } from "@tanstack/react-query";
import { chairmanService } from "@/services/apiChairman";

export const chairmanKeys = {
  all: ["chairman"] as const,
  overview: () => [...chairmanKeys.all, "overview"] as const,
  revenue: (params?: { from?: string; to?: string }) => 
    [...chairmanKeys.all, "revenue", params] as const,
  wards: () => [...chairmanKeys.all, "wards"] as const,
  applications: () => [...chairmanKeys.all, "applications"] as const,
  complaints: () => [...chairmanKeys.all, "complaints"] as const,
};

// Chairman Overview Hook
export function useChairmanOverview(params?: { from?: string; to?: string }) {
  const {
    data: overview,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: chairmanKeys.overview(),
    queryFn: () => chairmanService.getChairmanOverview(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const metrics = overview?.metrics || {
    totalRevenue: 0,
    activePermits: 0,
    overdueInvoices: 0,
    wardCoverage: 0,
    pendingApplications: 0,
    approvedCertificates: 0,
    pendingComplaints: 0,
    activeOfficersCount: 0,
    totalInvoicesCount: 0,
    pendingBillsCount: 0,
  };

  return {
    overview,
    metrics,
    isLoading,
    error,
    refetch,
  };
}

// Revenue Trend Hook
export function useChairmanRevenue(params?: { from?: string; to?: string }) {
  const {
    data: revenueData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: chairmanKeys.revenue(params),
    queryFn: () => chairmanService.getRevenueTrend(params),
    staleTime: 2 * 60 * 1000,
  });

  const byCategory = revenueData?.byCategory || [];
  const dailyTrend = revenueData?.dailyTrend || [];
  const period = revenueData?.period;

  return {
    revenueData,
    byCategory,
    dailyTrend,
    period,
    isLoading,
    error,
    refetch,
  };
}

// Ward Performance Hook
export function useChairmanWards() {
  const {
    data: wards,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: chairmanKeys.wards(),
    queryFn: () => chairmanService.getWardPerformance(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  console.log(wards,"wards")

  // Calculate total applications, complaints, businesses across all wards
  const wardsList: any[] = Array.isArray(wards) ? wards : (wards?.wards || []);

  const totalStats = {
    applications: wardsList.reduce((sum: any, w: any) => sum + (w?._count?.stateOfOriginApplications || 0), 0) || 0,
    complaints: wardsList.reduce((sum: any, w: any) => sum + (w?._count?.complaints || 0), 0) || 0,
    businesses: wardsList.reduce((sum: any, w: any) => sum + (w?._count?.businesses || 0), 0) || 0,
  };

  // Get top performing ward by applications
  const topWardByApplications = wardsList.length
    ? [...wardsList].sort((a: any, b: any) => (b?._count?.stateOfOriginApplications || 0) - (a?._count?.stateOfOriginApplications || 0))[0]
    : null;

  // Get wards with no councillor assigned
  const wardsWithoutCouncillor = wardsList.filter((w: any) => !w?.councillor) || [];

  return {
    wards: wardsList,
    totalStats,
    topWardByApplications,
    wardsWithoutCouncillor,
    isLoading,
    error,
    refetch,
  };
}

// Application Statistics Hook
export function useChairmanApplications() {
  const {
    data: appStats,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: chairmanKeys.applications(),
    queryFn: () => chairmanService.getApplicationStats(),
    staleTime: 2 * 60 * 1000,
  });

  const byStatus = (appStats?.byStatus ?? {}) as Record<string, number>;
  const byWard = appStats?.byWard || [];

  // Calculate totals
  const totalApplications = Object.values(byStatus).reduce((sum, count) => sum + (count || 0), 0);
  const approvalRate = totalApplications > 0
    ? ((byStatus.approved || 0) / totalApplications) * 100
    : 0;

  // Get top ward by applications
  const topWard = byWard[0];

  return {
    appStats,
    byStatus,
    byWard,
    totalApplications,
    approvalRate: Math.round(approvalRate),
    topWard,
    isLoading,
    error,
    refetch,
  };
}

// Complaint Overview Hook
export function useChairmanComplaints() {
  const {
    data: complaintStats,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: chairmanKeys.complaints(),
    queryFn: () => chairmanService.getComplaintOverview(),
    staleTime: 2 * 60 * 1000,
  });

  const stats = complaintStats || {
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
    breakdown: {},
    topWards: [],
  };

  // Calculate resolution rate
  const resolutionRate = stats.total > 0
    ? ((stats.resolved || 0) / stats.total) * 100
    : 0;

  return {
    complaintStats: stats,
    totalComplaints: stats.total,
    openComplaints: stats.open,
    inProgressComplaints: stats.inProgress,
    resolvedComplaints: stats.resolved,
    resolutionRate: Math.round(resolutionRate),
    breakdown: stats.breakdown,
    topWards: stats.topWards,
    isLoading,
    error,
    refetch,
  };
}

// Combined Chairman Dashboard Hook
export function useChairmanDashboard() {
  const overview = useChairmanOverview();
  const revenue = useChairmanRevenue();
  const wards = useChairmanWards();
  const applications = useChairmanApplications();
  const complaints = useChairmanComplaints();

  return {
    overview,
    revenue,
    wards,
    applications,
    complaints,
  };
}