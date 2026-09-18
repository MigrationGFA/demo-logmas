"use client";

import React, { Suspense } from "react";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";
import { PublicServiceApplyWidget } from "@/components/services/PublicServiceApplyWidget";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ShieldCheck, ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ApplyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-mesh border-b border-border/40 py-12 md:py-16">
          <div className="container mx-auto px-4 text-center max-w-3xl">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                <Sparkles className="h-3 w-3 mr-1" /> Official Citizen Application Portal
              </Badge>
              <Badge variant="secondary" className="text-[10px]">
                <ShieldCheck className="h-3 w-3 mr-1 text-emerald-600" /> the LGA
              </Badge>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              Statutory Service Application & Online Payment
            </h1>
            <p className="mt-2 text-sm text-muted-foreground max-w-xl mx-auto">
              Select your service, verify official tariffs, settle the statutory fee online, and auto-provision your citizen portal account to submit documents.
            </p>
            <div className="mt-4 flex justify-center">
              <Button asChild variant="ghost" size="sm" className="text-xs text-muted-foreground">
                <Link href="/services">
                  <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back to Services Catalogue
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Interactive Apply Widget Section */}
        <section className="container mx-auto px-4 py-12 max-w-5xl">
          <Suspense
            fallback={
              <div className="p-12 text-center text-xs text-muted-foreground">
                <RefreshCw className="h-5 w-5 animate-spin mx-auto text-primary mb-2" />
                Loading application form...
              </div>
            }
          >
            <PublicServiceApplyWidget showStepGuide={true} />
          </Suspense>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
