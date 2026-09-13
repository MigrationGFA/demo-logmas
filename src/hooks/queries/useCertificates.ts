import { useQuery } from "@tanstack/react-query";
import { apiCertificates } from "@/services/apiCertificates";
import { BackendCertificate } from "@/types/certificate";

export const certificatesKeys = {
  all: ["certificates"] as const,
  lists: () => [...certificatesKeys.all, "list"] as const,
  detail: (id: string) => [...certificatesKeys.all, "detail", id] as const,
};

/**
 * Hook to fetch issued certificates scoped to current logged-in user role
 */
export function useCertificates() {
  return useQuery<BackendCertificate[], Error>({
    queryKey: certificatesKeys.lists(),
    queryFn: () => apiCertificates.getCertificates(),
    staleTime: 1000 * 60 * 3, // 3 minutes
  });
}

/**
 * Hook to fetch a single certificate by UUID, certificateNumber, or verificationCode
 */
export function useCertificate(idOrNumberOrCode: string, enabled: boolean = true) {
  return useQuery<BackendCertificate | null, Error>({
    queryKey: certificatesKeys.detail(idOrNumberOrCode),
    queryFn: () => apiCertificates.getCertificateById(idOrNumberOrCode),
    enabled: !!idOrNumberOrCode && enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });
}
