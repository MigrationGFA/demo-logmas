/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  BackendCertificate,
  CertificateIssuedBy,
  CertificateApplicant,
  CertificateCreatedBy,
  CertificateApplication,
  CertificateService,
  CertificateInvoice,
} from "./certificate";

export type {
  BackendCertificate,
  CertificateIssuedBy,
  CertificateApplicant,
  CertificateCreatedBy,
  CertificateApplication,
  CertificateService,
  CertificateInvoice,
};

export interface PublicCertificateService {
  id?: string;
  code: string;
  name: string;
  category?: string;
  description?: string;
  templateType?: string;
  revenueHead?: string;
  certificateType?: string;
  estimatedDays?: number;
}

export interface PublicCertificateApplicant {
  id?: string;
  name: string;
  address?: string;
  phone?: string | null;
  email?: string | null;
  ward?: string | null;
  nin?: string | null;
  gender?: string | null;
  dateOfBirth?: string | null;
  passportUrl?: string | null;
}

export interface PublicCertificateIssuer {
  id?: string;
  name: string;
  title: string;
  organization: string;
  subtitle: string;
  role?: string;
  councillorName?: string;
  holgaName?: string;
}

export interface PublicCertificateVerification {
  valid: boolean;
  verifiedAt?: string;
  qrUrl?: string;
  qrToken?: string;
  verificationCode?: string;
  verificationUrl?: string;
  verificationMessage?: string;
}

export interface PublicCertificate {
  id?: string;
  publicToken: string;
  documentId?: string;
  certificateNumber: string;
  applicationNo: string;
  service: PublicCertificateService;
  applicant: PublicCertificateApplicant;
  issuedAt: string;
  validUntil: string;
  expiryDate?: string | null;
  status: "valid" | "revoked" | "expired" | string;
  statusMessage?: string;
  issuer: PublicCertificateIssuer;
  certificateData: Record<string, any>;
  verification: PublicCertificateVerification;

  // Raw references from backend
  backendCertificate?: BackendCertificate;
  invoice?: CertificateInvoice | null;
  issuedBy?: CertificateIssuedBy | null;
  application?: CertificateApplication;
  pdfUrl?: string | null;
}
