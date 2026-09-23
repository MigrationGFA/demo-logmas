// End-to-end flow test using native fetch (Node 18+).
const BASE = 'http://localhost:3400';
const log = (...a) => console.log('[harness4]', ...a);
const headers = { 'Content-Type': 'application/json', 'x-demo-bypass': 'true' };

const get = async (path) => {
  const r = await fetch(BASE + path, { method: 'GET', headers });
  return { status: r.status, body: await r.text() };
};
const post = async (path, payload) => {
  const r = await fetch(BASE + path, { method: 'POST', headers, body: JSON.stringify(payload) });
  return { status: r.status, body: await r.text() };
};

// 1. Submit a new application
const appData = {
  serviceId: 'certificate_of_origin',
  applicantId: 'citizen_demo_001',
  formData: {
    fullName: 'Adeola Test Citizen', phone: '08030001112', email: 'adeola.test@example.com',
    address: '1 Test Crescent, Ikenne', ward: 'Ikenne Ward', nin: '12345678901234567',
    dob: '1992-04-15', gender: 'Female', maritalStatus: 'Married', occupation: 'Teacher',
    fatherName: 'James Test', fatherCompound: 'Test Compound', fatherVillage: 'Ijebu-Ode',
    motherName: 'Mary Test', motherCompound: 'Test Compound II', motherVillage: 'Ikenne',
    familyBaale: 'Chief Test', purpose: 'Employment / NYSC / Admission', previousApplication: 'No',
  },
  files: {
    passport_photo: { name: 'passport.jpg' },
    nin_slip: { name: 'nin-slip.pdf' },
    proof_of_residency: { name: 'utility-bill.pdf' },
  },
};
const submitRes = await post('/api/applications', appData);
log('POST /api/applications ->', submitRes.status);
let submit; try { submit = JSON.parse(submitRes.body); } catch { submit = { raw: submitRes.body }; }
log('keys:', Object.keys(submit).slice(0, 10));
const hasApp = submit?.application?.applicationNumber || submit?.applicationNumber;
const hasInv = submit?.invoice?.invoiceNumber || submit?.invoice?.reference || submit?.invoiceNumber || submit?.reference;
log('applicationNumber present:', !!hasApp, '->', hasApp);
log('invoiceNumber present:', !!hasInv, '->', hasInv);

// 2. Fetch the invoice
let invRef = hasInv || '';
const invRes = await get('/invoices/' + encodeURIComponent(invRef));
log('GET /invoices/<ref> ->', invRes.status);
const inv = JSON.parse(invRes.body);
log('invoice.status =', inv?.status || inv?.paymentStatus);
log('invoice.amount =', inv?.amount);

// 3. Pay online (Paystack mock route, falls back to local settle when unconfigured)
const initRes = await post('/api/paystack/initialize', {
  invoiceId: inv?.id || invRef, invoiceNumber: invRef,
  amount: inv?.amount, email: 'adeola.test@example.com',
  applicationId: submit?.application?.id,
});
const init = JSON.parse(initRes.body);
log('initialize -> status', init.status, 'authorization_url:', init.data?.authorization_url);
log('reference (slash-free):', init.data?.reference);

// 4. Verify the payment reference
const vRes = await get('/payments/verify/' + encodeURIComponent(invRef));
const v = JSON.parse(vRes.body);
log('GET /payments/verify/<ref> ->', vRes.status);
log('verified:', v.verified, 'status:', v.status, 'paid:', v.paid, 'source:', v.source);

// 5. Re-fetch invoice to confirm paid state
const invPaidRes = await get('/invoices/' + encodeURIComponent(invRef));
const invPaid = JSON.parse(invPaidRes.body);
log('post-payment invoice.status =', invPaid?.status || invPaid?.paymentStatus);
log('receipt present:', !!invPaid?.receipt, 'verificationCode:', invPaid?.receipt?.verificationCode || '(none)');

// 6. Dashboard overview consistency check
const ovRes = await get('/dashboard/overview');
log('GET /dashboard/overview ->', ovRes.status);
const ov = JSON.parse(ovRes.body);
if (ov?.stats) log('overview approvedApplications:', ov.stats.approvedApplications);
if (ov?.recentApplications) log('overview recentApplications count:', ov.recentApplications.length);
if (ov?.metrics) log('overview citizenMetrics.approvedApplications:', ov.metrics?.approvedApplications);

console.log('\\n=== E2E VERDICT ===');
const ok = hasApp && hasInv && inv && (inv.status !== 'failed');
console.log('submit/invoice/verify path exercised:', ok);
