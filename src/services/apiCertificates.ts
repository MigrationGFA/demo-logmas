/* eslint-disable @typescript-eslint/no-explicit-any */
import { api } from "@/lib/api";
import { BackendCertificate } from "@/types/certificate";
import { PublicCertificate } from "@/types/publicCertificate";
import { formatOfficialDate, generatePublicToken } from "@/lib/certificateTokens";

/**
 * Service for the official Backend Certificate Endpoints:
 * - GET /api/v1/certificates (List scoped to role)
 * - GET /api/v1/certificates/:id (Fetch one by ID, certificateNumber, or verificationCode)
 */
export const apiCertificates = {
  /**
   * List issued certificates, scoped to the logged-in user's role:
   * - citizen/business_owner: applicant OR createdBy
   * - field_officer: applications they created
   * - admin/super_admin/chairman/treasurer/auditor: all certificates
   */
  getCertificates: async (): Promise<BackendCertificate[]> => {
    try {
      const response = await api.get<BackendCertificate[] | { data: BackendCertificate[] }>(
        "/certificates"
      );

      if (Array.isArray(response)) {
        return response;
      }
      if (response && Array.isArray((response as any).data)) {
        return (response as any).data;
      }
      return [];
    } catch (err) {
      console.warn("apiCertificates.getCertificates error:", err);
      return [];
    }
  },

  /**
   * Fetch one certificate by its UUID id, its certificateNumber, or its verificationCode
   */
  getCertificateById: async (idOrNumberOrCode: string): Promise<BackendCertificate | null> => {
    if (!idOrNumberOrCode) return null;
    const cleanId = idOrNumberOrCode.trim();

    try {
      let response: any;
      try {
        response = await api.get<BackendCertificate | { data: BackendCertificate }>(
          `/certificates/${encodeURIComponent(cleanId)}`
        );
      } catch (firstErr) {
        // If encoded failed (e.g. backend expects raw slashes or unencoded path), try raw
        try {
          response = await api.get<BackendCertificate | { data: BackendCertificate }>(
            `/certificates/${cleanId}`
          );
        } catch {
          throw firstErr;
        }
      }

      if (response && (response as any).id) {
        return response as BackendCertificate;
      }
      if (response && (response as any).data && (response as any).data.id) {
        return (response as any).data as BackendCertificate;
      }
      return response as BackendCertificate;
    } catch (err) {
      console.warn(`apiCertificates.getCertificateById(${cleanId}) error:`, err);
      throw err;
    }
  },

  /**
   * Transforms the backend certificate contract response into the full PublicCertificate
   * model used by CertificateRenderer, templates, and public verification views.
   */
  transformBackendToPublicCertificate: (
    cert: BackendCertificate,
    tokenOverride?: string
  ): PublicCertificate => {
    const rawApp = cert.application || {};
    const formData = rawApp.formData || {};
    const applicantRaw = rawApp.applicant || {};
    const serviceRaw = cert.service || {};

    const isClub =
      serviceRaw.code?.toLowerCase().includes("club") ||
      serviceRaw.code?.toLowerCase().includes("cda") ||
      serviceRaw.code?.toLowerCase().includes("association") ||
      serviceRaw.certificateType === "CERTIFICATE_OF_REGISTRATION";

    const applicantName =
      applicantRaw.name ||
      formData.fullName ||
      formData.clubName ||
      formData.associationName ||
      formData.businessName ||
      formData.name ||
      "Official Applicant";

    const applicantAddress =
      formData.address ||
      formData.secretariatAddress ||
      formData.residentialAddress ||
      formData.businessAddress ||
      "Odeda Local Government Area, Ogun State, Nigeria";

    const applicantWard =
      formData.ward ||
      formData.wardName ||
      formData.lgaWard ||
      "Ward 1 (Odeda Central)";

    const formattedIssuedDate = formatOfficialDate(cert.issuedAt);
    const validUntilDate = cert.expiresAt
      ? formatOfficialDate(cert.expiresAt)
      : "Indefinite / Subject to LGA Verification";

    const effectiveToken =
      tokenOverride ||
      cert.qrToken ||
      cert.certificateNumber ||
      cert.verificationCode ||
      generatePublicToken(cert.id);

    // Build dynamic certificateData dictionary for the layout templates
    const certificateData: Record<string, any> = {
      ...formData,
      // Origin specific fields
      nameOfApplicant: applicantName,
      address: applicantAddress,
      ward: applicantWard,
      dateOfIssue: formattedIssuedDate,
      validUntil: validUntilDate,
      stateOfOrigin: formData.stateOfOrigin || formData.state || "Ogun State",
      lgaOfOrigin:
        formData.lgaOfOrigin ||
        formData.lga ||
        formData.originLga ||
        "Odeda Local Government Area",
      descriptionOfGoods:
        formData.descriptionOfGoods ||
        formData.purposeDescription ||
        "General Merchandise & Indigene Civic Verification",
      countryOfDestination:
        formData.countryOfDestination ||
        formData.destination ||
        "Federal Republic of Nigeria",
      purpose:
        formData.purpose ||
        formData.reasonForApplication ||
        "Official Indigene Verification & Documentation",

      // Club / Association specific fields
      clubName: formData.clubName || applicantName,
      registrationNo: cert.certificateNumber,
      category:
        formData.category ||
        serviceRaw.category ||
        "Social & Community Development",
      dateOfRegistration: formattedIssuedDate,
      objectives:
        formData.objectives ||
        formData.aims ||
        "Youth Empowerment, Community Development & Civic Leadership",
      motto: formData.motto || "Unity, Peace and Progress",
      validity: validUntilDate,
      statutoryLawNotice:
        "Registered in accordance with the Local Government Statutory Guidelines and bye-laws of Odeda Local Government.",
    };

    return {
      id: cert.id,
      publicToken: effectiveToken,
      documentId: cert.id,
      certificateNumber: cert.certificateNumber,
      applicationNo: rawApp.applicationNumber || `ODE-APP-${cert.id.substring(0, 6)}`,
      service: {
        id: serviceRaw.id,
        code: serviceRaw.code || "certificate_of_origin",
        name: serviceRaw.name || "Certificate of Origin",
        category: serviceRaw.category || "Certificates",
        description: serviceRaw.description,
        templateType: isClub ? "club" : "origin",
        revenueHead: serviceRaw.revenueHead || "1001 - Statutory LGA Revenue",
        certificateType: serviceRaw.certificateType,
        estimatedDays: serviceRaw.estimatedDays,
      },
      applicant: {
        id: applicantRaw.id,
        name: applicantName,
        address: applicantAddress,
        phone: applicantRaw.phone || formData.phone || null,
        email: applicantRaw.email || formData.email || null,
        ward: applicantWard,
        nin: formData.nin || null,
        gender: formData.gender || null,
        dateOfBirth: formData.dateOfBirth || null,
        passportUrl: formData.passportUrl || formData.passportPhoto || null,
      },
      issuedAt: cert.issuedAt,
      validUntil: cert.expiresAt || validUntilDate,
      expiryDate: cert.expiresAt,
      status: "valid",
      statusMessage: "Official Document — Verified & Active in Odeda LGA Registry",
      issuer: {
        id: cert.issuedBy?.id,
        name: cert.issuedBy?.name || "Hon. Akinyemi A. Odunayo",
        title:
          cert.issuedBy?.role === "chairman"
            ? "Executive Chairman"
            : cert.issuedBy?.name
              ? `${cert.issuedBy.name} (${cert.issuedBy.role || "LGA Admin"})`
              : "Executive Chairman",
        organization: "Odeda Local Government",
        subtitle: "Ogun State, Nigeria",
        councillorName: formData.councillorName || "Hon. Osunnowo Azeez",
        holgaName: "Dr. K. A. Adebisi (HOLGA)",
        role: cert.issuedBy?.role || "lga_admin",
      },
      certificateData,
      verification: {
        valid: true,
        verifiedAt: new Date().toISOString(),
        qrUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/certificate/${encodeURIComponent(cert.certificateNumber || effectiveToken)}`,
        qrToken: cert.qrToken,
        verificationCode: cert.verificationCode,
        verificationUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/verify?code=${encodeURIComponent(cert.certificateNumber || cert.verificationCode)}`,
        verificationMessage:
          "Authentic certificate issued by Odeda Local Government Secretariat.",
      },
      backendCertificate: cert,
      invoice: cert.invoice || null,
      issuedBy: cert.issuedBy || null,
      application: cert.application,
      pdfUrl: cert.pdfUrl || null,
    };
  },
};
