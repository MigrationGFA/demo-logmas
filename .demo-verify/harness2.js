/* End-to-end test body: exercises the full demo flow through the mock handler. */
const { handler, appsStore, lls } = require("./harness1.js");

let pass = 0, fail = 0;
function check(name, cond, extra = "") {
  if (cond) { pass++; console.log("  OK  " + name); }
  else { fail++; console.log("  FAIL " + name + "  " + extra); }
}

async function req(method, url, body) {
    const res = await handler.handleMockApiRequest({ method, url, data: body });
  // Mock returns the axios-style response envelope; real api.ts unwraps .data.data.
  if (res && res.data && typeof res.data === "object" && "data" in res.data) return res.data.data;
  if (res && "data" in res) return res.data;
  return res;
}

(async function main() {
  console.log("\n=== STEP 1: Citizen submits application ===");
  const submit = await req("POST", "/applications", {
    serviceId: "certificate_of_origin",
    service: { id: "certificate_of_origin", name: "Certificate of Origin" },
    applicantId: "usr_citizen_001",
    formData: { fullName: "Adeola Adesanya", phone: "+2348011112222", email: "adeola@demo.ng", address: "23 Liberty Road", ward: "Ward 1 - Central Urban", nin: "12345678901234567", gender: "Female", fatherName: "Pa Adesanya", fatherCompound: "Adesanya Compound", motherName: "Mama Adesanya", purpose: "Passport" },
    files: { passport_photo: { name: "passport.jpg" } },
  });
  console.log("submit =", JSON.stringify(submit).slice(0, 200));
  const app = submit.application;
  const inv = submit.invoice;
  check("submit returns application", !!app);
  check("submit returns invoice", !!inv);
  check("applicationNumber present (APP/..)", !!app && !!app.applicationNumber && app.applicationNumber.startsWith("APP/"), "got: " + (app && app.applicationNumber));
  check("invoiceNumber present (INV-..)", !!inv && !!inv.invoiceNumber && inv.invoiceNumber.startsWith("INV-"), "got: " + (inv && inv.invoiceNumber));
  check("application status = Awaiting Payment", app && app.status === "Awaiting Payment", "got: " + (app && app.status));
  check("invoice unpaid", inv && (inv.status === "pending" || inv.status === "unpaid") && inv.paymentStatus !== "paid", "got: " + (inv && inv.status));

  console.log("\n=== STEP 2: View invoice ===");
  const invView = await req("GET", "/invoices/" + inv.invoiceNumber);
  check("invoice lookup by number works", !!invView, JSON.stringify(invView).slice(0, 120));
  check("invoice totalAmount correct", invView && Number(invView.totalAmount) === inv.amount, "got: " + (invView && invView.totalAmount) + " vs " + inv.amount);
  check("invoice linked to application", invView && invView.applicationId === app.id, "" + (invView && invView.applicationId));

  console.log("\n=== STEP 3: Paystack settle (server route mirrors to localStorage) ===");
  const ref = "PST-" + inv.invoiceNumber + "-" + Date.now();
  const settle = await req("POST", "/invoices/" + inv.invoiceNumber + "/settle-payment", { reference: ref, method: "online", payerName: "Adeola Adesanya" });
  console.log("settle =", JSON.stringify(settle).slice(0, 200));
  const settleInv = settle.invoice || settle;
  check("settle-payment marks invoice paid", settleInv.status === "paid" || settleInv.paymentStatus === "paid", JSON.stringify(settle).slice(0, 120));
  lls.setItem("logmas.paystack.ref." + ref, JSON.stringify({ ...invView }));

  console.log("\n=== STEP 4: Verify payment via /payments/verify/:ref ===");
  const verified = await req("GET", "/payments/verify/" + ref);
  console.log("verified =", JSON.stringify(verified).slice(0, 200));
  check("payment verified true", verified.verified === true, JSON.stringify(verified).slice(0, 150));
  check("verify status paid/confirmed", ["confirmed", "paid", "success"].includes(verified.status), "got: " + verified.status);

  console.log("\n=== STEP 5: Invoice reflects paid + receipt ===");
  const invPaid = await req("GET", "/invoices/" + inv.invoiceNumber);
  check("invoice paid", invPaid.paymentStatus === "paid" || invPaid.status === "paid", "" + invPaid.status);
  check("receipt issued", invPaid.receipt && invPaid.receipt.receiptNumber, JSON.stringify(invPaid.receipt).slice(0, 80));

  console.log("\n=== STEP 6: Application advances to Payment Confirmed ===");
  const appsList = appsStore.getLgaApplications();
  const found = appsList.find(a => a.id === app.id);
  check("app exists in list", !!found);
  check("app status advanced past Awaiting Payment", found && found.status !== "Awaiting Payment" && found.status !== "Submitted", "got: " + (found && found.status));
  check("app paymentStatus = paid", found && found.paymentStatus === "paid", "got: " + (found && found.paymentStatus));

  console.log("\n=== STEP 7: Treasurer configures fee ===");
  const feeSave = await req("POST", "/treasurer/fees/configure", { serviceId: "certificate_of_origin", amount: 50000, status: "ACTIVE" });
  console.log("feeSave =", JSON.stringify(feeSave).slice(0, 200));
  check("treasurer fee saved", feeSave && (feeSave.success === true || feeSave.saved === true || feeSave.status === "success"), JSON.stringify(feeSave).slice(0, 120));

  console.log("\n=== STEP 8: New app uses treasured fee ===");
  const submit2 = await req("POST", "/applications", { serviceId: "certificate_of_origin", formData: { fullName: "Bisi Obafunke" } });
  check("new app uses configured fee (50000)", submit2.invoice && Number(submit2.invoice.amount) === 50000, "got: " + (submit2.invoice && submit2.invoice.amount));

  console.log("\n=== STEP 9: Overview counts approved application ===");
  lls.setItem("logmas.auth.user", JSON.stringify({ id: "usr_citizen_001", role: "citizen" }));
  const overview = await req("GET", "/dashboard/overview");
  console.log("overview metrics.approvedApplications =", overview && overview.metrics && overview.metrics.approvedApplications);
  check("overview approvedApplications >= 1", overview && overview.metrics && overview.metrics.approvedApplications >= 1, "got: " + (overview && overview.metrics && overview.metrics.approvedApplications));

  console.log("\n=== RESULT: " + pass + " passed, " + fail + " failed ===\n");
  process.exit(fail > 0 ? 1 : 0);
})().catch(e => { console.error("HARNESS ERROR:", e && e.stack ? e.stack : e); process.exit(1); });
