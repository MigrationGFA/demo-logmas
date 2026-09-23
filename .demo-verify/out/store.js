/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.genId = exports.genVirtualAccount = exports.genQRToken = exports.genVerificationCode = exports.genReceiptNumber = exports.genInvoiceRef = exports.REVENUE_CATEGORIES = exports.PERMIT_TYPES = void 0;
exports.getStore = getStore;
exports.setStore = setStore;
exports.resetStore = resetStore;
exports.getStoreSnapshot = getStoreSnapshot;
exports.useStore = useStore;
exports.addCustomer = addCustomer;
exports.upsertLevy = upsertLevy;
exports.deleteLevy = deleteLevy;
exports.createInvoice = createInvoice;
exports.markInvoicePaid = markInvoicePaid;
exports.createOfficer = createOfficer;
exports.setOfficerStatus = setOfficerStatus;
exports.addNotification = addNotification;
exports.markNotificationRead = markNotificationRead;
exports.markAllNotificationsRead = markAllNotificationsRead;
exports.addAudit = addAudit;
exports.findByQrOrCode = findByQrOrCode;
exports.findInvoiceByRef = findInvoiceByRef;
exports.createPermit = createPermit;
exports.issuePermit = issuePermit;
exports.findPermitByToken = findPermitByToken;
exports.upsertPermitConfig = upsertPermitConfig;
exports.deletePermitConfig = deletePermitConfig;
exports.togglePermitConfigActive = togglePermitConfigActive;
const react_1 = require("react");
exports.PERMIT_TYPES = [
    { type: "General Trade Permit", fee: 10000, validity: 12 },
    { type: "Shop Permit", fee: 12000, validity: 12 },
    { type: "Market Trader Permit", fee: 7500, validity: 12 },
    { type: "Food Vendor Permit", fee: 9000, validity: 12 },
    { type: "Commercial Operator Permit", fee: 25000, validity: 12 },
    { type: "SME Permit", fee: 20000, validity: 12 },
    { type: "Corporate Business Permit", fee: 75000, validity: 12 },
    { type: "Mobile Trader Permit", fee: 5000, validity: 6 },
    { type: "Artisan Permit", fee: 6000, validity: 12 },
    { type: "Temporary Event Permit", fee: 15000, validity: 1 },
];
exports.REVENUE_CATEGORIES = [
    { value: "trade_permit", label: "Trade Permit" },
    { value: "event_permit", label: "Event Permit" },
    { value: "shop_permit", label: "Shop Permit" },
    { value: "signage_permit", label: "Signage Permit" },
    { value: "market_levy", label: "Market Levy" },
    { value: "environmental_levy", label: "Environmental Levy" },
    { value: "haulage_levy", label: "Haulage Levy" },
    { value: "parking_levy", label: "Parking Levy" },
    { value: "business_levy", label: "Business Levy" },
    { value: "lockup_levy", label: "Lockup Levy" },
    { value: "other", label: "Other" },
];
const KEY = "logmas.store.v3";
const EVT = "logmas:store-change";
// ============== Helpers ==============
const rand = (n = 6) => Math.random().toString(36).slice(2, 2 + n).toUpperCase();
const today = () => new Date().toISOString();
const datePart = () => new Date().toISOString().slice(0, 10).replace(/-/g, "");
const genInvoiceRef = () => `DEMO/INV/${new Date().getFullYear()}/${rand(6)}`;
exports.genInvoiceRef = genInvoiceRef;
const genReceiptNumber = () => `DEMO/RCP/${new Date().getFullYear()}/${rand(6)}`;
exports.genReceiptNumber = genReceiptNumber;
const genVerificationCode = () => `DEMO-VCODE-${rand(6)}`;
exports.genVerificationCode = genVerificationCode;
const genQRToken = () => `QR-DEMO-${rand(8)}`;
exports.genQRToken = genQRToken;
const genVirtualAccount = () => `99${Math.floor(10000000 + Math.random() * 89999999)}`;
exports.genVirtualAccount = genVirtualAccount;
const genId = () => `demo-${Date.now().toString(36)}${rand(4)}`;
exports.genId = genId;
// ============== Seed data ==============
const WARDS = ["Atan", "Ojowo", "Owu", "Ososa", "Imuwo", "Ikija", "Ife", "Itele", "Mamu"];
function seed() {
    const customers = [
        { id: "c1", name: "Bola Enterprises", phone: "+2348012345678", email: "bola@example.com", address: "23 Atan Market Road", businessName: "Bola Enterprises", ward: "Atan", createdAt: today() },
        { id: "c2", name: "Ade Logistics", phone: "+2348022345678", email: "ade@example.com", address: "12 Owu Street", businessName: "Ade Logistics Ltd", ward: "Owu", createdAt: today() },
        { id: "c3", name: "Funke Stores", phone: "+2348032345678", email: "funke@example.com", address: "Shop 4 Ojowo Market", businessName: "Funke Stores", ward: "Ojowo", createdAt: today() },
        { id: "c4", name: "Sunshine Mart", phone: "+2348042345678", email: "sun@example.com", address: "5 Ososa Junction", businessName: "Sunshine Mart", ward: "Ososa", createdAt: today() },
        { id: "c5", name: "Fast Movers Ltd", phone: "+2348052345678", email: "fast@example.com", address: "Park A, Itele", businessName: "Fast Movers Ltd", ward: "Itele", createdAt: today() },
        { id: "c6", name: "Ojowo Traders Coop", phone: "+2348062345678", email: "ojowo@example.com", address: "Trade Hall, Ojowo", businessName: "Ojowo Traders", ward: "Ojowo", createdAt: today() },
    ];
    const levies = [
        { id: "l1", category: "Market Levy", description: "Daily market stall fee", mode: "fixed", unitPrice: 500, frequency: "daily", active: true },
        { id: "l2", category: "Haulage Levy", description: "Per-trip haulage levy", mode: "fixed", unitPrice: 5000, frequency: "one-off", active: true },
        { id: "l3", category: "Environmental Levy", description: "Sanitation contribution", mode: "fixed", unitPrice: 1200, frequency: "monthly", active: true },
        { id: "l4", category: "Lockup Store Levy", description: "Locjkup shop levy", mode: "fixed", unitPrice: 1500, frequency: "monthly", active: true },
        { id: "l5", category: "Parking Levy", description: "Vehicle parking levy", mode: "fixed", unitPrice: 300, frequency: "daily", active: true },
        { id: "l6", category: "Business Levy", description: "Business permit", mode: "variable", unitPrice: 15000, frequency: "yearly", active: true },
        { id: "l7", category: "Signage Permit", description: "Signboard / advertisement", mode: "variable", unitPrice: 8000, frequency: "yearly", active: true },
        { id: "l8", category: "Other", description: "Miscellaneous levies", mode: "variable", unitPrice: 1000, frequency: "one-off", active: true },
    ];
    const mkInv = (over) => ({
        id: (0, exports.genId)(), reference: (0, exports.genInvoiceRef)(), customerId: "c1", customerName: "Bola Enterprises",
        phone: "+2348012345678", levyType: "Market Levy", purpose: "Market stall", quantity: 1,
        unitPrice: 500, amount: 500, frequency: "daily", dueDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
        status: "unpaid", virtualAccount: (0, exports.genVirtualAccount)(), qrToken: (0, exports.genQRToken)(),
        paymentLink: "", officerName: "Tunji Field", officerId: "of1",
        createdAt: today(), ...over,
    });
    const invoices = [
        mkInv({ customerId: "c1", customerName: "Bola Enterprises", phone: "+2348012345678", levyType: "Market Levy", purpose: "Market stall (May)", quantity: 25, unitPrice: 500, amount: 12500, status: "paid", paidAt: today(), paymentMethod: "transfer" }),
        mkInv({ customerId: "c2", customerName: "Ade Logistics", phone: "+2348022345678", levyType: "Haulage Levy", purpose: "Truck trips", quantity: 9, unitPrice: 5000, amount: 45000, status: "unpaid" }),
        mkInv({ customerId: "c3", customerName: "Funke Stores", phone: "+2348032345678", levyType: "Lockup Store Levy", purpose: "Shop 4  -  Ojowo", quantity: 1, unitPrice: 8000, amount: 8000, status: "overdue", dueDate: "2026-04-29" }),
        mkInv({ customerId: "c4", customerName: "Sunshine Mart", phone: "+2348042345678", levyType: "Market Levy", purpose: "Stall block C", quantity: 13, unitPrice: 500, amount: 6500, status: "paid", paidAt: today(), paymentMethod: "pos" }),
        mkInv({ customerId: "c5", customerName: "Fast Movers Ltd", phone: "+2348052345678", levyType: "Haulage Levy", purpose: "Park dues", quantity: 12, unitPrice: 5000, amount: 60000, status: "unpaid" }),
        mkInv({ customerId: "c6", customerName: "Ojowo Traders Coop", phone: "+2348062345678", levyType: "Market Levy", purpose: "Daily stall  -  coop", quantity: 9, unitPrice: 500, amount: 4500, status: "paid", paidAt: today(), paymentMethod: "cash" }),
    ];
    const receipts = invoices.filter((i) => i.status === "paid").map((i) => ({
        id: (0, exports.genId)(),
        receiptNumber: (0, exports.genReceiptNumber)(),
        invoiceId: i.id,
        invoiceRef: i.reference,
        customerName: i.customerName,
        phone: i.phone,
        amount: i.amount,
        levyType: i.levyType,
        paymentMethod: i.paymentMethod || "transfer",
        officerId: i.officerId,
        officerName: i.officerName,
        qrToken: i.qrToken,
        verificationCode: (0, exports.genVerificationCode)(),
        paidAt: i.paidAt || today(),
    }));
    const officers = [
        { id: "of1", name: "Tunji Field", email: "field@logmas.gov.ng", phone: "+2348070000001", ward: "Atan", levies: ["Market Levy", "Parking Levy"], status: "active", createdBy: "Olumide Admin", createdByRole: "lga_admin", totalCollected: 245000, invoicesIssued: 32, createdAt: today() },
        { id: "of2", name: "Kemi Adesina", email: "kemi.field@logmas.gov.ng", phone: "+2348070000002", ward: "Ojowo", levies: ["Lockup Store Levy", "Business Levy"], status: "active", createdBy: "Femi Agent", createdByRole: "contractor", contractorId: "ag1", totalCollected: 128000, invoicesIssued: 18, createdAt: today() },
        { id: "of3", name: "Bayo Salami", email: "bayo.field@logmas.gov.ng", phone: "+2348070000003", ward: "Owu", levies: ["Haulage Levy"], status: "suspended", createdBy: "Olumide Admin", createdByRole: "lga_admin", totalCollected: 86000, invoicesIssued: 9, createdAt: today() },
    ];
    const notifications = [
        { id: (0, exports.genId)(), title: "Welcome to LOGMAS", body: "Your dashboard is ready.", type: "info", read: false, createdAt: today() },
    ];
    const expiry = new Date();
    expiry.setMonth(expiry.getMonth() + 12);
    const permits = [
        { id: "p1", permitNumber: `TP-${datePart()}-A1B2`, businessName: "Bola Enterprises", ownerName: "Bola Adekunle", phone: "+2348012345678", email: "bola@example.com", address: "23 Atan Market Road", ward: "Atan", category: "Retail", permitType: "Shop Permit", description: "General provisions store", status: "issued", fee: 12000, qrToken: (0, exports.genQRToken)(), verificationCode: (0, exports.genVerificationCode)(), issuedBy: "Olumide Admin", issueDate: today(), expiryDate: expiry.toISOString(), createdAt: today() },
        { id: "p2", permitNumber: `TP-${datePart()}-C3D4`, businessName: "Funke Stores", ownerName: "Funke Olawale", phone: "+2348032345678", email: "funke@example.com", address: "Shop 4 Ojowo Market", ward: "Ojowo", category: "Market Trader", permitType: "Market Trader Permit", status: "pending_payment", fee: 7500, qrToken: (0, exports.genQRToken)(), verificationCode: (0, exports.genVerificationCode)(), createdAt: today() },
    ];
    const permitConfigs = [
        { id: "pc1", name: "Annual Trade Permit  -  Retail", code: "ATP_RETAIL", baseAmount: 12000, category: "trade_permit", isActive: true, createdAt: today() },
        { id: "pc2", name: "Event Permit  -  Plaza", code: "EVT_PLAZA", baseAmount: 25000, category: "event_permit", isActive: true, createdAt: today() },
        { id: "pc3", name: "Shop Permit  -  Lockup", code: "SHOP_LOCKUP", baseAmount: 15000, category: "shop_permit", isActive: true, createdAt: today() },
        { id: "pc4", name: "Signage Permit  -  Standard", code: "SIGN_STD", baseAmount: 8000, category: "signage_permit", isActive: false, createdAt: today() },
    ];
    return { customers, levies, invoices, receipts, officers, notifications, audits: [], permits, permitConfigs };
}
// ============== Persistence ==============
function read() {
    if (typeof window === "undefined")
        return seed();
    try {
        const raw = window.localStorage.getItem(KEY);
        if (!raw) {
            const s = seed();
            window.localStorage.setItem(KEY, JSON.stringify(s));
            return s;
        }
        const parsed = JSON.parse(raw);
        const base = seed();
        return { ...base, ...parsed, permits: parsed.permits ?? base.permits, permitConfigs: parsed.permitConfigs ?? base.permitConfigs };
    }
    catch {
        return seed();
    }
}
function write(s) {
    if (typeof window === "undefined")
        return;
    window.localStorage.setItem(KEY, JSON.stringify(s));
    window.dispatchEvent(new CustomEvent(EVT));
}
let _cache = null;
function getStore() {
    if (!_cache)
        _cache = read();
    return _cache;
}
function setStore(updater) {
    const next = updater(getStore());
    _cache = next;
    write(next);
}
function resetStore() {
    _cache = seed();
    write(_cache);
}
/** Non-React snapshot getter for service-layer code (mock-mode bridge). */
function getStoreSnapshot() {
    return getStore();
}
// ============== Hook ==============
function useStore(selector) {
    const [, force] = (0, react_1.useState)(0);
    (0, react_1.useEffect)(() => {
        const h = () => force((n) => n + 1);
        window.addEventListener(EVT, h);
        window.addEventListener("storage", h);
        return () => {
            window.removeEventListener(EVT, h);
            window.removeEventListener("storage", h);
        };
    }, []);
    return selector(getStore());
}
// ============== Actions ==============
function addCustomer(c) {
    const newC = { ...c, id: (0, exports.genId)(), createdAt: today() };
    setStore((s) => ({ ...s, customers: [newC, ...s.customers] }));
    return newC;
}
function upsertLevy(l) {
    setStore((s) => {
        const ix = s.levies.findIndex((x) => x.id === l.id);
        const levies = [...s.levies];
        if (ix >= 0)
            levies[ix] = l;
        else
            levies.unshift(l);
        return { ...s, levies };
    });
}
function deleteLevy(id) {
    setStore((s) => ({ ...s, levies: s.levies.filter((l) => l.id !== id) }));
}
function createInvoice(input) {
    let customerId = input.customerId;
    if (!customerId) {
        const existing = getStore().customers.find((c) => c.phone === input.phone);
        if (existing)
            customerId = existing.id;
        else
            customerId = addCustomer({
                name: input.customerName, phone: input.phone, email: input.email,
                address: input.address, businessName: input.businessName,
            }).id;
    }
    const reference = (0, exports.genInvoiceRef)();
    const inv = {
        id: (0, exports.genId)(),
        reference,
        customerId,
        customerName: input.customerName,
        phone: input.phone,
        email: input.email,
        address: input.address,
        businessName: input.businessName,
        levyType: input.levyType,
        purpose: input.purpose,
        description: input.description,
        quantity: input.quantity,
        unitPrice: input.unitPrice,
        amount: input.unitPrice ? (input.quantity || 1) * input.unitPrice : (input.amount ?? 0),
        frequency: input.frequency,
        dueDate: input.dueDate,
        status: "unpaid",
        virtualAccount: (0, exports.genVirtualAccount)(),
        qrToken: (0, exports.genQRToken)(),
        paymentLink: `/pay/${reference}`,
        officerId: input.officerId,
        officerName: input.officerName,
        createdAt: today(),
    };
    setStore((s) => ({ ...s, invoices: [inv, ...s.invoices] }));
    addAudit({ actor: input.actor, actorRole: input.actorRole, action: "INVOICE_CREATED", target: reference, meta: { amount: inv.amount, levy: inv.levyType } });
    addNotification({ title: "Invoice generated", body: `${reference} for ${inv.customerName}  -  ₦${inv.amount.toLocaleString()}`, type: "success" });
    return inv;
}
function markInvoicePaid(invoiceId, method, actor, actorRole) {
    const s = getStore();
    const inv = s.invoices.find((i) => i.id === invoiceId);
    if (!inv || inv.status === "paid")
        return null;
    const receipt = {
        id: (0, exports.genId)(),
        receiptNumber: (0, exports.genReceiptNumber)(),
        invoiceId: inv.id,
        invoiceRef: inv.reference,
        customerName: inv.customerName,
        phone: inv.phone,
        amount: inv.amount,
        levyType: inv.levyType,
        paymentMethod: method,
        officerId: inv.officerId,
        officerName: inv.officerName,
        qrToken: inv.qrToken,
        verificationCode: (0, exports.genVerificationCode)(),
        paidAt: today(),
    };
    setStore((cur) => ({
        ...cur,
        invoices: cur.invoices.map((i) => i.id === invoiceId ? { ...i, status: "paid", paidAt: today(), paymentMethod: method } : i),
        receipts: [receipt, ...cur.receipts],
    }));
    addAudit({ actor, actorRole, action: "PAYMENT_CONFIRMED", target: inv.reference, meta: { method, amount: inv.amount } });
    addNotification({ title: "Payment received", body: `${inv.reference} marked PAID via ${method.toUpperCase()}. Receipt ${receipt.receiptNumber} issued.`, type: "success" });
    return receipt;
}
function createOfficer(o) {
    const officer = { ...o, id: (0, exports.genId)(), totalCollected: 0, invoicesIssued: 0, createdAt: today() };
    setStore((s) => ({ ...s, officers: [officer, ...s.officers] }));
    addAudit({ actor: o.createdBy, actorRole: o.createdByRole, action: "OFFICER_CREATED", target: officer.name });
    return officer;
}
function setOfficerStatus(id, status, actor, actorRole) {
    setStore((s) => ({ ...s, officers: s.officers.map((o) => o.id === id ? { ...o, status } : o) }));
    addAudit({ actor, actorRole, action: `OFFICER_${status.toUpperCase()}`, target: id });
}
function addNotification(n) {
    const notif = { ...n, id: (0, exports.genId)(), read: n.read ?? false, createdAt: today() };
    setStore((s) => ({ ...s, notifications: [notif, ...s.notifications].slice(0, 200) }));
}
function markNotificationRead(id) {
    setStore((s) => ({ ...s, notifications: s.notifications.map((n) => n.id === id ? { ...n, read: true } : n) }));
}
function markAllNotificationsRead() {
    setStore((s) => ({ ...s, notifications: s.notifications.map((n) => ({ ...n, read: true })) }));
}
function addAudit(a) {
    const log = { ...a, id: (0, exports.genId)(), createdAt: today() };
    setStore((s) => ({ ...s, audits: [log, ...s.audits].slice(0, 500) }));
}
function findByQrOrCode(token) {
    const s = getStore();
    const t = token.trim().toUpperCase();
    const rec = s.receipts.find((r) => r.qrToken.toUpperCase() === t ||
        r.receiptNumber.toUpperCase() === t ||
        r.verificationCode.toUpperCase() === t ||
        r.invoiceRef.toUpperCase() === t);
    if (!rec)
        return null;
    return { receipt: rec, invoice: s.invoices.find((i) => i.id === rec.invoiceId) };
}
function findInvoiceByRef(ref) {
    return getStore().invoices.find((i) => i.reference.toUpperCase() === ref.trim().toUpperCase()) || null;
}
function createPermit(input) {
    const cfg = exports.PERMIT_TYPES.find((p) => p.type === input.permitType);
    const permitNumber = `TP-${datePart()}-${rand(4)}`;
    const permit = {
        id: (0, exports.genId)(),
        permitNumber,
        businessName: input.businessName,
        ownerName: input.ownerName,
        phone: input.phone,
        email: input.email,
        address: input.address,
        ward: input.ward,
        category: input.category,
        permitType: input.permitType,
        cacNumber: input.cacNumber,
        description: input.description,
        status: "pending_payment",
        fee: cfg.fee,
        qrToken: (0, exports.genQRToken)(),
        verificationCode: (0, exports.genVerificationCode)(),
        createdAt: today(),
    };
    // auto-create linked invoice
    const inv = createInvoice({
        customerName: input.businessName,
        phone: input.phone,
        email: input.email,
        address: input.address,
        businessName: input.businessName,
        levyType: "Trade Permit Fees",
        purpose: `${input.permitType}  -  ${input.businessName}`,
        description: `Trade permit application ${permitNumber}`,
        quantity: 1,
        unitPrice: cfg.fee,
        frequency: "yearly",
        dueDate: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
        actor: input.actor,
        actorRole: input.actorRole,
    });
    permit.invoiceId = inv.id;
    permit.invoiceRef = inv.reference;
    setStore((s) => ({ ...s, permits: [permit, ...s.permits] }));
    addAudit({ actor: input.actor, actorRole: input.actorRole, action: "PERMIT_APPLIED", target: permitNumber, meta: { type: input.permitType, fee: cfg.fee } });
    addNotification({ title: "Permit application received", body: `${permitNumber} • ${input.businessName} • Invoice ${inv.reference} generated.`, type: "success" });
    return permit;
}
function issuePermit(permitId, actor, actorRole) {
    const s = getStore();
    const permit = s.permits.find((p) => p.id === permitId);
    if (!permit)
        return null;
    const inv = permit.invoiceId ? s.invoices.find((i) => i.id === permit.invoiceId) : undefined;
    if (inv && inv.status !== "paid")
        return null;
    const cfg = exports.PERMIT_TYPES.find((p) => p.type === permit.permitType);
    const issueDate = new Date();
    const expiry = new Date();
    expiry.setMonth(expiry.getMonth() + cfg.validity);
    const updated = { ...permit, status: "issued", issuedBy: actor, issueDate: issueDate.toISOString(), expiryDate: expiry.toISOString() };
    setStore((cur) => ({ ...cur, permits: cur.permits.map((p) => p.id === permitId ? updated : p) }));
    addAudit({ actor, actorRole, action: "PERMIT_ISSUED", target: permit.permitNumber });
    addNotification({ title: "Permit issued", body: `${permit.permitNumber} • ${permit.businessName} • valid until ${expiry.toISOString().slice(0, 10)}.`, type: "success" });
    return updated;
}
function findPermitByToken(token) {
    const t = token.trim().toUpperCase();
    return getStore().permits.find((p) => p.qrToken.toUpperCase() === t ||
        p.permitNumber.toUpperCase() === t ||
        p.verificationCode.toUpperCase() === t) || null;
}
// ============== Permit Configs ==============
function upsertPermitConfig(c) {
    setStore((s) => {
        const ix = s.permitConfigs.findIndex((x) => x.id === c.id);
        const list = [...s.permitConfigs];
        if (ix >= 0)
            list[ix] = c;
        else
            list.unshift(c);
        return { ...s, permitConfigs: list };
    });
}
function deletePermitConfig(id) {
    setStore((s) => ({ ...s, permitConfigs: s.permitConfigs.filter((c) => c.id !== id) }));
}
function togglePermitConfigActive(id) {
    setStore((s) => ({
        ...s,
        permitConfigs: s.permitConfigs.map((c) => c.id === id ? { ...c, isActive: !c.isActive } : c),
    }));
}
