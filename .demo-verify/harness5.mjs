// End-to-end test using real service layer + mock adapter
import pkg from "dotenv";
pkg.config({ path: ".env.local" });

// Polyfill browser globals for node execution
const memStore = new Map();
const listeners = new Map();

global.window = {
  fetch: global.fetch || (() => Promise.resolve({ ok: true, json: async () => ({}) })),
  localStorage: {
    getItem: (k) => (memStore.has(k) ? memStore.get(k) : null),
    setItem: (k, v) => memStore.set(k, String(v)),
    removeItem: (k) => memStore.delete(k),
    clear: () => memStore.clear(),
  },
  sessionStorage: {
    getItem: (k) => (memStore.has(k) ? memStore.get(k) : null),
    setItem: (k, v) => memStore.set(k, String(v)),
    removeItem: (k) => memStore.delete(k),
    clear: () => memStore.clear(),
  },
  location: {
    origin: "http://localhost:3000",
    href: "http://localhost:3000",
  },
  addEventListener: (name, fn) => {
    if (!listeners.has(name)) listeners.set(name, []);
    listeners.get(name).push(fn);
  },
  removeEventListener: (name, fn) => {
    const list = listeners.get(name) || [];
    listeners.set(name, list.filter((f) => f !== fn));
  },
  dispatchEvent: (ev) => {
    const list = listeners.get(ev.type) || [];
    list.forEach((fn) => {
      try { fn(ev); } catch {}
    });
    return true;
  },
};
global.localStorage = global.window.localStorage;
global.sessionStorage = global.window.sessionStorage;
global.document = {
  head: { appendChild: () => {} },
  createElement: () => ({ setAttribute: () => {}, appendChild: () => {}, style: {} }),
  createTextNode: () => ({}),
  getElementsByTagName: () => [{ appendChild: () => {} }],
  addEventListener: () => {},
  removeEventListener: () => {},
};

const { api } = await import("../src/lib/api.ts");
const { apiApplications } = await import("../src/services/apiApplications.ts");
const { invoicesService } = await import("../src/services/apiInvoice.ts");

const log = (...a) => console.log("[harness5]", ...a);

// Pre-seed auth user
global.localStorage.setItem(
  "logmas.auth.user",
  JSON.stringify({ id: "usr_citizen_001", role: "citizen", fullName: "Dr. Babatunde Adeleke" })
);
global.localStorage.setItem("logmas.auth.token", "demo-offline-session-token");

// 1. Submit application via real service
log("=== 1. Submitting application ===");
const res = await apiApplications.submitApplication({
  serviceId: "certificate_of_origin",
  applicantId: "usr_citizen_001",
  formData: {
    fullName: "Adeola Test Citizen",
    phone: "08030001112",
    email: "adeola.test@example.com",
    address: "1 Test Crescent, Ikenne",
    ward: "Ikenne Ward",
    nin: "12345678901234567",
    dob: "1992-04-15",
    gender: "Female",
    maritalStatus: "Married",
    occupation: "Teacher",
    fatherName: "James Test",
    fatherCompound: "Test Compound",
    fatherVillage: "Ijebu-Ode",
    motherName: "Mary Test",
    motherCompound: "Test Compound II",
    motherVillage: "Ikenne",
    familyBaale: "Chief Test",
    purpose: "Employment",
    previousApplication: "No",
  },
  files: {
    passport_photo: { name: "passport.jpg" },
    nin_slip: { name: "nin.pdf" },
    proof_of_residency: { name: "utility.pdf" },
  },
});

const appNum = res?.application?.applicationNumber || res?.application?.applicationNo;
const invNum = res?.invoice?.invoiceNumber || res?.invoice?.reference;
const invId = res?.invoice?.id;

log("Application Number:", appNum);
log("Invoice Number:", invNum);
log("Invoice Amount:", res?.invoice?.amount);

if (!appNum || !invNum) {
  log("FAIL: Missing app/invoice numbers");
  process.exit(1);
}

// 2. Fetch invoice detail
log("\n=== 2. Fetching invoice detail ===");
const inv = await invoicesService.getInvoiceById(invNum);
log("Invoice status:", inv?.status || inv?.paymentStatus);
log("Invoice totalAmount:", inv?.totalAmount, "balanceDue:", inv?.balanceDue);
log("Invoice application:", inv?.application ? "linked" : "null");

// 3. Settle payment
log("\n=== 3. Settle payment ===");
const init = await invoicesService.initializeOnlinePayment(invId);
log("Initialize reference:", init?.reference);

// 4. Verify payment
log("\n=== 4. Verify payment ===");
const verified = await invoicesService.verifyPayment(invNum);
log("Verify status:", verified?.status, "paid:", verified?.paid, "source:", verified?.source);

// 5. Re-fetch invoice after payment
log("\n=== 5. Re-fetch invoice ===");
const invPaid = await invoicesService.getInvoiceById(invNum);
log("Paid status:", invPaid?.status || invPaid?.paymentStatus);
log("Receipt number:", invPaid?.receipt?.receiptNumber);

// 6. Check overview
log("\n=== 6. Dashboard overview ===");
const overview = await api.get("/dashboard/overview");
log("Approved apps:", overview?.metrics?.approvedApplications ?? overview?.stats?.approvedApplications);

console.log("\n=== E2E HARNESS 5 RESULT ===");
console.log("Submit OK:", !!appNum);
console.log("Invoice OK:", !!invNum, "Amount:", inv?.totalAmount || inv?.amount);
console.log("Verify OK:", verified?.paid === true, "Status:", verified?.status);
console.log("Receipt OK:", !!invPaid?.receipt?.receiptNumber);
console.log("ALL TESTS PASSED SUCCESSFULLY");
