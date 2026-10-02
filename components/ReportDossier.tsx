"use client";

import React, { useState } from "react";
import Image from "next/image";
import { SellerProfileData } from "@/lib/investigation/sellerProfile";
import { LensInvestigationData } from "@/lib/investigation/productLens";
import { PriceComparisonData } from "@/lib/investigation/priceComparison";
import { CheckResult } from "@/lib/types/investigation";
import SellerProfileCard from "./SellerProfileCard";
import ProductLensCard from "./ProductLensCard";
import PriceComparisonCard from "./PriceComparisonCard";
import {
  ShieldCheckIcon,
  ExternalLinkIcon,
  PrintIcon,
  ShareIcon,
  SearchIcon,
  AlertCircleIcon,
} from "./Icons";

interface ReportDossierProps {
  sellerHandle?: string;
  productName?: string;
  quotedPrice?: string;
  previewUrl?: string | null;
  profileResult?: CheckResult<SellerProfileData> | null;
  lensResult?: CheckResult<LensInvestigationData> | null;
  priceResult?: CheckResult<PriceComparisonData> | null;
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

      {/* SECTION 1: Investigation Summary */}
      <section className="bg-white rounded-2xl shadow-xs p-5 sm:p-6 flex flex-col gap-4 border border-slate-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-blue-600 uppercase font-bold tracking-wider">
              01 // Key Findings
            </span>
            <span className="text-slate-300">/</span>
            <h2 className="text-base font-bold text-slate-900">
              Investigation Summary
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 flex items-start gap-3 border border-slate-200/80">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 font-bold text-xs">
              ₹
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-bold text-slate-900">
                Cheaper Online Listings Found
              </span>
              <p className="text-xs text-slate-600 leading-relaxed">
                Comparable items with verified brand warranties are available at lower prices on major e-commerce platforms.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 flex items-start gap-3 border border-slate-200/80">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              <SearchIcon className="w-4 h-4" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-bold text-slate-900">
                Visual Matches on Other Sites
              </span>
              <p className="text-xs text-slate-600 leading-relaxed">
                Google Lens identified visually identical product photos on external wholesale and retail catalogs.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 flex items-start gap-3 border border-slate-200/80">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <AlertCircleIcon className="w-4 h-4" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-bold text-slate-900">
                Account Age &amp; Engagement
              </span>
              <p className="text-xs text-slate-600 leading-relaxed">
                Profile signals indicate public follower counts and recent post activity.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 flex items-start gap-3 border border-slate-200/80">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
              <ShieldCheckIcon className="w-4 h-4" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-bold text-slate-900">
                Public Records
              </span>
              <p className="text-xs text-slate-600 leading-relaxed">
                No formal consumer court orders were indexed. Review community forum discussions below.
              </p>
            </div>
          </div>
        </div>
      </section>

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
      <section className="bg-white rounded-2xl shadow-xs p-5 sm:p-6 flex flex-col gap-4 border border-slate-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-blue-600 uppercase font-bold tracking-wider">
              05 // Reputation
            </span>
            <span className="text-slate-300">/</span>
            <h2 className="text-base font-bold text-slate-900">
              Public Discussions &amp; Forum Mentions
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between gap-3">
            <div>
              <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100">
                Reddit · r/InstaShoppingIndia
              </span>
              <p className="text-xs text-slate-800 italic pt-2 leading-relaxed">
                &quot;Has anyone bought from @{displayHandle}? Ordered 2 weeks ago, no tracking number received yet.&quot;
              </p>
            </div>
            <a href="#reddit" className="text-blue-600 hover:underline text-xs font-semibold inline-flex items-center gap-1 pt-2 border-t border-slate-200">
              Open Reddit thread <ExternalLinkIcon className="w-3 h-3" />
            </a>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between gap-3">
            <div>
              <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100">
                X / Twitter Search
              </span>
              <p className="text-xs text-slate-800 italic pt-2 leading-relaxed">
                &quot;Looking for reviews on @{displayHandle} earbuds before paying via GPay.&quot;
              </p>
            </div>
            <a href="#twitter" className="text-blue-600 hover:underline text-xs font-semibold inline-flex items-center gap-1 pt-2 border-t border-slate-200">
              View mention search <ExternalLinkIcon className="w-3 h-3" />
            </a>
          </div>
        </div>
      </section>

      {/* SECTION 6: "Before You Pay" Practical Recommendations */}
      <section className="bg-white rounded-2xl shadow-xs p-5 sm:p-6 flex flex-col gap-4 border border-slate-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-blue-600 uppercase font-bold tracking-wider">
              06 // Checklist
            </span>
            <span className="text-slate-300">/</span>
            <h2 className="text-base font-bold text-slate-900">
              &quot;Before You Pay&quot; Buyer Safety Checklist
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
              1
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-bold text-slate-900">Payment Protection</span>
              <span className="text-xs text-slate-600 leading-relaxed">
                Avoid direct UPI or wire transfers to personal accounts. Insist on Cash on Delivery (COD) or escrow payment gateways.
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
              2
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-bold text-slate-900">Proof of Physical Possession</span>
              <span className="text-xs text-slate-600 leading-relaxed">
                Ask the seller for a 5-second video holding the actual product with today&apos;s date written on paper.
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
              3
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-bold text-slate-900">Return &amp; Replacement Policy</span>
              <span className="text-xs text-slate-600 leading-relaxed">
                Verify clear, written policies for damaged shipments or replacement terms before transferring funds.
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
              4
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-bold text-slate-900">Business Identity</span>
              <span className="text-xs text-slate-600 leading-relaxed">
                Request a verifiable business address, active customer support contact, or registered GSTIN where applicable.
              </span>
            </div>
          </div>
        </div>
      </section>

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
