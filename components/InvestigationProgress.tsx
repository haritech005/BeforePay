"use client";

import React from "react";
import Image from "next/image";
import { CheckIcon, LockIcon, SearchIcon, InfoIcon, CloseIcon, ArrowRightIcon, AlertCircleIcon } from "./Icons";

export type StepState = "pending" | "loading" | "completed" | "no_results" | "failed";

interface InvestigationProgressProps {
  sellerHandle?: string;
  productName?: string;
  quotedPrice?: string;
  previewUrl?: string | null;
  profileStatus?: StepState;
  lensStatus?: StepState;
  priceStatus?: StepState;
  reputationStatus?: StepState;
  synthesisStatus?: StepState;
  onCancel?: () => void;
  onComplete?: () => void;
}

export default function InvestigationProgress({
  sellerHandle = "",
  productName = "",
  quotedPrice = "",
  previewUrl = null,
  profileStatus = "completed",
  lensStatus = "completed",
  priceStatus = "loading",
  reputationStatus = "loading",
  synthesisStatus = "pending",
  onCancel,
  onComplete,
}: InvestigationProgressProps) {
  const displayHandle =
    (sellerHandle || "")
      .trim()
      .replace(/^https?:\/\/(www\.)?instagram\.com\//i, "")
      .replace(/[/?#].*$/, "")
      .replace(/^@/, "");

  const renderStatusBadge = (status: StepState) => {
    switch (status) {
      case "completed":
        return (
          <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
            Completed
          </span>
        );
      case "no_results":
        return (
          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-xs font-semibold">
            0 Records
          </span>
        );
      case "failed":
        return (
          <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 text-xs font-semibold border border-rose-200">
            Unavailable
          </span>
        );
      case "loading":
        return (
          <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
            In-Progress
          </span>
        );
      case "pending":
      default:
        return (
          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-500 text-xs font-medium">
            Queued
          </span>
        );
    }
  };

  const renderStepIcon = (status: StepState) => {
    switch (status) {
      case "completed":
        return (
          <div className="mt-0.5 w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <CheckIcon className="w-3.5 h-3.5" />
          </div>
        );
      case "no_results":
        return (
          <div className="mt-0.5 w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
            <CheckIcon className="w-3.5 h-3.5" />
          </div>
        );
      case "failed":
        return (
          <div className="mt-0.5 w-6 h-6 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
            <AlertCircleIcon className="w-3.5 h-3.5" />
          </div>
        );
      case "loading":
        return (
          <div className="mt-0.5 w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <svg className="animate-spin w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" fill="currentColor"></path>
            </svg>
          </div>
        );
      case "pending":
      default:
        return (
          <div className="mt-0.5 w-6 h-6 rounded-lg bg-slate-100 border border-slate-200 text-slate-400 flex items-center justify-center shrink-0 text-xs font-mono">
            —
          </div>
        );
    }
  };

  const isAllComplete =
    (profileStatus === "completed" || profileStatus === "no_results" || profileStatus === "failed") &&
    (lensStatus === "completed" || lensStatus === "no_results" || lensStatus === "failed") &&
    (priceStatus === "completed" || priceStatus === "no_results" || priceStatus === "failed") &&
    (reputationStatus === "completed" || reputationStatus === "no_results" || reputationStatus === "failed") &&
    (synthesisStatus === "completed" || synthesisStatus === "failed");

  return (
    <div className="w-full max-w-2xl mx-auto py-4 sm:py-6 flex flex-col gap-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-1">
          Checking @{displayHandle || "seller"}...
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          Checking Instagram profile signals, reverse-searching product images, and comparing prices across verified stores.
        </p>
      </div>

      {/* Target Summary Card */}
      <div className="relative overflow-hidden rounded-2xl bg-white p-4 sm:p-5 shadow-xs border border-slate-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
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
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-[11px] font-bold text-blue-700 px-2 py-0.5 rounded bg-blue-50 border border-blue-100">
                  Instagram Seller
                </span>
                <span className="text-xs text-slate-600 truncate font-medium">
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
                  <span className="text-xs text-slate-500">Asking Price</span>
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
              {isAllComplete ? "Finishing report" : "Searching web"}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4 pt-3 flex items-center gap-3 border-t border-slate-100">
          <div className="h-1.5 flex-1 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full bg-blue-600 rounded-full transition-all duration-500 ${
                isAllComplete ? "w-full" : "w-3/4"
              }`}
            ></div>
          </div>
          <span className="text-xs font-medium text-slate-500">
            {isAllComplete ? "Done" : "In progress"}
          </span>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="rounded-2xl bg-white p-5 sm:p-6 shadow-xs border border-slate-200 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Verification Steps
          </h3>
        </div>

        <div className="flex flex-col gap-4">
          {/* Step 1: Seller Profile Check */}
          <div className="flex items-start gap-3.5">
            {renderStepIcon(profileStatus)}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-1">
                <span className="font-bold text-sm text-slate-900">
                  1. Checking seller profile signals
                </span>
                {renderStatusBadge(profileStatus)}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Follower count, account activity, and profile verification.
              </p>
            </div>
          </div>

          <div className="h-px w-full bg-slate-100"></div>

          {/* Step 2: Reverse-searching product image */}
          <div className="flex items-start gap-3.5">
            {renderStepIcon(lensStatus)}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-1">
                <span className="font-bold text-sm text-slate-900">
                  2. Reverse-searching product photo
                </span>
                {renderStatusBadge(lensStatus)}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Google Lens search across verified stores and catalogs.
              </p>
            </div>
          </div>

          <div className="h-px w-full bg-slate-100"></div>

          {/* Step 3: Comparing Google Shopping prices */}
          <div className="flex items-start gap-3.5">
            {renderStepIcon(priceStatus)}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-1">
                <span className="font-bold text-sm text-slate-900">
                  3. Comparing store prices
                </span>
                {renderStatusBadge(priceStatus)}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Checking for lower prices on Amazon, Myntra, Flipkart, and other trusted stores.
              </p>
            </div>
          </div>

          <div className="h-px w-full bg-slate-100"></div>

          {/* Step 4: Public Discussions & Reputation */}
          <div className="flex items-start gap-3.5">
            {renderStepIcon(reputationStatus)}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-1">
                <span className="font-bold text-sm text-slate-900">
                  4. Checking customer reviews &amp; complaints
                </span>
                {renderStatusBadge(reputationStatus)}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Searching Reddit, Quora, consumer forums, and complaint records.
              </p>
            </div>
          </div>

          <div className="h-px w-full bg-slate-100"></div>

          {/* Step 5: AI Report Synthesis */}
          <div className="flex items-start gap-3.5">
            {renderStepIcon(synthesisStatus)}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-1">
                <span className="font-bold text-sm text-slate-900">
                  5. Compiling report &amp; safety checklist
                </span>
                {renderStatusBadge(synthesisStatus)}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Synthesizing findings into clear buying advice.
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
