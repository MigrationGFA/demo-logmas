/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { genInvoiceRef, genReceiptNumber, genQRToken, genVerificationCode, addNotification, addAudit } from "./store";
import { LGA_CONFIG } from "@/config/lga.config";

export type ApplicationStatus =
  | "Draft"
  | "Submitted"
  | "Under Review"
  | "Inspection Required"
  | "Inspection Completed"
  | "Awaiting Assessment"
  | "Assessment Approved"
  | "Invoice Generated"
  | "Awaiting Payment"
  | "Payment Confirmed"
  | "Pending Approval"
  | "Approved"
  | "Certificate Generated"
  | "Completed"
  | "Returned For Correction"
  | "Rejected"
  | "Revoked";

export interface ApplicationTimelineEvent {
  id: string;
  stage: string;
  title: string;
  description: string;
  actor: string;
  actorRole: string;
  timestamp: string;
  status: "completed" | "current" | "pending";
}

export interface InspectionReport {
  scheduledAt?: string;
  inspectedAt?: string;
  inspectorName?: string;
  findings?: string;
  photos?: string[];
  recommendedCategory?: string;
  recommendedFee?: number;
  completed: boolean;
}

export interface TreasuryAssessment {
  assessedAt?: string;
  assessedBy?: string;
  approvedFee?: number;
  revenueHead?: string;
  treasuryNotes?: string;
  status: "pending" | "approved" | "rejected";
}

export interface LgaApplication {
  id: string;
  applicationNo: string;
  serviceId: string;
  serviceName: string;
  category: string;
  applicant: string;
  phone: string;
  email?: string;
  address: string;
  ward: string;
  nin?: string;
  cacNumber?: string;
  revenueHead: string;
  amount: number;
  status: ApplicationStatus;
  paymentStatus: "unpaid" | "paid" | "pending";
  invoiceId?: string;
  invoiceNumber?: string;
  receiptNumber?: string;
  paidAt?: string;
  paymentMethod?: string;
  certificateNumber?: string;
  licenceNumber?: string;
  issuedAt?: string;
  issuedBy?: string;
  expiryDate?: string;
  qrToken: string;
  verificationCode: string;
  createdAt: string;
  updatedAt: string;

  // Form payload
  details: Record<string, any>;
  documents: { name: string; url: string; status: "uploaded" | "verified" }[];

  // Workflow tracking
  inspectionReport?: InspectionReport;
  treasuryAssessment?: TreasuryAssessment;
  correctionNotes?: string;
  rejectionReason?: string;
  councillorNotes?: string;

  // Timeline
  timeline: ApplicationTimelineEvent[];
}

export const APPLICATIONS_STORAGE_KEY = `${LGA_CONFIG.identity.id}_applications`;
export const LEGACY_APPLICATIONS_STORAGE_KEY = "legacy_applications";
export const APPLICATIONS_EVENT_KEY = `${LGA_CONFIG.identity.id}:applications-change`;
export const LEGACY_APPLICATIONS_EVENT_KEY = "lga:applications-change";

const STORAGE_KEY = APPLICATIONS_STORAGE_KEY;
const EVT_KEY = APPLICATIONS_EVENT_KEY;

const INITIAL_SEED_APPLICATIONS: LgaApplication[] = [
  {
    id: "DEMO-2026-001",
    applicationNo: "DEMO/COO/2026/0001",
    serviceId: "certificate_of_origin",
    serviceName: "Certificate of Origin",
    category: "Certificates",
    applicant: "Dr. Babatunde Adeleke",
    phone: "+234 803 123 4567",
    email: "citizen@demo.gov.ng",
    address: "12 Adeleke Crescent, Adeleke Quarter, Demo City",
    ward: "Ward 3 (Adeleke / Central)",
    nin: "12345678901",
    revenueHead: "1001 - Statutory Certification Fees",
    amount: 3500,
    status: "Completed",
    paymentStatus: "paid",
    invoiceNumber: "DEMO/INV/2026/000101",
    receiptNumber: "DEMO/RCP/2026/000101",
    paidAt: "2026-08-01T10:00:00Z",
    paymentMethod: "card",
    certificateNumber: "DEMO/COO/2026/000001",
    issuedAt: "2026-08-02T11:00:00Z",
    issuedBy: `${LGA_CONFIG.leadership.chairman.name} (${LGA_CONFIG.leadership.chairman.title})`,
    qrToken: "QR-DEMO-COO-000001",
    verificationCode: "VER-COO-001",
    createdAt: "2026-08-01T09:00:00Z",
    updatedAt: "2026-08-02T11:00:00Z",
    details: {
      fullName: "Dr. Babatunde Adeleke",
      dateOfBirth: "1985-06-15",
      gender: "Male",
      fatherName: "Chief Samuel Adeleke",
      fatherCompound: "Adeleke Quarter",
      purpose: "Public Service & State Indigene Verification",
      ward: "Ward 3 (Adeleke / Central)",
    },
    documents: [
      { name: "Passport Photo", url: "/documents/passport.jpg", status: "verified" },
      { name: "NIN Slip", url: "/documents/nin.pdf", status: "verified" },
      { name: "Family Compound Verification Letter", url: "/documents/baale_letter.pdf", status: "verified" },
    ],
    timeline: [
      { id: "t1", stage: "Created", title: "Application Drafted", description: "Application created by Citizen", actor: "Dr. Babatunde Adeleke", actorRole: "citizen", timestamp: "2026-08-01 09:00", status: "completed" },
      { id: "t2", stage: "Submitted", title: "Submitted", description: "Application submitted for processing", actor: "Dr. Babatunde Adeleke", actorRole: "citizen", timestamp: "2026-08-01 09:05", status: "completed" },
      { id: "t3", stage: "Invoice Generated", title: "Statutory Invoice Issued", description: "Invoice DEMO/INV/2026/000101 for ₦3,500 generated", actor: "System Treasury", actorRole: "treasurer", timestamp: "2026-08-01 09:10", status: "completed" },
      { id: "t4", stage: "Payment Confirmed", title: "Payment Received", description: "₦3,500 paid via Online Gateway. Receipt DEMO/RCP/2026/000101 issued.", actor: "Dr. Babatunde Adeleke", actorRole: "citizen", timestamp: "2026-08-01 10:00", status: "completed" },
      { id: "t5", stage: "Approved", title: "Application Approved", description: "Verified by Ward Councillor & approved by Council Admin", actor: "Council Admin Officer", actorRole: "lga_admin", timestamp: "2026-08-02 11:00", status: "completed" },
      { id: "t6", stage: "Certificate Generated", title: "Certificate Issued", description: "Official Certificate DEMO/COO/2026/000001 ready for download", actor: "Executive Chairman", actorRole: "chairman", timestamp: "2026-08-02 11:00", status: "completed" },
    ],
  },
  {
    id: "DEMO-2026-002",
    applicationNo: "DEMO/TEN/2026/0002",
    serviceId: "tenement_rate",
    serviceName: "Tenement Rate Assessment",
    category: "Rates & Levies",
    applicant: "Commercial Retail Plaza (Alhaji Musa)",
    phone: "+234 805 444 3333",
    email: "business@demo.gov.ng",
    address: "Plot 14, Commercial District, Ward 2",
    ward: "Ward 2 (Commercial Urban)",
    revenueHead: "2001 - Tenement & Property Rates",
    amount: 35000,
    status: "Invoice Generated",
    paymentStatus: "unpaid",
    invoiceNumber: "DEMO/INV/2026/000102",
    qrToken: "QR-DEMO-TEN-000002",
    verificationCode: "VER-TEN-002",
    createdAt: "2026-08-03T08:30:00Z",
    updatedAt: "2026-08-04T14:00:00Z",
    details: {
      propertyName: "Plot 14, Commercial District",
      propertyType: "Commercial Building & Retail Complex",
      ownerName: "Alhaji Musa Ibrahim",
      ward: "Ward 2 (Commercial Urban)",
      numberOfUnits: "6 Commercial Shops",
    },
    documents: [
      { name: "Property Layout", url: "/documents/layout.pdf", status: "uploaded" },
    ],
    inspectionReport: {
      inspectedAt: "2026-08-04T10:00:00Z",
      inspectorName: "Kemi Officer",
      findings: "Multi-tenant commercial shopping units on Plot 14 Commercial District.",
      recommendedCategory: "Commercial Tier 2",
      recommendedFee: 35000,
      completed: true,
    },
    treasuryAssessment: {
      assessedAt: "2026-08-04T14:00:00Z",
      assessedBy: "Mrs. Amina Mohammed, FCA (Treasurer)",
      approvedFee: 35000,
      revenueHead: "2001 - Tenement & Property Rates",
      status: "approved",
    },
    timeline: [
      { id: "t1", stage: "Submitted", title: "Application Submitted", description: "Property assessment requested", actor: "Alhaji Musa", actorRole: "business_owner", timestamp: "2026-08-03 08:30", status: "completed" },
      { id: "t2", stage: "Inspection Completed", title: "Site Inspection Conducted", description: "Inspected by Officer Kemi Officer. Recommended ₦35,000", actor: "Kemi Officer", actorRole: "field_officer", timestamp: "2026-08-04 10:00", status: "completed" },
      { id: "t3", stage: "Invoice Generated", title: "Demand Notice Issued", description: "Invoice DEMO/INV/2026/000102 for ₦35,000 issued by Treasury. Awaiting payment.", actor: "Treasury Dept", actorRole: "treasurer", timestamp: "2026-08-04 14:00", status: "current" },
    ],
  },
  {
    id: "DEMO-2026-003",
    applicationNo: "DEMO/CLU/2026/0003",
    serviceId: "club_registration",
    serviceName: "Certificate of Club Registration",
    category: "Certificates",
    applicant: "Rising Stars Youth & Sports Development Club",
    phone: "+234 802 111 9999",
    email: "risingstars@demo.gov.ng",
    address: "Community Stadium Complex, Ward 1",
    ward: "Ward 1 (Central Urban)",
    revenueHead: "1002 - Organization & Club Registration",
    amount: 15000,
    status: "Approved",
    paymentStatus: "paid",
    invoiceNumber: "DEMO/INV/2026/000103",
    receiptNumber: "DEMO/RCP/2026/000103",
    paidAt: "2026-08-05T09:00:00Z",
    paymentMethod: "card",
    certificateNumber: "DEMO/CLU/2026/000003",
    issuedAt: "2026-08-05T15:00:00Z",
    issuedBy: `${LGA_CONFIG.leadership.chairman.name} (${LGA_CONFIG.leadership.chairman.title})`,
    qrToken: "QR-DEMO-CLU-000003",
    verificationCode: "VER-CLU-003",
    createdAt: "2026-08-04T11:00:00Z",
    updatedAt: "2026-08-05T15:00:00Z",
    details: {
      clubName: "Rising Stars Youth & Sports Development Club",
      aims: "Grassroots youth sports, talent nurturing and community empowerment",
      meetingDays: "Saturdays 4:00 PM",
      registeredTrustees: "3 Trustees",
    },
    documents: [
      { name: "Club Constitution", url: "/documents/constitution.pdf", status: "verified" },
      { name: "Minutes of Inaugural Meeting", url: "/documents/minutes.pdf", status: "verified" },
    ],
    timeline: [
      { id: "t1", stage: "Submitted", title: "Application Submitted", description: "Club registration submitted", actor: "Secretary", actorRole: "citizen", timestamp: "2026-08-04 11:00", status: "completed" },
      { id: "t2", stage: "Payment Confirmed", title: "Payment Received", description: "₦15,000 paid via Online Gateway. Receipt DEMO/RCP/2026/000103 issued.", actor: "System", actorRole: "system", timestamp: "2026-08-05 09:00", status: "completed" },
      { id: "t3", stage: "Approved", title: "Certificate Approved", description: "Official Registration Certificate granted by Executive Chairman.", actor: "Council Admin Officer", actorRole: "lga_admin", timestamp: "2026-08-05 15:00", status: "completed" },
    ],
  },
  {
    id: "DEMO-2026-004",
    applicationNo: "DEMO/STR/2026/0004",
    serviceId: "street_naming",
    serviceName: "Street Naming Approval",
    category: "Licences & Permits",
    applicant: "Residents Association (Engr. Adeleke)",
    phone: "+234 803 222 3333",
    email: "streetnaming@demo.gov.ng",
    address: "Chief Obafemi Awolowo Crescent, Off Commercial Way, Ward 2",
    ward: "Ward 2 (Commercial Urban)",
    revenueHead: "2004 - Street Naming & House Numbering",
    amount: 50000,
    status: "Approved",
    paymentStatus: "paid",
    invoiceNumber: "DEMO/INV/2026/000104",
    receiptNumber: "DEMO/RCP/2026/000104",
    paidAt: "2026-08-06T10:00:00Z",
    paymentMethod: "bank_transfer",
    certificateNumber: "DEMO/STR/2026/000004",
    issuedAt: "2026-08-06T16:00:00Z",
    issuedBy: `${LGA_CONFIG.leadership.chairman.name} (${LGA_CONFIG.leadership.chairman.title})`,
    qrToken: "QR-DEMO-STR-000004",
    verificationCode: "VER-STR-004",
    createdAt: "2026-08-05T14:20:00Z",
    updatedAt: "2026-08-06T16:00:00Z",
    details: {
      proposedStreetName: "Chief Obafemi Awolowo Crescent",
      ward: "Ward 2 (Commercial Urban)",
      numberOfHouses: "24 Properties",
      councilSignoff: "Approved by Council Resolution 14B",
    },
    documents: [
      { name: "Survey Plan", url: "/documents/survey.pdf", status: "verified" },
      { name: "Council Resolution Excerpt", url: "/documents/resolution.pdf", status: "verified" },
    ],
    timeline: [
      { id: "t1", stage: "Submitted", title: "Application Submitted", description: "Street naming approval requested", actor: "Residents Association", actorRole: "citizen", timestamp: "2026-08-05 14:20", status: "completed" },
      { id: "t2", stage: "Inspection Completed", title: "Physical Route Inspected", description: "Approved street name Chief Obafemi Awolowo Crescent verified on ground", actor: "Kemi Officer", actorRole: "field_officer", timestamp: "2026-08-06 09:00", status: "completed" },
      { id: "t3", stage: "Approved", title: "Gazetted & Approved", description: "Approved Street Name 'Chief Obafemi Awolowo Crescent' registered in Council GIS Ledger.", actor: "Executive Chairman", actorRole: "chairman", timestamp: "2026-08-06 16:00", status: "completed" },
    ],
  },
  {
    id: "DEMO-2026-005",
    applicationNo: "DEMO/TRD/2026/0005",
    serviceId: "trade_permit",
    serviceName: "Micro-Trade Kiosk Permit",
    category: "Licences & Permits",
    applicant: "Alhaji Musa Agro Stores",
    phone: "+234 805 444 3333",
    email: "business@demo.gov.ng",
    address: "Kiosk 12, Commercial Market, Ward 2",
    ward: "Ward 2 (Commercial Urban)",
    revenueHead: "2002 - Trade Licences & Market Tolls",
    amount: 7500,
    status: "Approved",
    paymentStatus: "paid",
    invoiceNumber: "DEMO/INV/2026/000105",
    receiptNumber: "DEMO/RCP/2026/000105",
    paidAt: "2026-08-07T08:00:00Z",
    paymentMethod: "pos",
    certificateNumber: "DEMO/TRD/2026/000005",
    issuedAt: "2026-08-07T12:00:00Z",
    issuedBy: `${LGA_CONFIG.leadership.chairman.name} (${LGA_CONFIG.leadership.chairman.title})`,
    qrToken: "QR-DEMO-TRD-000005",
    verificationCode: "VER-TRD-005",
    createdAt: "2026-08-06T10:00:00Z",
    updatedAt: "2026-08-07T12:00:00Z",
    details: {
      businessName: "Alhaji Musa Agro Stores",
      businessType: "Agro-allied Commodities & Grain Retail",
      location: "Commercial Ward 2",
      kioskNumber: "Kiosk 12",
    },
    documents: [
      { name: "Trade Permit Form", url: "/documents/permit.pdf", status: "verified" },
    ],
    timeline: [
      { id: "t1", stage: "Submitted", title: "Permit Requested", description: "Micro-trade kiosk permit requested", actor: "Alhaji Musa", actorRole: "business_owner", timestamp: "2026-08-06 10:00", status: "completed" },
      { id: "t2", stage: "Payment Confirmed", title: "Payment Collected via POS", description: "₦7,500 collected by Revenue Officer Kemi Officer", actor: "Kemi Officer", actorRole: "field_officer", timestamp: "2026-08-07 08:00", status: "completed" },
      { id: "t3", stage: "Approved", title: "Permit Issued", description: "Commercial trade permit active with verifiable QR sticker.", actor: "Council Admin Officer", actorRole: "lga_admin", timestamp: "2026-08-07 12:00", status: "completed" },
    ],
  },
  {
    id: "ODE-2026-006",
    applicationNo: "ODE/CLU/2026/0006",
    serviceId: "club_registration",
    serviceName: "Certificate of Club Registration",
    category: "Certificates",
    applicant: "Itesi Youth Development Club",
    phone: "08022223333",
    email: "itesiyouths@gmail.com",
    address: "Community Centre, Camp Road, Ward 7",
    ward: "Ward 7 (Itesi / Camp)",
    revenueHead: "1002 - Organization Fees",
    amount: 15000,
    status: "Returned For Correction",
    paymentStatus: "unpaid",
    qrToken: "QR-ODE-CLU-000006",
    verificationCode: "VER-CLU-006",
    createdAt: "2026-08-03T11:00:00Z",
    updatedAt: "2026-08-05T16:00:00Z",
    correctionNotes: "Please attach the signed minutes of the inaugural meeting and updated executive list with NINs.",
    details: {
      clubName: "Itesi Youth Development Club",
      presidentName: "Oluwaseun Popoola",
      secretaryName: "Funmi Adeniyi",
      purpose: "Youth Empowerment & Social Welfare",
    },
    documents: [
      { name: "Draft Constitution", url: "/documents/constitution.pdf", status: "uploaded" },
    ],
    timeline: [
      { id: "t1", stage: "Submitted", title: "Submitted", description: "Club registration submitted", actor: "Oluwaseun Popoola", actorRole: "citizen", timestamp: "2026-08-03 11:00", status: "completed" },
      { id: "t2", stage: "Returned For Correction", title: "Returned for Correction", description: "Returned by LGA Admin: Attached minutes missing required executive signatures.", actor: "LGA Admin", actorRole: "lga_admin", timestamp: "2026-08-05 16:00", status: "current" },
    ],
  },
  {
    id: "ODE-2026-007",
    applicationNo: "ODE/KIO/2026/0007",
    serviceId: "kiosk_licence",
    serviceName: "Kiosk Licence",
    category: "Licences & Permits",
    applicant: "Sunlight Refreshment Kiosk",
    phone: "08099990000",
    address: "Osiele Market Bus Stop",
    ward: "Ward 2 (Osiele Market)",
    revenueHead: "3002 - Micro Trade Permits",
    amount: 8000,
    status: "Draft",
    paymentStatus: "unpaid",
    qrToken: "QR-ODE-KIO-000007",
    verificationCode: "VER-KIO-007",
    createdAt: "2026-08-06T09:00:00Z",
    updatedAt: "2026-08-06T09:00:00Z",
    details: {
      kioskName: "Sunlight Refreshment Kiosk",
      operatorName: "Mercy Johnson",
      itemSold: "Soft Drinks & Provisions",
    },
    documents: [],
    timeline: [
      { id: "t1", stage: "Draft", title: "Draft Saved", description: "Application saved as draft", actor: "Mercy Johnson", actorRole: "citizen", timestamp: "2026-08-06 09:00", status: "current" },
    ],
  },
  {
    id: "ODE-2026-008",
    applicationNo: "ODE/CDA/2026/0008",
    serviceId: "cda_registration",
    serviceName: "Certificate of CDA Registration",
    category: "Community & Agriculture",
    applicant: "Osiele Central CDA",
    phone: "08066667777",
    address: "Community Hall, Osiele",
    ward: "Ward 2 (Osiele Market)",
    revenueHead: "1003 - Community Dev Head",
    amount: 10000,
    status: "Rejected",
    paymentStatus: "unpaid",
    qrToken: "QR-ODE-CDA-000008",
    verificationCode: "VER-CDA-008",
    createdAt: "2026-07-28T10:00:00Z",
    updatedAt: "2026-07-30T14:00:00Z",
    rejectionReason: "Boundary dispute resolution required with neighbouring Ward 3 CDA before formal LGA registration.",
    details: {
      cdaName: "Osiele Central CDA",
      chairmanName: "High Chief Aremu",
      boundaryDescription: "Osiele Market North to Railway Track",
    },
    documents: [],
    timeline: [
      { id: "t1", stage: "Submitted", title: "Submitted", description: "CDA registration submitted", actor: "High Chief Aremu", actorRole: "citizen", timestamp: "2026-07-28 10:00", status: "completed" },
      { id: "t2", stage: "Rejected", title: "Application Rejected", description: "Rejected: Boundary dispute resolution required before registration.", actor: "LGA Admin", actorRole: "lga_admin", timestamp: "2026-07-30 14:00", status: "completed" },
    ],
  },
];

export function getLgaApplications(): LgaApplication[] {
  if (typeof window === "undefined") return INITIAL_SEED_APPLICATIONS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY) || window.localStorage.getItem(LEGACY_APPLICATIONS_STORAGE_KEY);
    if (!raw) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SEED_APPLICATIONS));
      return INITIAL_SEED_APPLICATIONS;
    }
    const apps = JSON.parse(raw);
    return Array.isArray(apps) && apps.length > 0 ? apps : INITIAL_SEED_APPLICATIONS;
  } catch {
    return INITIAL_SEED_APPLICATIONS;
  }
}

export function saveLgaApplications(apps: LgaApplication[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(apps));
    window.dispatchEvent(new CustomEvent(EVT_KEY));
    window.dispatchEvent(new CustomEvent(LEGACY_APPLICATIONS_EVENT_KEY));
  } catch (err) {
    console.error("Failed to save applications", err);
  }
}

export function getLgaApplicationById(id: string): LgaApplication | undefined {
  const apps = getLgaApplications();
  return apps.find((a) => a.id === id || a.applicationNo === id);
}

export function createLgaApplication(data: {
  serviceId: string;
  serviceName: string;
  category: string;
  applicant: string;
  phone: string;
  email?: string;
  address: string;
  ward: string;
  nin?: string;
  cacNumber?: string;
  revenueHead: string;
  amount: number;
  details: Record<string, any>;
  documents?: { name: string; url: string; status: "uploaded" | "verified" }[];
  isDraft?: boolean;
}): LgaApplication {
  const apps = getLgaApplications();
  const count = apps.length + 101;
  const id = `ODE-2026-${String(count).padStart(3, "0")}`;
  const serviceCode = data.serviceId.substring(0, 3).toUpperCase();
  const appNo = `ODE/${serviceCode}/2026/${String(count).padStart(4, "0")}`;
  const now = new Date().toISOString();
  const dateStr = now.replace("T", " ").substring(0, 16);

  const initialStatus: ApplicationStatus = data.isDraft ? "Draft" : "Submitted";

  const newApp: LgaApplication = {
    id,
    applicationNo: appNo,
    serviceId: data.serviceId,
    serviceName: data.serviceName,
    category: data.category,
    applicant: data.applicant,
    phone: data.phone,
    email: data.email,
    address: data.address,
    ward: data.ward || "the LGA",
    nin: data.nin,
    cacNumber: data.cacNumber,
    revenueHead: data.revenueHead,
    amount: data.amount,
    status: initialStatus,
    paymentStatus: "unpaid",
    qrToken: genQRToken(),
    verificationCode: genVerificationCode(),
    createdAt: now,
    updatedAt: now,
    details: data.details,
    documents: data.documents || [],
    timeline: [
      {
        id: `t-${Date.now()}-1`,
        stage: initialStatus,
        title: data.isDraft ? "Draft Saved" : "Application Submitted",
        description: data.isDraft
          ? "Application saved to draft"
          : `Application for ${data.serviceName} submitted successfully.`,
        actor: data.applicant,
        actorRole: "citizen",
        timestamp: dateStr,
        status: "current",
      },
    ],
  };

  const updated = [newApp, ...apps];
  saveLgaApplications(updated);

  addNotification({
    title: data.isDraft ? "Draft Saved" : "Application Submitted",
    body: `${newApp.applicationNo} • ${data.serviceName} • Status: ${initialStatus}`,
    type: "info",
  });

  addAudit({
    actor: data.applicant,
    actorRole: "citizen",
    action: data.isDraft ? "APPLICATION_DRAFTED" : "APPLICATION_SUBMITTED",
    target: newApp.applicationNo,
    meta: { service: data.serviceName, amount: data.amount },
  });

  return newApp;
}

export function updateApplicationStatus(
  id: string,
  newStatus: ApplicationStatus,
  actorInfo: { name: string; role: string },
  updates: Partial<LgaApplication> = {}
): LgaApplication | null {
  const apps = getLgaApplications();
  const index = apps.findIndex((a) => a.id === id || a.applicationNo === id);
  if (index === -1) return null;

  const current = apps[index];
  const now = new Date().toISOString();
  const dateStr = now.replace("T", " ").substring(0, 16);

  // Mark all previous timeline events as completed
  const updatedTimeline = (current.timeline || []).map((t) => ({ ...t, status: "completed" as const }));

  // Add new stage event
  updatedTimeline.push({
    id: `t-${Date.now()}`,
    stage: newStatus,
    title: `Status: ${newStatus}`,
    description: updates.correctionNotes || updates.rejectionReason || updates.councillorNotes || `Application status transitioned to ${newStatus}`,
    actor: actorInfo.name,
    actorRole: actorInfo.role,
    timestamp: dateStr,
    status: "current",
  });

  const updatedApp: LgaApplication = {
    ...current,
    ...updates,
    status: newStatus,
    updatedAt: now,
    timeline: updatedTimeline,
  };

  apps[index] = updatedApp;
  saveLgaApplications(apps);

  addNotification({
    title: `Application ${newStatus}`,
    body: `${updatedApp.applicationNo} updated to ${newStatus} by ${actorInfo.name}`,
    type: newStatus === "Approved" || newStatus === "Completed" ? "success" : newStatus === "Rejected" ? "error" : "info",
  });

  addAudit({
    actor: actorInfo.name,
    actorRole: actorInfo.role,
    action: `STATUS_${newStatus.toUpperCase().replace(/\s+/g, "_")}`,
    target: updatedApp.applicationNo,
  });

  return updatedApp;
}

// Workflow action: Citizen or Field Officer simulates payment
export function processApplicationPayment(
  id: string,
  paymentMethod: string = "card",
  actorInfo: { name: string; role: string }
): LgaApplication | null {
  const app = getLgaApplicationById(id);
  if (!app) return null;

  const invRef = app.invoiceNumber || genInvoiceRef();
  const rctRef = genReceiptNumber();
  const now = new Date().toISOString();

  return updateApplicationStatus(id, "Payment Confirmed", actorInfo, {
    paymentStatus: "paid",
    invoiceNumber: invRef,
    receiptNumber: rctRef,
    paidAt: now,
    paymentMethod,
  });
}

// Workflow action: Field Officer conducts inspection
export function recordFieldInspection(
  id: string,
  inspection: {
    findings: string;
    recommendedCategory: string;
    recommendedFee: number;
    photos?: string[];
  },
  officerInfo: { name: string; role: string }
): LgaApplication | null {
  const now = new Date().toISOString();
  return updateApplicationStatus(id, "Inspection Completed", officerInfo, {
    inspectionReport: {
      inspectedAt: now,
      inspectorName: officerInfo.name,
      findings: inspection.findings,
      recommendedCategory: inspection.recommendedCategory,
      recommendedFee: inspection.recommendedFee,
      photos: inspection.photos || [],
      completed: true,
    },
    amount: inspection.recommendedFee,
  });
}

// Workflow action: Treasury assesses fee and issues demand notice / invoice
export function issueTreasuryInvoice(
  id: string,
  assessment: {
    approvedFee: number;
    revenueHead: string;
    treasuryNotes?: string;
  },
  treasurerInfo: { name: string; role: string }
): LgaApplication | null {
  const invNo = genInvoiceRef();
  const now = new Date().toISOString();

  return updateApplicationStatus(id, "Invoice Generated", treasurerInfo, {
    amount: assessment.approvedFee,
    revenueHead: assessment.revenueHead,
    invoiceNumber: invNo,
    paymentStatus: "unpaid",
    treasuryAssessment: {
      assessedAt: now,
      assessedBy: treasurerInfo.name,
      approvedFee: assessment.approvedFee,
      revenueHead: assessment.revenueHead,
      treasuryNotes: assessment.treasuryNotes,
      status: "approved",
    },
  });
}

// Workflow action: LGA Admin Approves Application & Generates Certificate/Licence
export function approveAndGenerateCertificate(
  id: string,
  adminInfo: { name: string; role: string }
): LgaApplication | null {
  const app = getLgaApplicationById(id);
  if (!app) return null;

  const now = new Date().toISOString();
  const certNo = `ODE/${app.serviceId.substring(0, 3).toUpperCase()}/2026/${Math.floor(100000 + Math.random() * 899999)}`;
  const expiry = new Date();
  expiry.setFullYear(expiry.getFullYear() + 1);

  return updateApplicationStatus(id, "Certificate Generated", adminInfo, {
    certificateNumber: certNo,
    licenceNumber: certNo,
    issuedAt: now,
    issuedBy: adminInfo.name,
    expiryDate: expiry.toISOString(),
    status: "Completed",
  });
}

// Workflow action: Citizen Reapplies from a Rejected Application
export function reapplyFromRejected(
  id: string,
  citizenName: string
): LgaApplication | null {
  const app = getLgaApplicationById(id);
  if (!app) return null;

  return createLgaApplication({
    serviceId: app.serviceId,
    serviceName: app.serviceName,
    category: app.category,
    applicant: citizenName || app.applicant,
    phone: app.phone,
    email: app.email,
    address: app.address,
    ward: app.ward,
    nin: app.nin,
    cacNumber: app.cacNumber,
    revenueHead: app.revenueHead,
    amount: app.amount,
    details: { ...app.details, reappliedFrom: app.applicationNo },
    documents: app.documents,
    isDraft: false,
  });
}

// Aliases for unified mock store access
export const getApplications = getLgaApplications;
export const getApplicationById = getLgaApplicationById;
export function addApplication(app: LgaApplication): LgaApplication {
  const apps = getLgaApplications();
  const updated = [app, ...apps.filter((existing) => existing.id !== app.id && existing.applicationNo !== app.applicationNo)];
  saveLgaApplications(updated);
  return app;
}

// This module now exports neutral LGA function names directly.

