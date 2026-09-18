/**
 * @deprecated Legacy service registry module.
 * Succeeded by `src/config/services.config.ts` which uses `src/config/lga.config.ts`.
 * Re-exports all services, types, and fee helpers for backward compatibility.
 */
export * from "./services.config";

import {
  DEFAULT_SERVICES,
  getServiceById,
} from "./services.config";

export const LGA_SERVICES = DEFAULT_SERVICES;
export const getLgaServiceById = getServiceById;
