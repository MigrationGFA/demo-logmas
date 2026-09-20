# NEW LGA CLONE & ONBOARDING GUIDE

> **Context for AI Agents & Developers in a New Chat Session:**
> This guide outlines how to clone and configure this LOGMAS repository for **any new Local Government Area (LGA) in Nigeria** (e.g., Kosofe LGA, Ikeja LGA, Alimosho LGA, Abeokuta South LGA, Port Harcourt City, etc.) in under 15 minutes.
> 
> Thanks to the centralized configuration architecture, **over 90% of LGA-specific details are controlled by a single file: `src/config/lga.config.ts`**.

---

## 1. The Core Architecture: Single Source of Truth

The entire platform pulls council branding, legal edicts, leadership signatures, ward divisions, fee prefixes, and verification URLs from:

```
📁 src/config/lga.config.ts  <-- Primary Source of Truth
```

When cloning for a new LGA:
1. Update `src/config/lga.config.ts`.
2. Swap the visual assets in `public/`.
3. Update `metadata.json` and `src/app/layout.tsx`.
4. Review service fees in `src/config/services.config.ts` if tariffs differ.

---

## 2. Step-by-Step Onboarding Checklist

### Step 1: Update `src/config/lga.config.ts`
Replace the `LGA_CONFIG` object with the new council's official parameters:
- `identity.id`: Slug identifier (e.g., `"kosofe"`)
- `identity.name`: Short name (e.g., `"Kosofe"`)
- `identity.fullName`: Full formal council name (e.g., `"Kosofe Local Government"`)
- `identity.councilName`: (e.g., `"Kosofe Local Government Council"`)
- `identity.shortCode` & `acronym`: (e.g., `"KOS"`, `"KSLG"`)
- `identity.state`: (e.g., `"Lagos State"`)
- `identity.motto`: Official council motto
- `identity.headquarters`: Town/Area of the Secretariat complex (e.g., `"Ogudu, Ojota"`)
- `leadership.chairman`: Name, honorific, formal title, email
- `contact`: Address, helpdesk phones, revenue phone, official website
- `verification.domain`: The production domain for QR verification (e.g., `"verify.kosofe.gov.ng"` or `"kosofe.logmas.com.ng"`)
- `wards`: Array of all electoral/administrative wards in the LGA
- `certificates.numbering`: Prefix codes (e.g., `"KOS-CRT"`, `"KOS-PMT"`, `"KOS-INV"`)
- `payment`: Council bank account and consolidated revenue details

### Step 2: Swap Visual Branding Assets in `public/`
Replace the following image assets:

| Asset Purpose | Default File Location | Notes / Best Practice |
|---|---|---|
| **Council Official Seal/Logo** | `public/images/lga-logo.png` | Transparent PNG, 512×512px. High resolution state/council crest. |
| **Executive Chairman Portrait** | `public/assets/chairman.jpg` | High-quality formal portrait photograph of the sitting Chairman. |
| **Executive Chairman Signature** | `public/certificates/signatures/chairman-signature.png` | Transparent PNG with cursive ink strokes (aspect ratio ~2.7:1). Blends with `mix-blend-mode: multiply`. |
| **Certificate Template Artwork** | `public/certificates/templates/template.png` | 1536×1024 master landscape template with border, ribbons, and seal framing. |
| **Treasury Receipt Background** | `public/assets/receipt_template.png` | Standard background for official automated revenue receipts. |

### Step 3: Update Application Metadata & HTML Titles
Keep the application entry points in sync:

1. **`metadata.json`**:
```json
{
  "name": "Kosofe Local Government Portal - LOGMAS",
  "description": "Official digital administration, e-permits, revenue collection, and statutory certificate verification portal for Kosofe Local Government Area, Lagos State.",
  "requestFramePermissions": ["camera", "geolocation"],
  "majorCapabilities": ["MAJOR_CAPABILITY_SERVER_SIDE_GEMINI_API"]
}
```

2. **`src/app/layout.tsx`**:
Ensure Next.js `metadata.title` and `metadata.description` match the new LGA name.

### Step 4: Adjust Service Fees & Dynamic Form Fields (If Needed)
- **`src/config/services.config.ts`**: Update the tariffs or base prices for services (e.g. Street Naming, Club Registration, Food Handlers, Liquor Licences) according to the new LGA's bye-laws and revenue gazette.
- **`src/config/certificateServiceFieldMap.ts`**: If the new council requests specific custom fields to appear on certificates, add them to the service's `canonicalOrder` array.

### Step 5: Environment & Backend API Connection
File: `.env` / `src/config/env.ts`
- Point `NEXT_PUBLIC_API_BASE_URL` to the backend cluster provisioned for this LGA (e.g. `https://api.kosofe.logmas.com.ng/api/v1`).
- Set payment gateway keys (`PAYSTACK_PUBLIC_KEY` or `MONNIFY_API_KEY` / `REMITA_MERCHANT_ID`).

---

## 3. Concrete Example: Ready-to-Paste Configuration for Kosofe LGA (Lagos State)

When asked to onboard **Kosofe LGA**, copy and paste this complete `LGA_CONFIG` into `src/config/lga.config.ts`:

```typescript
export const LGA_CONFIG: LgaConfiguration = {
  platform: {
    name: "LOGMAS",
    fullName: "Local Government Management and Administration System",
    version: "2.0.0",
  },
  identity: {
    id: "kosofe",
    name: "Kosofe",
    fullName: "Kosofe Local Government",
    formalTitle: "Kosofe Local Government Area",
    councilName: "Kosofe Local Government Council",
    shortCode: "KOS",
    acronym: "KSLG",
    state: "Lagos State",
    stateShort: "Lagos",
    country: "Nigeria",
    geopoliticalZone: "South West",
    motto: "Center of Excellence - Service and Integrity",
    establishedYear: 1996,
    establishingLaw: "Local Government Administration Law of Lagos State and applicable gazettes.",
    headquarters: "Ogudu Road, Ojota, Lagos State",
  },

  leadership: {
    chairman: {
      name: "Hon. Barr. Moyosore Ogunlewe",
      honorific: "Hon. Barr.",
      title: "Executive Chairman",
      fullTitle: "Executive Chairman\nKosofe Local Government Council",
      signatureImagePath: "/certificates/signatures/chairman-signature.png",
      portraitImagePath: "/assets/chairman.jpg",
      officeEmail: "chairman@kosofe.lg.gov.ng",
      tenureNote: "Executive Chairman, Kosofe Local Government Council · Lagos State",
    },
    viceChairman: {
      name: "Hon. Oluwole Sosanya",
      title: "Vice Chairman",
    },
    secretary: {
      name: "Council Secretary",
      title: "Secretary to the Local Government (SLG)",
    },
    headOfAdmin: {
      name: "Council HOLGA",
      title: "Head of Local Government Administration",
    },
    treasurer: {
      name: "Council Treasurer",
      title: "Council Treasurer",
    },
  },

  contact: {
    address: "Kosofe Local Government Secretariat, Ogudu Road, Ojota, Lagos State",
    phone: "+234 802 000 5000",
    email: "info@kosofe.lg.gov.ng",
    website: "https://kosofe.lg.gov.ng",
    revenueDeskPhone: "+234 802 000 5001",
    supportEmail: "support@logmas.com.ng",
  },

  verification: {
    domain: "verify.kosofe.lg.gov.ng",
    verifyUrlTemplate: "https://verify.kosofe.lg.gov.ng/certificate/{token}",
    publicRegistryPath: "/verify",
  },

  wards: [
    { id: "ward_a", name: "Ward A - Oworonshoki", code: "W-OWO" },
    { id: "ward_b", name: "Ward B - Ifako / Soluyi", code: "W-IFA" },
    { id: "ward_c", name: "Ward C - Anthony / Mende", code: "W-ANT" },
    { id: "ward_d", name: "Ward D - Ojota / Ogudu", code: "W-OJO" },
    { id: "ward_e", name: "Ward E - Ketu / Alapere", code: "W-KET" },
    { id: "ward_f", name: "Ward f - Ikosi / Shangisha", code: "W-IKO" },
    { id: "ward_g", name: "Ward G - Agboyi I", code: "W-AG1" },
    { id: "ward_h", name: "Ward H - Agboyi II", code: "W-AG2" },
  ],

  certificates: {
    templates: {
      landscape: {
        id: "kosofe_landscape_master",
        name: "Kosofe LGA Statutory Master Certificate",
        defaultTitle: "OFFICIAL STATUTORY CERTIFICATE",
        backgroundImage: "/certificates/templates/template.png",
      },
      portrait: {
        id: "kosofe_portrait_master",
        name: "Kosofe Portrait Certificate",
        defaultTitle: "STATUTORY CERTIFICATE",
        backgroundImage: "/certificates/templates/template.png",
      },
      receipt: {
        id: "kosofe_receipt_master",
        name: "Kosofe Local Government Official Revenue Receipt",
        defaultTitle: "OFFICIAL LOCAL GOVERNMENT TREASURY RECEIPT",
        backgroundImage: "/assets/receipt_template.png",
      },
    },
    numbering: {
      certificatePrefix: "KOS-CRT",
      permitPrefix: "KOS-PMT",
      receiptPrefix: "KOS-RCP",
      invoicePrefix: "KOS-INV",
      applicationPrefix: "KOS-APP",
      verificationPrefix: "KOS-VRF",
    },
    legalWording: {
      statutoryLawNotice: "Issued under the authority of the Kosofe Local Government Council Laws of Lagos State.",
      originPreamble: "This is to officially certify that the applicant named herein has satisfied all statutory verification procedures of Kosofe Local Government Area, Lagos State.",
      certificateSubHeader: "OFFICIAL STATUTORY CERTIFICATE OF REGISTRATION",
      reissueDisclaimer: "Any unauthorized alteration, erasure, or falsification invalidates this official statutory document.",
      officialSealNotice: "Authenticated with the official digital security QR code and the executive signature of the Executive Chairman.",
      footerDisclaimer: "This certificate is an official statutory property of Kosofe Local Government Council, Lagos State.",
    },
  },

  payment: {
    bankName: "First Bank of Nigeria Plc",
    accountName: "Kosofe Local Government Consolidated Revenue Account",
    accountNumber: "2034981120",
    currency: "NGN",
    currencySymbol: "₦",
  },
};
```

---

## 4. Verification Checklist for New LGA Deployment

When the new chat completes the configuration:
1. Run `npm run build` to confirm zero compilation or TypeScript errors.
2. Confirm that running the app shows the new LGA name, crest, and wards across the dashboard, forms, receipts, and certificates.
3. Verify that `/certificate/[token]` displays the certificate with the new council's title and header.
4. Verify that `/verify` points to the new council's verification domain.
