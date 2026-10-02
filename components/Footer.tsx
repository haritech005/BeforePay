import React from "react";
import BrandLogo from "./BrandLogo";

export default function Footer() {
  return (
    <footer className="w-full bg-[#eff4ff] mt-12 py-10 border-t border-[#dce9ff]/60">
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="max-w-md space-y-1">
            <BrandLogo />
            <p className="text-sm text-[#434655] font-medium">
              Investigate before you pay.
            </p>
          </div>

          <nav className="flex flex-wrap gap-x-6 gap-y-2 items-center text-sm font-semibold text-[#434655]">
            <a
              href="#how-it-works"
              className="hover:text-[#0b1c30] transition-colors"
            >
              How it works
            </a>
            <a
              href="#data-sources"
              className="hover:text-[#0b1c30] transition-colors"
            >
              Public Data Sources
            </a>
            <a
              href="#terms"
              className="hover:text-[#0b1c30] transition-colors"
            >
              Terms &amp; Limitations
            </a>
            <a
              href="#privacy"
              className="hover:text-[#0b1c30] transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="#contact"
              className="hover:text-[#0b1c30] transition-colors"
            >
              Contact
            </a>
          </nav>
        </div>

        <div className="p-4 rounded-xl bg-[#ffffff] shadow-[0_1px_2px_0_rgba(15,23,42,0.03)] border border-[#e5eeff]">
          <p className="text-xs text-[#434655] leading-relaxed">
            <strong className="text-[#0b1c30]">Disclaimer:</strong> BeforePay is
            an independent consumer research utility that collects publicly
            available web signals. BeforePay does not guarantee that a seller is
            safe or fraudulent. Use verified evidence to make your own
            purchasing decisions.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#434655]">
          <p>© {new Date().getFullYear()} BeforePay. All rights reserved.</p>
          <span className="font-mono text-[#565e74] text-[11px] bg-[#e5eeff] px-2.5 py-0.5 rounded">
            Independent Pre-Purchase Verification
          </span>
        </div>
      </div>
    </footer>
  );
}
