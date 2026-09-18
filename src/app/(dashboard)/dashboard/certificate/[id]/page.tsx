
// "use client"
// import { Printer, ArrowLeft, ShieldCheck, Loader2, FileQuestion, AlertCircle } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Card } from "@/components/ui/card";
// import { QRCodeSVG } from "@/components/dashboard/qr-code";
// import { useGetCertificateData } from "@/hooks/queries/useServices";
// import React from "react";
// import Link from "next/link";


// export default function CertificatePage({params}:{params:Promise<{ id: string }>}) {
//   const { id:applicationId } = React.use(params)
//   const { useCertificate } = useGetCertificateData();
  
//   // Check if ID is missing or invalid
//   const hasValidId = !!applicationId 

//   const { data: certResponse, isLoading, error } = useCertificate(applicationId, hasValidId );

//   // Extract certificate data from response (handle potential nested structure)
//   const cert = certResponse;

//   console.log(cert)

//   // No ID provided
//   if (!hasValidId) {
//     return (
//       <div className="flex items-center justify-center min-h-[60vh]">
//         <Card className="max-w-md p-8 text-center">
//           <div className="flex flex-col items-center gap-4">
//             <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
//               <FileQuestion className="h-8 w-8 text-destructive" />
//             </div>
//             <h2 className="text-xl font-semibold">No Certificate ID Provided</h2>
//             <p className="text-muted-foreground">
//               A valid certificate ID is required to view this certificate.
//               Please check the link or go back to your applications.
//             </p>
//             <Button asChild variant="outline" className="mt-2">
//               <Link href="/dashboard/applications">
//                 <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Applications
//               </Link>
//             </Button>
//           </div>
//         </Card>
//       </div>
//     );
//   }

//   // Loading state
//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center min-h-[60vh] text-muted-foreground">
//         <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading certificateâ€¦
//       </div>
//     );
//   }

//   // Error or no certificate data
//   if (error || !cert) {
//     return (
//       <div className="flex items-center justify-center min-h-[60vh]">
//         <Card className="max-w-md p-8 text-center">
//           <div className="flex flex-col items-center gap-4">
//             <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
//               <AlertCircle className="h-8 w-8 text-destructive" />
//             </div>
//             <h2 className="text-xl font-semibold">Certificate Not Found</h2>
//             <p className="text-muted-foreground">
//               {error ? "Unable to load certificate data." : "No certificate found for this application."}
//               <br />
//               Please ensure the application has been approved and a certificate has been issued.
//             </p>
//             <Button asChild variant="outline" className="mt-2">
//               <Link href="/dashboard/applications">
//                 <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Applications
//               </Link>
//             </Button>
//           </div>
//         </Card>
//       </div>
//     );
//   }

//   const issued = new Date(cert.issuedAt);
//   const issuedDate = issued.toLocaleDateString(undefined, { 
//     year: "numeric", 
//     month: "long", 
//     day: "numeric" 
//   });

//   // Format date of birth for display
//   const dateOfBirth = cert.dateOfBirth 
//     ? new Date(cert.dateOfBirth).toLocaleDateString(undefined, {
//         year: "numeric",
//         month: "long",
//         day: "numeric"
//       })
//     : "Not Specified";

//   return (
//     <div className="cert-page">
//       {/* Top toolbar  -  hidden on print */}
//       <div className="no-print flex items-center justify-between mb-5">
//         <Button asChild variant="ghost" size="sm">
//           <Link href="/dashboard/applications">
//             <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Applications
//           </Link>
//         </Button>
//         <Button onClick={() => window.print()} className="bg-gradient-hero shadow-elegant">
//           <Printer className="h-4 w-4 mr-2" /> Download PDF / Print
//         </Button>
//       </div>

//       {/* Certificate document  -  .print-area triggers global print rules */}
//       <div 
//         className="print-area cert-document mx-auto bg-white text-slate-900 shadow-2xl"
//         style={{ maxWidth: "1100px", aspectRatio: "1.414 / 1" }}
//       >
//         <div className="relative h-full w-full p-3">
//           {/* Outer ornate border */}
//           <div className="absolute inset-3 border-[6px] border-double border-amber-700/80 rounded-sm" />
//           <div className="absolute inset-5 border border-amber-600/40 rounded-sm" />

//           <div className="relative h-full w-full px-12 py-10 flex flex-col">
//             {/* Header  -  crest + titles */}
//             <div className="flex flex-col items-center text-center">
//               <div className="h-20 w-20 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-md ring-4 ring-amber-200">
//                 <ShieldCheck className="h-10 w-10 text-white" />
//               </div>
//               <div className="mt-3 text-[11px] tracking-[0.35em] text-amber-800 font-semibold">
//                 FEDERAL REPUBLIC OF NIGERIA
//               </div>
//               <h1 className="mt-1 text-3xl font-serif font-bold text-slate-900">
//                 the Local Government
//               </h1>
//               <div className="text-sm text-slate-600 italic">
//                 Office of the Local Government Chairman  -  Ogun State
//               </div>
//               <div className="mt-5 inline-block px-6 py-1.5 border-y-2 border-amber-700">
//                 <h2 className="text-2xl font-serif font-bold tracking-[0.25em] text-amber-800">
//                   CERTIFICATE OF ORIGIN
//                 </h2>
//               </div>
//             </div>

//             {/* Body */}
//             <div className="flex-1 mt-8 text-center font-serif text-slate-800 leading-relaxed">
//               <p className="text-base">This is to certify that</p>
//               <p className="mt-4 text-4xl font-bold uppercase tracking-wide text-slate-900 underline decoration-amber-700/60 underline-offset-8">
//                 {cert.fullName}
//               </p>
//               <p className="mt-6 text-base max-w-3xl mx-auto">
//                 born on <span className="font-semibold">{dateOfBirth}</span> ({cert.gender}), 
//                 is a bona fide indigene of{" "}
//                 <span className="font-semibold">{cert.ward} Ward</span>, in{" "}
//                 <span className="font-semibold">the Local Government Area</span> of{" "}
//                 <span className="font-semibold">{cert.state || "Ogun State"}</span>, and is duly recognised as such 
//                 under the records of this Local Government Council.
//               </p>
//               <p className="mt-5 text-sm text-slate-600">
//                 Issued this {issuedDate} • Certificate No.{" "}
//                 <span className="font-mono font-semibold text-slate-800">{cert.certificateNumber}</span>
//               </p>
//             </div>

//             {/* Footer  -  signature + QR */}
//             <div className="mt-auto grid grid-cols-3 gap-6 items-end pt-6">
//               <div className="text-center">
//                 <div className="border-t-2 border-slate-700 pt-2 text-sm font-serif">
//                   <div className="font-semibold">{cert.councillorName || "Ward Councillor"}</div>
//                   <div className="text-xs text-slate-600 italic">Executive Ward Councillor Signature</div>
//                 </div>
//               </div>

//               <div className="text-center text-[10px] text-slate-500 font-serif italic">
//                 This certificate is electronically issued and remains the property of {cert.issuedBy || "the LGA Council"}.
//               </div>

//               <div className="flex flex-col items-end">
//                 <div className="p-1.5 bg-white border border-slate-300 rounded">
//                   <QRCodeSVG 
//                     value={cert.verificationUrl || `https://logmas.gov.ng/verify/${cert.certificateNumber}`} 
//                     size={112} 
//                   />
//                 </div>
//                 <div className="mt-1.5 text-[9px] text-slate-500 font-mono max-w-[140px] text-right truncate">
//                   Scan to verify · {cert.qrToken || cert.certificateNumber.slice(-8)}
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }


import React from 'react'

function Page() {
  return (
    <div>Page</div>
  )
}

export default Page
