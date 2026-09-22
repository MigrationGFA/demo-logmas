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
  type LgaApplication,
} from "./applicationsStore";
import { transformApplicationToPublicCertificate } from "@/services/apiPublicCertificate";

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
    emailVerifiedAt: "2024-01-01T00:00:00.000Z",
    passwordResetRequired: false,
    suspendedAt: null,
    suspendedById: null,
    suspensionReason: null,
    ward: { id: "ward_1", name: "Ward 1 - Demo Central" },
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
    emailVerifiedAt: "2024-01-01T00:00:00.000Z",
    passwordResetRequired: false,
    suspendedAt: null,
    suspendedById: null,
    suspensionReason: null,
    ward: { id: "ward_1", name: "Ward 1 - Demo Central" },
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
    emailVerifiedAt: "2024-01-01T00:00:00.000Z",
    passwordResetRequired: false,
    suspendedAt: null,
    suspendedById: null,
    suspensionReason: null,
    ward: { id: "ward_1", name: "Ward 1 - Demo Central" },
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
    emailVerifiedAt: "2024-01-01T00:00:00.000Z",
    passwordResetRequired: false,
    suspendedAt: null,
    suspendedById: null,
    suspensionReason: null,
    ward: { id: "ward_1", name: "Ward 1 - Demo Central" },
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
    emailVerifiedAt: "2024-01-01T00:00:00.000Z",
    passwordResetRequired: false,
    suspendedAt: null,
    suspendedById: null,
    suspensionReason: null,
    ward: { id: "ward_1", name: "Ward 1 - Demo Central" },
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
    emailVerifiedAt: "2024-01-01T00:00:00.000Z",
    passwordResetRequired: false,
    suspendedAt: null,
    suspendedById: null,
    suspensionReason: null,
    ward: { id: "ward_1", name: "Ward 1 - Demo Central" },
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
    emailVerifiedAt: "2024-01-01T00:00:00.000Z",
    passwordResetRequired: false,
    suspendedAt: null,
    suspendedById: null,
    suspensionReason: null,
    ward: { id: "ward_1", name: "Ward 1 - Demo Central" },
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
    emailVerifiedAt: "2024-01-01T00:00:00.000Z",
    passwordResetRequired: false,
    suspendedAt: null,
    suspendedById: null,
    suspensionReason: null,
    ward: { id: "ward_1", name: "Ward 1 - Demo Central" },
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
    emailVerifiedAt: "2024-01-01T00:00:00.000Z",
    passwordResetRequired: false,
    suspendedAt: null,
    suspendedById: null,
    suspensionReason: null,
    ward: { id: "ward_1", name: "Ward 1 - Demo Central" },
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
    emailVerifiedAt: "2024-01-01T00:00:00.000Z",
    passwordResetRequired: false,
    suspendedAt: null,
    suspendedById: null,
    suspensionReason: null,
    ward: { id: "ward_2", name: "Ward 2 - Commercial District" },
  },
};

function getDemoUsersList() {
  if (typeof window === "undefined") return Object.values(DEMO_PRESET_USERS);
  try {
    const custom = JSON.parse(window.localStorage.getItem("logmas.demo.users") || "[]");
    return [...Object.values(DEMO_PRESET_USERS), ...custom];
  } catch {
    return Object.values(DEMO_PRESET_USERS);
  }
}

function saveRegisteredDemoUser(user: any) {
  if (typeof window === "undefined") return;
  try {
    const list = JSON.parse(window.localStorage.getItem("logmas.demo.users") || "[]");
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
export async function handleMockApiRequest(config: any): Promise<any> {
  const url = (config.url || "").replace(/^https?:\/\/[^/]+/, "").replace(/^\/api\/v1/, "").replace(/^\/api\/demo/, "");
  const method = (config.method || "GET").toUpperCase();
  let data: any = {};
  if (typeof config.data === "string") {
    try {
      data = JSON.parse(config.data || "{}");
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
        emailVerifiedAt: new Date().toISOString(),
        passwordResetRequired: false,
        suspendedAt: null,
        suspendedById: null,
        suspensionReason: null,
        ward: { id: "ward_1", name: "Ward 1 - Demo Central" },
        createdAt: new Date().toISOString(),
      };
      saveRegisteredDemoUser(found);
    } else {
      // Ensure found user always has emailVerifiedAt in demo
      if (!found.emailVerifiedAt) {
        found.emailVerifiedAt = new Date().toISOString();
      }
      found.isActive = true;
      found.passwordResetRequired = false;
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
      emailVerifiedAt: new Date().toISOString(),
      passwordResetRequired: false,
      suspendedAt: null,
      suspendedById: null,
      suspensionReason: null,
      ward: { id: "ward_1", name: "Ward 1 - Demo Central" },
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
    let user = null;
    if (typeof window !== "undefined") {
      try {
        const raw = window.localStorage.getItem("logmas.auth.user");
        if (raw) user = JSON.parse(raw);
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
      const all = getLgaApplications();
      return respond({
        items: all,
        total: all.length,
        page: 1,
        limit: 50,
        totalPages: 1,
      });
    }

    if (method === "POST") {
      const createdApp = createLgaApplication({
        serviceId: data.serviceId || "certificate_of_origin",
        serviceName: data.serviceName || "Certificate of Origin",
        category: data.category || "Statutory Certificates",
        applicant: data.applicant || data.fullName || "Demo Applicant",
        phone: data.phone || "+234 800 000 1122",
        email: data.email || "applicant@demo.gov.ng",
        address: data.address || "Demo Secretariat Road, Demo City",
        ward: data.ward || "Ward 1 - Central Urban",
        nin: data.nin,
        cacNumber: data.cacNumber,
        revenueHead: data.revenueHead || "Internal Revenue",
        amount: Number(data.amount) || 5000,
        details: data.details || data.formData || {},
        documents: data.documents || [],
        isDraft: data.isDraft ?? false,
      });

      // Auto create an Invoice in store.ts for this application
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 14);
      createInvoice({
        taxpayer: createdApp.applicant,
        phone: createdApp.phone,
        email: createdApp.email,
        address: createdApp.address,
        ward: createdApp.ward,
        levyType: "State of Origin Fee",
        amount: createdApp.amount,
        frequency: "one-off",
        dueDate: dueDate.toISOString().slice(0, 10),
        actor: "System",
        actorRole: "system",
      });

      triggerSync();
      return respond(createdApp);
    }
  }

  // Specific application lookup / status change
  const appMatch = url.match(/^\/applications\/([^/?]+)(.*)/);
  if (appMatch) {
    const appId = appMatch[1];
    const subPath = appMatch[2] || "";

    if (subPath.includes("approve") || subPath.includes("status")) {
      const newStatus = data.status || "Approved";
      const updated = updateApplicationStatus(appId, newStatus, {
        name: "Council Admin",
        role: "lga_admin",
      }, {
        paymentStatus: "paid",
      });
      triggerSync();
      return respond(updated);
    }

    if (subPath.includes("decline") || subPath.includes("reject")) {
      const updated = updateApplicationStatus(appId, "Rejected", {
        name: "Council Admin",
        role: "lga_admin",
      }, {
        rejectionReason: data.reason || "Documentation verification failed.",
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
  if (url === "/invoices/hub" || url.startsWith("/invoices/hub?")) {
    const s = getStore();
    const invoices = s.invoices;
    const paid = invoices.filter((i) => i.status === "paid");
    const unpaid = invoices.filter((i) => i.status !== "paid");
    const totalCollected = paid.reduce((sum, i) => sum + i.amount, 0);
    const totalOutstanding = unpaid.reduce((sum, i) => sum + i.amount, 0);

    return respond({
      invoices,
      stats: {
        totalInvoices: invoices.length,
        totalPaidCount: paid.length,
        totalUnpaidCount: unpaid.length,
        totalCollected,
        totalOutstanding,
      },
    });
  }

  if (url === "/invoices" || url.startsWith("/invoices?")) {
    const s = getStore();
    return respond(s.invoices);
  }

  // Invoice simulation or payment
  const invActionMatch = url.match(/^\/invoices\/([^/?]+)\/(simulate-payment|pay|pay-online|send-payment-link)/);
  if (invActionMatch) {
    const invId = invActionMatch[1];
    const action = invActionMatch[2];

    if (action === "send-payment-link") {
      return respond({ message: "Payment link sent to taxpayer phone & email." });
    }

    // Payment simulation or execution
    const s = getStore();
    const inv = s.invoices.find((i) => i.id === invId || i.reference === invId);
    if (inv) {
      const receipt = markInvoicePaid(inv.id, "online", "Demo Taxpayer", "citizen");

      // Check if there is an application matching this invoice
      const apps = getLgaApplications();
      const matchedApp = apps.find(
        (a) =>
          a.applicationNo === inv.reference ||
          a.id === inv.reference ||
          a.applicant.toLowerCase() === inv.customerName.toLowerCase() ||
          a.amount === inv.amount
      );
      if (matchedApp) {
        updateApplicationStatus(matchedApp.id, "Approved", {
          name: "Treasury Gateway",
          role: "treasurer",
        }, {
          paymentStatus: "paid",
          paidAt: new Date().toISOString(),
        });
      }

      triggerSync();
      return respond({
        success: true,
        message: "Payment processed successfully",
        receipt: receipt || {
          receiptNumber: `DEMO-RCP-${Date.now().toString().slice(-6)}`,
          amount: inv.amount,
          paidAt: new Date().toISOString(),
        },
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
    );
    if (inv) return respond(inv);
  }

  if (url.startsWith("/payments/verify/")) {
    const ref = url.split("/").pop() || "";
    const inv = findInvoiceByRef(ref);
    return respond({
      verified: true,
      status: inv?.status === "paid" ? "paid" : "unpaid",
      invoice: inv,
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
    return respond(DEFAULT_SERVICES);
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
    );

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

    return {
      status: 404,
      statusText: "Not Found",
      headers: {},
      config,
      data: {
        status: "error",
        data: null,
        error: "Certificate not found in registry",
      },
    };
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
    );

    if (!foundApp) {
      return {
        status: 404,
        statusText: "Not Found",
        headers: {},
        config,
        data: {
          status: "error",
          data: null,
          error: "Certificate not found in registry",
        },
      };
    }

    const cert = transformApplicationToPublicCertificate(foundApp, token);
    return respond(cert);
  }

  if (url.startsWith("/verify/")) {
    const code = url.split("/").pop() || "";
    const result = findByQrOrCode(code);
    if (result) {
      return respond({
        valid: true,
        details: result,
        verificationMessage: `Authentic statutory record verified in LOGMAS Registry`,
      });
    }
    return respond({
      valid: false,
      details: null,
      verificationMessage: `No record matching "${code}" found in LOGMAS Registry`,
    });
  }

  // ==========================================
  // OVERVIEW & DASHBOARD STATS
  // ==========================================
  if (
    url.startsWith("/dashboard/overview") ||
    url.startsWith("/lga/overview") ||
    url.startsWith("/reports/overview")
  ) {
    const s = getStore();
    const apps = getLgaApplications();
    const paidInvoices = s.invoices.filter((i) => i.status === "paid");
    const totalRev = paidInvoices.reduce((acc, i) => acc + i.amount, 0);

    return respond({
      stats: {
        totalRevenue: totalRev || 18450000,
        totalInvoices: s.invoices.length || 142,
        totalReceipts: s.receipts.length || 118,
        totalApplications: apps.length || 65,
        totalCitizens: 1240,
        pendingApprovals: apps.filter((a) => a.status === "Submitted" || a.status === "Under Review").length || 8,
        activeFieldOfficers: 14,
      },
      revenueOverview: [
        { name: "Mon", revenue: 420000 },
        { name: "Tue", revenue: 680000 },
        { name: "Wed", revenue: 590000 },
        { name: "Thu", revenue: 840000 },
        { name: "Fri", revenue: 990000 },
      ],
      recentActivities: s.audits.slice(0, 10),
      recentApplications: apps.slice(0, 5),
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
    return respond(getStore().notifications);
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
