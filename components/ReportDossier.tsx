"use client";

import React, { useState } from "react";
import Image from "next/image";
import { SellerProfileData } from "@/lib/investigation/sellerProfile";
import { LensInvestigationData } from "@/lib/investigation/productLens";
import { PriceComparisonData } from "@/lib/investigation/priceComparison";
import { SellerReputationData } from "@/lib/investigation/sellerReputation";
import { CheckResult, AIReportSynthesis } from "@/lib/types/investigation";
import InvestigationSummaryCard from "./InvestigationSummaryCard";
import SellerProfileCard from "./SellerProfileCard";
import ProductLensCard from "./ProductLensCard";
import PriceComparisonCard from "./PriceComparisonCard";
import SellerReputationCard from "./SellerReputationCard";
import BuyerChecklistCard from "./BuyerChecklistCard";
import {
  ShieldCheckIcon,
  ExternalLinkIcon,
  PrintIcon,
  ShareIcon,
  SearchIcon,
} from "./Icons";

interface ReportDossierProps {
  sellerHandle?: string;
  productName?: string;
  quotedPrice?: string;
  previewUrl?: string | null;
  profileResult?: CheckResult<SellerProfileData> | null;
  lensResult?: CheckResult<LensInvestigationData> | null;
  priceResult?: CheckResult<PriceComparisonData> | null;
  reputationResult?: CheckResult<SellerReputationData> | null;
  synthesis?: AIReportSynthesis | null;
  onNewInvestigation?: () => void;
}

export default function ReportDossier({
  sellerHandle = "audiokraft_studio",
  productName = "Noise-Cancelling Wireless Earbuds (Studio Edition)",
  quotedPrice = "2,499",
  previewUrl = "https://lh3.googleusercontent.com/aida-public/AB6AXuC1H8V5geou3DIicGlTH7oI_vwStKq_ULYS6351cdsJcdZ5VwFsMRMi7jNvzKYex8yqGjt924cPZVHDT29C1gmzJvmxYc7QHG0bDhp6o6_w8WU2bWab0MTpZTWzFE2Xsjd3wJaIHYc9S-phQ5NyCxT3zrQw4V8rn1MfzuwjY9gdIRGF72pm4OxGjs8elrnEG5nSVb7DUH57DijVqd2yLNZo8SuoXc7WKtj48Z65wQIrVlPJyRQ5QK2GVQ",
  profileResult,
  lensResult,
  priceResult,
  reputationResult,
  synthesis,
  onNewInvestigation,
}: ReportDossierProps) {
  const [copied, setCopied] = useState(false);

  const displayHandle = (sellerHandle || "seller").replace(/^@/, "");

  const handleCopyLink = () => {
    if (typeof window !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 max-w-4xl mx-auto">
      {/* Top Utility Header */}
      <div className="w-full bg-blue-50/70 py-3 px-4 sm:px-6 rounded-2xl border border-blue-200/70 flex flex-wrap items-center justify-between gap-3 text-xs font-semibold text-slate-700">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
          <span className="font-mono text-slate-900 font-bold">CASE #BP-88421</span>
          <span className="text-slate-300">•</span>
          <span className="text-slate-600">
            Generated on {new Date().toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handlePrint}
            className="hover:text-blue-700 transition-colors flex items-center gap-1.5 cursor-pointer text-slate-700"
            type="button"
          >
            <PrintIcon className="w-4 h-4 text-slate-600" />
            Print Dossier
          </button>
        </div>
      </div>

      {/* Target Overview Card */}
      <section className="bg-white rounded-2xl shadow-xs p-5 sm:p-6 flex flex-col gap-4 border border-slate-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200 shadow-xs">
              {previewUrl ? (
                <Image
                  src={previewUrl}
                  alt="Target Product Thumbnail"
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  <SearchIcon className="w-6 h-6" />
                </div>
              )}
            </div>

            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-mono text-xs font-bold border border-blue-100">
                  Target Product
                </span>
                <span className="text-blue-600 font-bold text-xs inline-flex items-center gap-1">
                  @{displayHandle}
                  <ExternalLinkIcon className="w-3 h-3" />
                </span>
              </div>

              <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                {productName || "Product Listing"}
              </h1>
              <p className="text-xs text-slate-500">
                Seller Quoted Asking Price:{" "}
                <span className="text-sm font-extrabold text-slate-900">
                  ₹{quotedPrice || "0"}
                </span>
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:items-end gap-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Investigation Status
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
              Evidence Synthesized
            </span>
          </div>
        </div>

        {/* Evidence Summary Banner */}
        <div className="rounded-xl p-4 bg-slate-50 flex items-start gap-3 border border-slate-200">
          <ShieldCheckIcon className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div className="flex flex-col gap-0.5 text-slate-800">
            <p className="text-xs font-bold text-slate-900">
              Public Signals Overview (4 Data Sources Evaluated)
            </p>
            <p className="text-xs text-slate-600 leading-relaxed">
              We evaluated publicly indexed Instagram seller profile information, Google Lens optical matches, and price variances. Review the technical findings below.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 1: Investigation Summary (AI Synthesis) */}
      <InvestigationSummaryCard
        synthesis={synthesis}
        sellerHandle={sellerHandle}
      />

      {/* SECTION 2: Live / Evaluated Seller Profile Signals */}
      <SellerProfileCard
        profileResult={profileResult}
        fallbackHandle={displayHandle}
      />

      {/* SECTION 3: Product Image Matches (Google Lens) */}
      <ProductLensCard
        lensResult={lensResult}
        previewUrl={previewUrl}
      />

      {/* SECTION 4: Cheaper Comparable Listings (Google Shopping) */}
      <PriceComparisonCard
        priceResult={priceResult}
        quotedPrice={quotedPrice}
        productName={productName}
      />

      {/* SECTION 5: Public Discussions & Reputation */}
      <SellerReputationCard
        reputationResult={reputationResult}
        sellerHandle={sellerHandle}
      />

      {/* SECTION 6: "Before You Pay" Practical Recommendations */}
      <BuyerChecklistCard
        checklist={synthesis?.checklist}
      />

      {/* SECTION 7: Action Bar */}
      <section className="bg-white rounded-2xl shadow-xs p-5 sm:p-6 flex flex-col gap-4 border border-slate-200">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handlePrint}
              type="button"
              className="px-4 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <PrintIcon className="w-4 h-4" />
              Download / Print PDF
            </button>

            <button
              onClick={handleCopyLink}
              type="button"
              className="px-4 py-2.5 rounded-xl bg-white text-slate-800 hover:bg-slate-50 transition-colors font-bold text-xs flex items-center gap-1.5 border border-slate-300 cursor-pointer"
            >
              <ShareIcon className="w-4 h-4 text-slate-600" />
              <span>{copied ? "Link Copied!" : "Share Link"}</span>
            </button>
          </div>

          {onNewInvestigation && (
            <button
              onClick={onNewInvestigation}
              type="button"
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <SearchIcon className="w-4 h-4" />
              Investigate Another Seller
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
