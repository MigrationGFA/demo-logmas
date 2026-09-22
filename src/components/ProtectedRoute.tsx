"use client"
import { ReactNode, useEffect } from "react";
import { useAuth } from "@/hooks/queries/useAuth";
import { tokenManager } from "@/services/apiAuth";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import { Loader2, ShieldCheck } from "lucide-react";
import { ForcePasswordChangeModal } from "./ForcePasswordChangeModal";
import { toast } from "sonner";

export function FullPageLoader({title="Page"}:{title?:string}) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 10;
      });
    }, 200);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-6 max-w-sm w-full px-4">
        <div className="h-20 w-20 rounded-2xl bg-gradient-hero flex items-center justify-center shadow-elegant animate-pulse">
          <ShieldCheck className="h-10 w-10 text-primary-foreground" />
        </div>
        
        <div className="text-center">
          <p className="text-sm font-medium text-foreground">Loading your {title ?? "dashboard"}</p>
          <p className="text-xs text-muted-foreground mt-1">Please wait...</p>
        </div>
        
        <div className="w-full mt-2">
          <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-gradient-hero rounded-full transition-all duration-300 ease-out"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <p className="text-[10px] text-muted-foreground text-center mt-1.5">
            {Math.round(Math.min(progress, 100))}%
          </p>
        </div>
      </div>
    </div>
  );
}

import { DEMO_PRESET_USERS } from "@/lib/mockApiHandler";

export function RedirectIfPasswordReset({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

interface ProtectedRouteProps {
  children: ReactNode;
}

// Routes that don't require authentication
const PUBLIC_ROUTES = ['/login', '/register', '/verify-email', '/forgot-password', '/reset-password'];

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const navigate = useRouter();
  const pathname = usePathname();
  const { isLoadingUser, user } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // In demo environment, auto-provision citizen session if none exists
    const existingToken = tokenManager.getAccessToken();
    const existingUser = tokenManager.getUser();
    if (!existingToken || !existingUser) {
      tokenManager.setAccessToken("demo-offline-session-token");
      tokenManager.setUser(DEMO_PRESET_USERS.citizen as any);
    }
  }, []);

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
  const isOnboardingRoute = pathname === "/onboarding";

  useEffect(() => {
    if (!mounted) return;
    if (isOnboardingRoute || isPublicRoute) {
      navigate.push("/dashboard");
    }
  }, [mounted, isOnboardingRoute, isPublicRoute, navigate]);

  if (!mounted) {
    return <FullPageLoader title="demo dashboard" />;
  }

  return <>{children}</>;
}
