"use client";

import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { FileCheck, AlertCircle, ShieldCheck, User, Phone, MapPin, Building2 } from "lucide-react";
import { DocumentSpec, UploadedFileMeta } from "./DocumentUploadStep";
import { ApplicantSnapshot } from "../ApplicantSelectionStep";

export interface ReviewSection {
  title: string;
  items: { label: string; value: React.ReactNode }[];
}

export interface ReviewRepeatableSection {
  title: string;
  countLabel: string;
  items: Array<Record<string, React.ReactNode>>;
}

interface ReviewSubmitStepProps {
  serviceName: string;
  revenueHead: string;
  feeAmount: number;
  applicant?: ApplicantSnapshot;
  sections: ReviewSection[];
  repeatableSections?: ReviewRepeatableSection[];
  documents: DocumentSpec[];
  uploadedFiles: Record<string, string | UploadedFileMeta>;
  declarationChecked: boolean;
  onDeclarationChange: (checked: boolean) => void;
  declarationText?: string;
}

export function ReviewSubmitStep({
  serviceName,
  revenueHead,
  feeAmount,
  applicant,
  sections,
  repeatableSections = [],
  documents,
  uploadedFiles,
  declarationChecked,
  onDeclarationChange,
  declarationText = "I solemnly declare that the information provided in this statutory application is true, authentic, and accurate. I understand that false statements or forged documentation incur criminal liability and automatic nullification under the LGA bye-laws.",
}: ReviewSubmitStepProps) {
  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h4 className="text-base font-bold text-foreground">
          Review Application & Statutory Submission
        </h4>
        <p className="text-xs text-muted-foreground mt-1">
          Please carefully inspect all applicant information, service parameters, and attached supporting documents before final statutory submission to the LGA Treasury and Administration.
        </p>
      </div>

      {/* Fee & Revenue Summary Banner */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-primary uppercase tracking-wider block">
            Statutory Assessment Total
          </span>
          <h4 className="text-xl font-extrabold text-foreground mt-0.5">
            ₦{feeAmount.toLocaleString()}
          </h4>
          <span className="text-xs text-muted-foreground">
            Revenue Head: <strong className="text-foreground">{revenueHead}</strong>
          </span>
        </div>
        <div className="flex items-center gap-2 bg-background border px-3 py-2 rounded-lg">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="text-xs">
            <span className="font-semibold block">Official LGA Verification</span>
            <span className="text-muted-foreground text-[11px]">Instant invoice & reference generation</span>
          </div>
        </div>
      </div>

      {/* Applicant Snapshot Section */}
      {applicant && applicant.fullName && (
        <div className="border rounded-xl p-4 bg-muted/10 space-y-3">
          <div className="flex items-center justify-between border-b pb-1.5">
            <h5 className="font-bold text-xs uppercase tracking-wider text-primary flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" /> Applicant Profile & Identity
            </h5>
            {applicant.applicantId ? (
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 text-[10px] border-emerald-300">
                Registered Citizen / Business (ID: {applicant.applicantId})
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-amber-500/10 text-amber-700 text-[10px] border-amber-300">
                Unregistered Applicant
              </Badge>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
            <div>
              <span className="text-muted-foreground block text-[11px] font-medium">Full Name:</span>
              <span className="font-semibold text-foreground">{applicant.fullName}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px] font-medium">Phone Number:</span>
              <span className="font-semibold text-foreground">{applicant.phone}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px] font-medium">Ward of Origin/Residency:</span>
              <span className="font-semibold text-foreground">{applicant.ward}</span>
            </div>
            <div className="sm:col-span-2">
              <span className="text-muted-foreground block text-[11px] font-medium">Address:</span>
              <span className="font-semibold text-foreground">{applicant.address}</span>
            </div>
            {applicant.email && (
              <div>
                <span className="text-muted-foreground block text-[11px] font-medium">Email Address:</span>
                <span className="font-semibold text-foreground">{applicant.email}</span>
              </div>
            )}
            {applicant.nin && (
              <div>
                <span className="text-muted-foreground block text-[11px] font-medium">NIN:</span>
                <span className="font-mono font-semibold text-foreground">{applicant.nin}</span>
              </div>
            )}
            {applicant.cacNumber && (
              <div>
                <span className="text-muted-foreground block text-[11px] font-medium">CAC Reg. No:</span>
                <span className="font-mono font-semibold text-foreground">{applicant.cacNumber}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Standard Sections */}
      <div className="space-y-4">
        {sections.map((section, idx) => (
          <div key={idx} className="border rounded-xl p-4 bg-muted/10 space-y-3">
            <h5 className="font-bold text-xs uppercase tracking-wider text-primary border-b pb-1.5">
              {section.title}
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              {section.items.map((item, i) => (
                <div key={i} className="space-y-0.5">
                  <span className="text-muted-foreground block text-[11px] font-medium">
                    {item.label}:
                  </span>
                  <div className="font-semibold text-foreground break-words">
                    {item.value || <span className="text-muted-foreground italic font-normal">N/A</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Repeatable Sections (e.g. Officers, Vehicles, Units, Equipment) */}
      {repeatableSections.map((rep, idx) => (
        <div key={idx} className="border rounded-xl p-4 bg-muted/10 space-y-3">
          <div className="flex items-center justify-between border-b pb-2">
            <h5 className="font-bold text-xs uppercase tracking-wider text-primary">
              {rep.title}
            </h5>
            <Badge variant="outline" className="text-xs font-semibold bg-primary/10 text-primary border-primary/20">
              {rep.items.length} {rep.countLabel}
            </Badge>
          </div>
          {rep.items.length === 0 ? (
            <p className="text-xs text-muted-foreground italic py-2">
              No entries recorded.
            </p>
          ) : (
            <div className="space-y-2.5">
              {rep.items.map((item, itemIdx) => (
                <div
                  key={itemIdx}
                  className="bg-card border rounded-lg p-3 text-xs grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 shadow-xs"
                >
                  {Object.entries(item).map(([k, v]) => (
                    <div key={k} className="space-y-0.5">
                      <span className="text-[10px] text-muted-foreground uppercase font-medium block">
                        {k.replace(/([A-Z])/g, " $1")}:
                      </span>
                      <div className="font-semibold text-foreground">
                        {v || <span className="text-muted-foreground italic font-normal"> - </span>}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Uploaded Documents Summary */}
      <div className="border rounded-xl p-4 bg-muted/10 space-y-3">
        <h5 className="font-bold text-xs uppercase tracking-wider text-primary border-b pb-1.5">
          Attached Supporting Documents
        </h5>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {documents.map((doc) => {
            const rawVal = uploadedFiles[doc.id];
            const uploadedName = typeof rawVal === "string" ? rawVal : rawVal?.name;

            return (
              <div
                key={doc.id}
                className="flex items-center justify-between p-2.5 rounded-lg border bg-card text-xs gap-2"
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  {uploadedName ? (
                    <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-muted-foreground/50 shrink-0" />
                  )}
                  <div className="truncate">
                    <span className="font-medium text-foreground block truncate">{doc.label}</span>
                    {uploadedName && (
                      <span className="text-[10px] font-mono text-muted-foreground block truncate">
                        {uploadedName} (Field: {doc.id})
                      </span>
                    )}
                  </div>
                </div>
                {uploadedName ? (
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 text-[10px] border-emerald-300 shrink-0">
                    Uploaded
                  </Badge>
                ) : doc.required ? (
                  <Badge variant="outline" className="bg-red-500/10 text-red-600 text-[10px] border-red-300 shrink-0">
                    Missing *
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-muted-foreground text-[10px] shrink-0">
                    Not attached
                  </Badge>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Statutory Legal Declaration */}
      <div className="bg-amber-500/5 border-2 border-amber-500/30 rounded-xl p-4 sm:p-5 space-y-3">
        <div className="flex items-start gap-3">
          <Checkbox
            id="statutory-declaration-checkbox"
            checked={declarationChecked}
            onCheckedChange={(c) => onDeclarationChange(!!c)}
            className="mt-1 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
          />
          <div className="space-y-1">
            <Label
              htmlFor="statutory-declaration-checkbox"
              className="text-xs font-bold text-foreground cursor-pointer"
            >
              Statutory Declaration & Legal Consent <span className="text-red-500">*</span>
            </Label>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {declarationText}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

