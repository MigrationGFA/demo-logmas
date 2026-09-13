import React from "react";

/**
 * High-fidelity vector SVG reproduction of Odeda Local Government Emblem
 * Features: Green Odeda LGA map silhouette, landmark rocky hill / tower, "ODEDA LGA", "Our People, Our Priority"
 */
export function OdedaLgaLogo({ className = "w-20 h-20" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 160 160"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Odeda Local Government Crest"
    >
      <circle cx="80" cy="80" r="76" fill="#FBFDF8" stroke="#14532D" strokeWidth="3" />
      <circle cx="80" cy="80" r="70" stroke="#CA8A04" strokeWidth="1.5" strokeDasharray="3 2" />
      <circle cx="80" cy="80" r="64" fill="#0D3B1E" />

      {/* Outer Curved Text paths */}
      <path id="circleTop" d="M 24 80 A 56 56 0 0 1 136 80" fill="none" />
      <text fill="#FFFFFF" fontSize="10.5" fontWeight="900" letterSpacing="2.5">
        <textPath href="#circleTop" startOffset="50%" textAnchor="middle">
          ODEDA LOCAL GOVT
        </textPath>
      </text>

      {/* Center White Shield / Disc */}
      <circle cx="80" cy="82" r="44" fill="#FFFFFF" stroke="#CA8A04" strokeWidth="2" />

      {/* Map silhouette of Odeda */}
      <path
        d="M 62 65 C 68 60, 85 58, 96 66 C 104 72, 102 88, 95 96 C 88 104, 72 102, 64 96 C 58 88, 56 72, 62 65 Z"
        fill="#15803D"
        opacity="0.25"
      />

      {/* Landmark Rocks / Hill Illustration */}
      <path d="M 52 92 L 68 70 L 84 92 Z" fill="#14532D" />
      <path d="M 76 92 L 92 64 L 108 92 Z" fill="#166534" />
      <path d="M 68 92 L 80 75 L 94 92 Z" fill="#22C55E" opacity="0.6" />

      {/* Golden Sunburst over hill */}
      <circle cx="80" cy="62" r="8" fill="#EAB308" />
      <path d="M 80 50 L 80 53 M 70 54 L 72 57 M 90 54 L 88 57" stroke="#EAB308" strokeWidth="1.5" strokeLinecap="round" />

      {/* Central Bold Text */}
      <rect x="52" y="94" width="56" height="15" rx="3" fill="#0D3B1E" stroke="#CA8A04" strokeWidth="1" />
      <text x="80" y="105" fill="#FFFFFF" fontSize="8" fontWeight="bold" textAnchor="middle" letterSpacing="1">
        ODEDA LGA
      </text>

      {/* Bottom Ribbon / Motto */}
      <path d="M 38 126 C 60 134, 100 134, 122 126 L 118 138 C 98 144, 62 144, 42 138 Z" fill="#CA8A04" />
      <text x="80" y="134" fill="#0D3B1E" fontSize="6.5" fontWeight="900" textAnchor="middle" letterSpacing="0.5">
        OUR PEOPLE, OUR PRIORITY
      </text>
    </svg>
  );
}

/**
 * High-fidelity Ogun State Crest (Circular Emblem with Coat of Arms & State Colors)
 */
export function OgunStateCrest({ className = "w-20 h-20" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 160 160"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Ogun State Nigeria Crest"
    >
      <circle cx="80" cy="80" r="76" fill="#FBFDF8" stroke="#166534" strokeWidth="3" />
      <circle cx="80" cy="80" r="70" stroke="#CA8A04" strokeWidth="1.5" />
      <circle cx="80" cy="80" r="66" stroke="#166534" strokeWidth="1" strokeDasharray="2 2" />

      {/* Top Arc Text */}
      <path id="ogunTop" d="M 28 80 A 52 52 0 0 1 132 80" fill="none" />
      <text fill="#0F4224" fontSize="10" fontWeight="900" letterSpacing="3">
        <textPath href="#ogunTop" startOffset="50%" textAnchor="middle">
          OGUN STATE NIGERIA
        </textPath>
      </text>

      {/* Bottom Arc Stars */}
      <circle cx="48" cy="116" r="3.5" fill="#15803D" />
      <circle cx="80" cy="128" r="4.5" fill="#CA8A04" />
      <circle cx="112" cy="116" r="3.5" fill="#15803D" />

      {/* Center Shield */}
      <g transform="translate(48, 46)">
        <path
          d="M 0 0 L 64 0 L 64 36 C 64 54, 32 64, 32 64 C 32 64, 0 54, 0 36 Z"
          fill="#0D3B1E"
          stroke="#CA8A04"
          strokeWidth="2"
        />
        {/* Shield inner field */}
        <path
          d="M 4 4 L 60 4 L 60 34 C 60 48, 32 58, 32 58 C 32 58, 4 48, 4 34 Z"
          fill="#15803D"
        />
        {/* Rising Sun in Shield */}
        <circle cx="32" cy="24" r="12" fill="#EAB308" />
        <path d="M 32 6 L 32 10 M 20 12 L 23 15 M 44 12 L 41 15 M 14 24 L 18 24 M 50 24 L 46 24" stroke="#EAB308" strokeWidth="2" strokeLinecap="round" />
        {/* Palm Tree / Agriculture / Unity motif */}
        <path d="M 30 24 C 30 38, 34 38, 34 46 L 30 46 Z" fill="#854D0E" />
        <path d="M 32 24 C 20 18, 14 28, 14 28 C 22 28, 28 26, 32 24 Z" fill="#22C55E" />
        <path d="M 32 24 C 44 18, 50 28, 50 28 C 42 28, 36 26, 32 24 Z" fill="#22C55E" />
        <path d="M 32 22 C 32 12, 24 8, 24 8 C 26 16, 30 20, 32 22 Z" fill="#4ADE80" />
        <path d="M 32 22 C 32 12, 40 8, 40 8 C 38 16, 34 20, 32 22 Z" fill="#4ADE80" />
      </g>
    </svg>
  );
}

/**
 * National Coat of Arms of Nigeria (Two white horses, black shield with silver pall 'Y', red eagle, green & white wreath)
 */
export function NigerianCoatOfArms({ className = "w-20 h-20" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 160 160"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Federal Republic of Nigeria Coat of Arms"
    >
      {/* Red Eagle on top */}
      <path
        d="M 80 20 C 72 26, 68 34, 60 32 C 66 38, 72 38, 74 44 L 80 40 L 86 44 C 88 38, 94 38, 100 32 C 92 34, 88 26, 80 20 Z"
        fill="#DC2626"
        stroke="#991B1B"
        strokeWidth="1"
      />
      {/* Green & White Wreath (Torse) */}
      <rect x="64" y="42" width="32" height="6" rx="2" fill="#15803D" stroke="#CA8A04" strokeWidth="1" />
      <rect x="74" y="42" width="12" height="6" fill="#FFFFFF" />

      {/* Left Supporting White Horse */}
      <path
        d="M 40 48 C 42 42, 50 48, 56 56 C 58 64, 52 74, 52 84 C 52 94, 46 108, 38 116 C 42 110, 46 96, 44 88 C 40 80, 32 68, 34 58 C 35 52, 38 50, 40 48 Z"
        fill="#F8FAFC"
        stroke="#64748B"
        strokeWidth="1.5"
      />
      <path d="M 46 64 C 42 66, 38 74, 40 82" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" />

      {/* Right Supporting White Horse */}
      <path
        d="M 120 48 C 118 42, 110 48, 104 56 C 102 64, 108 74, 108 84 C 108 94, 114 108, 122 116 C 118 110, 114 96, 116 88 C 120 80, 128 68, 126 58 C 125 52, 122 50, 120 48 Z"
        fill="#F8FAFC"
        stroke="#64748B"
        strokeWidth="1.5"
      />
      <path d="M 114 64 C 118 66, 122 74, 120 82" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" />

      {/* Central Black Shield with Silver Y Pall (River Niger and Benue) */}
      <path
        d="M 58 50 L 102 50 L 102 84 C 102 100, 80 114, 80 114 C 80 114, 58 100, 58 84 Z"
        fill="#0F172A"
        stroke="#CA8A04"
        strokeWidth="2"
      />
      {/* Silver 'Y' (Pall wavy) */}
      <path
        d="M 58 50 L 74 68 L 74 108 L 86 108 L 86 68 L 102 50 L 92 50 L 80 62 L 68 50 Z"
        fill="#E2E8F0"
        stroke="#94A3B8"
        strokeWidth="1"
      />

      {/* Coctuses / Floral Base (Costus Spectabilis) */}
      <path d="M 30 118 C 55 110, 105 110, 130 118 L 126 126 C 100 120, 60 120, 34 126 Z" fill="#15803D" />
      <circle cx="50" cy="120" r="3" fill="#EAB308" />
      <circle cx="80" cy="119" r="4" fill="#EAB308" />
      <circle cx="110" cy="120" r="3" fill="#EAB308" />

      {/* Bottom Motto Scroll: UNITY AND FAITH, PEACE AND PROGRESS */}
      <rect x="24" y="128" width="112" height="16" rx="3" fill="#CA8A04" stroke="#854D0E" strokeWidth="1" />
      <text x="80" y="139" fill="#0D3B1E" fontSize="5.5" fontWeight="900" textAnchor="middle" letterSpacing="0.8">
        UNITY AND FAITH, PEACE AND PROGRESS
      </text>
    </svg>
  );
}