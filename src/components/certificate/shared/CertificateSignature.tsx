import React from "react";

interface CertificateSignatureProps {
  signerName?: string;
  signerTitle?: string;
  organization?: string;
  className?: string;
  align?: "left" | "center" | "right";
}

/**
 * @deprecated Legacy standalone signature component.
 * Signatures are now rendered directly via config in CertificateRenderer.tsx.
 */
export function CertificateSignature({
  signerName = "Hon. Dr. Waliat Folasade Adeyemo",
  signerTitle = "Executive Chairman",
  organization = "Odeda Local Government",
  className = "",
  align = "left",
}: CertificateSignatureProps) {
  const alignmentClass =
    align === "center"
      ? "items-center text-center"
      : align === "right"
      ? "items-end text-right"
      : "items-start text-left";

  return (
    <div className={`flex flex-col ${alignmentClass} ${className}`}>
      {/* Official Signature Image Asset */}
      <div className="h-14 w-48 relative flex items-center justify-center -mb-2">
        <img
          src="/certificates/signatures/chairman-signature.png"
          alt="Official Signature"
          className="max-h-full max-w-full object-contain pointer-events-none select-none"
        />
      </div>

      {/* Signature line divider */}
      <div className="w-48 h-[1.5px] bg-[#14532D] my-1 opacity-70" />

      {/* Signer Info */}
      <div
        className="text-[14px] font-bold text-[#14532D] tracking-wide"
        style={{ fontFamily: "'Libertinus Serif', 'Times New Roman', 'Liberation Serif', serif" }}
      >
        {signerName}
      </div>
      <div
        className="text-[12px] font-semibold text-slate-800 leading-tight"
        style={{ fontFamily: "'EB Garamond', 'Garamond', 'Times New Roman', serif" }}
      >
        {signerTitle}
      </div>
      <div
        className="text-[11px] text-slate-600 italic leading-tight"
        style={{ fontFamily: "'EB Garamond', 'Garamond', 'Times New Roman', serif" }}
      >
        {organization}
      </div>
    </div>
  );
}
