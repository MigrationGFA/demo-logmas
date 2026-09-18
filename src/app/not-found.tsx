import { NotFoundView } from "@/components/NotFoundView";
import { LGA_CONFIG } from "@/config/lga.config";

export const metadata = {
  title: `404 - Page Not Found | ${LGA_CONFIG.branding.appTitle}`,
  description: "The requested page could not be found.",
};

export default function GlobalNotFound() {
  return <NotFoundView />;
}
