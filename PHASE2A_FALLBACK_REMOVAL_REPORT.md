# Phase 2A Fallback Removal Report

Date: 2026-09-18
Status: Completed

## Goal
Remove runtime mock/fallback behavior so the app uses backend-driven data paths only, while keeping endpoint contracts intact.

## Completed Changes

### 1) Service-layer runtime fallbacks removed
Updated files:
- src/services/apiApplications.ts
- src/services/apiInvoice.ts
- src/services/apiRevenueCategories.ts
- src/services/apiWard.ts
- src/services/apiPublicCertificate.ts
- src/services/apiVerification.ts
- src/services/audit.ts
- src/services/business.ts
- src/services/notifications.ts
- src/services/operations.ts
- src/services/permits.ts
- src/services/soo.ts
- src/services/apiServices.ts

What changed:
- Removed local in-memory/mock return paths used when backend calls fail.
- Removed synthetic fallback objects and fallback mutation behavior.
- Kept backend endpoint routes and methods unchanged.
- Fixed malformed approval endpoint in apiApplications:
  - from /applications/admin /:id/approve
  - to   /applications/admin/:id/approve

### 2) Mock-mode switch neutralized
Updated file:
- src/services/_mock.ts

What changed:
- Runtime mock mode is now forced off.

### 3) Ward selection source centralized to LGA config
Updated files:
- src/app/(dashboard)/dashboard/applications/page.tsx
- src/app/(marketing)/about/page.tsx
- src/components/services/ApplicantSelectionStep.tsx
- src/components/services/forms/CdaRegistrationForm.tsx
- src/components/services/forms/CertificateOfOriginForm.tsx
- src/components/services/forms/ClubRegistrationForm.tsx
- src/components/services/forms/EnvironmentalSanitationForm.tsx
- src/components/services/forms/FarmersRegistrationForm.tsx
- src/components/services/forms/HaulageFeesForm.tsx
- src/components/services/forms/KioskLicenceForm.tsx
- src/components/services/forms/LiquorLicenceForm.tsx
- src/components/services/forms/QuarryPermitForm.tsx
- src/components/services/forms/StreetNamingForm.tsx
- src/components/services/forms/TenementRateForm.tsx
- src/components/services/forms/ViewingCentreLicenceForm.tsx

What changed:
- Replaced mock-data ward imports with LGA-config-driven ward names.

### 4) Marketing/dashboard content moved out of mock-data
New file:
- src/config/lgaContent.config.ts

Updated files:
- src/app/(dashboard)/dashboard/page.tsx
- src/app/(marketing)/page.tsx
- src/app/(marketing)/careers/page.tsx
- src/app/(marketing)/departments/page.tsx
- src/app/(marketing)/downloads/page.tsx
- src/app/(marketing)/faq/page.tsx
- src/app/(marketing)/gallery/page.tsx
- src/app/(marketing)/invest/page.tsx
- src/app/(marketing)/leadership/page.tsx
- src/app/(marketing)/news/page.tsx
- src/app/(marketing)/tourism/page.tsx

What changed:
- Replaced all page-level imports from src/lib/mock-data.ts with src/config/lgaContent.config.ts.

## Verification

### Build
- Command: npm run build
- Result: Success (Next.js production build completed, all routes generated).

### Mock-data import scan
- Query: from "@/lib/mock-data"
- Result: 0 matches under src.

## Notes for Phase 2B (AI Studio)
- Phase 2A establishes backend-only runtime behavior and LGA-config content sourcing.
- Proceed with certificate template/layout redesign in Phase 2B without reintroducing fallback or synthetic data paths.
