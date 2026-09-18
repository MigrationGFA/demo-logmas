export * from "./services.config";

import { DEFAULT_SERVICES, getServiceById } from "./services.config";

export const LGA_SERVICES = DEFAULT_SERVICES;
export const getLgaServiceById = getServiceById;
