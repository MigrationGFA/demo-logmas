// Loads the REAL service + mock layer (axios custom adapter) so we exercise the
// exact code path the UI uses: apiApplications.submitApplication -> axios -> mock.
import { config } from 'dotenv/config';
config({ path: '.env.local' });

// --- Minimal window/localStorage polyfill so "use client" store.ts works ---
const store = new Map();
global.window = global.window || {
  localStorage: {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
    clear: () => store.clear(),
  },
  addEventListener: () => {},
  removeEventListener: () => {},
  dispatchEvent: () => true,
  get location() { return { origin: 'http://localhost:3400', href: 'http://localhost:3400' }; },
};
global.document = { addEventListener: () => {}, removeEventListener: () => {} };

const { api } = await import('./src/lib/api.js');
const { apiApplications } = await import('./src/services/apiApplications.js');
const { invoicesService } = await import('./src/services/apiInvoice.js');

const log = (...a) => console.log('[harness5]', ...a);

// Pre-seed a test auth user so citizen-scoped dashboard counts work.
store.set('logmas.auth.user', JSON.stringify({ id: 'usr_citizen_001', role: 'citizen', fullName: 'Dr. Babatunde Adeleke' }));
store.set('logmas.auth.token', 'demo-offline-session-token');

// 1. Submit an application (real service + mock adapter path)
const res = await apiApplications.submitApplication({
  serviceId: 'certificate_of_origin',
  applicantId: 'usr_citizen_001',
  formData: {
    fullName: 'Adeola Test Citizen', phone: '08030001112', email: 'adeola.test@example.com',
    address: '1 Test Crescent, Ikenne', ward: 'Ikenne Ward', nin: '12345678901234567',
    dob: '1992-04-15', gender: 'Female', maritalStatus: 'Married', occupation: 'Teacher',
    fatherName: 'James Test', fatherCompound: 'Test Compound', fatherVillage: 'Ijebu-Ode',
    motherName: 'Mary Test', motherCompound: 'Test Compound II', motherVillage: 'Ikenne',
    familyBaale: 'Chief Test', purpose: 'Employment', previousApplication: 'No',
  },
  files: { passport_photo: { name: 'passport.jpg' }, nin_slip: { name: 'nin.pdf' }, proof_of_residency: { name: 'utility.pdf' } },
});
log('submit response keys:', Object.keys(res));
log('application.applicationNumber =', res?.application?.applicationNumber);
log('invoice.invoiceNumber =', res?.invoice?.invoiceNumber);
log('invoice.amount =', res?.invoice?.amount);

const appNum = res?.application?.applicationNumber;
const invNum = res?.invoice?.invoiceNumber || res?.invoice?.reference;
const invId = res?.invoice?.id;

if (!appNum || !invNum) { log('FAIL: missing app/invoice numbers'); process.exit(1); }

// 2. Fetch the invoice detail (real GET through mock adapter)
const inv = await invoicesService.getInvoiceById(invNum);
log('GET invoice.status =', inv?.status || inv?.paymentStatus);
log('GET invoice.amount =', inv?.amount, 'balanceDue =', inv?.balanceDue);
log('GET invoice.application =', inv?.application ? 'linked' : 'null');
log('GET invoice.virtualAccountNumber =', inv?.virtualAccountNumber);

// 3. Pay online (real service -> Paystack API route -> local settle fallback)
const init = await invoicesService.initializeOnlinePayment(invId);
log('initializeOnlinePayment reference =', init?.reference);

// 4. Verify the payment reference (real service -> mock /payments/verify/:ref)
const verified = await invoicesService.verifyPayment(invNum);
log('verifyPayment status =', verified?.status, 'paid =', verified?.paid, 'source =', verified?.source);

// 5. Re-fetch invoice — confirm paid + receipt issued
const invPaid = await invoicesService.getInvoiceById(invNum);
log('post-payment invoice.status =', invPaid?.status || invPaid?.paymentStatus);
log('post-payment receipt =', invPaid?.receipt?.receiptNumber || '(none)');
log('post-payment verificationCode =', invPaid?.receipt?.verificationCode || '(none)');

// 6. Overview consistency
const overview = await api.get('/dashboard/overview');
log('GET /dashboard/overview -> approvedApplications =', overview?.metrics?.approvedApplications ?? overview?.stats?.approvedApplications);
log('GET /dashboard/overview -> recentApplications count =', (overview?.recentApplications || overview?.recentApps || []).length);

// 7. Applications list fetch (citizen-scoped)
const appsList = await api.get('/applications');
log('GET /applications -> count =', Array.isArray(appsList) ? appsList.length : '(non-array)');

console.log('\\n=== E2E VERDICT ===');
console.log('submit OK:', !!appNum);
console.log('invoice OK:', !!invNum, 'amount:', inv?.amount);
console.log('verify OK:', verified?.verified || verified?.paid, 'status:', verified?.status);
console.log('receipt OK:', !!invPaid?.receipt?.receiptNumber);
