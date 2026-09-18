"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Home, ArrowLeft, Search, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";

export function NotFoundView() {
  const router = useRouter();

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-16 text-center">
      <div className="relative mb-6">
        <div className="text-8xl md:text-9xl font-extrabold tracking-tight text-primary/15 select-none">
          404
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-16 w-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-sm">
            <Search className="h-8 w-8" />
          </div>
        </div>
      </div>

      <div className="max-w-md space-y-3">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
          Page Not Found
        </h1>
        <p className="text-muted-foreground text-sm leading-relaxed">
          The page or statutory resource you are looking for could not be found, may have been relocated, or is temporarily unavailable.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
        <Button
          asChild
          size="default"
          className="gap-2 shadow-sm font-medium"
        >
          <Link href="/">
            <Home className="h-4 w-4" />
            Go Back Home
          </Link>
        </Button>

        <Button
          asChild
          variant="outline"
          size="default"
          className="gap-2 font-medium"
        >
          <Link href="/dashboard">
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>
        </Button>

        <Button
          variant="ghost"
          size="default"
          onClick={() => router.back()}
          className="gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Go Back
        </Button>
      </div>

      <div className="mt-12 pt-8 border-t border-border/60 max-w-sm w-full">
        <p className="text-xs text-muted-foreground mb-3 font-medium">Helpful Links</p>
        <div className="flex flex-wrap justify-center gap-4 text-xs">
          <Link href="/services" className="text-primary hover:underline">
            Public Services
          </Link>
          <span className="text-muted-foreground/40">•</span>
          <Link href="/verify" className="text-primary hover:underline">
            Verify Permits
          </Link>
          <span className="text-muted-foreground/40">•</span>
          <Link href="/contact" className="text-primary hover:underline">
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}

export default NotFoundView;

