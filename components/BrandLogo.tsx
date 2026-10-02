import React from "react";

interface BrandLogoProps {
  className?: string;
  showWordmark?: boolean;
}

export default function BrandLogo({
  className = "h-8 w-auto",
  showWordmark = true,
}: BrandLogoProps) {
  return (
    <div className={`inline-flex items-center gap-2 select-none ${className}`}>
      {/* Minimalist Shield / Lens Verification Monogram Mark */}
      <svg
        className="h-8 w-8 shrink-0"
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="2" y="2" width="36" height="36" rx="9" fill="#0F172A" />
        <path
          d="M20 9C24.4183 9 28 12.5817 28 17C28 18.91 27.3294 20.6645 26.208 22.0402L30.7071 26.5393C31.0976 26.9298 31.0976 27.563 30.7071 27.9536C30.3166 28.3441 29.6834 28.3441 29.2929 27.9536L24.8329 23.4936C23.4735 24.4357 21.8028 25 20 25C15.5817 25 12 21.4183 12 17C12 12.5817 15.5817 9 20 9ZM20 11C16.6863 11 14 13.6863 14 17C14 20.3137 16.6863 23 20 23C23.3137 23 26 20.3137 26 17C26 13.6863 23.3137 11 20 11Z"
          fill="#FFFFFF"
        />
        <circle cx="20" cy="17" r="2.5" fill="#2563EB" />
      </svg>

      {showWordmark && (
        <span className="font-bold text-lg tracking-tight text-slate-900 font-sans">
          Before<span className="text-blue-600">Pay</span>
        </span>
      )}
    </div>
  );
}
