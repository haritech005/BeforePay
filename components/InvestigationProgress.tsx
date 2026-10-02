"use client";

import React from "react";
import Image from "next/image";
import { CheckIcon, LockIcon, SearchIcon, InfoIcon, CloseIcon, ArrowRightIcon } from "./Icons";

interface InvestigationProgressProps {
  sellerHandle?: string;
  productName?: string;
  quotedPrice?: string;
  previewUrl?: string | null;
  onCancel?: () => void;
  onComplete?: () => void;
}

export default function InvestigationProgress({
  sellerHandle = "",
  productName = "",
  quotedPrice = "",
  previewUrl = null,
  onCancel,
  onComplete,
}: InvestigationProgressProps) {
  const displayHandle = sellerHandle.replace(/^@/, "");

  return (
    <div className="w-full max-w-2xl mx-auto py-4 sm:py-6 flex flex-col gap-6">
      {/* Top Badge */}
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
          <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
          Active Investigation
        </span>
        <span className="text-slate-300 text-xs">•</span>
        <span className="font-mono text-xs text-slate-500">Live Search Ingestion</span>
      </div>

      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-1">
          Investigating @{displayHandle || "seller"}…
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          Gathering live public evidence from Instagram signals, Google Lens, Google Shopping, and indexed discussions.
        </p>
      </div>

      {/* Target Summary Card */}
      <div className="relative overflow-hidden rounded-2xl bg-white p-4 sm:p-5 shadow-xs border border-slate-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            {/* Thumbnail with animated scanner beam */}
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
              {previewUrl ? (
                <Image
                  src={previewUrl}
                  alt="Product Thumbnail"
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400">
                  <SearchIcon className="w-6 h-6" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-b from-blue-600/10 via-transparent to-blue-600/20 pointer-events-none"></div>
              <div className="absolute inset-x-0 top-0 h-[2px] bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.8)] animate-radar-scan pointer-events-none"></div>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-[11px] font-bold text-blue-700 px-2 py-0.5 rounded bg-blue-50 border border-blue-100">
                  Instagram Seller
                </span>
                <span className="font-mono text-xs text-slate-600 truncate">
                  @{displayHandle}
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                {productName || "Product Listing"}
              </h2>
              {quotedPrice && (
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-sm font-extrabold text-slate-900">
                    ₹{quotedPrice}
                  </span>
                  <span className="text-xs text-slate-500">Quoted Price</span>
                </div>
              )}
            </div>
          </div>

          <div className="sm:self-center shrink-0 w-full sm:w-auto flex sm:flex-col items-center sm:items-end justify-between pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Status
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600">
              <SearchIcon className="w-3.5 h-3.5" />
              Scanning public web
            </span>
          </div>
        </div>

        {/* Scan visualizer bar */}
        <div className="mt-4 pt-3 flex items-center gap-3 border-t border-slate-100">
          <div className="h-1.5 flex-1 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 rounded-full w-3/4 animate-pulse"></div>
          </div>
          <span className="font-mono text-xs text-slate-500">In Progress</span>
        </div>
      </div>

      {/* Live Pipeline Steps */}
      <div className="rounded-2xl bg-white p-5 sm:p-6 shadow-xs border border-slate-200 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Live Inquiry Pipeline
          </h3>
          <span className="font-mono text-xs text-emerald-700 flex items-center gap-1.5 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            SerpApi Active
          </span>
        </div>

        <div className="flex flex-col gap-4">
          {/* Step 1: Completed */}
          <div className="flex items-start gap-3.5">
            <div className="mt-0.5 w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <CheckIcon className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-1">
                <span className="font-bold text-sm text-slate-900">
                  1. Checking seller profile signals
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                  Completed
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Public profile indexed: Follower count, account activity, and bio verification.
              </p>
            </div>
          </div>

          <div className="h-px w-full bg-slate-100"></div>

          {/* Step 2: Completed */}
          <div className="flex items-start gap-3.5">
            <div className="mt-0.5 w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <CheckIcon className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-1">
                <span className="font-bold text-sm text-slate-900">
                  2. Reverse-searching product image
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                  Completed
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Google Lens optical search across e-commerce marketplaces and catalogs.
              </p>
            </div>
          </div>

          <div className="h-px w-full bg-slate-100"></div>

          {/* Step 3: In-Progress */}
          <div className="flex items-start gap-3.5">
            <div className="mt-0.5 w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <svg className="animate-spin w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" fill="currentColor"></path>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-1">
                <span className="font-bold text-sm text-slate-900">
                  3. Comparing Google Shopping prices
                </span>
                <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
                  In-Progress
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Finding comparable listings priced below the seller&apos;s asking price…
              </p>
            </div>
          </div>

          <div className="h-px w-full bg-slate-100"></div>

          {/* Step 4: Pending */}
          <div className="flex items-start gap-3.5 opacity-70">
            <div className="mt-1 w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
              <div className="w-2 h-2 rounded-full bg-slate-400"></div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-1">
                <span className="font-bold text-sm text-slate-900">
                  4. Scanning public complaints &amp; forums
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-xs font-semibold">
                  Pending
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Queued: Google Search, consumer forums, and indexed complaint boards.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Reassurance Card */}
      <div className="rounded-2xl bg-blue-50/70 p-4 sm:p-5 flex items-start gap-3.5 border border-blue-100">
        <InfoIcon className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="text-sm font-bold text-slate-900 mb-0.5">
            Real-time Evidence Query
          </h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            BeforePay performs live API searches for each check. The generated report
            will clearly distinguish facts, source links, and AI summarization.
          </p>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-1.5 text-slate-500 text-xs">
          <LockIcon className="w-3.5 h-3.5 text-slate-400" />
          <span>Encrypted • Ephemeral session memory</span>
        </div>

        <div className="flex items-center gap-2">
          {onComplete && (
            <button
              type="button"
              onClick={onComplete}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg border border-blue-200 transition-colors cursor-pointer"
            >
              <span>View Generated Report</span>
              <ArrowRightIcon className="w-3.5 h-3.5" />
            </button>
          )}

          {onCancel && (
            <button
              onClick={onCancel}
              type="button"
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-rose-600 transition-colors px-3 py-2 rounded-lg hover:bg-white cursor-pointer"
            >
              <CloseIcon className="w-3.5 h-3.5" />
              Cancel investigation
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
