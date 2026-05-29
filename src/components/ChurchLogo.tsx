import React from "react";

interface ChurchLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  textColor?: string;
  sloganColor?: string;
  vertical?: boolean;
  logoUrl?: string;
}

export default function ChurchLogo({
  className = "",
  size = 64,
  showText = true,
  textColor = "text-slate-900",
  sloganColor = "text-slate-500",
  vertical = false,
  logoUrl = ""
}: ChurchLogoProps) {
  // Try to load from localStorage if not provided to make it backwards-compatible
  const resolvedLogoUrl = logoUrl || (typeof window !== "undefined" ? localStorage.getItem("viva-church-logo-url") || "" : "");

  return (
    <div className={`flex ${vertical ? "flex-col items-center text-center gap-4" : "items-center gap-3"} ${className}`}>
      {resolvedLogoUrl ? (
        <img
          src={resolvedLogoUrl}
          alt="Logo da Igreja"
          style={{ width: size, height: size }}
          className="rounded-xl object-contain shrink-0 transition-transform hover:scale-105 duration-300 shadow-3xs"
          referrerPolicy="no-referrer"
        />
      ) : (
        /* High-Fidelity brand-accurate Cruz + Folha + Circuito Digital SVG */
        <svg
          id="logo-igreja-viva"
          width={size}
          height={size}
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="shrink-0 transition-transform hover:scale-105 duration-300"
        >
        <defs>
          {/* Subtle nature gradient for the leaf to match the design's organic vibe */}
          <linearGradient id="leafGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1B7A2D" />
            <stop offset="100%" stopColor="#34A853" />
          </linearGradient>
        </defs>

        {/* Central Christian Cross in Vivid Green (#1B7A2D) */}
        <path
          d="M 92 30 C 92 28, 94 26, 96 26 H 104 C 106 26, 108 28, 108 30 V 65 H 145 C 147 65, 149 67, 149 69 V 77 C 149 79, 147 81, 145 81 H 108 V 160 C 108 162, 106 164, 104 164 H 96 C 94 164, 92 162, 92 160 V 81 H 55 C 53 81, 51 79, 51 77 V 69 C 51 67, 53 65, 55 65 H 92 Z"
          fill="#1B7A2D"
        />

        {/* LEFT SEMICIRCLE ARC: Green, symbolizing organic growth and life */}
        <path
          d="M 90 24 A 72 72 0 0 0 90 166"
          stroke="#1B7A2D"
          strokeWidth="6"
          strokeLinecap="round"
        />

        {/* ORGANIC LEAF: Growing upwards and inwards in the bottom-left sphere */}
        <path
          d="M 50 125 C 40 100, 60 75, 82 90 C 72 115, 60 125, 50 125 Z"
          fill="url(#leafGrad)"
        />
        {/* Subtle leaf stem accent */}
        <path
          d="M 50 125 Q 65 110 82 90"
          stroke="#FFFFFF"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.6"
        />

        {/* RIGHT SEMICIRCLE ARC: Royal Blue, symbolizing technology and connection */}
        <path
          d="M 110 24 A 72 72 0 0 1 110 166"
          stroke="#1565C0"
          strokeWidth="6"
          strokeLinecap="round"
        />

        {/* DIGITAL CIRCUIT TRACES: Extending from the blue tech arc inwards */}
        {/* Upper Trace: Starts from the upper-right arc, bends down-left and horizontal-left */}
        <path
          d="M 148 44 L 132 60 H 122"
          stroke="#1565C0"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="122" cy="60" r="5" fill="#1565C0" stroke="#FFFFFF" strokeWidth="1.5" />

        {/* Middle Trace: Starts from middle-right arc, horizontal-left, bends down */}
        <path
          d="M 171 95 H 145 V 120"
          stroke="#1565C0"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="145" cy="120" r="5" fill="#1565C0" stroke="#FFFFFF" strokeWidth="1.5" />

        {/* Lower Trace: Starts from lower-right arc, diagonal inwards and down-vertical */}
        <path
          d="M 158 136 L 140 136 V 150"
          stroke="#1565C0"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="140" cy="150" r="5" fill="#1565C0" stroke="#FFFFFF" strokeWidth="1.5" />
      </svg>
      )}

      {showText && (
        <div className={`flex flex-col ${vertical ? "items-center text-center" : ""}`}>
          <span className={`${vertical ? "text-3xl font-black" : size <= 48 ? "text-base font-extrabold" : "text-2xl font-black"} tracking-tight leading-none ${textColor}`}>
            Igreja <span className="text-[#1B7A2D]">Viva</span>
          </span>
          <span className={`${vertical ? "text-xs mt-2" : size <= 48 ? "text-[8px] mt-0.5" : "text-[10px] mt-1"} font-extrabold tracking-wider uppercase ${sloganColor}`}>
            Tecnologia a serviço do Reino.
          </span>
        </div>
      )}
    </div>
  );
}
