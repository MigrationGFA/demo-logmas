"use client";
import React from "react";
import { Check, ChevronRight, ArrowLeft, ArrowRight, Shield, AlertCircle, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ServiceType, getConfiguredFeeForService } from "@/config/lgaServices";

export interface FormStep {
  id: string;
  title: string;
  shortTitle?: string;
  description?: string;
}

interface FormWizardProps {
  service: ServiceType;
  steps: FormStep[];
  currentStepIndex: number;
  onStepChange: (newIndex: number) => void;
  onNext: () => void;
  onPrev: () => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting?: boolean;
  isStepValid?: boolean;
  currentFee?: number;
  children: React.ReactNode;
  submitLabel?: string;
  submitDisabled?: boolean;
}

export function FormWizard({
  service,
  steps,
  currentStepIndex,
  onStepChange,
  onNext,
  onPrev,
  onSubmit,
  isSubmitting = false,
  isStepValid = true,
  currentFee,
  children,
  submitLabel = "Submit Application & Proceed",
  submitDisabled = false,
}: FormWizardProps) {
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;
  const activeStep = steps[currentStepIndex];
  
  // Get fee from service data
  const feeToDisplay = currentFee !== undefined 
    ? currentFee 
    : (service.feeConfig?.amount ? parseFloat(service.feeConfig.amount) : service.defaultFee || 0);

  // Get requirements from service
  const requirements = service.requirements || [];
  const estimatedDays = service.estimatedDays || 3;

  return (
    <div className="space-y-6">
      {/* Service Header Banner */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background p-4 sm:p-5 rounded-xl border border-primary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded">
              {service.category}
            </span>
            <span className="text-xs text-muted-foreground">
              {service.revenueHead}
            </span>
            {service.certificateType && (
              <span className="text-xs bg-blue-500/10 text-blue-600 px-2 py-0.5 rounded">
                {service.certificateType.replace('_', ' ')}
              </span>
            )}
          </div>
          <h3 className="font-bold text-lg text-foreground">{service.name}</h3>
          <p className="text-xs text-muted-foreground max-w-xl">
            {service.description || service.feeDescription || "Official Statutory Portal"}
          </p>
          <div className="flex flex-wrap gap-2 mt-1">
            <span className="text-xs bg-green-500/10 text-green-600 px-2 py-0.5 rounded">
              {estimatedDays} days processing
            </span>
            {service.supportsRenewal && (
              <span className="text-xs bg-purple-500/10 text-purple-600 px-2 py-0.5 rounded">
                Renewable
              </span>
            )}
          </div>
        </div>
        <div className="bg-background/80 backdrop-blur-sm border border-primary/20 p-3 rounded-lg text-right sm:text-right shrink-0">
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground block font-medium">
            Statutory Fee
          </span>
          <span className="text-xl font-extrabold text-primary">
            ₦{feeToDisplay.toLocaleString()}
          </span>
          {service.feeConfig?.status && (
            <span className="text-[10px] text-muted-foreground block mt-0.5">
              {service.feeConfig.status}
            </span>
          )}
        </div>
      </div>

      {/* Modern Responsive Stepper */}
      <div className="bg-card border rounded-xl p-3 sm:p-4 shadow-xs">
        <div className="flex items-center justify-between gap-1 sm:gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {steps.map((step, idx) => {
            const isCompleted = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;
            const isClickable = idx < currentStepIndex;

            return (
              <React.Fragment key={step.id}>
                <button
                  type="button"
                  disabled={!isClickable}
                  onClick={() => isClickable && onStepChange(idx)}
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 text-left ${
                    isCurrent
                      ? "bg-primary text-primary-foreground shadow-xs ring-1 ring-primary/30"
                      : isCompleted
                      ? "bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer"
                      : "text-muted-foreground/70 bg-muted/40 cursor-not-allowed"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                      isCurrent
                        ? "bg-primary-foreground text-primary"
                        : isCompleted
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted-foreground/20 text-muted-foreground"
                    }`}
                  >
                    {isCompleted ? <Check className="w-3 h-3 stroke-[3]" /> : idx + 1}
                  </div>
                  <span className="hidden md:inline whitespace-nowrap">
                    {step.shortTitle || step.title}
                  </span>
                  <span className="md:hidden whitespace-nowrap">
                    {step.shortTitle || `Step ${idx + 1}`}
                  </span>
                </button>

                {idx < steps.length - 1 && (
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0 hidden sm:block" />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Active Step Indicator & Description */}
        <div className="mt-3 pt-3 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <div>
            <div className="text-xs font-bold text-primary uppercase tracking-wide">
              Step {currentStepIndex + 1} of {steps.length}: {activeStep.title}
            </div>
            {activeStep.description && (
              <div className="text-xs text-muted-foreground mt-0.5">
                {activeStep.description}
              </div>
            )}
          </div>
          <span className="text-[11px] text-muted-foreground/80 self-end sm:self-auto">
            Fields marked with <span className="text-red-500 font-bold">*</span> are mandatory
          </span>
        </div>
      </div>

      {/* Step Form Body */}
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="bg-card border rounded-xl p-5 sm:p-6 shadow-xs">
          {children}
        </div>

        {/* Required Documents Summary */}
        {currentStepIndex < steps.length - 1 && service.requirements && service.requirements.length > 0 && (
          <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-3 flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-500" />
            <span className="text-xs text-muted-foreground">
              Required documents: {service.requirements.map(req => 
                req.replace('_', ' ').toUpperCase()
              ).join(', ')}
            </span>
          </div>
        )}

        {/* Wizard Navigation Footer */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-2">
          {!isFirstStep ? (
            <Button
              type="button"
              variant="outline"
              onClick={onPrev}
              disabled={isSubmitting}
              className="w-full sm:w-auto gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous Step
            </Button>
          ) : (
            <div />
          )}

          {!isLastStep ? (
            <Button
              type="button"
              onClick={onNext}
              disabled={!isStepValid || isSubmitting}
              className="w-full sm:w-auto gap-2 bg-primary text-primary-foreground ml-auto"
            >
              Next: {steps[currentStepIndex + 1]?.shortTitle || steps[currentStepIndex + 1]?.title || "Continue"}
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={isSubmitting || submitDisabled}
              className="w-full sm:w-auto gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md ml-auto"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing Application...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  {submitLabel}
                </>
              )}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
