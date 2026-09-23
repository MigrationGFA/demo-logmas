/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  complaintsService,
  ComplaintStatus,
  RaiseComplaintData,
  RespondToComplaintData,
  AssignComplaintData,
  UpdateStatusData,
  PaginatedResponse,
  Complaint,
  UpdateComplaintData,
} from "@/services/apiComplaints";

export const complaintKeys = {
  all: ["complaints"] as const,
  my: () => [...complaintKeys.all, "my"] as const,
  myList: (params?: any) => [...complaintKeys.my(), params] as const,
  myDetail: (id: string) => [...complaintKeys.my(), id] as const,
  ward: () => [...complaintKeys.all, "ward"] as const,
  wardList: (params?: any) => [...complaintKeys.ward(), params] as const,
  admin: () => [...complaintKeys.all, "admin"] as const,
  adminList: (params?: any) => [...complaintKeys.admin(), params] as const,
  adminDetail: (id: string) => [...complaintKeys.admin(), id] as const,
  stats: () => [...complaintKeys.all, "stats"] as const,
};

// Hook for citizen operations
export function useCitizenComplaints() {
  const queryClient = useQueryClient();

  // Get my complaints
  const useGetMyComplaints = (params?: {
    status?: ComplaintStatus;
    page?: number;
    limit?: number;
  }) => {
    return useQuery({
      queryKey: ["complaints","my"],
      queryFn: async () => {
        const response = await complaintsService.getMyComplaints(params);
        // Handle response structure
        return response;
      },
    });
  };

  // Get single complaint by ID
  const useGetMyComplaint = (id: string) => {
    return useQuery({
      queryKey: complaintKeys.myDetail(id),
      queryFn: () => complaintsService.getMyComplaintById(id),
      enabled: !!id,
    });
  };

  // Raise new complaint
  const raiseComplaintMutation = useMutation({
    mutationFn: (data: RaiseComplaintData) =>
      complaintsService.raiseComplaint(data),
    onSuccess: (data) => {
      toast.success(`Complaint #${data?.ticketNumber} raised successfully`);
      queryClient.invalidateQueries({
        queryKey:["complaints","my"],
      });
    },
    onMutate: () => {
      queryClient.invalidateQueries({
        queryKey:["complaints","my"],
      });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to raise complaint");
    },
  });

   // Citizen reply mutation
  const respondMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { message: string } }) => complaintsService.citizenRespond(id,data),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey:complaintKeys.myDetail(vars.id) });
      // Refresh every queue that renders this thread (myDetail is a prefix of my()).
      queryClient.invalidateQueries({ queryKey: complaintKeys.my() });
      queryClient.invalidateQueries({ queryKey: complaintKeys.admin() });
      queryClient.invalidateQueries({ queryKey: complaintKeys.ward() });
    },
    onError: (err: any) => toast.error(err.message || 'Failed to send'),
  });

  return {
    useGetMyComplaints,
    useGetMyComplaint,
    raiseComplaint: raiseComplaintMutation.mutate,
    raiseComplaintAsync: raiseComplaintMutation.mutateAsync,
    isRaising: raiseComplaintMutation.isPending,
    raiseError: raiseComplaintMutation.error,
    addResponse: respondMutation.mutate,
    addResponseAsync: respondMutation.mutateAsync,
    isAddingResponse: respondMutation.isPending,
    addResponseError: respondMutation.error,
  };
}

// Hook for ward councillor operations
export function useCouncillorComplaints() {
  const queryClient = useQueryClient();

  // Get ward complaints
  const useGetWardComplaints = (params?: {
    status?: ComplaintStatus;
    page?: number;
    limit?: number;
  }) => {
    return useQuery({
      queryKey: complaintKeys.wardList(params),
      queryFn: async () => {
        const response = await complaintsService.getWardComplaints(params);
        return response.complaints;
      },
    });
  };

  // Respond to ward complaint
  const respondMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: RespondToComplaintData }) =>
      complaintsService.wardCouncillorRespond(id, data),
    onSuccess: () => {
      toast.success("Response submitted successfully");
      queryClient.invalidateQueries({ queryKey: complaintKeys.ward() });
      queryClient.invalidateQueries({ queryKey: complaintKeys.admin() });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to submit response");
    },
  });

  return {
    useGetWardComplaints,
    respond: respondMutation.mutate,
    respondAsync: respondMutation.mutateAsync,
    isResponding: respondMutation.isPending,
    respondError: respondMutation.error,
  };
}

// Hook for admin operations
export function useAdminComplaints() {
  const queryClient = useQueryClient();

  // Get all complaints
  const useGetAllComplaints = (params?: {
    status?: ComplaintStatus;
    wardId?: string;
    page?: number;
    limit?: number;
  }) => {
    return useQuery({
      queryKey: complaintKeys.adminList(params),
      queryFn: async () => {
        const response = await complaintsService.getAllComplaints(params);
        return response;
      },
    });
  };

  // Get complaint by ID
  const useGetComplaint = (id: string) => {
    return useQuery({
      queryKey: complaintKeys.adminDetail(id),
      queryFn: () => complaintsService.getComplaintById(id),
      enabled: !!id,
    });
  };

  // Get complaint statistics
  const useGetStats = () => {
    return useQuery({
      queryKey: complaintKeys.stats(),
      queryFn: () => complaintsService.getComplaintStats(),
    });
  };

  // Assign complaint
  const assignMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: AssignComplaintData }) =>
      complaintsService.assignComplaint(id, data),
    onSuccess: () => {
      toast.success("Complaint assigned successfully");
      queryClient.invalidateQueries({ queryKey: complaintKeys.admin() });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to assign complaint");
    },
  });

  // Update status
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateStatusData }) =>
      complaintsService.updateComplaintStatus(id, data),
    onSuccess: (data) => {
      toast.success(`Complaint status updated to ${data.status}`);
      queryClient.invalidateQueries({ queryKey: complaintKeys.admin() });
      queryClient.invalidateQueries({ queryKey: complaintKeys.stats() });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update status");
    },
  });

  // Replace assignMutation AND updateStatusMutation in useAdminComplaints with this single one.
  // Invalidates both admin() and stats()  -  union of what the two old mutations invalidated,
  // since this one call can now change either or both.

  const updateComplaintMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateComplaintData }) =>
      complaintsService.updateComplaint(id, data),
    onSuccess: (_response, variables) => {
      const { assignedToId, status } = variables.data;
      toast.success(
        assignedToId && status
          ? `Complaint reassigned and marked ${status}`
          : status
            ? `Complaint status updated to ${status}`
            : "Complaint assigned successfully",
      );
      queryClient.invalidateQueries({ queryKey: complaintKeys.admin() });
      queryClient.invalidateQueries({ queryKey: complaintKeys.stats() });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update complaint");
    },
  });

  // Admin respond
  const adminRespondMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: RespondToComplaintData }) =>
      complaintsService.adminRespond(id, data),
    onSuccess: () => {
      toast.success("Response added successfully");
      queryClient.invalidateQueries({ queryKey: complaintKeys.admin() });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to add response");
    },
  });

  return {
    useGetAllComplaints,
    useGetComplaint,
    useGetStats,
    assignComplaint: assignMutation.mutate,
    assignComplaintAsync: assignMutation.mutateAsync,
    updateComplaint: updateComplaintMutation.mutate,
    updateComplaintAsync: updateComplaintMutation.mutateAsync,
    isUpdating: updateComplaintMutation.isPending,
    isAssigning: assignMutation.isPending,
    updateStatus: updateStatusMutation.mutate,
    updateStatusAsync: updateStatusMutation.mutateAsync,
    // isUpdating: updateStatusMutation.isPending,
    adminRespond: adminRespondMutation.mutate,
    adminRespondAsync: adminRespondMutation.mutateAsync,
    isAdminResponding: adminRespondMutation.isPending,
  };
}

// Combined hook for role-based usage
export function useComplaintsByRole(role?: string) {
  const citizenHooks = useCitizenComplaints();
  const councillorHooks = useCouncillorComplaints();
  const adminHooks = useAdminComplaints();

  switch (role) {
    case "citizen":
    case "business_owner":
      return citizenHooks;
    case "ward_councillor":
      return councillorHooks;
    case "lga_admin":
    case "super_admin":
      return adminHooks;
    default:
      return citizenHooks;
  }
}

