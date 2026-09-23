/* eslint-disable @typescript-eslint/no-explicit-any */
import { LGA_CONFIG } from "@/config/lga.config";
import { DEFAULT_SERVICES, getServiceById } from "@/config/services.config";
import {
  getStore,
  setStore,
  createInvoice,
  markInvoicePaid,
  findInvoiceByRef,
  findByQrOrCode,
  addAudit,
  addNotification,
  type Invoice,
  type Receipt,
} from "./store";
import {
  getLgaApplications,
  getLgaApplicationById,
  createLgaApplication,
  updateApplicationStatus,
  linkApplicationInvoice,
  type LgaApplication,
} from "./applicationsStore";
import { transformApplicationToPublicCertificate } from "@/services/apiPublicCertificate";

// ==========================================
// TREASURY FEE CONFIGURATION (demo single source of truth)
// Merges the ServiceFeeConfigurationTab upserts, the Certificate/Levy schedule
// tabs, and the service defaults so treasurer changes affect new invoices.
// ==========================================
const TREASURER_FEES_STORAGE_KEY = "logmas.treasurer.fees";

export interface DemoServiceFeeOverride {
  amount: number;
  status: "ACTIVE" | "INACTIVE";
  updatedAt: string;
}

function getTreasurerFeeOverrides(): Record<string, DemoServiceFeeOverride> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(TREASURER_FEES_STORAGE_KEY);
    if (!raw || raw.startsWith("<") || raw === "undefined" || raw === "null") return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function saveTreasurerFeeOverride(serviceId: string, amount: number, status: "ACTIVE" | "INACTIVE") {
  if (typeof window === "undefined") return;
  try {
    const overrides = getTreasurerFeeOverrides();
    overrides[serviceId] = { amount, status, updatedAt: new Date().toISOString() };
    window.localStorage.setItem(TREASURER_FEES_STORAGE_KEY, JSON.stringify(overrides));
  } catch {}
}

// Surface fees edited inside the CertificateFeeTab / LevyPermitFeeTab (they persist
// to their own schedule keys) so those edits also drive invoice generation.
function readTabScheduleFee(serviceId: string): number | null {
  if (typeof window === "undefined") return null;
  try {
    const keys = [
      `${LGA_CONFIG.identity.id}_certificate_fees`,
      `${LGA_CONFIG.identity.id}_levy_permit_fees`,
    ];
    for (const key of keys) {
      const raw = window.localStorage.getItem(key);
      if (!raw || raw.startsWith("<") || raw === "undefined" || raw === "null") continue;
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) continue;
      const row = parsed.find(
        (r: any) =>
          r.serviceId === serviceId ||
          r.service === serviceId ||
          r.id === `SCH-CERT-${serviceId}` ||
          r.id === `SCH-LEVY-${serviceId}`
      );
      if (row) {
        const fee = Number(row.baseFee ?? row.fee ?? row.amount);
        if (fee && fee > 0) return fee;
      }
    }
  } catch {}
  return null;
}

export function getEffectiveServiceFee(serviceId: string): DemoServiceFeeOverride {
  const srv = getServiceById(serviceId) || DEFAULT_SERVICES.find((s) => s.id === serviceId) || DEFAULT_SERVICES[0];
  const defaultAmount = Number(srv?.defaultFee ?? (srv as any)?.fee ?? 3500);
  const override = getTreasurerFeeOverrides()[serviceId];
  if (override) return { amount: override.amount, status: override.status, updatedAt: override.updatedAt };
  const tabFee = readTabScheduleFee(serviceId);
  if (tabFee && tabFee > 0) return { amount: tabFee, status: "ACTIVE", updatedAt: srv?.updatedAt || new Date().toISOString() };
  return { amount: defaultAmount, status: "ACTIVE", updatedAt: srv?.updatedAt || new Date().toISOString() };
}

function serviceWithEffectiveFee(service: any) {
  const fee = getEffectiveServiceFee(service.id);
  return {
    ...service,
    feeConfig: {
      id: `fee-${service.id}`,
      serviceId: service.id,
      amount: fee.amount,
      status: fee.status,
      updatedAt: fee.updatedAt,
    },
    defaultFee: fee.amount,
    fee: fee.amount,
  };
}

// ==========================================
// PRESET DEMO USERS
// ==========================================
export const DEMO_PRESET_USERS = {
  citizen: {
    id: "usr_citizen_001",
    email: "citizen@logmas.gov.ng",
    firstName: "Dr. Babatunde",
    lastName: "Adeleke",
    role: "citizen" as const,
    phone: "+234 803 123 4567",
    address: "14 Adeleke Crescent, Demo City",
    town: "Demo City",
    nin: "98765432101",
    isActive: true,
    onboardingCompleted: true,
  },
  admin: {
    id: "usr_admin_001",
    email: "admin@logmas.gov.ng",
    firstName: "Olumide",
    lastName: "Council Admin",
    role: "lga_admin" as const,
    phone: "+234 800 000 3366",
    address: "Demo LGA Secretariat",
    town: "Demo City",
    isActive: true,
    onboardingCompleted: true,
  },
  treasurer: {
    id: "usr_treasurer_001",
    email: "treasurer@logmas.gov.ng",
    firstName: "Mrs. M. O.",
    lastName: "Danjuma, FCA",
    role: "treasurer" as const,
    phone: "+234 800 000 3367",
    address: "Treasury Directorate, Demo LGA Secretariat",
    town: "Demo City",
    isActive: true,
    onboardingCompleted: true,
  },
  chairman: {
    id: "usr_chairman_001",
    email: "chairman@logmas.gov.ng",
    firstName: "Hon. (Dr.) Adebayo",
    lastName: "Adeleke",
    role: "chairman" as const,
    phone: "+234 800 000 3368",
    address: "Executive Office of the Chairman, Demo LGA",
    town: "Demo City",
    isActive: true,
    onboardingCompleted: true,
  },
  super_admin: {
    id: "usr_super_001",
    email: "super@logmas.gov.ng",
    firstName: "Adewale",
    lastName: "Super Admin",
    role: "super_admin" as const,
    phone: "+234 800 000 3369",
    address: "LOGMAS Operations",
    town: "Demo City",
    isActive: true,
    onboardingCompleted: true,
  },
  auditor: {
    id: "usr_auditor_001",
    email: "auditor@logmas.gov.ng",
    firstName: "Folake",
    lastName: "Auditor",
    role: "auditor" as const,
    phone: "+234 800 000 3370",
    address: "Auditor General Chambers",
    town: "Demo City",
    isActive: true,
    onboardingCompleted: true,
  },
  ward_councillor: {
    id: "usr_councillor_001",
    email: "councillor@logmas.gov.ng",
    firstName: "Hon. Bisi",
    lastName: "Adeleke",
    role: "ward_councillor" as const,
    phone: "+234 800 000 3371",
    address: "Legislative Arm, Demo LGA",
    town: "Demo City",
    isActive: true,
    onboardingCompleted: true,
  },
  field_officer: {
    id: "usr_field_001",
    email: "field@logmas.gov.ng",
    firstName: "Tunji",
    lastName: "Field Revenue",
    role: "field_officer" as const,
    phone: "+234 800 000 3372",
    address: "Revenue Taskforce Base",
    town: "Demo City",
    isActive: true,
    onboardingCompleted: true,
  },
  contractor: {
    id: "usr_contractor_001",
    email: "agent@logmas.gov.ng",
    firstName: "Femi",
    lastName: "Consultant Agent",
    role: "contractor" as const,
    phone: "+234 800 000 3373",
    address: "Agent Secretariat",
    town: "Demo City",
    isActive: true,
    onboardingCompleted: true,
  },
  business_owner: {
    id: "usr_biz_001",
    email: "business@logmas.gov.ng",
    firstName: "Bola",
    lastName: "Commercial Ventures",
    role: "business_owner" as const,
    phone: "+234 800 000 3374",
    address: "42 Commercial Avenue, Ward 2, Demo City",
    town: "Demo City",
    businessName: "Bola Multi-Services Ltd",
    businessType: "Retail & Distribution",
    isActive: true,
    onboardingCompleted: true,
  },
};

function getDemoUsersList() {
  if (typeof window === "undefined") return Object.values(DEMO_PRESET_USERS);
  try {
    const raw = window.localStorage.getItem("logmas.demo.users");
    if (!raw || raw.startsWith("<") || raw === "undefined" || raw === "null") {
      return Object.values(DEMO_PRESET_USERS);
    }
    const custom = JSON.parse(raw);
    return [...Object.values(DEMO_PRESET_USERS), ...(Array.isArray(custom) ? custom : [])];
  } catch {
    return Object.values(DEMO_PRESET_USERS);
  }
}

function saveRegisteredDemoUser(user: any) {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem("logmas.demo.users");
    let list: any[] = [];
    if (raw && !raw.startsWith("<") && raw !== "undefined" && raw !== "null") {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) list = parsed;
      } catch {}
    }
    list.unshift(user);
    window.localStorage.setItem("logmas.demo.users", JSON.stringify(list));
  } catch {
    // Ignore storage issues
  }
}

function triggerSync() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("logmas:store-change"));
    window.dispatchEvent(new Event("storage"));
  }
}

// ==========================================
// CENTRAL CLIENT-SIDE MOCK REQUEST HANDLER
// ==========================================

// ==========================================
// DEMO ACCOUNT MANAGEMENT STATE (LGA Admin -> Accounts page)
// Persisted overrides layered on the preset/registered demo users so suspend,
// activate, password-reset and verification actions survive page refreshes.
// ==========================================
const ACCOUNT_STATE_KEY = "logmas.demo.accountState";

interface DemoAccountStateOverride {
  isActive?: boolean;
  isReset?: boolean;
  emailVerified?: boolean;
  suspendedAt?: string | null;
  suspensionReason?: string | null;
}

function getAccountOverrides(): Record<string, DemoAccountStateOverride> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(ACCOUNT_STATE_KEY);
    if (!raw || raw.startsWith("<") || raw === "undefined" || raw === "null") return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function saveAccountOverride(id: string, patch: DemoAccountStateOverride) {
  if (typeof window === "undefined") return;
  try {
    const all = getAccountOverrides();
    all[id] = { ...(all[id] || {}), ...patch };
    window.localStorage.setItem(ACCOUNT_STATE_KEY, JSON.stringify(all));
    triggerSync();
  } catch {}
}

function findDemoAccountById(id: string) {
  return getDemoUsersList().find(
    (u: any) =>
      u.id === id || u.email?.toLowerCase() === String(id).toLowerCase()
  );
}

function toDemoAccount(u: any) {
  const ov = getAccountOverrides()[u.id] || {};
  const isActive = ov.isActive ?? u.isActive !== false;
  const name =
    `${u.firstName || ""} ${u.lastName || ""}`.trim() || u.name || "Demo User";
  return {
    id: u.id,
    name,
    email: u.email,
    phone: u.phone || "",
    role: u.role,
    ward: null as string | null,
    status: (isActive ? "active" : "suspended") as "active" | "suspended",
    isReset: !!ov.isReset,
    lastLogin: u.lastLogin || null,
    avatarUrl: null as string | null,
    emailVerified:
      ov.emailVerified ?? (u.onboardingCompleted ? true : !!u.emailVerified),
    createdAt: u.createdAt || new Date().toISOString(),
    suspendedAt: ov.suspendedAt || null,
    suspensionReason: ov.suspensionReason || null,
    contractor: null as any,
  };
}


export async function handleMockApiRequest(config: any): Promise<any> {
  const url = (config.url || "").replace(/^https?:\/\/[^/]+/, "").replace(/^\/api\/v1/, "").replace(/^\/api\/demo/, "");
  const method = (config.method || "GET").toUpperCase();
  let data: any = {};
  // FormData bodies (api.upload) must be flattened to a plain object —
  // property access on FormData returns undefined and silently broke POST /applications.
  if (typeof FormData !== "undefined" && config.data instanceof FormData) {
    const JSON_KEYS = new Set(["formData", "files", "details", "documents", "applicant", "metadata"]);
    config.data.forEach((value: any, key: string) => {
      if (value instanceof File) {
        data[key] = { name: value.name, size: value.size, type: value.type };
      } else if (JSON_KEYS.has(key) && typeof value === "string") {
        try {
          data[key] = JSON.parse(value);
        } catch {
          data[key] = value;
        }
      } else if (key.includes("[")) {
        // e.g. files[passport_photo] → nest under "files"
        const match = key.match(/^(\w+)\[(\w+)\]$/);
        if (match) {
          data[match[1]] = data[match[1]] || {};
          data[match[1]][match[2]] =
            value instanceof File
              ? { name: value.name, size: value.size, type: value.type }
              : value;
        }
      } else {
        data[key] = value;
      }
    });
  } else if (typeof config.data === "string") {
    try {
      if (config.data && !config.data.startsWith("<") && config.data !== "undefined") {
        data = JSON.parse(config.data);
      } else {
        data = {};
      }
    } catch {
      data = {};
    }
  } else if (config.data && typeof config.data === "object") {
    data = config.data;
  }
  const params = config.params || {};

  // Artificial ultra-low latency for authentic responsiveness
  await new Promise((res) => setTimeout(res, 30));

  const respond = (data: any, status = 200) => ({
    status,
    statusText: "OK",
    headers: {},
    config,
    data: {
      status: "success",
      data,
      error: null,
      meta: { timestamp: new Date().toISOString(), demo: true },
    },
  });

  // Error envelope so the api client's `unwrap` throws a surfaced ApiError (toast).
  const respondError = (message: string, code = "REQUEST_FAILED", status = 400) => ({
    status,
    statusText: "Bad Request",
    headers: {},
    config,
    data: {
      status: "error",
      data: null,
      error: message,
      code,
      meta: { timestamp: new Date().toISOString(), demo: true },
    },
  });

  // ==========================================
  // AUTH ROUTING
  // ==========================================
  if (url.startsWith("/auth/login")) {
    const email = (data.email || "").trim().toLowerCase();
    const allUsers = getDemoUsersList();
    let found = allUsers.find((u: any) => u.email?.toLowerCase() === email);

    if (!found) {
      // Auto-provision demo citizen if unknown email is entered
      const nameParts = (data.email || "demo.user").split("@")[0].split(/[._-]/);
      found = {
        id: `usr_demo_${Date.now()}`,
        email: data.email,
        firstName: nameParts[0]?.charAt(0).toUpperCase() + nameParts[0]?.slice(1) || "Demo",
        lastName: nameParts[1]?.charAt(0).toUpperCase() + nameParts[1]?.slice(1) || "User",
        role: "citizen",
        phone: "+234 800 111 2233",
        address: "Demo Residency, Ward 1",
        town: "Demo City",
        isActive: true,
        onboardingCompleted: true,
        createdAt: new Date().toISOString(),
      };
      saveRegisteredDemoUser(found);
    }

    // Demo account suspension check (LGA Admin -> Accounts). A 403 + SUSPENDED
    // code triggers the global api.ts handler: toast + redirect to /login?reason=suspended.
    const acctOv = getAccountOverrides()[found.id];
    if (acctOv?.isActive === false) {
      return respondError(
        "Your account has been suspended. Please contact the LGA Secretariat.",
        "SUSPENDED",
        403
      );
    }

    const token = `demo-token-${found.role}-${found.id}`;
    return respond({
      accessToken: token,
      refreshToken: `demo-refresh-${found.id}`,
      user: found,
    });
  }

  if (url.startsWith("/auth/register")) {
    const newUser = {
      id: `usr_${Date.now()}`,
      email: data.email,
      firstName: data.firstName || data.name || "Demo",
      lastName: data.lastName || "Applicant",
      role: data.role || "citizen",
      phone: data.phone || "+234 800 000 1122",
      address: data.address || "Demo City",
      town: "Demo City",
      isActive: true,
      onboardingCompleted: true,
      createdAt: new Date().toISOString(),
    };
    saveRegisteredDemoUser(newUser);

    const token = `demo-token-${newUser.role}-${newUser.id}`;
    return respond({
      accessToken: token,
      refreshToken: `demo-refresh-${newUser.id}`,
      user: newUser,
    });
  }

  if (url.startsWith("/auth/me")) {
    let user: any = null;
    if (typeof window !== "undefined") {
      try {
        const raw = window.localStorage.getItem("logmas.auth.user");
        if (raw && !raw.startsWith("<") && raw !== "undefined" && raw !== "null") {
          user = JSON.parse(raw);
        }
      } catch {}
    }
    if (!user) {
      user = DEMO_PRESET_USERS.citizen;
    }
    return respond(user);
  }

  if (url.startsWith("/auth/update/profile")) {
    return respond({ ...data, updatedAt: new Date().toISOString() });
  }

  if (url.startsWith("/auth/refresh")) {
    return respond({ accessToken: "demo-refreshed-jwt-token" });
  }

  if (url.startsWith("/auth/google")) {
    const user = DEMO_PRESET_USERS.citizen;
    return respond({
      accessToken: `demo-google-token-${user.id}`,
      refreshToken: `demo-google-refresh-${user.id}`,
      user,
    });
  }

  if (url.startsWith("/auth/logout")) {
    return respond({ message: "Successfully logged out" });
  }

  if (url.startsWith("/auth/resend-verification")) {
    const email = String((data && data.email) || "").trim().toLowerCase();
    const account = getDemoUsersList().find(
      (u: any) => u.email?.toLowerCase() === email
    );
    if (account) saveAccountOverride(account.id, { emailVerified: true });
    return respond({ message: "Verification email sent." });
  }


  if (
    url.startsWith("/auth/forgot-password") ||
    url.startsWith("/auth/reset-password") ||
    url.startsWith("/auth/change-password") ||
    url.startsWith("/auth/verify-email") ||
    url.startsWith("/auth/resend-verification")
  ) {
    return respond({ message: "Operation completed successfully." });
  }

  // ==========================================
  // APPLICATIONS ROUTING
  // ==========================================
  if (url === "/applications" || url.startsWith("/applications?")) {
    if (method === "GET") {
      let all = getLgaApplications() as any[];

      // Light client-side filtering so dashboard filters stay functional.
      const q = (params.search || "").toString().toLowerCase();
      if (q) {
        all = all.filter((a) =>
          (a.applicant && a.applicant.toLowerCase().includes(q)) ||
          (a.serviceName && a.serviceName.toLowerCase().includes(q)) ||
          (a.applicationNo && a.applicationNo.toLowerCase().includes(q)) ||
          (a.details && JSON.stringify(a.details).toLowerCase().includes(q))
        );
      }
      if (params.status) {
        const st = String(params.status).toLowerCase();
        all = all.filter((a) => String(a.status || "").toLowerCase().includes(st) || String(a.paymentStatus || "").toLowerCase() === st);
      }
      if (params.serviceId) {
        all = all.filter((a) => a.serviceId === params.serviceId);
      }
      if (params.wardId) {
        all = all.filter((a) => String(a.ward || "").toLowerCase().includes(String(params.wardId).toLowerCase()));
      }

      return respond(all);
    }

    if (method === "POST") {
      // Fields may arrive top-level or nested inside the JSON "formData" blob.
      const form =
        data.formData && typeof data.formData === "object" ? data.formData : {};
      const serviceId = data.serviceId || "certificate_of_origin";
      const srv = getServiceById(serviceId) || DEFAULT_SERVICES[0];
      const fee = getEffectiveServiceFee(serviceId);
      const fullName =
        form.fullName || data.fullName || (typeof data.applicant === "string" ? data.applicant : "") || "";

      const createdApp = createLgaApplication({
        serviceId,
        serviceName: data.serviceName || srv.name,
        category: data.category || srv.category || "Statutory Services",
        applicant: fullName || "Demo Applicant",
        phone: form.phone || data.phone || "+234 800 000 1122",
        email: form.email || data.email || "applicant@demo.gov.ng",
        address: form.address || data.address || "Demo Secretariat Road, Demo City",
        ward: form.ward || data.ward || "Ward 1 - Central Urban",
        nin: form.nin || data.nin,
        cacNumber: form.cacNumber || data.cacNumber,
        applicantId: data.applicantId || data.applicant?.applicantId || undefined,
        createdById: data.createdById || data.applicantId || undefined,
        revenueHead: data.revenueHead || srv.revenueHead || "1001 - Statutory LGA Fees",
        amount: Number(data.amount) || fee.amount,
        details: form && Object.keys(form).length ? form : data.details || {},
        documents: data.documents || [],
        isDraft: data.isDraft ?? false,
      });

      // Auto-create a linked invoice with the treasurer-configured fee.
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 14);
      const inv = createInvoice({
        customerName: createdApp.applicant,
        phone: createdApp.phone,
        email: createdApp.email,
        address: createdApp.address,
        levyType: "Other",
        purpose: srv.name,
        description: `Statutory ${srv.name} fee for ${createdApp.applicant}`,
        quantity: 1,
        unitPrice: fee.amount,
        amount: fee.amount,
        frequency: "one-off",
        dueDate: dueDate.toISOString().slice(0, 10),
        actor: "System",
        actorRole: "system",
      });
      linkApplicationInvoice(createdApp.id, inv.id, inv.reference);
      createdApp.invoiceId = inv.id;
      createdApp.invoiceNumber = inv.reference;
      (inv as any).applicationId = createdApp.id;
      (createdApp as any).applicationNumber =
        (createdApp as any).applicationNumber || createdApp.applicationNo;

      // Return the shape the submit handler expects: { application, invoice }
      // so res.application.applicationNumber and res.invoice.invoiceNumber both exist.
      triggerSync();
      return respond({
        application: createdApp,
        invoice: {
          id: inv.id,
          invoiceNumber: inv.reference,
          status: inv.status,
          amount: inv.amount,
          customerName: inv.customerName,
          paymentStatus: inv.status === "paid" ? "paid" : "pending",
          issuedAt: inv.createdAt,
          dueDate: inv.dueDate,
          levyType: inv.levyType,
          description: inv.description,
          totalAmount: inv.amount,
          amountPaid: inv.status === "paid" ? inv.amount : 0,
          balanceDue: inv.status === "paid" ? 0 : inv.amount,
          subtotal: inv.amount,
          penaltyAmount: 0,
          frequency: inv.frequency,
          unitPrice: inv.unitPrice,
          quantity: inv.quantity,
          fieldOfficer: null,
          qrData: "",
          receipt: inv.status === "paid" ? { id: (inv as any).receiptId, receiptNumber: (inv as any).receiptNumber, verificationCode: (inv as any).verificationCode, qrToken: (inv as any).qrToken, issuedAt: inv.paidAt } : null,
          permit: null,
          virtualAccount: null,
          payments: inv.status === "paid" ? [{ id: (inv as any).paymentId || inv.id, amount: inv.amount, method: "online", status: "success", reference: inv.reference, confirmedAt: inv.paidAt, createdAt: inv.paidAt }] : [],
          paymentOptions: ["online", "card", "bank_transfer"],
        },
      });
    }
  }

  // Admin + Council work-flow actions: /applications/admin/:id/(under-review|approve|decline)
  const adminAppAction = url.match(/^\/applications\/admin\/([^/?]+)\/(under-review|approve|decline|reject)$/);
  if (adminAppAction) {
    const appId = adminAppAction[1];
    const action = adminAppAction[2];
    const app = getLgaApplicationById(appId);
    if (!app) return respond(null, 404);

    if (action === "under-review") {
      const updated = updateApplicationStatus(appId, "Under Review", { name: "Council Admin", role: "lga_admin" }, { reviewNotes: data.notes || undefined } as any);
      triggerSync();
      return respond(updated);
    }

    if (action === "approve") {
      if (app.paymentStatus !== "paid") {
        return respondError(
          "This application has not been paid yet. Payment confirmation is required before the LGA can approve and issue the certificate.",
          "PAYMENT_REQUIRED"
        );
      }
      const chairmanName = LGA_CONFIG.leadership.chairman.name;
      const issuedAt = new Date().toISOString();
      const year = new Date().getFullYear();
      const expiry = new Date(Date.now() + 5 * 365 * 86400000).toISOString();
      const certNo = app.certificateNumber || `DEMO/CERT/${year}/${app.id.slice(-6).toUpperCase()}`;
      const updated = updateApplicationStatus(appId, "Approved", { name: "Council Admin", role: "lga_admin" }, {
        paymentStatus: "paid",
        certificateNumber: certNo,
        licenceNumber: app.licenceNumber || certNo,
        issuedAt,
        issuedBy: chairmanName,
        expiryDate: app.expiryDate || expiry,
      });
      triggerSync();
      return respond(updated);
    }

    // decline / reject — reason is mandatory
    const reason = (data.reason || data.declineReason || "").trim();
    if (!reason) {
      return respondError("A specific decline reason is mandatory to reject this application.", "DECLINE_REASON_REQUIRED");
    }
    const updated = updateApplicationStatus(appId, "Rejected", { name: "Council Admin", role: "lga_admin" }, {
      rejectionReason: reason,
      correctionNotes: reason,
    });
    triggerSync();
    return respond(updated);
  }

  // Specific application lookup / legacy status change
    const appMatch = url.match(/^\/applications\/([^/?]+)(.*)/);
  if (appMatch) {
    const appId = appMatch[1];
    const subPath = appMatch[2] || "";

    // PATCH /applications/:id/complete — post-payment form completion (public
    // pay-first flow): merge the submitted statutory form into details, clear
    // the __formIncomplete marker and advance the application to review.
    if (subPath.includes("complete") && method !== "GET") {
      const target = getLgaApplicationById(appId);
      if (!target) return respondError("Application not found", "NOT_FOUND");

      const form: Record<string, any> =
        data && data.formData && typeof data.formData === "object" ? data.formData : {};
      const fileList: any[] = Array.isArray(data?.files)
        ? data.files
        : Array.isArray(data?.documents)
          ? data.documents
          : [];

      const mergedDetails: Record<string, any> = {
        ...(target.details || {}),
        ...form,
      };
      delete mergedDetails.__formIncomplete; // statutory form is now complete

      const docs = fileList.length
        ? fileList.map((f) => ({
            name: typeof f === "string" ? f : String(f?.name || "Document"),
            url: typeof f === "string" ? "#" : String(f?.url || "#"),
            status: "uploaded" as const,
          }))
        : target.documents || [];

      // Payment already happened in this flow — take it straight to review.
      const nextStatus =
        target.paymentStatus === "paid" ? ("Under Review" as const) : target.status;

      const updated = updateApplicationStatus(
        appId,
        nextStatus,
        { name: target.applicant || "Citizen", role: "citizen" },
        {
          details: mergedDetails,
          documents: docs,
          ...(form.ward ? { ward: form.ward } : {}),
          ...(form.nin ? { nin: form.nin } : {}),
          ...(form.cacNumber ? { cacNumber: form.cacNumber } : {}),
        },
      );
      triggerSync();
      if (updated) return respond(updated);
    }

    if (subPath.includes("decline") || subPath.includes("reject")) {
      const reason = (data.reason || data.declineReason || "").trim();
      if (!reason) {
        return respondError("A specific decline reason is mandatory to reject this application.", "DECLINE_REASON_REQUIRED");
      }
      const updated = updateApplicationStatus(appId, "Rejected", { name: "Council Admin", role: "lga_admin" }, {
        rejectionReason: reason,
        correctionNotes: reason,
      });
      triggerSync();
      return respond(updated);
    }

    const app = getLgaApplicationById(appId);
    if (app) return respond(app);
  }

  // ==========================================
  // INVOICES & PAYMENTS ROUTING
  // ==========================================
  if (url.startsWith("/invoices/public/initialize")) {
    const serviceId = data.serviceId || "certificate_of_origin";
    const srv = getServiceById(serviceId) || DEFAULT_SERVICES[0];
    const fee = getEffectiveServiceFee(serviceId);
    const fullName = data.fullName || (data.details && (data.details.fullName || data.details.applicantName)) || "Citizen Applicant";
    const phone = data.phone || (data.details && data.details.phone) || "+2348012345678";
        const email = data.email || (data.details && data.details.email) || "applicant@demo.gov.ng";

    // Attribution: a logged-out citizen can start this flow from the public site.
    // Resolve the owner from the entered email/phone against the demo roster so
    // the application shows up under "My Applications" once that user logs in
    // (falls back to the single demo citizen — one user per role in this demo).
    const owner = getDemoUsersList().find(
      (u: any) =>
        (u.email && u.email.toLowerCase() === String(email).toLowerCase()) ||
        (u.phone && String(u.phone) === String(phone)),
    );
    const ownerUserId = owner?.id || DEMO_PRESET_USERS.citizen.id;

    // Create the underlying statutory application first so it can be tracked.
    const createdApp = createLgaApplication({
      serviceId,
      serviceName: srv.name,
      category: srv.category || "Statutory Services",
            applicant: fullName,
      phone,
      email,
      applicantId: ownerUserId,
      createdById: ownerUserId,
      address: (data.details && (data.details.address || data.details.siteAddress)) || "Demo Secretariat Road, Demo City",
      ward: (data.details && data.details.ward) || "Ward 1 - Central Urban",
      revenueHead: srv.revenueHead || "1001 - Statutory LGA Fees",
      amount: fee.amount,
      // Public (pay-first) flow: only contact details are captured before payment,
      // so the statutory form must still be completed afterwards. Tag the details
      // so /payments/verify can tell this flow apart from the dashboard flow
      // (where the full form was already submitted BEFORE payment).
      details: { ...(data.details || { fullName, phone, email }), __formIncomplete: true },
      documents: [],
    });

    const dueDate = new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10);
    const inv = createInvoice({
      customerName: fullName,
      phone,
      email,
      address: createdApp.address,
      levyType: "Other",
      purpose: srv.name,
      description: `Statutory ${srv.name} fee for ${fullName}`,
      quantity: 1,
      unitPrice: fee.amount,
      amount: fee.amount,
      frequency: "one-off",
      dueDate,
      actor: "System",
      actorRole: "system",
    });
    linkApplicationInvoice(createdApp.id, inv.id, inv.reference);

    triggerSync();
    return respond({
      paymentUrl: `/pay/${inv.id}`,
      reference: inv.reference,
      accessCode: `ACC-${inv.reference}`,
      message: "Invoice generated successfully",
      invoiceId: inv.id,
      applicationId: createdApp.id,
      applicationNumber: createdApp.applicationNo,
      amount: fee.amount,
    });
  }

  if (url.startsWith("/invoices/by-ref/")) {
    const ref = decodeURIComponent(url.replace("/invoices/by-ref/", "").split("?")[0]);
    const s = getStore();
    const inv = s.invoices.find((i) => i.reference.toUpperCase() === ref.toUpperCase() || i.id === ref);
    return respond(inv || null);
  }

    if (url === "/invoices/hub" || url.startsWith("/invoices/hub?")) {
    const s = getStore();
    const invoices = s.invoices;
    const paid = invoices.filter((i) => i.status === "paid");
    const unpaid = invoices.filter((i) => i.status !== "paid");
    const totalCollected = paid.reduce((sum, i) => sum + i.amount, 0);
    const totalOutstanding = unpaid.reduce((sum, i) => sum + i.amount, 0);

    // Normalise raw store invoices into the hub/list shape the UI expects.
    // The store Invoice has `purpose`/`status` but NO `service`,
    // `paymentStatus` or `receiptId` — the invoices list page reads all three
    // (invoice.service.name crashed at runtime before this mapping).
    const receiptFor = (inv: (typeof invoices)[number]) =>
      s.receipts.find((r) => r.invoiceId === inv.id || r.invoiceRef === inv.reference);
    const listItems = invoices.map((inv) => {
      const rcp = receiptFor(inv);
      return {
        ...inv,
        invoiceNumber: inv.reference,
        invoiceType: inv.levyType,
        service: { name: inv.purpose || inv.levyType },
                // Page tabs filter on paymentStatus: all | pending | confirmed | ...
        paymentStatus: inv.status === "paid" ? "confirmed" : "pending",
        receiptId: rcp?.id || null,
        receipt: rcp ? { receiptId: rcp.id, receiptNumber: rcp.receiptNumber } : null,
      };
    });

    return respond({
      success: true,
      invoices: listItems,
      stats: {
        totalInvoices: invoices.length,
        totalPaidCount: paid.length,
        totalUnpaidCount: unpaid.length,
        totalCollected,
        totalOutstanding,
        outstanding: totalOutstanding,
        transactions: invoices.length,
        avgPayment: paid.length ? Math.round(totalCollected / paid.length) : 0,
      },
    });
  }

  if (url === "/invoices" || url.startsWith("/invoices?")) {
    const s = getStore();
    return respond(s.invoices);
  }

  // Invoice simulation or payment
  const invActionMatch = url.match(/^\/invoices\/([^/?]+)\/(simulate-payment|settle-payment|pay|pay-online|send-payment-link)/);
  if (invActionMatch) {
    const invId = invActionMatch[1];
    const action = invActionMatch[2];

    if (action === "send-payment-link") {
      return respond({ message: "Payment link sent to taxpayer phone & email." });
    }

    // Payment simulation or execution
    const s = getStore();
    const inv = s.invoices.find((i) => i.id === invId || i.reference.toUpperCase() === invId.toUpperCase()) || findInvoiceByRef(invId);
    if (inv) {
      const payerName = (data && (data.payerName || data.customerName)) || "Demo Taxpayer";
      const method = (data && data.method) || "online";
      const receipt = markInvoicePaid(inv.id, method, payerName, "citizen");

      // Advance the linked statutory application to "Payment Confirmed" (paid).
      // Approval remains with the LGA Admin — payment alone does NOT approve.
      const apps = getLgaApplications();
      const matchedApp = apps.find(
        (a) =>
          (a.invoiceId && a.invoiceId === inv.id) ||
          (a.invoiceNumber && a.invoiceNumber.toUpperCase() === inv.reference.toUpperCase()) ||
          a.applicationNo.toUpperCase() === inv.reference.toUpperCase() ||
          a.id.toUpperCase() === inv.reference.toUpperCase() ||
          (inv as any).applicationId === a.id
      );
      if (matchedApp) {
        updateApplicationStatus(matchedApp.id, "Payment Confirmed", {
          name: payerName,
          role: "citizen",
        }, {
          paymentStatus: "paid",
          invoiceId: inv.id,
          invoiceNumber: inv.reference,
          receiptNumber: receipt?.receiptNumber || `DEMO-RCP-${Date.now().toString().slice(-6)}`,
          paidAt: new Date().toISOString(),
          paymentMethod: method,
        });
      }

      triggerSync();
      return respond({
        success: true,
        status: "paid",
        paymentStatus: "confirmed",
        message: "Payment processed successfully",
        receipt: receipt || {
          receiptNumber: `DEMO-RCP-${Date.now().toString().slice(-6)}`,
          amount: inv.amount,
          paidAt: new Date().toISOString(),
        },
        invoice: {
          ...inv,
          status: "paid",
          paymentStatus: "confirmed",
          invoiceNumber: inv.reference,
          totalAmount: inv.amount,
          amountPaid: inv.amount,
          balanceDue: 0,
        },
                applicationId: matchedApp?.id,
        applicationNumber: matchedApp?.applicationNo,
        // Mirrors /payments/verify — lets the result page pick the right CTA
        // even when settlement happened via the Paystack mirror path.
        flow: matchedApp?.details?.__formIncomplete
          ? "new_application"
          : "existing_application",
      });
    }

    return respond({ success: true, message: "Payment simulated successfully." });
  }

  // Invoice single lookup
  const invSingleMatch = url.match(/^\/invoices\/([^/?]+)$/);
  if (invSingleMatch) {
    const idOrRef = invSingleMatch[1];
    const s = getStore();
    const inv = s.invoices.find(
      (i) => i.id === idOrRef || i.reference.toUpperCase() === idOrRef.toUpperCase()
    ) || findInvoiceByRef(idOrRef);
    if (inv) {
      // Resolve the linked statutory application so the invoice page can show the
      // applicant, the service and the declaration data instead of "N/A".
      const linkedApp = getLgaApplications().find(
        (a: any) =>
          a.id === (inv as any).applicationId ||
          a.invoiceId === inv.id ||
          (a.invoiceNumber && a.invoiceNumber.toUpperCase() === inv.reference.toUpperCase()) ||
          a.applicationNo.toUpperCase() === inv.reference.toUpperCase() ||
          a.id.toUpperCase() === inv.reference.toUpperCase(),
      ) as any;

      // Which post-payment CTA should /payment/result show?
      // - "new_application"      → public pay-first flow: only contact details
      //                            were captured; the statutory form is still due.
      // - "existing_application" → dashboard flow: the full form was submitted
      //                            BEFORE payment, so no completion step is needed.
      const flow = linkedApp?.details?.__formIncomplete
        ? "new_application"
        : "existing_application";

      const virtualAccountNumber = inv.virtualAccount || "9912847291";
      const savedReceipt = s.receipts.find((r) => r.invoiceId === inv.id || r.invoiceRef === inv.reference);
      const receiptNumber = savedReceipt?.receiptNumber || `DEMO-RCP-${inv.reference.replace(/[^0-9]/g, "").slice(-6) || "00142"}`;
      const receiptObj = inv.status === "paid" ? {
        id: savedReceipt?.id || `rcp-${inv.id}`,
        receiptNumber,
        verificationCode: savedReceipt?.verificationCode || `VCODE-${inv.id.slice(-4).toUpperCase()}`,
        qrToken: savedReceipt?.qrToken || inv.qrToken,
        issuedAt: savedReceipt?.paidAt || inv.paidAt || inv.createdAt,
      } : null;

            return respond({
        ...inv,
        invoiceNumber: inv.reference,
        // UI checks `paymentStatus === "confirmed"` (list + detail pages). Emit
        // "confirmed" here — "paid" elsewhere breaks the hide-pay-options gate.
        paymentStatus: inv.status === "paid" ? "confirmed" : "pending",
        flow,
        applicationId: linkedApp?.id || (inv as any).applicationId || null,
        applicationNumber: linkedApp?.applicationNo || linkedApp?.applicationNumber || null,
        totalAmount: inv.amount,
        amountPaid: inv.status === "paid" ? inv.amount : 0,
        balanceDue: inv.status === "paid" ? 0 : inv.amount,
        subtotal: inv.amount,
        penaltyAmount: 0,
        invoiceType: "standard",
        customerPhone: inv.phone,
        customerEmail: inv.email,
        description: inv.purpose || inv.levyType,
        fieldOfficer: inv.officerName || "Treasury Gateway",
        qrData: inv.qrToken,
        receipt: receiptObj,
        permit: null,
        virtualAccount: {
          accountNumber: virtualAccountNumber,
          bankName: "LOGMAS Revenue Settlement Bank",
          accountName: `IKENNE LGA - ${inv.customerName}`,
          reference: inv.reference,
        },
        // Flat aliases the invoice detail page reads directly.
        virtualAccountNumber,
        virtualBankName: "LOGMAS Revenue Settlement Bank",
        // Linked statutory application (shape the invoice page expects).
        application: linkedApp
          ? {
              id: linkedApp.id,
              applicationNumber: linkedApp.applicationNo || linkedApp.applicationNumber,
              status: linkedApp.status,
              feeAmount: linkedApp.amount,
              ward: linkedApp.ward,
              revenueHead: linkedApp.revenueHead,
              service: { name: linkedApp.serviceName, code: linkedApp.serviceId },
              formData: linkedApp.details || {},
              applicant: {
                fullName: linkedApp.applicant,
                phone: linkedApp.phone,
                email: linkedApp.email,
                address: linkedApp.address,
              },
            }
          : null,
        receipts: inv.status === "paid"
          ? [
              {
                id: `rcp-${inv.id}`,
                receiptNumber: `RCP-${inv.reference.replace(/[^0-9]/g, "").slice(-6) || "00142"}`,
                amount: inv.amount,
                method: inv.paymentMethod || "online",
                issuedAt: inv.paidAt || inv.createdAt,
              },
            ]
          : [],
        payments: inv.status === "paid" ? [
          {
            id: `pay-${inv.id}`,
            amount: inv.amount,
            method: inv.paymentMethod || "online",
            status: "confirmed",
            reference: inv.reference,
            confirmedAt: inv.paidAt || inv.createdAt,
            createdAt: inv.paidAt || inv.createdAt,
          }
        ] : [],
        paymentOptions: ["transfer", "pos", "card", "virtual_account"],
      });
    }
  }

  if (url.startsWith("/payments/verify/")) {
    const rawRef = url.replace("/payments/verify/", "").split("?")[0];
    const ref = decodeURIComponent(rawRef);
    const inv = findInvoiceByRef(ref);
    if (!inv) {
      return respond({
        status: "failed",
        paid: false,
        verified: false,
        source: "local",
        reference: ref,
        message: "No invoice found for this payment reference.",
      });
    }

    const s = getStore();
    let receipt: any = null;
    if (inv.status !== "paid") {
      receipt = markInvoicePaid(inv.id, "online", inv.customerName || "Demo Taxpayer", "citizen");
      inv.status = "paid";
    } else {
      receipt = s.receipts.find((r) => r.invoiceId === inv.id || r.invoiceRef === inv.reference);
    }

    const apps = getLgaApplications();
    const app = apps.find(
      (a) =>
        (a.invoiceId && a.invoiceId === inv.id) ||
        (a.invoiceNumber && a.invoiceNumber.toUpperCase() === inv.reference.toUpperCase()) ||
        a.applicationNo.toUpperCase() === inv.reference.toUpperCase() ||
        a.id.toUpperCase() === inv.reference.toUpperCase() ||
        (inv as any).applicationId === a.id
    );

    if (app && (app.status === "Awaiting Payment" || app.status === "Submitted" || app.paymentStatus !== "paid")) {
      updateApplicationStatus(app.id, "Payment Confirmed", {
        name: inv.customerName || "Demo Taxpayer",
        role: "citizen",
      }, {
        paymentStatus: "paid",
        invoiceId: inv.id,
        invoiceNumber: inv.reference,
        receiptNumber: receipt?.receiptNumber || `DEMO-RCP-${Date.now().toString().slice(-6)}`,
        paidAt: new Date().toISOString(),
        paymentMethod: "online",
      });
    }

    triggerSync();
    return respond({
      status: "confirmed",
      paid: true,
      verified: true,
      success: true,
      source: "local",
      reference: inv.reference,
      paid_at: inv.paidAt || new Date().toISOString(),
      invoice: {
        ...inv,
        status: "paid",
        paymentStatus: "confirmed",
        invoiceNumber: inv.reference,
        totalAmount: inv.amount,
        amountPaid: inv.amount,
        balanceDue: 0,
      },
      receipt: {
        receiptNumber:
          receipt?.receiptNumber ||
          (inv as any).receiptNumber ||
          `DEMO-RCP-${(inv.reference.replace(/[^0-9]/g, "").slice(-6) || Date.now().toString().slice(-6))}`,
        amount: inv.amount,
        paidAt: receipt?.paidAt || inv.paidAt || new Date().toISOString(),
      },
      application: app
        ? {
            id: app.id,
            applicationNumber: app.applicationNo || (app as any).applicationNumber,
            status: app.status === "Awaiting Payment" ? "Payment Confirmed" : app.status,
            service: { id: app.serviceId, name: app.serviceName },
          }
        : null,
    });
  }

  // ==========================================
  // RECEIPTS ROUTING
  // ==========================================
  if (url === "/receipts" || url.startsWith("/receipts?")) {
    return respond(getStore().receipts);
  }

  const receiptMatch = url.match(/^\/receipts\/([^/?]+)$/);
  if (receiptMatch) {
    const id = receiptMatch[1];
    const rec = getStore().receipts.find((r) => r.id === id || r.receiptNumber === id);
    if (rec) return respond(rec);
  }

  // ==========================================
  // SERVICES ROUTING
  // ==========================================
  if (url === "/services" || url.startsWith("/services?")) {
    return respond(DEFAULT_SERVICES.map(serviceWithEffectiveFee));
  }

  const serviceSlugMatch = url.match(/^\/services\/([^/?]+)$/);
  if (serviceSlugMatch) {
    const slug = serviceSlugMatch[1];
    const s = getServiceById(slug) || DEFAULT_SERVICES[0];
    return respond(s);
  }

  // ==========================================
  // CERTIFICATES & VERIFICATION ROUTING
  // ==========================================
  if (url === "/certificates" || url.startsWith("/certificates?")) {
    const apps = getLgaApplications();
    const certs = apps.map((app) => ({
      id: app.id,
      certificateNumber: app.certificateNumber || `DEMO/CERT/${new Date().getFullYear()}/${app.id.slice(-6).toUpperCase()}`,
      verificationCode: app.verificationCode || `VER-${app.id.slice(-4).toUpperCase()}`,
      qrToken: app.qrToken || `QR-DEMO-${app.id}`,
      issuedAt: app.issuedAt || app.createdAt || new Date().toISOString(),
      expiresAt: app.expiryDate || null,
      pdfUrl: null,
      issuedBy: {
        id: "usr_chairman_001",
        name: LGA_CONFIG.leadership.chairman.name,
        role: LGA_CONFIG.leadership.chairman.title,
      },
      application: {
        id: app.id,
        applicationNumber: app.applicationNo,
        status: app.status,
        feeAmount: app.amount,
        formData: {
          ...app.details,
          fullName: app.applicant,
          phone: app.phone,
          email: app.email,
          address: app.address,
          ward: app.ward,
          nin: app.nin,
        },
        createdAt: app.createdAt,
        applicant: {
          id: `usr_${app.applicant.replace(/\s+/g, "_").toLowerCase()}`,
          name: app.applicant,
          email: app.email,
          phone: app.phone,
        },
        createdBy: null,
      },
      service: {
        id: app.serviceId,
        code: app.serviceId,
        name: app.serviceName,
        category: app.category,
        revenueHead: app.revenueHead,
        description: `Official statutory certification for ${app.serviceName}`,
      },
      invoice: {
        id: app.invoiceId || `inv-${app.id}`,
        invoiceNumber: app.invoiceNumber || `INV-${app.id}`,
        amount: app.amount,
        paymentStatus: app.paymentStatus || "paid",
        paidAt: app.paidAt || app.createdAt,
      },
    }));

    return respond(certs);
  }

  const certMatch = url.match(/^\/certificates\/([^/?]+)$/);
  if (certMatch) {
    const idOrCode = decodeURIComponent(certMatch[1]);
    const apps = getLgaApplications();
    const app = apps.find(
      (a) =>
        a.id === idOrCode ||
        a.applicationNo === idOrCode ||
        a.certificateNumber === idOrCode ||
        a.verificationCode === idOrCode ||
        a.qrToken === idOrCode
    ) || apps[0];

    if (app) {
      return respond({
        id: app.id,
        certificateNumber: app.certificateNumber || `DEMO/CERT/${new Date().getFullYear()}/${app.id.slice(-6).toUpperCase()}`,
        verificationCode: app.verificationCode || `VER-${app.id.slice(-4).toUpperCase()}`,
        qrToken: app.qrToken || `QR-DEMO-${app.id}`,
        issuedAt: app.issuedAt || app.createdAt || new Date().toISOString(),
        expiresAt: app.expiryDate || null,
        pdfUrl: null,
        issuedBy: {
          id: "usr_chairman_001",
          name: LGA_CONFIG.leadership.chairman.name,
          role: LGA_CONFIG.leadership.chairman.title,
        },
        application: {
          id: app.id,
          applicationNumber: app.applicationNo,
          status: app.status,
          feeAmount: app.amount,
          formData: {
            ...app.details,
            fullName: app.applicant,
            phone: app.phone,
            email: app.email,
            address: app.address,
            ward: app.ward,
            nin: app.nin,
          },
          createdAt: app.createdAt,
          applicant: {
            id: `usr_${app.applicant.replace(/\s+/g, "_").toLowerCase()}`,
            name: app.applicant,
            email: app.email,
            phone: app.phone,
          },
          createdBy: null,
        },
        service: {
          id: app.serviceId,
          code: app.serviceId,
          name: app.serviceName,
          category: app.category,
          revenueHead: app.revenueHead,
          description: `Official statutory certification for ${app.serviceName}`,
        },
        invoice: {
          id: app.invoiceId || `inv-${app.id}`,
          invoiceNumber: app.invoiceNumber || `INV-${app.id}`,
          amount: app.amount,
          paymentStatus: app.paymentStatus || "paid",
          paidAt: app.paidAt || app.createdAt,
        },
      });
    }
  }

  if (url.startsWith("/public/certificates/") || url.startsWith("/certificates/verify/")) {
    const token = url.split("/").pop() || "";
    const apps = getLgaApplications();
    const foundApp = apps.find(
      (a) =>
        a.id === token ||
        a.applicationNo === token ||
        a.qrToken === token ||
        a.verificationCode === token
    ) || apps[0];

    const cert = transformApplicationToPublicCertificate(foundApp, token);
    return respond(cert);
  }

  if (url.startsWith("/verify/")) {
    const code = url.split("/").pop() || "";
    const result = findByQrOrCode(code);
    return respond({
      valid: true,
      details: result || {
        issuedTo: "Dr. Babatunde Adeleke",
        service: "Certificate of Origin",
        issuedBy: LGA_CONFIG.identity.councilName,
        status: "ACTIVE_AND_VALID",
      },
    });
  }

  // ==========================================
  // REPORTS & EXPORTS ROUTING
  // ==========================================
  if (url.startsWith("/reports/overview")) {
    const s = getStore();
    const paidInvoices = s.invoices.filter((i) => i.status === "paid");
    const totalRev = paidInvoices.reduce((acc, i) => acc + i.amount, 0) || 18450000;

    return respond({
      period: {
        from: new Date(Date.now() - 30 * 86400000).toISOString(),
        to: new Date().toISOString(),
      },
      stats: {
        totalRevenue: totalRev,
        byMethod: {
          transfer: 2150000,
          pos: 3800000,
          cash: 1200000,
          online: totalRev > 7150000 ? totalRev - 7150000 : 11300000,
        },
      },
      byLevy: [
        { levy: "Trade Permit", transactions: 65, revenue: 6100000 },
        { levy: "Certificate of Origin", transactions: 84, revenue: 4200000 },
        { levy: "Market Levy", transactions: 142, revenue: 2900000 },
        { levy: "Property Tax", transactions: 38, revenue: 4800000 },
      ],
      byServiceType: [
        { type: "certificate_of_origin", transactions: 84, revenue: 4200000, label: "Certificate of Origin" },
        { type: "trade_permit", transactions: 65, revenue: 6100000, label: "Trade Permit" },
        { type: "market_levy", transactions: 142, revenue: 2900000, label: "Market Levy" },
      ],
      byService: [
        { id: "certificate_of_origin", code: "certificate_of_origin", name: "Certificate of Origin", transactions: 84, revenue: 4200000 },
        { id: "trade_permit", code: "trade_permit", name: "Trade Permit", transactions: 65, revenue: 6100000 },
        { id: "market_levy", code: "market_levy", name: "Market Levy", transactions: 142, revenue: 2900000 },
      ],
      byOfficer: (s.officers || []).map((o) => ({
        id: o.id,
        name: o.name,
        ward: o.ward,
        invoicesIssued: o.invoicesIssued || 35,
        totalCollected: o.totalCollected || 450000,
        totalInvoiced: (o.totalCollected || 450000) + 120000,
      })),
      invoices: s.invoices.map((i) => ({
        id: i.id,
        reference: i.reference,
        customerName: i.customerName,
        levyType: i.levyType,
        status: i.status,
        amount: i.amount,
        dueDate: i.dueDate,
        paidAt: i.status === "paid" ? i.createdAt : null,
      })),
      receipts: s.receipts.map((r) => ({
        id: r.id,
        receiptNumber: r.receiptNumber,
        customerName: r.customerName,
        paymentMethod: r.paymentMethod,
        officerName: r.officerName || "Treasury Gateway",
        amount: r.amount,
        levyType: r.levyType,
        paidAt: r.paidAt,
      })),
    });
  }

  if (url.startsWith("/reports/export/invoices")) {
    const s = getStore();
    return respond(
      s.invoices.map((i) => ({
        reference: i.reference,
        customerName: i.customerName,
        levyType: i.levyType,
        status: i.status,
        amount: i.amount,
        amountPaid: i.status === "paid" ? i.amount : 0,
        balanceDue: i.status === "paid" ? 0 : i.amount,
        dueDate: i.dueDate,
        createdAt: i.createdAt,
      }))
    );
  }

  if (url.startsWith("/reports/export/receipts")) {
    const s = getStore();
    return respond(
      s.receipts.map((r) => ({
        receiptNumber: r.receiptNumber,
        customerName: r.customerName,
        levyType: r.levyType,
        paymentMethod: r.paymentMethod,
        officerName: r.officerName || "Treasury Gateway",
        amount: r.amount,
        paidAt: r.paidAt,
      }))
    );
  }

  if (url.startsWith("/reports/collections")) {
    const s = getStore();
    return respond({
      total: s.receipts.reduce((a, b) => a + b.amount, 0) || 18450000,
      rows: s.receipts,
    });
  }

  // ==========================================
  // TREASURER ROUTING
  // ==========================================
  if (url.startsWith("/treasurer/overview")) {
    const s = getStore();
    const apps = getLgaApplications();
    const paidInvoices = s.invoices.filter((i) => i.status === "paid");
    const unpaidInvoices = s.invoices.filter((i) => i.status !== "paid");
    const totalCollected = paidInvoices.reduce((a, b) => a + b.amount, 0) || 18450000;
    const totalOutstanding = unpaidInvoices.reduce((a, b) => a + b.amount, 0) || 6350000;

    return respond({
      period: {
        from: new Date(Date.now() - 30 * 86400000).toISOString(),
        to: new Date().toISOString(),
      },
      summary: {
        totalInvoices: s.invoices.length || 142,
        totalInvoiced: totalCollected + totalOutstanding,
        totalCollected,
        totalOutstanding,
        collectionRate: `${Math.round((paidInvoices.length / (s.invoices.length || 1)) * 100)}%`,
        confirmedTransactions: paidInvoices.length || 118,
        totalPaymentTransactions: s.invoices.length || 142,
      },
      paymentMethods: [
        { method: "online", totalCollected: 12500000, transactions: 84 },
        { method: "pos", totalCollected: 3800000, transactions: 24 },
        { method: "bank_transfer", totalCollected: 2150000, transactions: 10 },
      ],
      applicationStatuses: [
        { status: "Approved", count: apps.filter((a) => a.status === "Approved").length || 32 },
        { status: "Under Review", count: apps.filter((a) => a.status === "Under Review").length || 8 },
        { status: "Submitted", count: apps.filter((a) => a.status === "Submitted").length || 14 },
      ],
      revenueByService: DEFAULT_SERVICES.map((srv) => ({
        serviceId: srv.id,
        serviceName: srv.name,
        serviceCode: srv.id,
        totalCollected: 450000,
        transactions: 12,
      })),
      recentPayments: s.receipts.slice(0, 10).map((r) => ({
        id: r.id,
        amount: r.amount,
        method: r.paymentMethod,
        status: "confirmed",
        reference: r.receiptNumber,
        gatewayRef: `GTW-${r.id}`,
        createdAt: r.paidAt,
        confirmedAt: r.paidAt,
        invoice: {
          id: r.invoiceId,
          invoiceNumber: r.invoiceRef,
          amount: r.amount,
          application: {
            applicationNumber: r.invoiceRef,
            fullName: r.customerName,
            service: { name: r.levyType },
          },
        },
      })),
    });
  }

  if (url.startsWith("/treasurer/revenue/by-officer")) {
    const s = getStore();
    return respond({
      revenueByOfficer: (s.officers || []).map((o) => ({
        id: o.id,
        officerName: o.name,
        ward: o.ward,
        totalCollected: o.totalCollected || 250000,
        invoicesIssued: o.invoicesIssued || 18,
        collectionRate: "92%",
      })),
    });
  }

  if (url.startsWith("/treasurer/revenue/by-ward")) {
    return respond({
      revenueByWard: [
        { wardId: "w1", wardName: "Atan Ward", totalCollected: 5800000, target: 6000000, percentage: 96 },
        { wardId: "w2", wardName: "Ojowo Ward", totalCollected: 4900000, target: 5500000, percentage: 89 },
        { wardId: "w3", wardName: "Owu Ward", totalCollected: 4200000, target: 5000000, percentage: 84 },
      ],
    });
  }

  if (url.startsWith("/treasurer/revenue")) {
    return respond({
      period: { from: "2026-01-01", to: "2026-12-31" },
      byCategory: [
        { category: "state_of_origin_fee", invoiced: 4500000, collected: 4200000, invoiceCount: 84 },
        { category: "trade_permits", invoiced: 6800000, collected: 6100000, invoiceCount: 65 },
        { category: "market_levy", invoiced: 3200000, collected: 2900000, invoiceCount: 142 },
        { category: "property_tax", invoiced: 5100000, collected: 4800000, invoiceCount: 38 },
      ],
      dailyTrend: [
        { date: "2026-09-18", collected: 540000, transactions: 14 },
        { date: "2026-09-19", collected: 620000, transactions: 18 },
        { date: "2026-09-20", collected: 780000, transactions: 22 },
        { date: "2026-09-21", collected: 890000, transactions: 25 },
        { date: "2026-09-22", collected: 940000, transactions: 28 },
      ],
    });
  }

  if (url.startsWith("/treasurer/field-officers")) {
    const s = getStore();
    return respond({
      data: (s.officers || []).map((o) => ({
        id: o.id,
        name: o.name,
        email: o.email,
        phone: o.phone,
        ward: o.ward,
        status: o.status,
        totalCollected: o.totalCollected,
        invoicesIssued: o.invoicesIssued,
      })),
      summary: {
        totalOfficers: s.officers.length,
        activeOfficers: s.officers.filter((o) => o.status === "active").length,
        totalCollected: s.officers.reduce((acc, o) => acc + o.totalCollected, 0),
      },
    });
  }

  if (url.startsWith("/treasurer/reconciliation")) {
    const s = getStore();
    return respond({
      data: s.invoices.slice(0, 20).map((i) => ({
        id: i.id,
        reference: i.reference,
        amount: i.amount,
        status: i.status === "paid" ? "matched" : "pending",
        date: i.createdAt,
        customerName: i.customerName,
      })),
      stats: {
        totalTransactions: s.invoices.length,
        totalAmount: s.invoices.reduce((a, b) => a + b.amount, 0),
        matched: s.invoices.filter((i) => i.status === "paid").length,
        discrepancies: 0,
        pendingCount: s.invoices.filter((i) => i.status !== "paid").length,
      },
    });
  }

  if (url.startsWith("/treasurer/service-fees") || url.startsWith("/treasurer/fees")) {
    const feeSubMatch = url.match(/^\/treasurer\/(?:service-fees|fees)\/([^/?]+)$/);
    if (feeSubMatch) {
      let srvId = feeSubMatch[1];
      if (srvId === "configure" || srvId === "save" || srvId === "update") {
        srvId = data.serviceId || data.id || "certificate_of_origin";
      }
      const srv = DEFAULT_SERVICES.find((s) => s.id === srvId) || DEFAULT_SERVICES[0];
      const fee = getEffectiveServiceFee(srv.id);

      // PATCH upserts the treasurer-configured fee (amount + active status).
      if (method === "PATCH" || method === "POST" || method === "PUT") {
        const rawAmount = Number(data.amount);
        const amount = rawAmount && rawAmount > 0 ? rawAmount : fee.amount;
        const active = typeof data.status === "boolean" ? data.status : (data.status ? String(data.status).toUpperCase() !== "INACTIVE" : fee.status !== "INACTIVE");
        const status = active ? "ACTIVE" : "INACTIVE";
        saveTreasurerFeeOverride(srv.id, amount, status);
        addAudit({
          actor: "Council Treasurer",
          actorRole: "treasurer",
          action: "SERVICE_FEE_UPDATED",
          target: srv.id,
          meta: { amount, status },
        });
        triggerSync();
        return respond({
          success: true,
          saved: true,
          status: "success",
          id: `fee-${srv.id}`,
          serviceId: srv.id,
          serviceName: srv.name,
          amount,
          feeAmount: amount,
          feeStatus: status,
          updatedAt: new Date().toISOString(),
          updatedById: "usr_treasurer_001",
          updatedBy: { id: "usr_treasurer_001", firstName: "Mrs. M. O.", lastName: "Danjuma, FCA" },
        });
      }

      return respond({
        ...serviceWithEffectiveFee(srv),
        feeConfig: {
          id: `fee-${srv.id}`,
          serviceId: srv.id,
          amount: fee.amount,
          status: fee.status,
          updatedAt: fee.updatedAt,
          updatedById: "usr_treasurer_001",
          updatedBy: { id: "usr_treasurer_001", firstName: "Mrs. M. O.", lastName: "Danjuma, FCA" },
        },
      });
    }

    return respond(
      DEFAULT_SERVICES.map((srv) => {
        const fee = getEffectiveServiceFee(srv.id);
        return {
          ...serviceWithEffectiveFee(srv),
          feeConfig: {
            id: `fee-${srv.id}`,
            serviceId: srv.id,
            amount: fee.amount,
            status: fee.status,
            updatedAt: fee.updatedAt,
            updatedById: "usr_treasurer_001",
            updatedBy: { id: "usr_treasurer_001", firstName: "Mrs. M. O.", lastName: "Danjuma, FCA" },
          },
        };
      })
    );
  }

  if (url.startsWith("/treasurer/invoices")) {
    const s = getStore();
    return respond({
      items: s.invoices,
      total: s.invoices.length,
      page: 1,
      limit: 50,
    });
  }

  // ==========================================
  // CHAIRMAN ROUTING
  // ==========================================
  if (url.startsWith("/chairman/overview")) {
    const s = getStore();
    const apps = getLgaApplications();
    return respond({
      success: true,
      role: "chairman",
      metrics: {
        totalRevenue: s.receipts.reduce((a, b) => a + b.amount, 0) || 18450000,
        activePermits: s.permits.length || 34,
        overdueInvoices: s.invoices.filter((i) => i.status === "overdue").length || 3,
        wardCoverage: 100,
        pendingApplications: apps.filter((a) => a.status === "Submitted" || a.status === "Under Review").length || 8,
        approvedCertificates: apps.filter((a) => a.status === "Approved").length || 42,
        pendingComplaints: 2,
        activeOfficersCount: s.officers.filter((o) => o.status === "active").length || 14,
        totalInvoicesCount: s.invoices.length || 142,
        pendingBillsCount: s.invoices.filter((i) => i.status !== "paid").length || 24,
      },
    });
  }

  if (url.startsWith("/chairman/revenue")) {
    return respond({
      period: { from: "2026-01-01", to: "2026-12-31" },
      byCategory: [
        { category: "state_of_origin_fee", invoiced: 4500000, collected: 4200000, invoiceCount: 84 },
        { category: "trade_permits", invoiced: 6800000, collected: 6100000, invoiceCount: 65 },
        { category: "market_levy", invoiced: 3200000, collected: 2900000, invoiceCount: 142 },
        { category: "property_tax", invoiced: 5100000, collected: 4800000, invoiceCount: 38 },
      ],
      dailyTrend: [
        { date: "2026-09-18", collected: 540000, transactions: 14 },
        { date: "2026-09-19", collected: 620000, transactions: 18 },
        { date: "2026-09-20", collected: 780000, transactions: 22 },
        { date: "2026-09-21", collected: 890000, transactions: 25 },
        { date: "2026-09-22", collected: 940000, transactions: 28 },
      ],
    });
  }

  if (url.startsWith("/chairman/wards")) {
    const list = [
      {
        id: "w-1",
        name: "Atan Ward",
        code: "WRD-ATAN",
        description: "Atan urban center and trade precinct",
        councillor: { id: "c-1", firstName: "Hon. Taiwo", lastName: "Adeleke", isActive: true },
        _count: { complaints: 2, stateOfOriginApplications: 14, businesses: 32 },
      },
      {
        id: "w-2",
        name: "Ojowo Ward",
        code: "WRD-OJOWO",
        description: "Ojowo market trade area",
        councillor: { id: "c-2", firstName: "Hon. Bisi", lastName: "Ogunleye", isActive: true },
        _count: { complaints: 1, stateOfOriginApplications: 18, businesses: 45 },
      },
      {
        id: "w-3",
        name: "Owu Ward",
        code: "WRD-OWU",
        description: "Owu commercial district",
        councillor: { id: "c-3", firstName: "Hon. Femi", lastName: "Daramola", isActive: true },
        _count: { complaints: 0, stateOfOriginApplications: 11, businesses: 26 },
      },
    ];
    return respond({ wards: list });
  }

  if (url.startsWith("/chairman/applications")) {
    return respond({
      byStatus: {
        pending: 4,
        submitted: 8,
        payment_pending: 3,
        paid: 12,
        under_review: 6,
        forwarded_to_councillor: 2,
        approved: 42,
        rejected: 2,
        certificate_issued: 38,
      },
      byWard: [
        { ward: { id: "w-1", name: "Atan Ward" }, count: 24 },
        { ward: { id: "w-2", name: "Ojowo Ward" }, count: 32 },
        { ward: { id: "w-3", name: "Owu Ward" }, count: 18 },
      ],
    });
  }

  if (url.startsWith("/chairman/complaints")) {
    return respond({
      total: 8,
      resolved: 6,
      pending: 2,
      byStatus: { open: 2, in_progress: 1, resolved: 5, closed: 0 },
      byWard: [
        { ward: { id: "w-1", name: "Atan Ward" }, count: 1 },
        { ward: { id: "w-2", name: "Ojowo Ward" }, count: 1 },
      ],
    });
  }

  // ==========================================
  // AUDITOR ROUTING
  // ==========================================
  if (url.startsWith("/auditor/audit-logs")) {
    const s = getStore();
    const subMatch = url.match(/^\/auditor\/audit-logs\/([^/?]+)$/);
    if (subMatch) {
      const id = subMatch[1];
      const a = s.audits.find((x) => x.id === id) || s.audits[0] || {
        id,
        createdAt: new Date().toISOString(),
        actor: "Auditor Demo",
        actorRole: "auditor",
        action: "verification_check",
        target: "System Registry",
        meta: {},
      };
      return respond({
        ...a,
        entity: "AuditRecord",
        entityId: a.id,
        ipAddress: "127.0.0.1",
        email: "auditor@logmas.gov.ng",
        user: {
          id: "usr_auditor_001",
          firstName: "Council",
          lastName: "Auditor",
          email: "auditor@logmas.gov.ng",
          role: "auditor",
        },
      });
    }

    return respond({
      stats: {
        total: s.audits.length || 45,
        paymentEvents: s.audits.filter((a) => a.action?.includes("payment")).length || 18,
        permitEvents: s.audits.filter((a) => a.action?.includes("permit")).length || 12,
        suspicious: 0,
      },
      data: s.audits.map((a) => ({
        id: a.id,
        createdAt: a.createdAt,
        actor: a.actor,
        actorRole: a.actorRole,
        action: a.action,
        target: a.target,
        meta: a.meta || {},
        entity: "SystemTransaction",
        entityId: a.id,
        ipAddress: "192.168.1.1",
        email: "auditor@logmas.gov.ng",
      })),
      pagination: {
        total: s.audits.length || 45,
        page: 1,
        limit: 25,
        totalPages: 1,
      },
    });
  }

  // ==========================================
  // COMPLAINTS ROUTING
  // ==========================================
  if (url.startsWith("/complaints")) {
    const demoComplaints = [
      {
        id: "cmp-1",
        ticketNumber: "LOG-CMP-2026-001",
        title: "Market stall billing inquiry",
        description: "Request clarification on quarterly market levy assessment rate.",
        status: "resolved",
        category: "Levy Assessment",
        wardId: "w-1",
        raisedById: "usr_citizen_001",
        ward: { id: "w-1", name: "Atan Ward", code: "W1" },
        raisedBy: { id: "usr_citizen_001", firstName: "Dr. Babatunde", lastName: "Adeleke", email: "citizen@logmas.gov.ng" },
        createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
        resolvedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
        resolutionNote: "Rate verified according to official LGA Bye-Law Schedule 2.",
        responses: [
          {
            id: "res-1",
            message: "Assessed based on standard retail floor area rate.",
            respondedBy: { id: "adm-1", firstName: "Council", lastName: "Admin", role: "lga_admin" },
            createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
          },
        ],
      },
      {
        id: "cmp-2",
        ticketNumber: "LOG-CMP-2026-002",
        title: "Certificate verification status update",
        description: "Checking processing status of Indigene Certificate submitted last week.",
        status: "open",
        category: "Statutory Certificate",
        wardId: "w-2",
        raisedById: "usr_citizen_001",
        ward: { id: "w-2", name: "Ojowo Ward", code: "W2" },
        raisedBy: { id: "usr_citizen_001", firstName: "Dr. Babatunde", lastName: "Adeleke", email: "citizen@logmas.gov.ng" },
        createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
      },
    ];

    if (url.includes("/stats")) {
      return respond({
        total: demoComplaints.length,
        breakdown: { open: 1, assigned: 0, in_progress: 0, resolved: 1, closed: 0 },
      });
    }

    if (method === "POST" && !url.includes("/respond")) {
      const newCmp = {
        id: `cmp-${Date.now()}`,
        ticketNumber: `LOG-CMP-2026-${Math.floor(100 + Math.random() * 900)}`,
        title: data.title || "Citizen Feedback",
        description: data.description || "General complaint inquiry",
        status: "open",
        category: data.category || "General",
        wardId: "w-1",
        raisedById: "usr_citizen_001",
        ward: { id: "w-1", name: "Atan Ward", code: "W1" },
        raisedBy: { id: "usr_citizen_001", firstName: "Dr. Babatunde", lastName: "Adeleke", email: "citizen@logmas.gov.ng" },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return respond(newCmp);
    }

    if (url.includes("/admin") || url.includes("/ward")) {
      return respond({
        complaints: demoComplaints,
        meta: { total: demoComplaints.length, page: 1, limit: 20, totalPages: 1 },
      });
    }

    return respond({
      complaints: demoComplaints,
      meta: { total: demoComplaints.length, page: 1, limit: 20, totalPages: 1 },
    });
  }

  // ==========================================
  // BUSINESS ROUTING
  // ==========================================
  if (url.startsWith("/business")) {
    const s = getStore();
    const demoBiz = {
      id: "biz_demo_001",
      businessName: "Adeleke & Sons Agro Allied Enterprises",
      ownerName: "Dr. Babatunde Adeleke",
      address: "14 Adeleke Crescent, Demo City",
      phone: "+234 803 123 4567",
      email: "citizen@logmas.gov.ng",
      cacNumber: "RC-892341",
      category: "Agricultural & Food Processing",
      description: "Licensed municipal commercial agricultural distributor",
      isActive: true,
      wardId: "w-1",
      ownerId: "usr_citizen_001",
      createdAt: new Date(Date.now() - 90 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
      ward: { id: "w-1", name: "Atan Ward", code: "W1" },
      permits: (s.permits || []).map((p) => ({
        id: p.id,
        permitNumber: p.permitNumber,
        permitType: p.permitType,
        status: p.status,
        issueDate: p.issueDate || new Date().toISOString().slice(0, 10),
        expiryDate: p.expiryDate || new Date(Date.now() + 300 * 86400000).toISOString().slice(0, 10),
        qrToken: p.qrToken,
        businessName: p.businessName,
        fee: p.fee,
        invoiceId: `inv-${p.id}`,
        invoice: {
          id: `inv-${p.id}`,
          status: "paid",
          totalAmount: p.fee,
          balanceDue: 0,
        },
      })),
    };

    if (url.startsWith("/business/permits")) {
      if (url.includes("/verify/")) {
        const code = url.split("/").pop() || "";
        return respond({
          valid: true,
          permit: demoBiz.permits[0] || {
            permitNumber: code,
            businessName: demoBiz.businessName,
            status: "issued",
            fee: 25000,
          },
        });
      }
      return respond({
        permits: demoBiz.permits,
        total: demoBiz.permits.length,
      });
    }

    if (url.startsWith("/business/invoices")) {
      return respond({
        items: s.invoices.slice(0, 10),
        total: s.invoices.length,
        page: 1,
        limit: 10,
      });
    }

    if (url.startsWith("/business/my") || url === "/business") {
      if (method === "PATCH" || method === "POST") {
        return respond({ ...demoBiz, ...data, updatedAt: new Date().toISOString() });
      }
      return respond(demoBiz);
    }
  }

  // ==========================================
  // FIELD OFFICER ROUTING
  // ==========================================
  if (url.startsWith("/field-officer")) {
    const s = getStore();

    if (url.startsWith("/field-officer/collections/summary")) {
      return respond({
        totalCollected: 450000,
        count: 18,
        cash: 120000,
        pos: 330000,
      });
    }

    if (url.startsWith("/field-officer/collections")) {
      return respond({
        data: s.receipts,
        total: s.receipts.length,
        page: 1,
        limit: 20,
      });
    }

    if (url.startsWith("/field-officer/businesses")) {
      if (method === "POST") {
        const newBiz = {
          id: `biz-${Date.now()}`,
          businessName: data.businessName || "New Enterprise",
          ownerName: data.ownerName || "Business Owner",
          address: data.address || "Market Road",
          phone: data.phone || "+234 800 000 1122",
          category: data.category || "Retail",
          wardId: data.wardId || "w-1",
          ownerId: "usr_citizen_001",
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        return respond(newBiz);
      }
      return respond(
        s.customers.map((c) => ({
          id: c.id,
          businessName: c.businessName || c.name,
          ownerName: c.name,
          address: c.address,
          phone: c.phone,
          email: c.email,
          category: "Retail Commerce",
          isActive: true,
          wardId: "w-1",
          ownerId: c.id,
          createdAt: c.createdAt,
          updatedAt: c.createdAt,
        }))
      );
    }

    if (url.startsWith("/field-officer/permits")) {
      return respond({
        data: s.permits,
        total: s.permits.length,
      });
    }

    if (url.startsWith("/field-officer/violations")) {
      return respond({
        id: `viol-${Date.now()}`,
        businessName: data.businessName || "Default Business",
        reason: data.reason || "Trade permit non-compliance",
        loggedAt: new Date().toISOString(),
      });
    }
  }

  // ==========================================
  // LGA ADMIN ROUTING
  // ==========================================
  if (url.startsWith("/lga/contractors/overview")) {
    return respond({
      summary: { totalContractors: 2, totalAgents: 28, totalCollections: 14200000 },
      contractors: [
        {
          id: "c-1",
          name: "Prime Revenue Services Ltd",
          rcNumber: "RC-482910",
          contactPerson: "Alhaji Garba",
          phone: "+234 802 334 1122",
          agentsCount: 14,
          totalCollected: 7800000,
          status: "active",
        },
        {
          id: "c-2",
          name: "Metro Tax Associates",
          rcNumber: "RC-392811",
          contactPerson: "Chief O. Okonjo",
          phone: "+234 803 556 2233",
          agentsCount: 14,
          totalCollected: 6400000,
          status: "active",
        },
      ],
    });
  }

  if (url.startsWith("/lga/accounts/overview")) {
    // Real demo-roster account management (LGA Admin -> Accounts). Derived from
    // DEMO_PRESET_USERS + registered demo users + persisted suspend/reset/verify
    // overrides, so create/suspend/reset actions on this page actually stick.
    const search = (params.search || "").toString().toLowerCase();
    const roleFilter = (params.role || "").toString();
    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 20;

    let accounts = getDemoUsersList().map((u: any) => toDemoAccount(u));
    if (roleFilter && roleFilter !== "all") {
      accounts = accounts.filter((a: any) => a.role === roleFilter);
    }
    if (search) {
      accounts = accounts.filter(
        (a: any) =>
          a.name.toLowerCase().includes(search) ||
          String(a.email || "").toLowerCase().includes(search) ||
          String(a.phone || "").toLowerCase().includes(search)
      );
    }

    const total = accounts.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const safePage = Math.min(page, totalPages);
    const paged = accounts.slice((safePage - 1) * limit, safePage * limit);

    return respond({
      counts: {
        total,
        active: accounts.filter((a: any) => a.status === "active").length,
        suspended: accounts.filter((a: any) => a.status === "suspended").length,
        pending: accounts.filter((a: any) => a.isReset).length,
      },
      accounts: paged,
      meta: { total, page: safePage, limit, totalPages },
    });
  }

  // Reset account password (LGA Admin -> Accounts -> Reset Password)
  const resetPwMatch = url.match(/^\/lga\/accounts\/([^\/?]+)\/reset-password$/);
  if (resetPwMatch && method === "PATCH") {
    const acctId = decodeURIComponent(resetPwMatch[1]);
    const account = findDemoAccountById(acctId);
    if (!account) {
      return respondError("Account not found.", "ACCOUNT_NOT_FOUND", 404);
    }
    saveAccountOverride(account.id, { isReset: true });
    return respond({
      message: `Password reset link sent to ${account.email}.`,
      notice: "The user must set a new password before signing in again.",
    });
  }


  if (url.startsWith("/lga/wards")) {
    const s = getStore();
    const subMatch = url.match(/^\/lga\/wards\/([^/?]+)$/);
    if (subMatch) {
      const id = subMatch[1];
      return respond({
        id,
        name: "Atan Ward",
        code: "W1",
        description: "Administrative central ward",
      });
    }
    return respond([
      { id: "w-1", name: "Atan Ward", code: "W1", description: "Central commercial ward" },
      { id: "w-2", name: "Ojowo Ward", code: "W2", description: "Market sector ward" },
      { id: "w-3", name: "Owu Ward", code: "W3", description: "Urban residential ward" },
    ]);
  }

  if (url.startsWith("/lga/staff")) {

    // Create account (LGA Admin -> Accounts -> New Account). Persists to the
    // demo users store so the account appears on the Accounts page instantly.
    if (method === "POST" && url === "/lga/staff") {
      const email = String(data.email || "").trim().toLowerCase();
      if (!email) {
        return respondError("Email is required to create an account.");
      }
      const duplicate = getDemoUsersList().find(
        (u: any) => u.email?.toLowerCase() === email
      );
      if (duplicate) {
        return respondError(
          "An account with this email already exists.",
          "ACCOUNT_EXISTS"
        );
      }
      const staffUser = {
        id: `usr_staff_${Date.now().toString().slice(-8)}`,
        email,
        firstName: data.firstName || "New",
        lastName: data.lastName || "Officer",
        role: data.role || "field_officer",
        phone: data.phone || "",
        address: "Demo LGA Secretariat",
        town: "Demo City",
        isActive: true,
        onboardingCompleted: false,
        createdAt: new Date().toISOString(),
      };
      saveRegisteredDemoUser(staffUser);
      triggerSync();
      return respond({
        staff: {
          id: staffUser.id,
          email: staffUser.email,
          firstName: staffUser.firstName,
          lastName: staffUser.lastName,
          role: staffUser.role,
          phone: staffUser.phone,
          isActive: true,
          createdAt: staffUser.createdAt,
        },
        notice:
          "Account created. Login credentials would be emailed in a live deployment.",
      });
    }

    // Suspend / reactivate (LGA Admin -> Accounts -> Suspend/Reactivate).
    const toggleMatch = url.match(/^\/lga\/staff\/([^\/?]+)\/toggle-status$/);
    if (toggleMatch && method === "PATCH") {
      const acctId = decodeURIComponent(toggleMatch[1]);
      const account = findDemoAccountById(acctId);
      if (!account) {
        return respondError("Account not found.", "ACCOUNT_NOT_FOUND", 404);
      }
      const currentlyActive =
        getAccountOverrides()[account.id]?.isActive ?? account.isActive !== false;
      saveAccountOverride(account.id, {
        isActive: !currentlyActive,
        suspendedAt: currentlyActive ? new Date().toISOString() : null,
        suspensionReason: currentlyActive
          ? (data && data.reason) || "Suspended by LGA Admin"
          : null,
      });
      return respond({
        id: account.id,
        email: account.email,
        isActive: !currentlyActive,
        role: account.role,
      });
    }

    const s = getStore();
    const subMatch = url.match(/^\/lga\/staff\/([^/?]+)$/);
    if (subMatch) {
      const id = subMatch[1];
      const off = s.officers.find((o) => o.id === id) || s.officers[0];
      return respond({
        id,
        firstName: off?.name?.split(" ")[0] || "Staff",
        lastName: off?.name?.split(" ")[1] || "Officer",
        email: off?.email || "staff@logmas.gov.ng",
        role: "field_officer",
        isActive: true,
      });
    }
    return respond(
      (s.officers || []).map((o) => ({
        id: o.id,
        firstName: o.name.split(" ")[0] || "Officer",
        lastName: o.name.split(" ")[1] || "Field",
        email: o.email,
        phone: o.phone,
        role: "field_officer",
        isActive: o.status === "active",
      }))
    );
  }

  if (url.startsWith("/lga/permits")) {
    const s = getStore();
    return respond({
      data: s.permits,
      total: s.permits.length,
    });
  }

  // ==========================================
  // CUSTOMERS & PERMITS & LEVIES ROUTING
  // ==========================================
  if (url.startsWith("/customers")) {
    const s = getStore();
    const subMatch = url.match(/^\/customers\/([^/?]+)$/);
    if (subMatch) {
      const id = subMatch[1];
      if (method === "DELETE") {
        setStore((prev) => ({
          ...prev,
          customers: prev.customers.filter((c) => c.id !== id),
        }));
        return respond({ message: "Customer removed" });
      }
      const cust = s.customers.find((c) => c.id === id) || s.customers[0];
      return respond(cust);
    }

    if (method === "POST") {
      const newC = {
        id: `c-${Date.now()}`,
        name: data.name || data.businessName || "New Customer",
        phone: data.phone || "+2348000000000",
        email: data.email || "user@example.com",
        address: data.address || "Local Address",
        businessName: data.businessName,
        ward: data.ward || "Atan",
        createdAt: new Date().toISOString(),
      };
      setStore((prev) => ({ ...prev, customers: [newC, ...prev.customers] }));
      return respond(newC);
    }

    return respond(s.customers);
  }

  if (url.startsWith("/categories")) {
    const list = [
      {
        id: "cat-1",
        name: "Commercial & Business Trade",
        slug: "commercial-business-trade",
        type: "permit",
        description: "Business operations, shops, and trade premises",
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        _count: { levyConfigs: 2, permitConfigs: 4, invoices: 45 },
        levyConfigs: [],
        permitConfigs: [
          { id: "pc-1", name: "Major Commercial Trade Permit", baseAmount: 35000, isActive: true, type: "yearly" },
          { id: "pc-2", name: "Small Business Permit", baseAmount: 15000, isActive: true, type: "yearly" },
        ],
      },
      {
        id: "cat-2",
        name: "Statutory Certificates",
        slug: "statutory-certificates",
        type: "service",
        description: "Official LGA documentation and certifications",
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        _count: { levyConfigs: 1, permitConfigs: 2, invoices: 88 },
        levyConfigs: [],
        permitConfigs: [],
      },
    ];
    return respond(Object.assign([...list], { data: list }));
  }

  if (url.startsWith("/permits")) {
    const s = getStore();
    const verifyMatch = url.match(/^\/permits\/verify\/([^/?]+)$/);
    if (verifyMatch) {
      const token = decodeURIComponent(verifyMatch[1]);
      const p = s.permits.find((x) => x.id === token || x.permitNumber === token || x.qrToken === token) || s.permits[0];
      return respond(p);
    }
    const singleMatch = url.match(/^\/permits\/([^/?]+)$/);
    if (singleMatch) {
      const id = singleMatch[1];
      const p = s.permits.find((x) => x.id === id) || s.permits[0];
      return respond(p);
    }
    return respond(s.permits);
  }

  if (url.startsWith("/permit-types")) {
    return respond([
      { id: "pt-1", name: "Shop Permit", baseAmount: 12000, category: "trade_permit" },
      { id: "pt-2", name: "Market Trader Permit", baseAmount: 7500, category: "market_levy" },
      { id: "pt-3", name: "Liquor Licence", baseAmount: 25000, category: "other" },
    ]);
  }

  if (url.startsWith("/permit-configs")) {
    const s = getStore();
    return respond(s.permitConfigs);
  }

  if (url.startsWith("/levy-prices")) {
    const s = getStore();
    return respond(s.levies);
  }

  if (url.startsWith("/wards") || url.startsWith("/general/wards")) {
    const list = [
      { id: "w-1", name: "Atan Ward", code: "W1" },
      { id: "w-2", name: "Ojowo Ward", code: "W2" },
      { id: "w-3", name: "Owu Ward", code: "W3" },
      { id: "w-4", name: "Ososa Ward", code: "W4" },
      { id: "w-5", name: "Imuwo Ward", code: "W5" },
    ];
    return respond(Object.assign([...list], { data: list, wards: list, count: list.length }));
  }

  if (url.startsWith("/field-officers")) {
    const s = getStore();
    return respond(s.officers);
  }

  if (url.startsWith("/contractors")) {
    return respond([
      { id: "c-1", name: "Prime Revenue Services Ltd", contactName: "Alhaji Garba", phone: "+234 802 334 1122", active: true },
      { id: "c-2", name: "Metro Tax Associates", contactName: "Chief O. Okonjo", phone: "+234 803 556 2233", active: true },
    ]);
  }

  if (url.startsWith("/uploads")) {
    return respond({
      url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
      key: "uploads/demo_passport.jpg",
      mime: "image/jpeg",
      size: 102400,
    });
  }

  // ==========================================
  // OVERVIEW & DASHBOARD STATS
  // ==========================================
  if (
    url.startsWith("/dashboard/overview") ||
    url.startsWith("/lga/overview")
  ) {
    const s = getStore();
    const apps = getLgaApplications();
    const paidInvoices = s.invoices.filter((i) => i.status === "paid");
    const totalRev = paidInvoices.reduce((acc, i) => acc + i.amount, 0) || 18450000;
    const unpaidInvoices = s.invoices.filter((i) => i.status !== "paid");
    const pendingAmount = unpaidInvoices.reduce((acc, i) => acc + i.amount, 0) || 3450000;

    let currentRole: string = "citizen";
    let currentUser: any = null;
    try {
      if (typeof window !== "undefined") {
        const storedUser = window.localStorage.getItem("logmas.auth.user");
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          currentUser = parsed;
          if (parsed?.role) currentRole = parsed.role;
        }
      }
    } catch {}

    // Scope to records the current user actually owns, matching the "My Applications"
    // page filter (applicantId/createdById) — but only for applicant-type roles.
    // Management roles (admin, treasurer, chairman, field officer) see the full ledger.
    const isCitizenLikeRole = currentRole === "citizen" || currentRole === "business_owner";
    const scopedApps = (isCitizenLikeRole && currentUser && currentUser.id)
      ? (apps as any[]).filter((a: any) => a.applicantId === currentUser.id || a.createdById === currentUser.id)
      : apps;

    const approvedAppCount = scopedApps.filter((a: any) => {
      const st = String(a.status || "").toLowerCase();
      return st === "approved" || st === "completed";
    }).length;
    const pendingPaymentsSum = scopedApps
      .filter((a: any) => a.paymentStatus !== "paid")
      .reduce((sum: number, a: any) => sum + Number(a.amount || 0), 0);
    const awaitingFormCount = scopedApps.filter((a: any) => {
      const st = String(a.status || "").toLowerCase();
      return st !== "approved" && st !== "completed" && st !== "rejected" && st !== "draft";
    }).length;
    const rejectedAppCount = scopedApps.filter((a: any) => String(a.status || "").toLowerCase() === "rejected").length;

    const formattedRecentApps = (scopedApps && scopedApps.length ? scopedApps : apps).slice(0, 8).map((a, idx) => {
      const st = String(a.status || "").toLowerCase();
      return {
        id: a.id || `app-${1001 + idx}`,
        applicant: a.applicant || a.fullName || a.customerName || "Dr. Babatunde Adeleke",
        fullName: a.fullName || a.applicant || a.customerName || "Dr. Babatunde Adeleke",
        service: a.serviceName || a.service || "Certificate of State of Origin",
        serviceName: a.serviceName || a.service || "Certificate of State of Origin",
        ward: a.ward || "Atan Ward",
        status: st === "approved" || st === "completed" ? "approved" : (st === "rejected" ? "rejected" : (st === "draft" ? "draft" : "pending")),
        createdAt: a.createdAt || new Date(Date.now() - idx * 86400000).toISOString(),
        date: a.createdAt || new Date(Date.now() - idx * 86400000).toISOString(),
        type: a.serviceName || "Local Government Clearance",
      };
    });

    const formattedRecentInvoices = s.invoices.slice(0, 6).map((inv) => ({
      id: inv.id,
      reference: (inv as any).invoiceNumber || `INV-${inv.id}`,
      amount: inv.amount,
      customerName: inv.customerName || "Registered Ratepayer",
      status: inv.status,
    }));

    const metrics = {
      // Citizen metrics (derived from the current user's own applications so the
      // dashboard always matches the "My Applications" page).
      pendingPayments: pendingPaymentsSum,
      approvedApplications: approvedAppCount,
      openComplaints: 0,
      awaitingForm: awaitingFormCount,
      awaitingFormSubmissions: awaitingFormCount,

      // Business Owner metrics
      activeNotices: 3,
      totalPaid: totalRev,
      outstanding: pendingAmount,
      activePermits: s.permits.length || 4,

      // Treasurer metrics
      totalRevenue: totalRev,
      totalCollected: totalRev,
      pendingAmount: pendingAmount,
      invoiceGeneratedCount: s.invoices.length || 142,
      activeOfficers: s.officers.length || 14,
      overdueInvoices: s.invoices.filter((i) => i.status === "overdue").length || 3,
      collectionRate: 84,
      targetRevenue: 25000000,

      // Councillor metrics
      pendingApprovals: apps.filter((a) => a.status === "Submitted" || a.status === "Under Review").length || 5,
      wardComplaints: 2,
      totalConstituents: 12450,
      approvedSOO: 42,
      totalComplaints: 2,
      activeBusinesses: 128,

      // Auditor metrics
      anomaliesCount: 2,
      highValueCount: 6,

      // Field Officer metrics
      totalInvoicesGenerated: 42,
      pendingCount: 6,
      overdueCount: 2,
      channelBreakdown: { pos: 450000, cash: 120000, transfer: 80000 },

      // Super Admin metrics
      totalLgas: 1,
      platformUsers: 1420,
      systemOfficers: s.officers.length || 14,
      auditEvents: s.audits.length || 54,

      // Admin / Chairman metrics
      wardCoverage: 100,
      citizens: 1240,
      totalCitizens: 1240,
      fieldOfficers: s.officers.length || 14,
      activeOfficersCount: s.officers.length || 14,
      activeFieldOfficers: s.officers.length || 14,
      pendingApplications: apps.filter((a) => a.status === "Submitted" || a.status === "Under Review").length || 8,
      totalInvoices: s.invoices.length || 142,
      totalInvoicesCount: s.invoices.length || 142,
      approvedCertificates: 42,
      pendingBillsCount: unpaidInvoices.length || 24,
    };

    const stats = {
      citizens: 1240,
      totalCitizens: 1240,
      fieldOfficers: s.officers.length || 14,
      activeFieldOfficers: s.officers.length || 14,
      pendingApplications: apps.filter((a) => a.status === "Submitted" || a.status === "Under Review").length || 8,
      pendingApprovals: apps.filter((a) => a.status === "Submitted" || a.status === "Under Review").length || 8,
      totalInvoices: s.invoices.length || 142,
      totalInvoicesCount: s.invoices.length || 142,
      totalRevenue: totalRev,
      totalReceipts: s.receipts.length || 118,
      totalApplications: apps.length || 65,
    };

    const revenueTrendChart = [
      { month: "Jan", date: "2026-01-01", amount: 1200000 },
      { month: "Feb", date: "2026-02-01", amount: 1450000 },
      { month: "Mar", date: "2026-03-01", amount: 1800000 },
      { month: "Apr", date: "2026-04-01", amount: 1650000 },
      { month: "May", date: "2026-05-01", amount: 2100000 },
      { month: "Jun", date: "2026-06-01", amount: 1950000 },
      { month: "Jul", date: "2026-07-01", amount: 2300000 },
      { month: "Aug", date: "2026-08-01", amount: 2600000 },
      { month: "Sep", date: "2026-09-01", amount: 2850000 },
    ];

    const categoryBreakdown = [
      { category: "State of Origin Certificates", amount: 4500000, percentage: 24 },
      { category: "Trade & Operating Permits", amount: 6800000, percentage: 37 },
      { category: "Market Tolls & Levies", amount: 3200000, percentage: 17 },
      { category: "Property Tenement Rates", amount: 3950000, percentage: 22 },
    ];

    const anomalies = [
      {
        id: "anom-1",
        type: "duplicate_receipt",
        description: "Multiple receipts detected with identical sequence timestamp",
        severity: "low",
        createdAt: "2026-09-20T14:22:00Z",
      },
      {
        id: "anom-2",
        type: "out_of_hours_collection",
        description: "Collection logged outside statutory municipal hours (23:14)",
        severity: "medium",
        createdAt: "2026-09-21T23:14:00Z",
      },
    ];

    const highValueTransactions = [
      {
        id: "hvt-1",
        reference: "TXN-HV-88912",
        amount: 1500000,
        customerName: "Grand Atan Commercial Mills Ltd",
        date: "2026-09-21T11:00:00Z",
        status: "verified",
      },
      {
        id: "hvt-2",
        reference: "TXN-HV-88913",
        amount: 850000,
        customerName: "Owu Integrated Logistics Park",
        date: "2026-09-22T08:30:00Z",
        status: "verified",
      },
    ];

    const recentAudits = [
      {
        id: "aud-1",
        action: "REVENUE_RECONCILIATION",
        performedBy: "Folake Auditor",
        timestamp: "2026-09-22T08:00:00Z",
        description: "Daily automated treasury ledger reconciliation cleared.",
      },
      {
        id: "aud-2",
        action: "PERMIT_RATE_VERIFY",
        performedBy: "Folake Auditor",
        timestamp: "2026-09-21T16:45:00Z",
        description: "Standard commercial tariff schedule verification completed.",
      },
    ];

    const contractorRevenueTrend = [
      { month: "May", amount: 1200000 },
      { month: "Jun", amount: 1500000 },
      { month: "Jul", amount: 1800000 },
      { month: "Aug", amount: 2200000 },
      { month: "Sep", amount: 2650000 },
    ];

    return respond({
      role: currentRole,
      metrics,
      stats,
      recentApplications: formattedRecentApps,
      applications: formattedRecentApps,
      recentInvoices: formattedRecentInvoices,
      revenueTrendChart,
      categoryBreakdown,
      anomalies,
      highValueTransactions,
      recentAudits,
      invoices: s.invoices,
      receipts: s.receipts,
      officers: s.officers,
      revenueTrend: contractorRevenueTrend,
      revenueOverview: [
        { name: "Mon", revenue: 420000 },
        { name: "Tue", revenue: 680000 },
        { name: "Wed", revenue: 590000 },
        { name: "Thu", revenue: 840000 },
        { name: "Fri", revenue: 990000 },
      ],
      recentActivities: s.audits.slice(0, 10),
    });
  }

  // ==========================================
  // NOTIFICATIONS & AUDIT LOGS
  // ==========================================
  if (url.startsWith("/notifications")) {
    if (url.includes("/read-all")) {
      setStore((s) => ({
        ...s,
        notifications: s.notifications.map((n) => ({ ...n, read: true })),
      }));
      return respond({ message: "All notifications marked as read." });
    }
    const rawNotifs = getStore().notifications || [];
    const notifs = rawNotifs.map((n) => ({
      id: n.id,
      userId: n.userId || "usr_demo",
      title: n.title,
      message: (n as any).message || (n as any).body || "System update notification",
      type: n.type || "system",
      isRead: Boolean(n.read),
      createdAt: n.createdAt || new Date().toISOString(),
      updatedAt: n.createdAt || new Date().toISOString(),
    }));
    return respond({
      items: notifs,
      unreadCount: notifs.filter((n) => !n.isRead).length,
      page: 1,
      limit: 20,
    });
  }

  if (url.startsWith("/audit-logs") || url.startsWith("/activity-logs")) {
    return respond(getStore().audits);
  }

  // ==========================================
  // FALLBACK: ANY UNKNOWN REQUEST SUCCEEDS
  // ==========================================
  console.log(`[Mock API Handler] Synthesizing zero-backend response for: [${method}] ${url}`);
  return respond([]);
}
