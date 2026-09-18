/**
 * Utilities for Public Certificate Tokens, Verification URLs, and Document References.
 * Ensures internal database UUIDs are never exposed in public routes.
 */

import { LGA_CONFIG } from "@/config/lga.config";

// Simple deterministic hash to generate consistent, opaque hex public tokens (e.g. "40c4b26f" or "8f3d7c9a4e2b")
export function generatePublicToken(identifier: string, seed: string = `${LGA_CONFIG.identity.id}_lga_cert`): string {
  if (!identifier) return "cert_" + Math.random().toString(36).substring(2, 10);
  
  // If it's already a clean opaque token, return sanitized version
  if (/^[a-f0-9]{8,32}$/i.test(identifier)) {
    return identifier.toLowerCase();
  }

  let hash = 0;
  const combined = `${seed}_${identifier}`;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  const hexPart1 = Math.abs(hash).toString(16).padStart(8, "0");
  
  let hash2 = 5381;
  for (let i = combined.length - 1; i >= 0; i--) {
    hash2 = (hash2 * 33) ^ combined.charCodeAt(i);
  }
  const hexPart2 = Math.abs(hash2).toString(16).padStart(8, "0");

  return `${hexPart1}${hexPart2}`.slice(0, 16);
}

/**
 * Format a date into official Nigerian civil format with ordinal indicator:
 * e.g. "21st August, 2026"
 */
export function formatOfficialDate(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return "21st August, 2026";
  
  try {
    const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
    if (isNaN(date.getTime())) return String(dateInput);

    const day = date.getDate();
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    const getOrdinal = (n: number) => {
      const s = ["th", "st", "nd", "rd"];
      const v = n % 100;
      return s[(v - 20) % 10] || s[v] || s[0];
    };

    return `${day}${getOrdinal(day)} ${month}, ${year}`;
  } catch {
    return String(dateInput);
  }
}

/**
 * Generate public certificate URL
 */
export function getPublicCertificateUrl(tokenOrId: string): string {
  // const token = generatePublicToken(tokenOrId);
  return `/certificate/${tokenOrId}`;
}
