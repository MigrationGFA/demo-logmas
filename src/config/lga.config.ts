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
  /** Unique system identifier / slug (e.g. "demo-lga", "ikeja", "abeokuta-north") */
  id: string;
  /** Primary common name (e.g. "Demo") */
  name: string;
  /** Full official government entity name (e.g. "Demo Local Government") */
  fullName: string;
  /** Formal administrative title (e.g. "Demo Local Government Area") */
  formalTitle: string;
  /** Official council authority name (e.g. "Demo Local Government Council") */
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
  /** Geographic headquarters town (e.g. "Demo City") */
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
    version: "2.0.0 (Demo Standalone Edition)",
  },
  identity: {
    id: "demo",
    name: "Demo LGA",
    fullName: "Demo Local Government",
    formalTitle: "Demo Local Government Area",
    councilName: "Demo Local Government Council",
    shortCode: "DEMO",
    acronym: "DLGA",
    state: "Demo State",
    stateShort: "Demo",
    country: "Nigeria",
    geopoliticalZone: "South West",
    motto: "Excellence, Transparency & Public Service",
    establishedYear: 1991,
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
      // Demo placeholder portrait — swap this path for the real chairman photo
      // during testing (original file kept at src/assets/chairman.jpg).
      portraitImagePath: "/assets/chairman-demo.svg",
      officeEmail: "chairman@demo.logmas.com.ng",
      tenureNote: "Executive Chairman, Demo Local Government Council",
    },
    viceChairman: {
      name: "Hon. Fatima Ibrahim",
      title: "Vice Chairman",
    },
    secretary: {
      name: "Chief O. A. Babatunde",
      title: "Secretary to the Local Government",
    },
    treasurer: {
      name: "Mrs. M. O. Danjuma, FCA",
      title: "Council Treasurer",
    },
    headOfLocalGovAdmin: {
      name: "Dr. K. E. Okonkwo",
      title: "Head of Local Government Administration (HOLGA)",
    },
    councillor: {
      name: "Hon. Bisi Adeleke",
      title: "Ward Councillor",
    },
  },

  contact: {
    phone: "+234 800 000 3366",
    phoneRaw: "+2348000003366",
    phoneTel: "tel:+2348000003366",
    altPhone: "+234 800 000 3367",
    altPhoneRaw: "+2348000003367",
    emergencyPhone: "112",
    email: "info@demo.logmas.com.ng",
    emailMailto: "mailto:info@demo.logmas.com.ng",
    supportEmail: "support@logmas.com.ng",
    chairmanEmail: "chairman@demo.logmas.com.ng",
    revenueEmail: "revenue@demo.logmas.com.ng",
    secretariatAddress: "Secretariat Complex, Commercial Avenue, Demo City",
    shortAddress: "Secretariat Complex, Demo City",
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
    domain: "demo.logmas.com.ng",
    verifyUrl: "/verify",
    publicLookupUrl: "/certificate",
    verificationMessage: "Authentic statutory document issued by Demo Local Government Secretariat.",
    publicVerificationNotice: "Verify the authenticity of Demo LGA Certificates of Origin, trade permits, and official receipts.",
    securedBadgeText: "Verified & Active in Council Registry",
    disclaimer: "This document is computer generated and digitally validated. • 🔒 Secure Document",
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
        id: "demo_landscape_master",
        name: "Demo LGA Statutory Certificate Master",
        defaultTitle: "OFFICIAL STATUTORY CERTIFICATE",
        backgroundImage: "/certificates/templates/template.png",
      },
      portrait: {
        id: "demo_portrait_master",
        name: "Demo Portrait Certificate",
        defaultTitle: "STATUTORY CERTIFICATE",
        backgroundImage: "/certificates/templates/template.png",
      },
      receipt: {
        id: "demo_receipt_master",
        name: "Demo LGA Official Revenue Receipt",
        defaultTitle: "OFFICIAL LOCAL GOVERNMENT TREASURY RECEIPT",
        backgroundImage: "/certificates/templates/receipt-template.jpg",
      },
    },
    legalWording: {
      statutoryLawNotice: "Issued under the authority of the Demo Local Government Council Laws and Digital Public Infrastructure Guidelines.",
      originPreamble: "This is to officially certify that the applicant named herein has satisfied the residency and origin verification requirements of Demo Local Government.",
      clubPreamble: "This is to certify that the organization named herein has satisfied statutory requirements and is registered under the Community Development regulations of Demo Local Government Council.",
      receiptNotice: "Official Council Revenue Settlement • Audited and Secured by Local Government Treasury.",
      footerBannerText: "DEMO LOCAL GOVERNMENT - EXCELLENCE & PUBLIC SERVICE",
      citizenDeclaration: "I solemnly declare that the information provided in this statutory application is true, authentic, and accurate under Local Government Council bye-laws.",
    },
  },

  branding: {
    logoPath: "/logo.png",
    councilEmblemPath: "/favicon.ico",
    stateEmblemPath: "/images/ogun-crest.png",
    nationalEmblemPath: "/images/nigeria-crest.png",
    faviconPath: "/favicon.ico",
    appTitle: "Demo LGA Portal",
    appDescription: "Standalone Zero-Backend Demonstration Portal for Demo Local Government Council",
  },

  wards: [
    { id: "ward-1", name: "Ward 1 - Central Urban", code: "W01", description: "Central Administrative District" },
    { id: "ward-2", name: "Ward 2 - Commercial District", code: "W02", description: "Commercial Market Corridor" },
    { id: "ward-3", name: "Ward 3 - East Residential", code: "W03", description: "Urban Residential District" },
    { id: "ward-4", name: "Ward 4 - West Industrial", code: "W04", description: "Industrial & Logistics Park" },
    { id: "ward-5", name: "Ward 5 - North Heartland", code: "W05", description: "Historic Agro-Farming Corridor" },
    { id: "ward-6", name: "Ward 6 - South Highland", code: "W06", description: "Highland Community Ward" },
  ],
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

