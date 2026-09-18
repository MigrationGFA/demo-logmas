import { LGA_CONFIG } from "./lga.config";

/**
 * Contact Configuration for Citizen-facing and Marketing Portals.
 * Sourced directly from the central LGA_CONFIG module.
 */
export const SITE_CONTACT = {
  // Primary Public Contact Information
  phone: LGA_CONFIG.contact.phone,
  phoneRaw: LGA_CONFIG.contact.phoneRaw,
  phoneTel: LGA_CONFIG.contact.phoneTel,
  
  // Secondary / Helpline numbers
  altPhone: LGA_CONFIG.contact.altPhone,
  altPhoneRaw: LGA_CONFIG.contact.altPhoneRaw,
  emergencyPhone: LGA_CONFIG.contact.emergencyPhone,

  // Email Addresses
  email: LGA_CONFIG.contact.email,
  emailMailto: LGA_CONFIG.contact.emailMailto,
  supportEmail: LGA_CONFIG.contact.supportEmail,
  chairmanEmail: LGA_CONFIG.contact.chairmanEmail,
  revenueEmail: LGA_CONFIG.contact.revenueEmail,

  // Physical Location & Secretariat
  councilName: LGA_CONFIG.identity.fullName,
  lgaName: `${LGA_CONFIG.identity.name} LGA`,
  state: LGA_CONFIG.identity.state,
  country: LGA_CONFIG.identity.country,
  secretariatAddress: LGA_CONFIG.contact.secretariatAddress,
  shortAddress: LGA_CONFIG.contact.shortAddress,

  // Operating Hours
  officeHours: LGA_CONFIG.contact.officeHours,
  operatingDays: LGA_CONFIG.contact.operatingDays,
  weekendHours: LGA_CONFIG.contact.weekendHours,

  // Online & Portal
  portalUrl: LGA_CONFIG.contact.portalUrl,
  helpdeskTitle: LGA_CONFIG.contact.helpdeskTitle,

  // Social Channels
  socials: LGA_CONFIG.contact.socials,
} as const;

export type SiteContact = typeof SITE_CONTACT;

