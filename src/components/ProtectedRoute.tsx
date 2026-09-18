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

export function RedirectIfPasswordReset({ children }: { children: React.ReactNode }) {
  const { user, isLoadingUser } = useAuth();
  const [open, setOpen] = useState(user?.passwordResetRequired ?? false);

  useEffect(() => {
    if (!isLoadingUser && user) {
      setOpen(user.passwordResetRequired ?? false);
    }
  }, [isLoadingUser, user]);

  return (
    <>
      {children}
      <ForcePasswordChangeModal
        open={open}
        setOpen={setOpen}
      />
    </>
  );
}

interface ProtectedRouteProps {
  children: ReactNode;
}

// Routes that don't require authentication
const PUBLIC_ROUTES = ['/login', '/register', '/verify-email', '/forgot-password', '/reset-password'];

// Routes that citizens/business owners should be redirected to onboarding
const ONBOARDING_REQUIRED_ROUTES = ['/dashboard', '/dashboard/services', '/dashboard/applications'];

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const navigate = useRouter();
  const pathname = usePathname();
  const { isLoadingUser, isUserDataFresh, user } = useAuth();
  const token = tokenManager.getAccessToken();

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
  const isOnboardingRoute = pathname === "/onboarding";
  const isCitizenOrBusiness = user?.role === "citizen" || user?.role === "business_owner";
  const needsOnboarding = isCitizenOrBusiness && !user?.onboardingCompleted;
  const needsEmailVerification = isCitizenOrBusiness && !user?.emailVerifiedAt;

  const isReady = !isLoadingUser && isUserDataFresh;

  let redirectTarget: string | null = null;
  const redirectToastMessage: string | null = null;
  let shouldClearSession = false;

  if (!isLoadingUser && !token) {
    redirectTarget = "/login";
  } else if (isReady && user) {
    if (needsEmailVerification && !isPublicRoute) {
      // Unverified users can't be left holding a valid session  -  clear it
      // or they'll just get bounced straight back here from /login.
      redirectTarget = `/login?reason=unverified&email=${encodeURIComponent(user.email)}`;
      shouldClearSession = true;
    } else if (isOnboardingRoute) {
      // Onboarding route is no longer a blocking page; redirect to dashboard where modal indicator is available
      redirectTarget = "/dashboard";
    } else if (isPublicRoute) {
      redirectTarget = "/dashboard";
    }
  }

  useEffect(() => {
    if (redirectTarget) {
      if (shouldClearSession) {
        tokenManager.clearAllTokens();
      }
      navigate.push(redirectTarget);
      if (redirectToastMessage) toast.info(redirectToastMessage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [redirectTarget]);

  if (isLoadingUser || !token || !isUserDataFresh || redirectTarget) {
    return <FullPageLoader />;
  }

  // return <>{children}</>;
   return <RedirectIfPasswordReset>{children}</RedirectIfPasswordReset>;
}
