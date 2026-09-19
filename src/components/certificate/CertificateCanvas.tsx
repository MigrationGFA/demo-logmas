/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { PublicCertificate } from "@/types/publicCertificate";
import { CertificateRenderer } from "./CertificateRenderer";
import {
  MasterCertificateConfig,
  LANDSCAPE_TEMPLATE_CONFIG,
  getMasterTemplateConfig,
} from "@/config/certificateFieldConfig";
import { resolveTemplateForService } from "@/config/certificateTemplateMap";

interface CertificateCanvasProps {
  certificate: PublicCertificate;
  templateConfig?: MasterCertificateConfig | any;
  className?: string;
  isWatermarked?: boolean;
}

export function CertificateCanvas({
  certificate,
  templateConfig,
  className = "",
  isWatermarked = false,
}: CertificateCanvasProps) {
  // Deterministically enforce landscape master template configuration
  const config =
    templateConfig && templateConfig.fields && templateConfig.orientation === "landscape"
      ? templateConfig
      : getMasterTemplateConfig(
          resolveTemplateForService(certificate.service.code || certificate.service.name)
        );

  return (
    <CertificateRenderer
      certificate={certificate}
      config={config}
      className={className}
      isWatermarked={isWatermarked}
    />
  );
}
