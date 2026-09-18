/**
 * LOGMAS SERVICE TO CERTIFICATE TEMPLATE MAPPING
 * 
 * Maps all 12 official the Local Government services to one of the
 * two official master certificate layouts:
 * 
 * 1. "landscape" → The official Club Registration & Organizations master template
 * 2. "portrait"  → The official Certificate of Origin & Statutory Permits master template
 * 
 * You can freely change any service's assigned template here.
 */

import { LGA_CONFIG } from "./lga.config";

export type MasterTemplateType = "landscape" | "portrait";

export interface ServiceTemplateEntry {
  serviceId: string;
  serviceName: string;
  template: MasterTemplateType;
  description: string;
}

/**
 * COMPLETE ALLOCATION TABLE FOR ALL 12 LOGMAS SERVICES
 */
export const SERVICE_TEMPLATE_MAP: Record<string, MasterTemplateType> = {
  // 1. Indigene & Identity
  certificate_of_origin: "portrait",
  state_of_origin: "portrait",
  origin: "portrait",

  // 2. Clubs & Social Organizations
  club_registration: "landscape",
  club: "landscape",

  // 3. Community Development Associations
  cda_registration: "landscape",
  cda: "landscape",

  // 4. Agricultural & Farmers
  farmers_registration: "portrait",
  farmers: "portrait",

  // 5. Environmental Health & Sanitation
  environmental_sanitation: "portrait",
  sanitation: "portrait",

  // 6. Property & Tenement
  tenement_rate: "portrait",
  tenement: "portrait",

  // 7. Urban Planning & Street Naming
  street_naming: "portrait",
  street: "portrait",

  // 8. Freight & Haulage Transit
  haulage_fees: "portrait",
  haulage: "portrait",

  // 9. Liquor & Hospitality Excise
  liquor_licence: "portrait",
  liquor: "portrait",

  // 10. Entertainment & Viewing Centres
  viewing_centre_licence: "portrait",
  viewing_centre: "portrait",

  // 11. Solid Minerals & Quarry Permits
  quarry_permit: "portrait",
  quarry: "portrait",

  // 12. Micro Trade & Kiosk Permits
  kiosk_licence: "portrait",
  kiosk: "portrait",
};

/**
 * Formal service directory with human-readable metadata
 */
export const ALL_12_SERVICES_ALLOCATION: ServiceTemplateEntry[] = [
  {
    serviceId: "certificate_of_origin",
    serviceName: "Certificate of Origin",
    template: "portrait",
    description: "Official indigene verification certificate with tabular bio data.",
  },
  {
    serviceId: "club_registration",
    serviceName: "Certificate of Club Registration",
    template: "landscape",
    description: "Social, sports, cultural, and youth organization certificate.",
  },
  {
    serviceId: "cda_registration",
    serviceName: "Certificate of CDA Registration",
    template: "landscape",
    description: "Community Development Association recognition certificate.",
  },
  {
    serviceId: "farmers_registration",
    serviceName: "Certificate of Farmers Registration",
    template: "portrait",
    description: "Crop, livestock, and poultry farmer registration certificate.",
  },
  {
    serviceId: "environmental_sanitation",
    serviceName: "Certificate of Environmental Sanitation Compliance",
    template: "portrait",
    description: "Commercial & industrial public health compliance certificate.",
  },
  {
    serviceId: "tenement_rate",
    serviceName: "Tenement Rate Clearance",
    template: "portrait",
    description: "Statutory property rate clearance and valuation certificate.",
  },
  {
    serviceId: "street_naming",
    serviceName: "Street Naming and Property Numbering",
    template: "portrait",
    description: "Urban planning street name approval and house numbering certificate.",
  },
  {
    serviceId: "haulage_fees",
    serviceName: "Haulage Transit Permit",
    template: "portrait",
    description: "Heavy-duty transit, mineral, and produce transport clearance.",
  },
  {
    serviceId: "liquor_licence",
    serviceName: "Liquor Licence",
    template: "portrait",
    description: "Statutory retail and wholesale alcoholic beverage trading licence.",
  },
  {
    serviceId: "viewing_centre_licence",
    serviceName: "Viewing Centre Licence Fee",
    template: "portrait",
    description: "Commercial viewing centre and entertainment venue safety licence.",
  },
  {
    serviceId: "quarry_permit",
    serviceName: "Quarry Fees and Permits",
    template: "portrait",
    description: "Granite extraction, mining, and natural resources operating permit.",
  },
  {
    serviceId: "kiosk_licence",
    serviceName: "Kiosk Licence",
    template: "portrait",
    description: "Micro-trade booth, roadside kiosk, and container permit.",
  },
];

const LOCAL_STORAGE_KEY_OVERRIDES = `${LGA_CONFIG.identity.id}_custom_template_allocations`;
const LEGACY_STORAGE_KEY_OVERRIDES = "legacy_custom_template_allocations";

/**
 * Retrieve saved overrides from localStorage
 */
export function getSavedTemplateOverrides(): Record<string, MasterTemplateType> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY_OVERRIDES) || localStorage.getItem(LEGACY_STORAGE_KEY_OVERRIDES);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/**
 * Save custom template override for a service
 */
export function setServiceTemplateOverride(serviceId: string, template: MasterTemplateType): void {
  if (typeof window === "undefined") return;
  try {
    const current = getSavedTemplateOverrides();
    current[serviceId.toLowerCase().replace(/[- \s]+/g, "_")] = template;
    localStorage.setItem(LOCAL_STORAGE_KEY_OVERRIDES, JSON.stringify(current));
  } catch (err) {
    console.error("Failed to save template override:", err);
  }
}

/**
 * Resolves the active master template for any service ID or code
 */
export function resolveTemplateForService(
  serviceIdOrCode?: string,
  explicitTemplate?: MasterTemplateType
): MasterTemplateType {
  if (explicitTemplate === "landscape" || explicitTemplate === "portrait") {
    return explicitTemplate;
  }

  const cleanKey = (serviceIdOrCode || "").toLowerCase().replace(/[- \s]+/g, "_");

  // 1. Check user override
  const overrides = getSavedTemplateOverrides();
  if (overrides[cleanKey]) {
    return overrides[cleanKey];
  }

  // 2. Check predefined mapping
  if (SERVICE_TEMPLATE_MAP[cleanKey]) {
    return SERVICE_TEMPLATE_MAP[cleanKey];
  }

  // 3. Fallback heuristic
  if (cleanKey.includes("club") || cleanKey.includes("cda") || cleanKey.includes("association")) {
    return "landscape";
  }

  return "portrait";
}
