/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * CENTRALIZED SERVICE-SPECIFIC CERTIFICATE FIELD MAPPING REGISTRY
 * 
 * Phase C & Phase D:
 * - Single authoritative mapping source keyed by serviceId or serviceCode.
 * - LGA-agnostic: No hardcoded LGA identity literals or synthetic placeholder strings.
 * - Strict precedence: certificateData is authoritative; formData is fallback.
 * - Semantic deduplication: Alias groups prevent duplicate rows for equivalent concepts.
 * - Deterministic dynamic rows formatted for landscape certificate layout.
 */

export interface CanonicalCertificateField {
  canonicalKey: string;
  label: string;
  sourceKeys: string[];
  omitIfEmpty?: boolean;
  transform?: (value: any) => string | null;
}

export interface ServiceCertificateMapping {
  serviceId: string;
  serviceAliases: string[];
  serviceName: string;
  certificateTitle: string;
  canonicalOrder: string[];
  fields: Record<string, CanonicalCertificateField>;
}

export interface CertificateContentRow {
  key: string;
  label: string;
  value: string;
}

/**
 * Common keys that belong to fixed certificate zones (header, footer, QR, signatures)
 * or system metadata and must NEVER be rendered as repeating content rows.
 */
export const EXCLUDED_ROW_KEYS = new Set([
  "id",
  "token",
  "publicToken",
  "documentId",
  "certificateNumber",
  "applicationNo",
  "applicationNumber",
  "status",
  "statusMessage",
  "dateOfIssue",
  "dateOfRegistration",
  "issuedAt",
  "validUntil",
  "expiryDate",
  "councilHeader",
  "councilSubHeader",
  "councilTitle",
  "councilSubtitle",
  "councilAddress",
  "secretariatAddress_header",
  "phoneEmailWeb",
  "certificateTitle",
  "certifyingIntro",
  "statutoryNotice",
  "statutoryLawNotice",
  "footerDisclaimer",
  "footerBanner",
  "qrCodeLabel",
  "qrUrl",
  "qrToken",
  "verificationUrl",
  "verificationCode",
  "verificationMessage",
  "signerName",
  "signerTitle",
  "signerSignature",
  "password",
  "pin",
  "passportUrl",
  "passportPhoto",
  "signatureUrl",
  "documents",
  "uploadedFiles",
  "declarationChecked",
  "requiresInspection",
  "requiresLgaApproval",
  "isApproved",
  "reviewStatus",
  "assignedCouncillor",
  "supportingDocuments",
  "consentLetter",
  "siteInspection",
  "sitePlan",
  "minutesOfMeeting",
  "files",
  "attachments",
  "createdAt",
  "updatedAt",
]);

/**
 * Semantic alias groups: If any key in a group is resolved and placed on the
 * certificate, all other keys in the same group are considered consumed to prevent
 * duplicate rows (e.g. fullName vs applicantName vs nameOfApplicant).
 */
export const SEMANTIC_ALIAS_GROUPS: Record<string, string[]> = {
  entityName: [
    "nameOfApplicant",
    "fullName",
    "applicantName",
    "clubName",
    "associationName",
    "businessName",
    "companyName",
    "farmerName",
    "operatorName",
    "proprietorName",
    "licenseeName",
    "propertyOwner",
    "name",
  ],
  address: [
    "address",
    "residentialAddress",
    "secretariatAddress",
    "businessAddress",
    "premisesAddress",
    "meetingAddress",
    "farmLocation",
    "siteLocation",
    "propertyAddress",
    "kioskLocation",
    "meetingPlace",
  ],
  ward: [
    "ward",
    "wardName",
    "lgaWard",
    "communityWard",
    "locationWard",
    "assessmentWard",
    "electoralWard",
  ],
  objectives: [
    "objectives",
    "aims",
    "purpose",
    "purposeDescription",
    "tradeCategory",
    "developmentObjectives",
  ],
  identification: [
    "nin",
    "nationalId",
    "nationalIdentityNumber",
    "voterCard",
    "idNumber",
  ],
  phone: ["phone", "phoneNumber", "mobile", "telephone"],
  email: ["email", "emailAddress"],
  dateFounded: ["dateFounded", "establishedDate", "inaugurationDate"],
  registrationNumber: ["registrationNo", "registrationNumber", "regNo", "certNo"],
};

/**
 * Find the alias group name for a given key, if any.
 */
function findAliasGroup(key: string): string | null {
  for (const [groupName, aliases] of Object.entries(SEMANTIC_ALIAS_GROUPS)) {
    if (aliases.includes(key)) {
      return groupName;
    }
  }
  return null;
}

/**
 * SERVICE SPECIFIC MAPPING ALLOCATIONS (LGA-Agnostic)
 */
export const SERVICE_FIELD_MAPPINGS: Record<string, ServiceCertificateMapping> = {
  // 1. Indigene Certificate of Origin
  certificate_of_origin: {
    serviceId: "certificate_of_origin",
    serviceAliases: ["certificate_of_origin", "state_of_origin", "origin"],
    serviceName: "Certificate of Origin",
    certificateTitle: "CERTIFICATE OF ORIGIN",
    canonicalOrder: [
      "nameOfApplicant",
      "stateOfOrigin",
      "lgaOfOrigin",
      "ward",
      "compoundName",
      "address",
      "dateOfBirth",
      "gender",
      "nin",
    ],
    fields: {
      nameOfApplicant: {
        canonicalKey: "nameOfApplicant",
        label: "Name of Applicant",
        sourceKeys: ["nameOfApplicant", "fullName", "applicantName", "name"],
      },
      stateOfOrigin: {
        canonicalKey: "stateOfOrigin",
        label: "State of Origin",
        sourceKeys: ["stateOfOrigin", "originState", "state"],
      },
      lgaOfOrigin: {
        canonicalKey: "lgaOfOrigin",
        label: "LGA of Origin",
        sourceKeys: ["lgaOfOrigin", "originLga", "lga", "localGovernment"],
      },
      ward: {
        canonicalKey: "ward",
        label: "Electoral Ward",
        sourceKeys: ["ward", "wardName", "lgaWard", "electoralWard"],
      },
      compoundName: {
        canonicalKey: "compoundName",
        label: "Family Compound / Quarter",
        sourceKeys: ["compoundName", "familyCompound", "quarter", "village"],
      },
      address: {
        canonicalKey: "address",
        label: "Residential Address",
        sourceKeys: ["residentialAddress", "address"],
      },
      dateOfBirth: {
        canonicalKey: "dateOfBirth",
        label: "Date of Birth",
        sourceKeys: ["dateOfBirth", "dob"],
      },
      gender: {
        canonicalKey: "gender",
        label: "Gender",
        sourceKeys: ["gender", "sex"],
      },
      nin: {
        canonicalKey: "nin",
        label: "National Identity Number (NIN)",
        sourceKeys: ["nin", "nationalId"],
      },
    },
  },

  // 2. Club Registration
  club_registration: {
    serviceId: "club_registration",
    serviceAliases: ["club_registration", "club"],
    serviceName: "Certificate of Club Registration",
    certificateTitle: "CERTIFICATE OF CLUB REGISTRATION",
    canonicalOrder: [
      "clubName",
      "category",
      "secretariatAddress",
      "ward",
      "objectives",
      "motto",
      "dateFounded",
      "boardChairman",
      "generalSecretary",
    ],
    fields: {
      clubName: {
        canonicalKey: "clubName",
        label: "Name of Association / Club",
        sourceKeys: [
          "clubName",
          "associationName",
          "organizationName",
          "name",
          "fullName",
          "applicantName",
        ],
      },
      category: {
        canonicalKey: "category",
        label: "Designated Category",
        sourceKeys: ["category", "clubCategory", "organizationType"],
      },
      secretariatAddress: {
        canonicalKey: "secretariatAddress",
        label: "Secretariat / Meeting Address",
        sourceKeys: [
          "secretariatAddress",
          "meetingAddress",
          "address",
          "businessAddress",
        ],
      },
      ward: {
        canonicalKey: "ward",
        label: "Operating Ward",
        sourceKeys: ["ward", "wardName", "lgaWard"],
      },
      objectives: {
        canonicalKey: "objectives",
        label: "Core Aims & Objectives",
        sourceKeys: ["objectives", "aims", "purpose"],
      },
      motto: {
        canonicalKey: "motto",
        label: "Motto / Slogan",
        sourceKeys: ["motto", "slogan"],
      },
      dateFounded: {
        canonicalKey: "dateFounded",
        label: "Date Established",
        sourceKeys: ["dateFounded", "establishedDate", "inaugurationDate"],
      },
      boardChairman: {
        canonicalKey: "boardChairman",
        label: "President / Chairman",
        sourceKeys: [
          "boardChairman",
          "presidentName",
          "chairmanName",
          "president",
        ],
      },
      generalSecretary: {
        canonicalKey: "generalSecretary",
        label: "General Secretary",
        sourceKeys: ["generalSecretary", "secretaryName", "secretary"],
      },
    },
  },

  // 3. CDA Registration
  cda_registration: {
    serviceId: "cda_registration",
    serviceAliases: ["cda_registration", "cda"],
    serviceName: "Certificate of Community Development Association Registration",
    certificateTitle: "CERTIFICATE OF CDA REGISTRATION",
    canonicalOrder: [
      "associationName",
      "ward",
      "secretariatAddress",
      "boundaryDescription",
      "objectives",
      "boardChairman",
      "generalSecretary",
    ],
    fields: {
      associationName: {
        canonicalKey: "associationName",
        label: "Community Development Association",
        sourceKeys: [
          "associationName",
          "cdaName",
          "communityName",
          "clubName",
          "name",
          "fullName",
        ],
      },
      ward: {
        canonicalKey: "ward",
        label: "Community Ward",
        sourceKeys: ["ward", "wardName", "lgaWard"],
      },
      secretariatAddress: {
        canonicalKey: "secretariatAddress",
        label: "Community Secretariat",
        sourceKeys: ["secretariatAddress", "address", "meetingPlace"],
      },
      boundaryDescription: {
        canonicalKey: "boundaryDescription",
        label: "Community Boundaries / Coverage",
        sourceKeys: [
          "boundaryDescription",
          "communityBoundary",
          "coverageArea",
          "areaCovered",
        ],
      },
      objectives: {
        canonicalKey: "objectives",
        label: "Development Objectives",
        sourceKeys: ["objectives", "aims", "purpose"],
      },
      boardChairman: {
        canonicalKey: "boardChairman",
        label: "CDA Chairman",
        sourceKeys: [
          "boardChairman",
          "chairmanName",
          "presidentName",
          "chairman",
        ],
      },
      generalSecretary: {
        canonicalKey: "generalSecretary",
        label: "CDA Secretary",
        sourceKeys: ["generalSecretary", "secretaryName", "secretary"],
      },
    },
  },

  // 4. Farmers Registration
  farmers_registration: {
    serviceId: "farmers_registration",
    serviceAliases: ["farmers_registration", "farmers", "farmer"],
    serviceName: "Certificate of Farmers Registration",
    certificateTitle: "CERTIFICATE OF FARMERS REGISTRATION",
    canonicalOrder: [
      "farmerName",
      "farmingType",
      "farmLocation",
      "ward",
      "farmSize",
    ],
    fields: {
      farmerName: {
        canonicalKey: "farmerName",
        label: "Farmer / Enterprise Name",
        sourceKeys: [
          "farmerName",
          "fullName",
          "applicantName",
          "farmName",
          "businessName",
          "name",
        ],
      },
      farmingType: {
        canonicalKey: "farmingType",
        label: "Agricultural Classification",
        sourceKeys: ["farmingType", "category", "cropType", "produceType"],
      },
      farmLocation: {
        canonicalKey: "farmLocation",
        label: "Farm Location / Site",
        sourceKeys: ["farmLocation", "address", "location"],
      },
      ward: {
        canonicalKey: "ward",
        label: "Agricultural Ward",
        sourceKeys: ["ward", "wardName", "lgaWard"],
      },
      farmSize: {
        canonicalKey: "farmSize",
        label: "Farm Acreage / Size",
        sourceKeys: ["farmSize", "acreage", "hectares"],
      },
    },
  },

  // 5. Environmental Health & Sanitation Compliance
  environmental_sanitation: {
    serviceId: "environmental_sanitation",
    serviceAliases: ["environmental_sanitation", "sanitation"],
    serviceName: "Certificate of Environmental Sanitation Compliance",
    certificateTitle: "ENVIRONMENTAL SANITATION COMPLIANCE CERTIFICATE",
    canonicalOrder: [
      "businessName",
      "premisesType",
      "businessAddress",
      "ward",
      "sanitationGrade",
      "inspectionDate",
    ],
    fields: {
      businessName: {
        canonicalKey: "businessName",
        label: "Premises / Facility Name",
        sourceKeys: [
          "businessName",
          "facilityName",
          "companyName",
          "name",
          "fullName",
        ],
      },
      premisesType: {
        canonicalKey: "premisesType",
        label: "Facility Classification",
        sourceKeys: ["premisesType", "facilityType", "category"],
      },
      businessAddress: {
        canonicalKey: "businessAddress",
        label: "Premises Location",
        sourceKeys: [
          "businessAddress",
          "facilityAddress",
          "premisesAddress",
          "address",
        ],
      },
      ward: {
        canonicalKey: "ward",
        label: "Health Ward",
        sourceKeys: ["ward", "wardName", "lgaWard"],
      },
      sanitationGrade: {
        canonicalKey: "sanitationGrade",
        label: "Sanitation Standard / Grade",
        sourceKeys: [
          "sanitationGrade",
          "complianceGrade",
          "inspectionGrade",
          "grade",
        ],
      },
      inspectionDate: {
        canonicalKey: "inspectionDate",
        label: "Date of Inspection",
        sourceKeys: ["inspectionDate", "lastInspectionDate", "inspectedAt"],
      },
    },
  },

  // 6. Tenement Rate Clearance
  tenement_rate: {
    serviceId: "tenement_rate",
    serviceAliases: ["tenement_rate", "tenement"],
    serviceName: "Tenement Rate Clearance",
    certificateTitle: "TENEMENT RATE CLEARANCE CERTIFICATE",
    canonicalOrder: [
      "propertyOwner",
      "propertyAddress",
      "propertyReference",
      "propertyClassification",
      "ward",
      "rateAssessment",
    ],
    fields: {
      propertyOwner: {
        canonicalKey: "propertyOwner",
        label: "Property Owner / Ratepayer",
        sourceKeys: [
          "propertyOwner",
          "ownerName",
          "fullName",
          "applicantName",
          "name",
        ],
      },
      propertyAddress: {
        canonicalKey: "propertyAddress",
        label: "Property Location",
        sourceKeys: ["propertyAddress", "address", "tenementAddress"],
      },
      propertyReference: {
        canonicalKey: "propertyReference",
        label: "Tenement Assessment Ref",
        sourceKeys: ["propertyReference", "tenementId", "assessmentNo"],
      },
      propertyClassification: {
        canonicalKey: "propertyClassification",
        label: "Property Classification",
        sourceKeys: ["propertyClassification", "propertyType", "category"],
      },
      ward: {
        canonicalKey: "ward",
        label: "Assessment Ward",
        sourceKeys: ["ward", "wardName", "lgaWard"],
      },
      rateAssessment: {
        canonicalKey: "rateAssessment",
        label: "Assessed Statutory Rate",
        sourceKeys: ["rateAssessment", "assessedRate", "valuationAmount"],
      },
    },
  },

  // 7. Haulage Fees & Permit
  haulage_fees: {
    serviceId: "haulage_fees",
    serviceAliases: ["haulage_fees", "haulage"],
    serviceName: "Haulage Transit Permit",
    certificateTitle: "HAULAGE TRANSIT PERMIT",
    canonicalOrder: [
      "operatorName",
      "vehicleNumber",
      "cargoType",
      "tonnageCapacity",
      "routePermitted",
      "rateAssessment",
    ],
    fields: {
      operatorName: {
        canonicalKey: "operatorName",
        label: "Permit Holder / Transporter",
        sourceKeys: [
          "operatorName",
          "companyName",
          "businessName",
          "fullName",
          "applicantName",
        ],
      },
      vehicleNumber: {
        canonicalKey: "vehicleNumber",
        label: "Vehicle Reg. Number",
        sourceKeys: ["vehicleNumber", "plateNumber", "regNumber"],
      },
      cargoType: {
        canonicalKey: "cargoType",
        label: "Permitted Cargo Type",
        sourceKeys: [
          "cargoType",
          "produceType",
          "mineralType",
          "goodsType",
        ],
      },
      tonnageCapacity: {
        canonicalKey: "tonnageCapacity",
        label: "Vehicle Tonnage / Capacity",
        sourceKeys: ["tonnageCapacity", "tonnage", "capacity"],
      },
      routePermitted: {
        canonicalKey: "routePermitted",
        label: "Permitted Transit Route",
        sourceKeys: ["routePermitted", "transitRoute", "route"],
      },
      rateAssessment: {
        canonicalKey: "rateAssessment",
        label: "Assessed Transit Rate",
        sourceKeys: ["rateAssessment", "feeAmount", "assessedRate"],
      },
    },
  },

  // 8. Liquor Licence
  liquor_licence: {
    serviceId: "liquor_licence",
    serviceAliases: ["liquor_licence", "liquor"],
    serviceName: "Liquor Licence",
    certificateTitle: "STATUTORY LIQUOR LICENCE",
    canonicalOrder: [
      "businessName",
      "operatorName",
      "premisesType",
      "businessAddress",
      "ward",
    ],
    fields: {
      businessName: {
        canonicalKey: "businessName",
        label: "Licensed Establishment",
        sourceKeys: ["businessName", "hotelName", "barName", "name"],
      },
      operatorName: {
        canonicalKey: "operatorName",
        label: "Licensee / Proprietor",
        sourceKeys: [
          "operatorName",
          "licenseeName",
          "fullName",
          "applicantName",
        ],
      },
      premisesType: {
        canonicalKey: "premisesType",
        label: "Licence Grade / Type",
        sourceKeys: ["premisesType", "licenceGrade", "category"],
      },
      businessAddress: {
        canonicalKey: "businessAddress",
        label: "Licensed Premises Address",
        sourceKeys: ["businessAddress", "premisesAddress", "address"],
      },
      ward: {
        canonicalKey: "ward",
        label: "Licensing Ward",
        sourceKeys: ["ward", "wardName", "lgaWard"],
      },
    },
  },

  // 9. Viewing Centre Licence
  viewing_centre_licence: {
    serviceId: "viewing_centre_licence",
    serviceAliases: [
      "viewing_centre_licence",
      "viewing_centre",
      "viewing_center",
    ],
    serviceName: "Viewing Centre Licence Fee",
    certificateTitle: "COMMERCIAL VIEWING CENTRE LICENCE",
    canonicalOrder: [
      "businessName",
      "operatorName",
      "businessAddress",
      "ward",
      "capacity",
      "safetyCompliance",
    ],
    fields: {
      businessName: {
        canonicalKey: "businessName",
        label: "Viewing Centre / Trade Name",
        sourceKeys: [
          "businessName",
          "viewingCentreName",
          "centreName",
          "name",
          "fullName",
        ],
      },
      operatorName: {
        canonicalKey: "operatorName",
        label: "Proprietor / Operator",
        sourceKeys: [
          "operatorName",
          "proprietorName",
          "applicantName",
          "fullName",
          "name",
        ],
      },
      businessAddress: {
        canonicalKey: "businessAddress",
        label: "Premises Location",
        sourceKeys: [
          "businessAddress",
          "premisesAddress",
          "address",
          "location",
        ],
      },
      ward: {
        canonicalKey: "ward",
        label: "Operating Ward",
        sourceKeys: ["ward", "wardName", "lgaWard"],
      },
      capacity: {
        canonicalKey: "capacity",
        label: "Viewing Capacity (Seats)",
        sourceKeys: ["capacity", "hallCapacity", "seatCapacity"],
      },
      safetyCompliance: {
        canonicalKey: "safetyCompliance",
        label: "Safety & Fire Standard",
        sourceKeys: [
          "safetyCompliance",
          "fireSafety",
          "inspectionGrade",
          "sanitationGrade",
        ],
      },
    },
  },

  // 10. Quarry & Solid Minerals Operating Permit
  quarry_permit: {
    serviceId: "quarry_permit",
    serviceAliases: ["quarry_permit", "quarry"],
    serviceName: "Quarry Fees and Permits",
    certificateTitle: "QUARRY & EXTRACTION OPERATING PERMIT",
    canonicalOrder: [
      "companyName",
      "mineralType",
      "siteLocation",
      "ward",
    ],
    fields: {
      companyName: {
        canonicalKey: "companyName",
        label: "Quarry Operator / Company",
        sourceKeys: [
          "companyName",
          "businessName",
          "operatorName",
          "name",
          "fullName",
        ],
      },
      mineralType: {
        canonicalKey: "mineralType",
        label: "Mineral / Resource Type",
        sourceKeys: ["mineralType", "resourceType", "category"],
      },
      siteLocation: {
        canonicalKey: "siteLocation",
        label: "Site Location / GPS",
        sourceKeys: ["siteLocation", "quarrySite", "address"],
      },
      ward: {
        canonicalKey: "ward",
        label: "Mining Ward",
        sourceKeys: ["ward", "wardName", "lgaWard"],
      },
    },
  },

  // 11. Street Naming & Property Numbering
  street_naming: {
    serviceId: "street_naming",
    serviceAliases: ["street_naming", "street"],
    serviceName: "Street Naming and Property Numbering",
    certificateTitle: "STREET NAMING APPROVAL CERTIFICATE",
    canonicalOrder: [
      "proposedStreetName",
      "locationWard",
      "applicantName",
      "neighborhood",
      // Customizable by developers: uncomment to include elders or signpost note on the certificate
      // "communityElders",
      // "signpostSpecification",
    ],
    fields: {
      proposedStreetName: {
        canonicalKey: "proposedStreetName",
        label: "Approved Street Name",
        sourceKeys: ["proposedStreetName", "streetName", "approvedName"],
      },
      locationWard: {
        canonicalKey: "locationWard",
        label: "Ward / Zone",
        sourceKeys: ["locationWard", "ward", "wardName"],
      },
      applicantName: {
        canonicalKey: "applicantName",
        label: "Applicant / Community",
        sourceKeys: [
          "applicantName",
          "fullName",
          "communityName",
          "cdaName",
          "name",
        ],
      },
      neighborhood: {
        canonicalKey: "neighborhood",
        label: "Quarter / Neighborhood",
        sourceKeys: ["neighborhood", "area", "address"],
      },
      communityElders: {
        canonicalKey: "communityElders",
        label: "Endorsing Elders",
        sourceKeys: ["elders", "communityElders", "endorsers"],
      },
      signpostSpecification: {
        canonicalKey: "signpostSpecification",
        label: "Signpost Details",
        sourceKeys: ["signpostNote", "signpost", "signpostDetails"],
      },
    },
  },

  // 12. Micro-Trade Kiosk Licence
  kiosk_licence: {
    serviceId: "kiosk_licence",
    serviceAliases: ["kiosk_licence", "kiosk"],
    serviceName: "Kiosk Licence",
    certificateTitle: "MICRO-TRADE KIOSK LICENCE",
    canonicalOrder: [
      "businessName",
      "operatorName",
      "kioskLocation",
      "ward",
      "tradeCategory",
    ],
    fields: {
      businessName: {
        canonicalKey: "businessName",
        label: "Kiosk / Trade Name",
        sourceKeys: ["businessName", "tradeName", "name", "fullName"],
      },
      operatorName: {
        canonicalKey: "operatorName",
        label: "Permit Holder",
        sourceKeys: ["operatorName", "fullName", "applicantName"],
      },
      kioskLocation: {
        canonicalKey: "kioskLocation",
        label: "Site Location",
        sourceKeys: ["kioskLocation", "address", "location"],
      },
      ward: {
        canonicalKey: "ward",
        label: "Market Ward",
        sourceKeys: ["ward", "wardName", "lgaWard"],
      },
      tradeCategory: {
        canonicalKey: "tradeCategory",
        label: "Line of Trade",
        sourceKeys: ["tradeCategory", "category", "purpose"],
      },
    },
  },
};

/**
 * Resolves the service mapping configuration for a given serviceId or serviceCode.
 * If not found, generates a clean generic mapping.
 */
export function getServiceFieldMapping(serviceIdOrCode?: string): ServiceCertificateMapping {
  if (!serviceIdOrCode) {
    return createGenericServiceMapping("statutory_service", "Official Statutory Certificate");
  }

  const normalized = serviceIdOrCode.toLowerCase().trim();

  // Direct match
  if (SERVICE_FIELD_MAPPINGS[normalized]) {
    return SERVICE_FIELD_MAPPINGS[normalized];
  }

  // Check aliases
  for (const mapping of Object.values(SERVICE_FIELD_MAPPINGS)) {
    if (mapping.serviceAliases.includes(normalized)) {
      return mapping;
    }
  }

  // Fallback match by substring
  for (const [key, mapping] of Object.entries(SERVICE_FIELD_MAPPINGS)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return mapping;
    }
  }

  return createGenericServiceMapping(normalized, serviceIdOrCode);
}

/**
 * Creates a generic fallback service mapping for unlisted service types.
 */
function createGenericServiceMapping(serviceId: string, name: string): ServiceCertificateMapping {
  return {
    serviceId,
    serviceAliases: [serviceId],
    serviceName: name,
    certificateTitle: name.toUpperCase(),
    canonicalOrder: ["nameOfApplicant", "category", "address", "ward", "purpose"],
    fields: {
      nameOfApplicant: {
        canonicalKey: "nameOfApplicant",
        label: "Applicant / Beneficiary",
        sourceKeys: [
          "nameOfApplicant",
          "fullName",
          "applicantName",
          "clubName",
          "associationName",
          "businessName",
          "name",
        ],
      },
      category: {
        canonicalKey: "category",
        label: "Service Category",
        sourceKeys: ["category", "type", "serviceCategory"],
      },
      address: {
        canonicalKey: "address",
        label: "Official Address",
        sourceKeys: [
          "address",
          "residentialAddress",
          "secretariatAddress",
          "businessAddress",
        ],
      },
      ward: {
        canonicalKey: "ward",
        label: "Electoral / Local Ward",
        sourceKeys: ["ward", "wardName", "lgaWard"],
      },
      purpose: {
        canonicalKey: "purpose",
        label: "Purpose / Description",
        sourceKeys: ["purpose", "description", "objectives"],
      },
    },
  };
}

/**
 * Formats a raw value safely for display without placeholder injection.
 * Prevents any "[object Object]" or non-primitive leaks from appearing on official certificates.
 */
function sanitizeDisplayValue(val: any): string | null {
  if (val === null || val === undefined) return null;
  if (typeof val === "boolean") return null;

  if (typeof val === "string") {
    const trimmed = val.trim();
    if (
      trimmed.length === 0 ||
      trimmed.toLowerCase().includes("[object") ||
      trimmed === "undefined" ||
      trimmed === "null"
    ) {
      return null;
    }
    return trimmed;
  }

  if (Array.isArray(val)) {
    const validItems = val
      .map((item) => {
        if (item === null || item === undefined) return "";
        if (typeof item === "string") return item.trim();
        if (typeof item === "number") return String(item);
        if (typeof item === "object") {
          // If item is an object (e.g. elder endorsement or signpost spec), extract human name/title
          return (
            item.name ||
            item.fullName ||
            item.elderName ||
            item.title ||
            item.label ||
            item.value ||
            item.text ||
            ""
          );
        }
        return "";
      })
      .map((s) => (typeof s === "string" ? s.trim() : String(s)))
      .filter((s) => s.length > 0 && !s.toLowerCase().includes("[object"));
    return validItems.length > 0 ? validItems.join(", ") : null;
  }

  if (typeof val === "number") {
    return isNaN(val) ? null : String(val);
  }

  if (typeof val === "object") {
    // If val is a nested object, extract readable string property if present
    const candidate =
      val.name ||
      val.fullName ||
      val.title ||
      val.label ||
      val.value ||
      val.text ||
      val.description;
    if (typeof candidate === "string" && candidate.trim().length > 0) {
      const trimmed = candidate.trim();
      return trimmed.toLowerCase().includes("[object") ? null : trimmed;
    }
    return null;
  }

  return null;
}

/**
 * Resolves canonical fields and dynamic rows for a certificate with:
 * 1. Authoritative Precedence:
 *    - certificateData is checked first (authoritative).
 *    - application.formData is checked second (fallback).
 *    - applicant bio-data is checked third (bio fallback).
 * 2. Semantic Deduplication:
 *    - Prevents duplicate rows for equivalent concepts across alias groups.
 * 3. Strict Absence of Fake Placeholders:
 *    - Omitted if data is missing, never injects synthetic official values.
 */
export function resolveServiceFields(params: {
  serviceIdOrCode?: string;
  certificateData?: Record<string, any> | null;
  formData?: Record<string, any> | null;
  applicant?: Record<string, any> | null;
  maxRows?: number;
}): {
  certificateTitle: string;
  canonicalData: Record<string, any>;
  contentRows: CertificateContentRow[];
} {
  const {
    serviceIdOrCode,
    certificateData = {},
    formData = {},
    applicant = {},
    maxRows = 6,
  } = params;

  const mapping = getServiceFieldMapping(serviceIdOrCode);
  const canonicalData: Record<string, any> = {};
  const contentRows: CertificateContentRow[] = [];

  // Track consumed keys and semantic groups to prevent duplicate rows
  const consumedKeys = new Set<string>();
  const consumedGroups = new Set<string>();

  // Mark all excluded keys as consumed
  for (const exKey of EXCLUDED_ROW_KEYS) {
    consumedKeys.add(exKey);
  }

  // 1. Process canonical order defined for this specific service
  for (const canonicalKey of mapping.canonicalOrder) {
    if (contentRows.length >= maxRows) break;

    const fieldDef = mapping.fields[canonicalKey];
    if (!fieldDef) continue;

    // Check if its semantic group has already been rendered
    const groupName = findAliasGroup(canonicalKey);
    if (groupName && consumedGroups.has(groupName)) {
      continue;
    }

    let resolvedValue: string | null = null;
    let matchedSourceKey: string | null = null;

    // Authoritative check order: certificateData -> formData -> applicant
    for (const sourceKey of fieldDef.sourceKeys) {
      if (certificateData && sourceKey in certificateData) {
        resolvedValue = sanitizeDisplayValue(certificateData[sourceKey]);
        if (resolvedValue !== null) {
          matchedSourceKey = sourceKey;
          break;
        }
      }
      if (formData && sourceKey in formData) {
        resolvedValue = sanitizeDisplayValue(formData[sourceKey]);
        if (resolvedValue !== null) {
          matchedSourceKey = sourceKey;
          break;
        }
      }
      if (applicant && sourceKey in applicant) {
        resolvedValue = sanitizeDisplayValue(applicant[sourceKey]);
        if (resolvedValue !== null) {
          matchedSourceKey = sourceKey;
          break;
        }
      }
    }

    // Apply custom field transform if specified
    if (resolvedValue !== null && fieldDef.transform) {
      resolvedValue = fieldDef.transform(resolvedValue);
    }

    // If valid non-empty value resolved, add to rows and canonical data
    if (resolvedValue !== null) {
      canonicalData[canonicalKey] = resolvedValue;
      contentRows.push({
        key: canonicalKey,
        label: fieldDef.label,
        value: resolvedValue,
      });

      // Mark keys and semantic group as consumed
      consumedKeys.add(canonicalKey);
      if (matchedSourceKey) consumedKeys.add(matchedSourceKey);
      for (const sk of fieldDef.sourceKeys) {
        consumedKeys.add(sk);
      }
      if (groupName) {
        consumedGroups.add(groupName);
      }
    }
  }

  // 2. Fallback check for any extra unmapped data in certificateData / formData
  // (Only if space remains in contentRows, strictly respecting semantic deduplication)
  const combinedSources = [
    { data: certificateData || {}, isAuthoritative: true },
    { data: formData || {}, isAuthoritative: false },
  ];

  for (const { data } of combinedSources) {
    if (contentRows.length >= maxRows) break;

    for (const [rawKey, rawVal] of Object.entries(data)) {
      if (contentRows.length >= maxRows) break;
      if (consumedKeys.has(rawKey)) continue;

      const group = findAliasGroup(rawKey);
      if (group && consumedGroups.has(group)) {
        consumedKeys.add(rawKey);
        continue;
      }

      const cleanVal = sanitizeDisplayValue(rawVal);
      if (cleanVal !== null) {
        const label = rawKey
          .replace(/([A-Z])/g, " $1")
          .replace(/[_-]/g, " ")
          .replace(/^\w/, (c) => c.toUpperCase())
          .trim();

        canonicalData[rawKey] = cleanVal;
        contentRows.push({
          key: rawKey,
          label,
          value: cleanVal,
        });

        consumedKeys.add(rawKey);
        if (group) consumedGroups.add(group);
      }
    }
  }

  return {
    certificateTitle: mapping.certificateTitle,
    canonicalData,
    contentRows,
  };
}

/**
 * Builds the canonical certificateData dictionary used by PublicCertificate.
 * Unifies transformer logic across apiCertificates and apiPublicCertificate.
 */
export function buildCanonicalCertificateData(
  serviceIdOrCode?: string,
  certificateData?: Record<string, any> | null,
  formData?: Record<string, any> | null,
  applicant?: Record<string, any> | null
): Record<string, any> {
  const result = resolveServiceFields({
    serviceIdOrCode,
    certificateData,
    formData,
    applicant,
    maxRows: 12, // allow dictionary to store all canonical values
  });

  return {
    ...(formData || {}),
    ...(certificateData || {}),
    ...result.canonicalData,
    certificateTitle: result.certificateTitle,
  };
}
