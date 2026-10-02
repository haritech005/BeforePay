"use client";

import React from "react";
import BrandLogo from "./BrandLogo";
import { UserIcon } from "./Icons";

interface HeaderProps {
  onNewInvestigation?: () => void;
}

export default function Header({ onNewInvestigation }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo & Badges */}
        <div
          onClick={onNewInvestigation}
          className="flex items-center gap-3 cursor-pointer group"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" && onNewInvestigation) onNewInvestigation();
          }}
        >
          <BrandLogo />
          <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200/60">
            Consumer Verification
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onNewInvestigation}
            className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold text-xs sm:text-sm hover:bg-blue-700 active:bg-blue-800 transition-colors shadow-xs cursor-pointer"
          >
            Investigate a seller
          </button>
          <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-white shrink-0 shadow-xs">
            <UserIcon className="w-4 h-4 text-white" />
          </div>
        </div>
      </div>
    </header>
  );
}
