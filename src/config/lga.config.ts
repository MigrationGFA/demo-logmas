/**
 * Central Local Government Area (LGA) Configuration
 * 
 * Single source of truth for all local government-specific parameters, branding,
 * leadership, contact channels, statutory text, certificate naming, verification,
 * and template assets.
 * 
 * TO ONBOARD A NEW LGA:
 * Simply update this configuration object (or provide environment overrides).
 * All services, certificate layouts, public verification routes, site chrome,
 * forms, and marketing pages will adapt automatically.
 */

export interface LgaIdentityConfig {
  /** Unique system identifier / slug (e.g. "odeda", "ikeja", "abeokuta-north") */
  id: string;
  /** Primary common name (e.g. "Odeda") */
  name: string;
  /** Full official government entity name (e.g. "Odeda Local Government") */
  fullName: string;
  /** Formal administrative title (e.g. "Odeda Local Government Area") */
  formalTitle: string;
  /** Official council authority name (e.g. "Odeda Local Government Council") */
  councilName: string;
  /** Short abbreviation code used in identifiers (e.g. "ODE") */
  shortCode: string;
  /** Official acronym (e.g. "ODLG") */
  acronym: string;
  /** State name including 'State' (e.g. "Ogun State") */
  state: string;
  /** State short name (e.g. "Ogun") */
  stateShort: string;
  /** Country of jurisdiction (e.g. "Nigeria") */
  country: string;
  /** Geopolitical administrative zone (e.g. "South West") */
  geopoliticalZone: string;
  /** Official government motto or slogan */
  motto: string;
  /** Founding or creation year */
  establishedYear: number | string;
  /** Principal establishing legal authority / edict */
  establishingLaw: string;
  /** Geographic headquarters town (e.g. "Odeda") */
  headquarters: string;
}

export interface LgaExecutiveLeadership {
  chairman: {
    name: string;
    honorific?: string;
    title: string;
    fullTitle: string;
    signatureImagePath: string;
    portraitImagePath: string;
    officeEmail?: string;
    tenureNote?: string;
  };
  viceChairman?: {
    name: string;
    title: string;
  };
  secretary?: {
    name: string;
    title: string;
  };
  treasurer?: {
    name: string;
    title: string;
  };
  headOfLocalGovAdmin?: {
    name: string;
    title: string;
  };
  councillor?: {
    name: string;
    title: string;
  };
}

export interface LgaContactConfig {
  phone: string;
  phoneRaw: string;
  phoneTel: string;
  altPhone: string;
  altPhoneRaw: string;
  emergencyPhone: string;
  email: string;
  emailMailto: string;
  supportEmail: string;
  chairmanEmail: string;
  revenueEmail: string;
  secretariatAddress: string;
  shortAddress: string;
  officeHours: string;
  operatingDays: string;
  weekendHours: string;
  portalUrl: string;
  helpdeskTitle: string;
  socials: {
    facebook: string;
    twitter: string;
    instagram: string;
    youtube: string;
  };
}

export interface LgaVerificationConfig {
  /** Domain host for citizen QR verification scans */
  domain: string;
  /** Fully qualified public verification URL endpoint */
  verifyUrl: string;
  /** Canonical certificate view route */
  publicLookupUrl: string;
  /** Statutory confirmation text displayed upon successful lookup */
  verificationMessage: string;
  /** Public explanatory subtitle */
  publicVerificationNotice: string;
  /** Security and anti-fraud seal statement */
  securedBadgeText: string;
  /** Disclaimer on computer-generated credentials */
  disclaimer: string;
}

export interface LgaCertificateConfig {
  /** Standardized prefixes for document numbering */
  namingConventions: {
    originPrefix: string;
    clubPrefix: string;
    generalPrefix: string;
    permitPrefix: string;
    receiptPrefix: string;
    invoicePrefix: string;
    applicationPrefix: string;
    verificationPrefix: string;
  };
  /** Master background templates */
  templates: {
    portrait: {
      id: string;
      name: string;
      defaultTitle: string;
      backgroundImage: string;
    };
    landscape: {
      id: string;
      name: string;
      defaultTitle: string;
      backgroundImage: string;
    };
    receipt: {
      id: string;
      name: string;
      defaultTitle: string;
      backgroundImage: string;
    };
  };
  /** Standard statutory phrases, legal edicts, and footer banners */
  legalWording: {
    statutoryLawNotice: string;
    originPreamble: string;
    clubPreamble: string;
    receiptNotice: string;
    footerBannerText: string;
    citizenDeclaration: string;
  };
}

export interface LgaBrandingConfig {
  logoPath: string;
  councilEmblemPath: string;
  stateEmblemPath: string;
  nationalEmblemPath: string;
  faviconPath: string;
  appTitle: string;
  appDescription: string;
}

export interface LgaWardConfig {
  id: string;
  name: string;
  code: string;
  description?: string;
}

export interface LgaPlatformConfig {
  name: string;
  fullName: string;
  version: string;
}

export interface LgaConfiguration {
  platform: LgaPlatformConfig;
  identity: LgaIdentityConfig;
  leadership: LgaExecutiveLeadership;
  contact: LgaContactConfig;
  verification: LgaVerificationConfig;
  certificates: LgaCertificateConfig;
  branding: LgaBrandingConfig;
  wards: LgaWardConfig[];
}

/**
 * ACTIVE LOCAL GOVERNMENT CONFIGURATION (DEMO LGA)
 */
export const LGA_CONFIG: LgaConfiguration = {
  platform: {
    name: "LOGMAS",
    fullName: "Local Government Management and Administration System",
    version: "2.0.0-demo",
  },
  identity: {
    id: "demo",
    name: "Demo",
    fullName: "Demo Local Government",
    formalTitle: "Demo Local Government Area",
    councilName: "Demo Local Government Council",
    shortCode: "DEMO",
    acronym: "DLG",
    state: "Demo State",
    stateShort: "Demo",
    country: "Nigeria",
    geopoliticalZone: "South West",
    motto: "Service, Progress, and Digital Excellence",
    establishedYear: 2026,
    establishingLaw: "Local Government Administration Law & Digital Public Infrastructure Guidelines.",
    headquarters: "Central Council Secretariat, Demo City",
  },

  leadership: {
    chairman: {
      name: "Hon. (Dr.) Adebayo Adeleke",
      honorific: "Hon. (Dr.)",
      title: "Executive Chairman",
      fullTitle: "Executive Chairman\nDemo Local Government Council",
      signatureImagePath: "/certificates/signatures/chairman-signature.png",
      portraitImagePath: "/assets/chairman.jpg",
      officeEmail: "chairman@demo.gov.ng",
      tenureNote: "Executive Chairman, Demo Local Government Area · Demo State",
    },
    viceChairman: {
      name: "Hon. Folashade Balogun",
      title: "Vice Chairman",
    },
    secretary: {
      name: "Barr. Chukwuemeka Okonkwo",
      title: "Secretary to the Local Government",
    },
    treasurer: {
      name: "Mrs. Amina Mohammed, FCA",
      title: "Head of Local Government Treasury & Revenue",
    },
    headOfLocalGovAdmin: {
      name: "Dr. K. A. Adebisi",
      title: "Head of Local Government Administration (HOLGA)",
    },
    councillor: {
      name: "Hon. Osunnowo Azeez",
      title: "Ward Councillor",
    },
  },

  contact: {
    phone: "+234 800 3366 542",
    phoneRaw: "+2348003366542",
    phoneTel: "tel:+2348003366542",
    altPhone: "+234 803 123 4567",
    altPhoneRaw: "+2348031234567",
    emergencyPhone: "112",
    email: "info@demo.logmas.com.ng",
    emailMailto: "mailto:info@demo.logmas.com.ng",
    supportEmail: "support@demo.logmas.com.ng",
    chairmanEmail: "chairman@demo.gov.ng",
    revenueEmail: "revenue@demo.gov.ng",
    secretariatAddress: "1 Council Boulevard, Civic Centre, Demo City, Demo State",
    shortAddress: "Council Secretariat, Demo City, Demo State",
    officeHours: "Monday - Friday: 8:00 AM - 5:00 PM",
    operatingDays: "Mon - Fri, 8am - 5pm",
    weekendHours: "Closed (Emergency & online services active 24/7)",
    portalUrl: "https://demo.logmas.com.ng",
    helpdeskTitle: "Demo Council Citizens Helpdesk",
    socials: {
      facebook: "https://facebook.com/demolga",
      twitter: "https://x.com/demolga",
      instagram: "https://instagram.com/demolga",
      youtube: "https://youtube.com/@demolga",
    },
  },

  verification: {
    domain: "verify.demo.logmas.com.ng",
    verifyUrl: "/verify",
    publicLookupUrl: "/certificate",
    verificationMessage: "Authentic certificate issued by Demo Local Government Council Secretariat.",
    publicVerificationNotice: "Verify the authenticity of Demo LGA Certificates of Origin, trade permits, and official revenue receipts.",
    securedBadgeText: "Verified & Active in Council Registry",
    disclaimer: "This certificate is computer generated and does not require further signature. • 🔒 Secure Document",
  },

  certificates: {
    namingConventions: {
      originPrefix: "DEMO/CO",
      clubPrefix: "DEMO/CR",
      generalPrefix: "DEMO/CERT",
      permitPrefix: "DEMO/PRM",
      receiptPrefix: "DEMO/REC",
      invoicePrefix: "INV-DEMO",
      applicationPrefix: "DEMO-APP",
      verificationPrefix: "VER-DEMO",
    },
    templates: {
      landscape: {
        id: "landscape",
        name: "Official Statutory Certificate (Landscape)",
        defaultTitle: "OFFICIAL STATUTORY CERTIFICATE",
        backgroundImage: "/certificates/templates/template.png",
      },
      portrait: {
        id: "portrait",
        name: "Official Portrait Certificate",
        defaultTitle: "OFFICIAL STATUTORY CERTIFICATE",
        backgroundImage: "/certificates/templates/club-registration-template.jpg",
      },
      receipt: {
        id: "official_receipt",
        name: "Official Statutory Receipt",
        defaultTitle: "OFFICIAL RECEIPT",
        backgroundImage: "/certificates/templates/receipt-template.jpg",
      },
    },
    legalWording: {
      statutoryLawNotice: "This Certificate is issued in accordance with the provisions of the Local Government Administration Law and relevant State Bye-laws.",
      originPreamble: "This is to certify that the applicant named below has fulfilled all statutory requirements and is confirmed a bonafide indigene of Demo Local Government Area, Demo State, Nigeria.",
      clubPreamble: "This is to certify that the organization named below has satisfied statutory requirements and is officially registered under the Community Development regulations of Demo Local Government Authority.",
      receiptNotice: "Official Council Revenue Settlement • Audited and Secured by Local Government Treasury.",
      footerBannerText: "DEMO LOCAL GOVERNMENT - SERVICE, PROGRESS, AND DIGITAL EXCELLENCE",
      citizenDeclaration: "I solemnly declare that the information provided in this statutory application is true, authentic, and accurate. I understand that false statements or forged documentation incur criminal liability and automatic nullification under Local Government bye-laws.",
    },
  },

  branding: {
    logoPath: "/logo.png",
    councilEmblemPath: "/images/nigeria-crest.png",
    stateEmblemPath: "/images/nigeria-crest.png",
    nationalEmblemPath: "/images/nigeria-crest.png",
    faviconPath: "/favicon.ico",
    appTitle: "LOGMAS Demo LGA",
    appDescription: "Local Government Management and Administration System for Demo Local Government Area",
  },

  wards: [
    { id: "ward-1", name: "Ward 1 (Central Urban)", code: "W01", description: "City Centre & Council Secretariat Corridor" },
    { id: "ward-2", name: "Ward 2 (Commercial Market District)", code: "W02", description: "Central Market & Commercial Hub" },
    { id: "ward-3", name: "Ward 3 (Heritage & Residential Quarter)", code: "W03", description: "Traditional Compound & Residential Zone" },
    { id: "ward-4", name: "Ward 4 (Industrial & Logistics Park)", code: "W04", description: "Manufacturing, Haulage & Industrial Corridor" },
    { id: "ward-5", name: "Ward 5 (Agricultural Agro-Hub)", code: "W05", description: "Farming, Agritech & Produce Trade Zone" },
    { id: "ward-6", name: "Ward 6 (University & Innovation Corridor)", code: "W06", description: "Educational Institutions & Student Housing" },
    { id: "ward-7", name: "Ward 7 (Riverside Green District)", code: "W07", description: "Eco-tourism, Waterfront & Residential Estates" },
    { id: "ward-8", name: "Ward 8 (Hilltop Development Area)", code: "W08", description: "New Urban Development & Housing Schemes" },
    { id: "ward-9", name: "Ward 9 (Border Trade Corridor)", code: "W09", description: "Interstate Boundary & Transport Logistics" },
    { id: "ward-10", name: "Ward 10 (Eastern Community Heartland)", code: "W10", description: "Community Farming & Rural Settlement" },
  ],
  payment: {
    bankName: "LOGMAS Treasury Digital Bank",
    accountName: "Demo LGA Internal Revenue Account",
    accountNumber: "0123456789",
    currency: "NGN",
    currencySymbol: "₦",
  },
};

/**
 * Convenient helper utilities to format document numbers based on the active LGA configuration.
 */
export function formatLgaCertificateNumber(
  type: "origin" | "club" | "general" | "permit",
  uniqueSeq: string
): string {
  const currentYear = new Date().getFullYear();
  const cleanSeq = uniqueSeq.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8);
  switch (type) {
    case "origin":
      return `${LGA_CONFIG.certificates.namingConventions.originPrefix}/${currentYear}/${cleanSeq}`;
    case "club":
      return `${LGA_CONFIG.certificates.namingConventions.clubPrefix}/${currentYear}/CLUB/${cleanSeq.slice(0, 5)}`;
    case "permit":
      return `${LGA_CONFIG.certificates.namingConventions.permitPrefix}/${currentYear}/${cleanSeq}`;
    case "general":
    default:
      return `${LGA_CONFIG.certificates.namingConventions.generalPrefix}/${currentYear}/${cleanSeq}`;
  }
}

export function formatLgaApplicationNumber(uniqueSeq: string): string {
  const cleanSeq = uniqueSeq.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
  return `${LGA_CONFIG.certificates.namingConventions.applicationPrefix}-${cleanSeq}`;
}

export function formatLgaReceiptNumber(uniqueSeq: string): string {
  const currentYear = new Date().getFullYear();
  const cleanSeq = uniqueSeq.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
  return `${LGA_CONFIG.certificates.namingConventions.receiptPrefix}/${currentYear}/${cleanSeq}`;
}

export function formatLgaInvoiceNumber(uniqueSeq: string): string {
  const currentYear = new Date().getFullYear();
  const cleanSeq = uniqueSeq.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
  return `${LGA_CONFIG.certificates.namingConventions.invoicePrefix}-${currentYear}-${cleanSeq}`;
}

export function getLgaVerificationUrl(codeOrToken: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || LGA_CONFIG.verification.verifyUrl;
  if (baseUrl.includes("/verify")) {
    return `${baseUrl}?code=${encodeURIComponent(codeOrToken)}`;
  }
  return `${baseUrl.replace(/\/$/, "")}/verify?code=${encodeURIComponent(codeOrToken)}`;
}

export function getLgaCertificateUrl(certificateNumberOrToken: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || LGA_CONFIG.verification.publicLookupUrl;
  return `${baseUrl.replace(/\/$/, "")}/certificate/${encodeURIComponent(certificateNumberOrToken)}`;
}

/**
 * List of ward names for dropdowns and select components
 */
export const LGA_WARD_NAMES = LGA_CONFIG.wards.map((w) => w.name);

