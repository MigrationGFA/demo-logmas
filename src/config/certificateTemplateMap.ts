/**
 * LOGMAS SERVICE TO CERTIFICATE TEMPLATE MAPPING
 * 
 * Maps all 12 official Local Government services to the official unified
 * master certificate layout: "landscape" (The official Master Landscape Template).
 * 
 * The portrait template has been discarded entirely in favor of the unified landscape format.
 */

import { LGA_CONFIG } from "./lga.config";

export type MasterTemplateType = "landscape" | "portrait";

export interface ServiceTemplateEntry {
  serviceId: string;
  serviceName: string;
  template: "landscape";
  description: string;
}

/**
 * COMPLETE ALLOCATION TABLE FOR ALL 12 LOGMAS SERVICES
 * All services standardized on the official landscape master template.
 */
export const SERVICE_TEMPLATE_MAP: Record<string, "landscape"> = {
  // 1. Indigene & Identity
  certificate_of_origin: "landscape",
  state_of_origin: "landscape",
  origin: "landscape",

  // 2. Clubs & Social Organizations
  club_registration: "landscape",
  club: "landscape",

  // 3. Community Development Associations
  cda_registration: "landscape",
  cda: "landscape",

  // 4. Agricultural & Farmers
  farmers_registration: "landscape",
  farmers: "landscape",

  // 5. Environmental Health & Sanitation
  environmental_sanitation: "landscape",
  sanitation: "landscape",

  // 6. Property & Tenement
  tenement_rate: "landscape",
  tenement: "landscape",

  // 7. Urban Planning & Street Naming
  street_naming: "landscape",
  street: "landscape",

  // 8. Freight & Haulage Transit
  haulage_fees: "landscape",
  haulage: "landscape",

  // 9. Liquor & Hospitality Excise
  liquor_licence: "landscape",
  liquor: "landscape",

  // 10. Entertainment & Viewing Centres
  viewing_centre_licence: "landscape",
  viewing_centre: "landscape",

  // 11. Solid Minerals & Quarry Permits
  quarry_permit: "landscape",
  quarry: "landscape",

  // 12. Micro Trade & Kiosk Permits
  kiosk_licence: "landscape",
  kiosk: "landscape",
};

/**
 * Formal service directory with human-readable metadata
 */
export const ALL_12_SERVICES_ALLOCATION: ServiceTemplateEntry[] = [
  {
    serviceId: "certificate_of_origin",
    serviceName: "Certificate of Origin",
    template: "landscape",
    description: "Official indigene verification certificate with verified bio data.",
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
    template: "landscape",
    description: "Crop, livestock, and poultry farmer registration certificate.",
  },
  {
    serviceId: "environmental_sanitation",
    serviceName: "Certificate of Environmental Sanitation Compliance",
    template: "landscape",
    description: "Commercial & industrial public health compliance certificate.",
  },
  {
    serviceId: "tenement_rate",
    serviceName: "Tenement Rate Clearance",
    template: "landscape",
    description: "Statutory property rate clearance and valuation certificate.",
  },
  {
    serviceId: "street_naming",
    serviceName: "Street Naming and Property Numbering",
    template: "landscape",
    description: "Urban planning street name approval and house numbering certificate.",
  },
  {
    serviceId: "haulage_fees",
    serviceName: "Haulage Transit Permit",
    template: "landscape",
    description: "Heavy-duty transit, mineral, and produce transport clearance.",
  },
  {
    serviceId: "liquor_licence",
    serviceName: "Liquor Licence",
    template: "landscape",
    description: "Statutory retail and wholesale alcoholic beverage trading licence.",
  },
  {
    serviceId: "viewing_centre_licence",
    serviceName: "Viewing Centre Licence Fee",
    template: "landscape",
    description: "Commercial viewing centre and entertainment venue safety licence.",
  },
  {
    serviceId: "quarry_permit",
    serviceName: "Quarry Fees and Permits",
    template: "landscape",
    description: "Granite extraction, mining, and natural resources operating permit.",
  },
  {
    serviceId: "kiosk_licence",
    serviceName: "Kiosk Licence",
    template: "landscape",
    description: "Micro-trade booth, roadside kiosk, and container permit.",
  },
];

const LOCAL_STORAGE_KEY_OVERRIDES = `${LGA_CONFIG.identity.id}_custom_template_allocations`;
const LEGACY_STORAGE_KEY_OVERRIDES = "legacy_custom_template_allocations";

/**
 * Retrieve saved overrides from localStorage
 */
export function getSavedTemplateOverrides(): Record<string, MasterTemplateType> {
  return {};
}

/**
 * Save custom template override for a service
 */
export function setServiceTemplateOverride(_serviceId: string, _template: MasterTemplateType): void {
  // No-op: all services are strictly standardized on the official landscape template
}

/**
 * Resolves the active master template for any service ID or code
 * Always returns "landscape" as portrait has been discarded entirely.
 */
export function resolveTemplateForService(
  _serviceIdOrCode?: string,
  _explicitTemplate?: MasterTemplateType
): MasterTemplateType {
  return "landscape";
}
