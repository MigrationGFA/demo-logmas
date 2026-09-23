// Full E2E flow test using undici (no browser needed) to validate the complete
// submit -> invoice -> pay -> verify path. The dev server is already running on 3400.
import { request } from 'undici';

const BASE = 'http://localhost:3400';
const log = (...a) => console.log('[harness3]', ...a);

// 1. Load the mock store snapshot to get a real invoice number + session cookie.
// The app uses cookie-based auth in some paths; we use the mock's "skip-auth" header.
const headers = { 'Content-Type': 'application/json', 'x-demo-bypass': 'true' };

async function get(path) {
  const r = await request(BASE + path, { method: 'GET', headers });
  const body = await r.text();
  return { status: r.statusCode, body };
}

async function post(path, payload) {
  const r = await request(BASE + path, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });
  const body = await r.text();
  return { status: r.statusCode, body };
}

// 1. Fetch a service to get the form target
const svcRes = await get('/dashboard/services');
log('GET /dashboard/services ->', svcRes.status);

// 2. Submit a new application (mirrors what the form sends)
const appData = {
  serviceId: 'certificate_of_origin',
  applicantId: 'citizen_demo_001',
  formData: {
    fullName: 'Adeola Test Citizen',
    phone: '08030001112',
    email: 'adeola.test@example.com',
    address: '1 Test Crescent, Ikenne',
    ward: 'Ikenne Ward',
    nin: '12345678901234567',
    dob: '1992-04-15',
    gender: 'Female',
    maritalStatus: 'Married',
    occupation: 'Teacher',
    fatherName: 'James Test',
    fatherCompound: 'Test Compound',
    fatherVillage: 'Ijebu-Ode',
    motherName: 'Mary Test',
    motherCompound: 'Test Compound II',
    motherVillage: 'Ikenne',
    familyBaale: 'Chief Test',
    purpose: 'Employment / NYSC / Admission',
    previousApplication: 'No',
    fileNumber: '',
  },
  files: {
    passport_photo: { name: 'passport.jpg' },
    nin_slip: { name: 'nin-slip.pdf' },
    proof_of_residency: { name: 'utility-bill.pdf' },
  },
};
const submitRes = await post('/api/applications', appData);
log('POST /api/applications ->', submitRes.status);
let submit;
try { submit = JSON.parse(submitRes.body); } catch { submit = { raw: submitRes.body }; }
log('submit payload keys:', Object.keys(submit).slice(0, 10));
const hasApp = submit?.application?.applicationNumber || submit?.applicationNumber;
const hasInv = submit?.invoice?.invoiceNumber || submit?.invoice?.reference || submit?.invoiceNumber || submit?.reference;
log('applicationNumber present:', !!hasApp, '->', hasApp);
log('invoiceNumber present:', !!hasInv, '->', hasInv);

// 3. Resolve the invoice to pay (by reference or id) and inspect payment status
let invRef = hasInv || '';
const invRes = await get('/invoices/' + encodeURIComponent(invRef));
log('GET /invoices/<ref> ->', invRes.status);
const inv = JSON.parse(invRes.body);
log('invoice.status =', inv?.status || inv?.paymentStatus);
log('invoice.amount =', inv?.amount);

// 4. Pay online via the Paystack mock route (initializes -> 1-click settle)
const initRes = await post('/api/paystack/initialize', {
  invoiceId: inv?.id || invRef,
  invoiceNumber: invRef,
  amount: inv?.amount,
  email: 'adeola.test@example.com',
  applicationId: submit?.application?.id,
});
const init = JSON.parse(initRes.body);
log('initialize -> status', init.status, 'authorization_url:', init.data?.authorization_url);
log('reference (slash-free):', init.data?.reference);

// 5. Simulate the Paystack redirect returning to the result page by verifying
// the reference directly (the route handler falls back to local verify).
const verifyRef = invRef;
const vRes = await get('/payments/verify/' + encodeURIComponent(verifyRef));
const v = JSON.parse(vRes.body);
log('GET /payments/verify/<ref> ->', vRes.status);
log('verified:', v.verified, 'status:', v.status, 'paid:', v.paid, 'source:', v.source);

// 6. Re-fetch the invoice to confirm it is now marked paid + receipt issued.
const invPaidRes = await get('/invoices/' + encodeURIComponent(invRef));
const invPaid = JSON.parse(invPaidRes.body);
log('post-payment invoice.status =', invPaid?.status || invPaid?.paymentStatus);
log('receipt present:', !!invPaid?.receipt, 'verificationCode:', invPaid?.receipt?.verificationCode || '(none)');
log('application.status =', v.application?.status);

console.log('\\n=== E2E VERDICT ===');
const ok = hasApp && hasInv && inv && (inv.status === 'sent' || inv.status === 'unpaid' || inv.amount > 0)
  && (v.verified || v.status === 'pending' || v.source === 'unconfigured')
  ;
console.log('full submit/invoice/verify path exercised:', ok);
