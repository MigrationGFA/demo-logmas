/* eslint-disable @typescript-eslint/no-explicit-any */
import { AxiosRequestConfig } from "axios";
import { LGA_CONFIG } from "@/config/lga.config";
import { DEFAULT_SERVICES, getServiceById } from "@/config/services.config";
import {
  getInvoices,
  findInvoice,
  updateInvoice,
  addInvoice,
  getReceipts,
  addReceipt,
  genInvoiceRef,
  genReceiptNumber,
  genQRToken,
  genVerificationCode,
  addAudit,
  addNotification,
  type Invoice,
} from "./store";
import {
  getApplications,
  getApplicationById,
  updateApplicationStatus,
  addApplication,
  type LgaApplication,
} from "./applicationsStore";
import { transformApplicationToPublicCertificate } from "@/services/apiPublicCertificate";

// Preset Demo Users
export const DEMO_PRESET_USERS = {
  citizen: {
    id: "usr_citizen_001",
    email: "citizen@demo.gov.ng",
    firstName: "Babatunde",
    lastName: "Adeleke",
    name: "Dr. Babatunde Adeleke",
    role: "citizen" as const,
    phone: "+234 803 123 4567",
    token: "demo_citizen_token_jwt",
    isActive: true,
    onboardingCompleted: true,
    avatarUrl: null,
    address: "12 Adeleke Crescent, Ward 3, Demo City",
    nin: "12345678901",
    dateOfBirth: "1985-06-15",
    gender: "Male",
    town: "Demo City",
    occupation: "Medical Practitioner & Public Health Specialist",
  },
  admin: {
    id: "usr_admin_001",
    email: "admin@demo.gov.ng",
    firstName: "Council",
    lastName: "Admin",
    name: "Council Admin Officer",
    role: "lga_admin" as const,
    phone: "+234 800 336 6542",
    token: "demo_admin_token_jwt",
    isActive: true,
    onboardingCompleted: true,
    avatarUrl: null,
    address: "Central Council Secretariat, Demo City",
    dateOfBirth: "1980-01-01",
    gender: "Male",
    town: "Demo City",
  },
  treasurer: {
    id: "usr_treasurer_001",
    email: "treasurer@demo.gov.ng",
    firstName: "Amina",
    lastName: "Mohammed",
    name: "Mrs. Amina Mohammed, FCA",
    role: "treasurer" as const,
    phone: "+234 802 999 8888",
    token: "demo_treasurer_token_jwt",
    isActive: true,
    onboardingCompleted: true,
    avatarUrl: null,
    address: "Internal Revenue & Treasury Dept, Demo City",
    dateOfBirth: "1982-04-10",
    gender: "Female",
    town: "Demo City",
  },
  chairman: {
    id: "usr_chairman_001",
    email: "chairman@demo.gov.ng",
    firstName: "Adebayo",
    lastName: "Adeleke",
    name: "Hon. (Dr.) Adebayo Adeleke",
    role: "chairman" as const,
    phone: "+234 800 111 2222",
    token: "demo_chairman_token_jwt",
    isActive: true,
    onboardingCompleted: true,
    avatarUrl: "/assets/chairman.jpg",
    address: "Chairman's Official Lodge, Demo City",
    dateOfBirth: "1975-08-20",
    gender: "Male",
    town: "Demo City",
  },
  business_owner: {
    id: "usr_business_001",
    email: "business@demo.gov.ng",
    firstName: "Musa",
    lastName: "Ibrahim",
    name: "Alhaji Musa (Musa Agro Stores)",
    role: "business_owner" as const,
    phone: "+234 805 444 3333",
    token: "demo_business_token_jwt",
    isActive: true,
    onboardingCompleted: true,
    avatarUrl: null,
    businessName: "Musa Agro Allied Stores Ltd",
    businessType: "Agro-allied & Commodity Trading",
    cacNumber: "RC-1987442",
    address: "Block 4, Central Commercial Market, Ward 2",
    dateOfBirth: "1978-03-25",
    gender: "Male",
    town: "Demo City",
  },
  field_officer: {
    id: "usr_field_001",
    email: "field@demo.gov.ng",
    firstName: "Kemi",
    lastName: "Adewale",
    name: "Kemi Adewale",
    role: "field_officer" as const,
    phone: "+234 812 555 7777",
    token: "demo_field_token_jwt",
    isActive: true,
    onboardingCompleted: true,
    avatarUrl: null,
    address: "Field Operations Command, Ward 1",
    dateOfBirth: "1992-10-12",
    gender: "Female",
    town: "Demo City",
  },
  auditor: {
    id: "usr_auditor_001",
    email: "auditor@demo.gov.ng",
    firstName: "Council",
    lastName: "Auditor",
    name: "Internal Auditor",
    role: "auditor" as const,
    phone: "+234 803 777 9999",
    token: "demo_auditor_token_jwt",
    isActive: true,
    onboardingCompleted: true,
    avatarUrl: null,
    address: "Audit & Compliance Unit",
    dateOfBirth: "1983-05-18",
    gender: "Male",
    town: "Demo City",
  },
  ward_councillor: {
    id: "usr_councillor_001",
    email: "councillor@demo.gov.ng",
    firstName: "Osunnowo",
    lastName: "Azeez",
    name: "Hon. Osunnowo Azeez",
    role: "ward_councillor" as const,
    phone: "+234 809 111 3333",
    token: "demo_councillor_token_jwt",
    isActive: true,
    onboardingCompleted: true,
    avatarUrl: null,
    address: "Ward 1 Council Office",
    dateOfBirth: "1986-11-29",
    gender: "Male",
    town: "Demo City",
  },
  super_admin: {
    id: "usr_super_001",
    email: "super@demo.gov.ng",
    firstName: "LOGMAS",
    lastName: "SuperAdmin",
    name: "LOGMAS Platform Administrator",
    role: "super_admin" as const,
    phone: "+234 800 000 0001",
    token: "demo_super_token_jwt",
    isActive: true,
    onboardingCompleted: true,
    avatarUrl: null,
    address: "National DPI Data Centre, Abuja",
    dateOfBirth: "1980-01-01",
    gender: "Male",
    town: "Abuja",
  },
};

function getActiveDemoUser(): any {
  if (typeof window === "undefined") return DEMO_PRESET_USERS.citizen;
  try {
    const raw = localStorage.getItem("logmas.auth.user");
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return DEMO_PRESET_USERS.citizen;
}

/**
 * Clean path without query strings and normalized
 */
function cleanPath(url: string = ""): string {
  // Strip origin or base
  const withoutBase = url
    .replace(/^https?:\/\/[^/]+/i, "")
    .replace(/^\/api\/v1/i, "")
    .replace(/^\/api\/demo/i, "");
  const [path] = withoutBase.split("?");
  return path.startsWith("/") ? path : `/${path}`;
}

export async function handleDemoMockRequest(config: AxiosRequestConfig): Promise<{
  status: number;
  data: any;
  headers?: Record<string, string>;
}> {
  const method = (config.method || "GET").toUpperCase();
  const path = cleanPath(config.url);
  const data = typeof config.data === "string" ? JSON.parse(config.data || "{}") : config.data || {};
  const params = config.params || {};

  // Artificial short delay for realistic snappy response
  await new Promise((resolve) => setTimeout(resolve, 60));

  // =========================================================================
  // 1. AUTHENTICATION & USER MANAGEMENT
  // =========================================================================
  if (path === "/auth/login" && method === "POST") {
    const email = (data.email || "").toLowerCase().trim();
    // Match preset by email
    const matchedKey = Object.keys(DEMO_PRESET_USERS).find((k) => {
      const u = (DEMO_PRESET_USERS as any)[k];
      return u.email.toLowerCase() === email;
    });

    let userObj: any = matchedKey ? (DEMO_PRESET_USERS as any)[matchedKey] : null;

    if (!userObj) {
      // Create guest user based on email
      const prefix = email.split("@")[0] || "user";
      userObj = {
        id: `usr_${Date.now().toString(36)}`,
        email,
        firstName: prefix.charAt(0).toUpperCase() + prefix.slice(1),
        lastName: "Citizen",
        name: prefix.charAt(0).toUpperCase() + prefix.slice(1) + " Citizen",
        role: "citizen",
        phone: "+234 800 000 0000",
        token: `demo_${prefix}_token`,
        isActive: true,
        onboardingCompleted: true,
        avatarUrl: null,
      };
    }

    if (typeof window !== "undefined") {
      localStorage.setItem("logmas.auth.token", userObj.token);
      localStorage.setItem("logmas.auth.refreshToken", userObj.token + "_refresh");
      localStorage.setItem("logmas.auth.user", JSON.stringify(userObj));
    }

    return {
      status: 200,
      data: {
        status: "success",
        accessToken: userObj.token,
        refreshToken: userObj.token + "_refresh",
        user: userObj,
        data: {
          accessToken: userObj.token,
          refreshToken: userObj.token + "_refresh",
          user: userObj,
        },
      },
    };
  }

  if (path === "/auth/me" && method === "GET") {
    const currentUser = getActiveDemoUser();
    return {
      status: 200,
      data: {
        status: "success",
        data: currentUser,
        user: currentUser,
        ...currentUser,
      },
    };
  }

  if (path === "/auth/register" && method === "POST") {
    const newUser = {
      id: `usr_${Date.now().toString(36)}`,
      email: data.email || "applicant@demo.gov.ng",
      firstName: data.firstName || "Demo",
      lastName: data.lastName || "Applicant",
      name: `${data.firstName || "Demo"} ${data.lastName || "Applicant"}`.trim(),
      role: data.role || "citizen",
      phone: data.phone || "+234 800 000 0000",
      token: `demo_reg_${Date.now()}`,
      isActive: true,
      onboardingCompleted: true,
    };

    if (typeof window !== "undefined") {
      localStorage.setItem("logmas.auth.token", newUser.token);
      localStorage.setItem("logmas.auth.refreshToken", newUser.token + "_refresh");
      localStorage.setItem("logmas.auth.user", JSON.stringify(newUser));
    }

    return {
      status: 200,
      data: {
        status: "success",
        message: "Account registered successfully in Demo Portal",
        accessToken: newUser.token,
        user: newUser,
        data: { user: newUser },
      },
    };
  }

  if (path === "/auth/logout") {
    return {
      status: 200,
      data: { status: "success", message: "Logged out successfully" },
    };
  }

  if (path === "/auth/forgot-password" || path === "/auth/resend-verification") {
    return {
      status: 200,
      data: { status: "success", message: "Demo verification email simulated" },
    };
  }

  // =========================================================================
  // 2. STATUTORY SERVICES CATALOGUE
  // =========================================================================
  if (path === "/services" && method === "GET") {
    return {
      status: 200,
      data: {
        status: "success",
        data: DEFAULT_SERVICES,
      },
    };
  }

  if (path.startsWith("/services/") && method === "GET") {
    const slug = path.replace("/services/", "");
    const service = getServiceById(slug) || DEFAULT_SERVICES[0];
    return {
      status: 200,
      data: {
        status: "success",
        data: service,
      },
    };
  }

  // =========================================================================
  // 3. WARDS & LGA METADATA
  // =========================================================================
  if (path === "/wards" || path === "/lga/wards") {
    return {
      status: 200,
      data: {
        status: "success",
        data: LGA_CONFIG.wards,
      },
    };
  }

  // =========================================================================
  // 4. INVOICES & REVENUE HUB
  // =========================================================================
  if (path === "/invoices/hub" && method === "GET") {
    const allInvoices = getInvoices();
    const tab = params.tab;
    const search = (params.search || "").toLowerCase();

    let filtered = allInvoices;
    if (tab === "sent" || tab === "unpaid") {
      filtered = filtered.filter((i) => i.status === "unpaid" || i.status === "pending");
    } else if (tab === "paid") {
      filtered = filtered.filter((i) => i.status === "paid");
    } else if (tab === "overdue") {
      filtered = filtered.filter((i) => i.status === "overdue");
    }

    if (search) {
      filtered = filtered.filter(
        (i) =>
          i.reference.toLowerCase().includes(search) ||
          i.customerName.toLowerCase().includes(search) ||
          i.levyType.toLowerCase().includes(search)
      );
    }

    // Calculate aggregated stats
    const outstanding = allInvoices
      .filter((i) => i.status !== "paid")
      .reduce((sum, i) => sum + i.amount, 0);
    const totalCollected = allInvoices
      .filter((i) => i.status === "paid")
      .reduce((sum, i) => sum + i.amount, 0);
    const transactions = allInvoices.length;
    const avgPayment = transactions > 0 ? Math.round(totalCollected / (allInvoices.filter((i) => i.status === "paid").length || 1)) : 0;

    const formattedList = filtered.map((inv) => ({
      id: inv.id,
      reference: inv.reference,
      customerName: inv.customerName,
      levyType: inv.levyType,
      invoiceType: inv.purpose || inv.levyType,
      amount: inv.amount,
      balanceDue: inv.status === "paid" ? 0 : inv.amount,
      status: inv.status === "unpaid" ? "sent" : inv.status,
      dueDate: inv.dueDate,
      issuedAt: inv.createdAt,
      paidAt: inv.paidAt || null,
      channel: inv.paymentMethod || "online",
      phone: inv.phone,
      officerName: inv.officerName || "Council Treasury",
    }));

    return {
      status: 200,
      data: {
        status: "success",
        stats: {
          outstanding,
          totalCollected,
          transactions,
          avgPayment,
        },
        invoices: formattedList,
        data: {
          stats: {
            outstanding,
            totalCollected,
            transactions,
            avgPayment,
          },
          invoices: formattedList,
        },
      },
    };
  }

  // Single Invoice Details
  if (path.startsWith("/invoices/") && !path.includes("/pay") && !path.includes("/simulate") && !path.includes("/public") && method === "GET") {
    const invId = path.replace("/invoices/", "");
    const inv = findInvoice(invId) || getInvoices()[0];

    if (!inv) {
      return {
        status: 404,
        data: { status: "error", error: "Invoice not found" },
      };
    }

    const receipts = getReceipts();
    const relatedReceipt = receipts.find((r) => r.invoiceId === inv.id || r.invoiceRef === inv.reference);

    return {
      status: 200,
      data: {
        status: "success",
        data: {
          id: inv.id,
          invoiceNumber: inv.reference,
          status: inv.status === "paid" ? "paid" : "sent",
          issuedAt: inv.createdAt,
          dueDate: inv.dueDate,
          paidAt: inv.paidAt || null,
          invoiceType: inv.purpose || inv.levyType,
          totalAmount: inv.amount,
          amountPaid: inv.status === "paid" ? inv.amount : 0,
          balanceDue: inv.status === "paid" ? 0 : inv.amount,
          subtotal: inv.amount,
          penaltyAmount: 0,
          customerName: inv.customerName,
          customerPhone: inv.phone,
          customerEmail: inv.email,
          levyType: inv.levyType,
          description: inv.description || inv.purpose,
          frequency: inv.frequency,
          unitPrice: inv.unitPrice,
          quantity: inv.quantity,
          fieldOfficer: inv.officerName || "Direct Citizen Portal",
          qrData: inv.qrToken,
          receipt: relatedReceipt
            ? {
                id: relatedReceipt.id,
                receiptNumber: relatedReceipt.receiptNumber,
                verificationCode: relatedReceipt.verificationCode,
                qrToken: relatedReceipt.qrToken,
                issuedAt: relatedReceipt.paidAt,
              }
            : null,
          virtualAccount: {
            accountNumber: LGA_CONFIG.payment?.accountNumber || "0123456789",
            bankName: LGA_CONFIG.payment?.bankName || "LOGMAS Treasury Digital Bank",
            accountName: LGA_CONFIG.payment?.accountName || "Demo LGA Internal Revenue Account",
            reference: inv.reference,
          },
          payments: inv.status === "paid"
            ? [
                {
                  id: `pay_${inv.id}`,
                  amount: inv.amount,
                  method: (inv.paymentMethod || "online") as any,
                  status: "confirmed",
                  reference: `PAY-${inv.reference}`,
                  confirmedAt: inv.paidAt || inv.createdAt,
                  createdAt: inv.paidAt || inv.createdAt,
                },
              ]
            : [],
          paymentOptions: ["Card", "Bank Transfer", "USSD"],
        },
      },
    };
  }

  // Public payment initialize (Citizen Application Flow)
  if (path === "/invoices/public/initialize" && method === "POST") {
    const serviceId = data.serviceId || "certificate_of_origin";
    const service = getServiceById(serviceId) || DEFAULT_SERVICES[0];
    const fee = service?.baseFee || 3500;
    const ref = genInvoiceRef();
    const invId = `INV-${Date.now().toString(36).toUpperCase()}`;

    // Create a new unpaid invoice in store
    const newInv: Invoice = {
      id: invId,
      reference: ref,
      customerId: `cust_${Date.now()}`,
      customerName: data.fullName || "Citizen Applicant",
      phone: data.phone || "+234 800 000 0000",
      email: data.email || "citizen@demo.gov.ng",
      levyType: "State of Origin Fee",
      purpose: service.name,
      description: `Statutory fee for ${service.name}`,
      quantity: 1,
      unitPrice: fee,
      amount: fee,
      frequency: "one-off",
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString(),
      status: "unpaid",
      virtualAccount: LGA_CONFIG.payment?.accountNumber || "0123456789",
      qrToken: genQRToken(),
      paymentLink: `/pay/${invId}`,
      createdAt: new Date().toISOString(),
    };
    addInvoice(newInv);

    // Also register an application record in applicationsStore
    const appNo = `DEMO/${service.code || "APP"}/${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}`;
    const newApp: LgaApplication = {
      id: `APP-${Date.now().toString(36).toUpperCase()}`,
      applicationNo: appNo,
      serviceId: service.id,
      serviceName: service.name,
      category: service.category,
      applicant: data.fullName || "Citizen Applicant",
      phone: data.phone || "+234 800 000 0000",
      email: data.email || "citizen@demo.gov.ng",
      address: data.address || "1 Council Boulevard, Demo City",
      ward: data.ward || "Ward 1 (Central Urban)",
      revenueHead: service.revenueHead || "1001 - Statutory Certification",
      amount: fee,
      status: "Invoice Generated",
      paymentStatus: "unpaid",
      invoiceId: invId,
      invoiceNumber: ref,
      qrToken: genQRToken(),
      verificationCode: genVerificationCode(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      details: { ...data },
      documents: [],
      timeline: [
        {
          id: "t1",
          stage: "Submitted",
          title: "Application Submitted",
          description: `Application initiated for ${service.name}`,
          actor: data.fullName || "Citizen",
          actorRole: "citizen",
          timestamp: new Date().toISOString().replace("T", " ").slice(0, 16),
          status: "completed",
        },
        {
          id: "t2",
          stage: "Invoice Generated",
          title: "Statutory Demand Notice Generated",
          description: `Invoice ${ref} for ₦${fee.toLocaleString()} awaiting settlement`,
          actor: "Treasury Dept",
          actorRole: "treasurer",
          timestamp: new Date().toISOString().replace("T", " ").slice(0, 16),
          status: "current",
        },
      ],
    };
    addApplication(newApp);

    return {
      status: 200,
      data: {
        status: "success",
        paymentUrl: `/pay/${invId}`,
        authorizationUrl: `/pay/${invId}`,
        reference: ref,
        invoiceId: invId,
        applicationId: newApp.id,
        data: {
          paymentUrl: `/pay/${invId}`,
          authorizationUrl: `/pay/${invId}`,
          reference: ref,
          invoiceId: invId,
          applicationId: newApp.id,
        },
      },
    };
  }

  // Initialize online payment for existing invoice
  if (path.includes("/pay-online") && method === "POST") {
    const invId = path.split("/")[2];
    const inv = findInvoice(invId);
    const ref = inv ? inv.reference : genInvoiceRef();
    return {
      status: 200,
      data: {
        status: "success",
        paymentUrl: `/pay/${invId}`,
        reference: ref,
        data: {
          paymentUrl: `/pay/${invId}`,
          reference: ref,
        },
      },
    };
  }

  // In-App Payment Simulator (DEV / DEMO MODE)
  if ((path.includes("/simulate-payment") || path.includes("/pay")) && method === "POST") {
    const invId = path.split("/")[2];
    const inv = findInvoice(invId);

    if (!inv) {
      return {
        status: 404,
        data: { status: "error", error: "Invoice not found" },
      };
    }

    const paidAt = new Date().toISOString();
    const rcpNo = genReceiptNumber();
    const qrTok = genQRToken();
    const verCode = genVerificationCode();

    // Mark invoice paid
    updateInvoice(inv.id, {
      status: "paid",
      paidAt,
      paymentMethod: data.method || "online",
    });

    // Create receipt
    const newReceipt = {
      id: `rcp_${Date.now()}`,
      receiptNumber: rcpNo,
      invoiceId: inv.id,
      invoiceRef: inv.reference,
      customerName: inv.customerName,
      phone: inv.phone,
      amount: inv.amount,
      levyType: inv.levyType,
      paymentMethod: (data.method || "online") as any,
      qrToken: qrTok,
      verificationCode: verCode,
      paidAt,
    };
    addReceipt(newReceipt);

    // If there is an associated application, update its status to Payment Confirmed & Approved
    const apps = getApplications();
    const matchedApp = apps.find(
      (a) => a.invoiceId === inv.id || a.invoiceNumber === inv.reference
    );

    let certToken = qrTok;
    if (matchedApp) {
      const certNo = `DEMO/${matchedApp.serviceId.substring(0, 3).toUpperCase()}/${new Date().getFullYear()}/${Math.floor(100000 + Math.random() * 900000)}`;
      certToken = matchedApp.qrToken || qrTok;

      updateApplicationStatus(matchedApp.id, "Approved", {
        paymentStatus: "paid",
        receiptNumber: rcpNo,
        paidAt,
        certificateNumber: certNo,
        issuedAt: paidAt,
        issuedBy: LGA_CONFIG.leadership.chairman.name,
      });

      addNotification({
        title: "Certificate Issued & Payment Received",
        message: `Official Certificate ${certNo} is now active and ready for viewing.`,
        type: "success",
        category: "certificates",
        link: `/certificate/${certToken}`,
      });
    }

    addAudit({
      action: "DEMO_PAYMENT_CONFIRMED",
      details: `Settlement of ₦${inv.amount.toLocaleString()} on invoice ${inv.reference} confirmed via online demo simulator.`,
      userName: inv.customerName,
      userRole: "citizen",
    });

    return {
      status: 200,
      data: {
        status: "confirmed",
        success: true,
        message: "Payment successfully confirmed in Demo Gateway",
        receiptNumber: rcpNo,
        invoiceNumber: inv.reference,
        certificateToken: certToken,
        receipt: newReceipt,
        invoice: { ...inv, status: "paid", paidAt },
        data: {
          status: "confirmed",
          success: true,
          receiptNumber: rcpNo,
          invoiceNumber: inv.reference,
          certificateToken: certToken,
          receipt: newReceipt,
          invoice: { ...inv, status: "paid", paidAt },
        },
      },
    };
  }

  // Verify Payment by reference
  if (path.startsWith("/payments/verify/") && method === "GET") {
    const reference = path.replace("/payments/verify/", "");
    const inv = getInvoices().find((i) => i.reference === reference) || getInvoices()[0];
    const receipts = getReceipts();
    const receipt = receipts.find((r) => r.invoiceRef === reference || (inv && r.invoiceId === inv.id)) || receipts[0];
    const apps = getApplications();
    const app = apps.find((a) => a.invoiceNumber === reference || (inv && a.invoiceId === inv.id)) || apps[0];
    const service = app ? getServiceById(app.serviceId) : DEFAULT_SERVICES[0];

    return {
      status: 200,
      data: {
        status: "confirmed",
        success: true,
        flow: "new_application",
        invoice: inv
          ? {
              ...inv,
              invoiceNumber: inv.reference,
              applicationId: app?.id,
            }
          : null,
        receipt: receipt
          ? {
              receiptNumber: receipt.receiptNumber,
              issuedAt: receipt.paidAt,
            }
          : null,
        application: app
          ? {
              id: app.id,
              applicationNo: app.applicationNo,
              service: { name: app.serviceName },
            }
          : null,
        service: {
          name: service?.name || "Statutory Service",
        },
        data: {
          status: "confirmed",
          success: true,
          flow: "new_application",
          invoice: inv,
          receipt,
          application: app,
          service,
        },
      },
    };
  }

  // =========================================================================
  // 5. STATUTORY APPLICATIONS WORKFLOW
  // =========================================================================
  if (path === "/applications" && method === "GET") {
    const all = getApplications();
    return {
      status: 200,
      data: {
        status: "success",
        data: all,
        applications: all,
      },
    };
  }

  if (path.startsWith("/applications/") && method === "GET") {
    const appId = path.replace("/applications/", "");
    const app = getApplicationById(appId) || getApplications()[0];
    if (!app) {
      return {
        status: 404,
        data: { status: "error", error: "Application not found" },
      };
    }
    return {
      status: 200,
      data: {
        status: "success",
        data: app,
        application: app,
      },
    };
  }

  if (path.startsWith("/applications/") && path.includes("/approve") && method === "POST") {
    const appId = path.split("/")[2];
    const certNo = `DEMO/CRT/${new Date().getFullYear()}/${Math.floor(100000 + Math.random() * 900000)}`;
    const updated = updateApplicationStatus(appId, "Approved", {
      certificateNumber: certNo,
      issuedAt: new Date().toISOString(),
      issuedBy: LGA_CONFIG.leadership.chairman.name,
    });
    return {
      status: 200,
      data: {
        status: "success",
        message: "Application approved and statutory certificate generated",
        data: updated,
      },
    };
  }

  // =========================================================================
  // 6. CERTIFICATES & VERIFICATION
  // =========================================================================
  if (path === "/certificates" && method === "GET") {
    const apps = getApplications().filter((a) => a.certificateNumber || a.status === "Approved" || a.status === "Completed");
    const certs = apps.map((a) => ({
      id: a.id,
      certificateNumber: a.certificateNumber || `DEMO-${a.applicationNo}`,
      applicationId: a.id,
      serviceName: a.serviceName,
      applicantName: a.applicant,
      issuedAt: a.issuedAt || a.createdAt,
      status: "active",
      qrToken: a.qrToken,
    }));
    return {
      status: 200,
      data: {
        status: "success",
        data: certs,
      },
    };
  }

  if (path.startsWith("/certificates/") && method === "GET") {
    const certToken = path.replace("/certificates/", "").trim();
    const apps = getApplications();
    const match =
      apps.find((a) => a.qrToken === certToken || a.certificateNumber === certToken || a.id === certToken || a.verificationCode === certToken) ||
      apps[0];

    if (match) {
      const publicCert = transformApplicationToPublicCertificate(match, certToken);
      return {
        status: 200,
        data: {
          status: "success",
          data: publicCert,
          ...publicCert,
        },
      };
    }
  }

  // =========================================================================
  // 7. OVERVIEW STATS (DASHBOARDS)
  // =========================================================================
  if (path.includes("/overview")) {
    const invs = getInvoices();
    const apps = getApplications();
    const totalCollected = invs.filter((i) => i.status === "paid").reduce((s, i) => s + i.amount, 0);
    const pendingInvoices = invs.filter((i) => i.status !== "paid").length;
    const approvedApps = apps.filter((a) => a.status === "Approved" || a.status === "Completed").length;

    return {
      status: 200,
      data: {
        status: "success",
        data: {
          totalRevenue: totalCollected,
          totalCollected,
          pendingPayments: pendingInvoices,
          approvedApplications: approvedApps,
          totalApplications: apps.length,
          activeNotices: pendingInvoices,
          totalPaid: totalCollected,
          metrics: {
            revenueCollected: totalCollected,
            invoicesCount: invs.length,
            applicationsCount: apps.length,
            activeWards: LGA_CONFIG.wards.length,
          },
        },
      },
    };
  }

  // Default Fallback
  return {
    status: 200,
    data: {
      status: "success",
      message: "Simulated demo response",
      data: {},
    },
  };
}
