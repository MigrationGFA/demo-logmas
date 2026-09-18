
import type { Role } from "@/lib/auth";
import type { StoredAuthUser } from "@/lib/auth-storage";
import { User } from "@/services/apiAuth";
import { redirect } from "next/navigation";

const ALL_ROLES: Role[] = [
  "super_admin",
  "chairman",
  "lga_admin",
  "ward_councillor",
  "treasurer",
  "auditor",
  "contractor",
  "field_officer",
  "citizen",
  "business_owner",
];

/**
 * Per-path role allowlists. Routes missing from this map are treated as
 * accessible to any authenticated user. Derived from NAV[role] in
 * src/components/dashboard/app-sidebar.tsx  -  keep in sync.
 */
export const ROUTE_ACCESS: Record<string, Role[]> = {
  "/dashboard": ALL_ROLES,

  // Finance / config
  "/dashboard/pricing": ["treasurer", "super_admin"],
  "/dashboard/levies": ["treasurer", "super_admin"],

  // Audit & admin oversight
  "/dashboard/audit-logs": ["auditor", "lga_admin", "chairman", "super_admin"],
  "/dashboard/accounts": ["lga_admin", "super_admin"],
  "/dashboard/wards": ["lga_admin"],
  "/dashboard/contractors": ["auditor", "lga_admin"],
  "/dashboard/field-officers": ["contractor", "treasurer", "auditor", "lga_admin", "super_admin"],

  // Citizen/business/officer workflows
  "/dashboard/applications": [
    "citizen",
    "business_owner",
    "field_officer",
    "ward_councillor",
    "lga_admin",
    "chairman",
    "super_admin",
  ],
  "/dashboard/complaints": ["citizen", "business_owner", "ward_councillor", "lga_admin", "chairman"],

  // Action-only pages
  "/dashboard/permits/new": ["citizen", "business_owner", "field_officer"],
  "/dashboard/invoices/new": ["field_officer", "contractor"],
  "/dashboard/verify-payment": ["field_officer", "contractor"],
};

export function assertRoleAccess(path: string, user: User | null) {
  if (!user) {
    throw redirect("/login" );
  }
  const allowed = ROUTE_ACCESS[path];
  if (allowed && !allowed.includes(user?.role as Role)) {
    throw redirect("/dashboard");
  }
}

