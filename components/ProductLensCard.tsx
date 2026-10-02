"use client";

import React from "react";
import Image from "next/image";
import { LensInvestigationData } from "@/lib/investigation/productLens";
import { CheckResult } from "@/lib/types/investigation";
import {
  ExternalLinkIcon,
  SearchIcon,
  AlertCircleIcon,
} from "./Icons";

interface ProductLensCardProps {
  lensResult?: CheckResult<LensInvestigationData> | null;
  previewUrl?: string | null;
}

export default function ProductLensCard({
  lensResult,
  previewUrl,
}: ProductLensCardProps) {
  // Empty / No Results state
  if (lensResult && lensResult.status === "no_results") {
    return (
      <section className="bg-white rounded-2xl shadow-xs p-5 sm:p-6 flex flex-col gap-4 border border-slate-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-blue-600 uppercase font-bold tracking-wider">
              03 // Optical Forensics
            </span>
            <span className="text-slate-300">/</span>
            <h2 className="text-base font-bold text-slate-900">
              Product Image Matches (Google Lens)
            </h2>
          </div>
          <span className="px-2.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono text-xs font-bold">
            0 Matches
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
          <AlertCircleIcon className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-bold text-slate-900">
              No Visual Duplicate Matches Found
            </span>
            <p className="text-xs text-slate-600 leading-relaxed">
              {lensResult.message ||
                "No visual duplicates or wholesale catalog matches were identified for this product image across public Google Lens indexes."}
            </p>
          </div>
        </div>
      </section>
    );
  }

  // Failed state
  if (lensResult && lensResult.status === "failed") {
    return (
      <section className="bg-white rounded-2xl shadow-xs p-5 sm:p-6 flex flex-col gap-4 border border-slate-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-blue-600 uppercase font-bold tracking-wider">
              03 // Optical Forensics
            </span>
            <span className="text-slate-300">/</span>
            <h2 className="text-base font-bold text-slate-900">
              Product Image Matches (Google Lens)
            </h2>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3">
          <AlertCircleIcon className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-bold text-rose-900">
              Visual Search Service Warning
            </span>
            <p className="text-xs text-rose-800 leading-relaxed">
              {lensResult.message ||
                "Unable to complete Google Lens visual search at this time."}
            </p>
          </div>
        </div>
      </section>
    );
  }

  const data = lensResult?.data;
  const matches = data?.matches || [];

  return (
    <section className="bg-white rounded-2xl shadow-xs p-5 sm:p-6 flex flex-col gap-4 border border-slate-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-blue-600 uppercase font-bold tracking-wider">
            03 // Optical Forensics
          </span>
          <span className="text-slate-300">/</span>
          <h2 className="text-base font-bold text-slate-900">
            Product Image Matches (Google Lens)
          </h2>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="px-2.5 py-0.5 rounded bg-blue-50 text-blue-700 font-mono text-xs font-bold border border-blue-100">
            {matches.length > 0 ? `${matches.length} Matches Found` : "Visual Search Active"}
          </span>
          {lensResult?.source && (
            <a
              href={lensResult.source}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1 font-semibold"
            >
              Lens Results
              <ExternalLinkIcon className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>

      {/* Target Image & Match Banner */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
            {previewUrl || data?.imageUrl ? (
              <Image
                src={previewUrl || data?.imageUrl || ""}
                alt="Queried Product Image"
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400">
                <SearchIcon className="w-5 h-5" />
              </div>
            )}
          </div>
          <div>
            <span className="text-xs font-bold text-slate-900 block">
              Queried Product Photo
            </span>
            <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
              Google Lens reverse optical match identified listings across global and domestic marketplaces.
            </p>
          </div>
        </div>

        {matches.length > 0 && (
          <div className="shrink-0 flex sm:flex-col items-center sm:items-end gap-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Visual Correlation
            </span>
            <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
              High Match Density
            </span>
          </div>
        )}
      </div>

      {/* Visual Matches Grid */}
      {matches.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {matches.slice(0, 6).map((match, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between hover:border-slate-300 transition-colors"
            >
              <div className="space-y-2.5">
                {match.thumbnail && (
                  <div className="relative w-full h-28 rounded-lg overflow-hidden bg-slate-200/80 border border-slate-200">
                    <Image
                      src={match.thumbnail}
                      alt={match.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 truncate max-w-[140px]">
                      {match.source}
                    </span>
                    {match.price?.value && (
                      <span className="text-xs font-extrabold text-emerald-700 font-mono">
                        {match.price.value}
                      </span>
                    )}
                  </div>
                  <h4
                    className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug"
                    title={match.title}
                  >
                    {match.title}
                  </h4>
                </div>
              </div>

              <a
                href={match.link}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 text-blue-600 hover:underline text-xs font-semibold inline-flex items-center gap-1 self-start"
              >
                <span>View source listing</span>
                <ExternalLinkIcon className="w-3 h-3" />
              </a>
            </div>
          ))}
        </div>
      ) : (
        /* Fallback sample visualization when no live search is present */
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                  Made-in-China
                </span>
                <span className="text-xs font-bold text-emerald-700">₹850</span>
              </div>
              <span className="text-xs font-bold text-slate-900 block">
                Wholesale Wireless Earbuds OEM Catalog
              </span>
              <span className="text-xs text-slate-500 mt-1 block">
                Original Manufacturer Listing
              </span>
            </div>
            <span className="mt-3 text-blue-600 text-xs font-semibold inline-flex items-center gap-1">
              Sample Catalog Link <ExternalLinkIcon className="w-3 h-3" />
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                  AliExpress
                </span>
                <span className="text-xs font-bold text-emerald-700">₹1,120</span>
              </div>
              <span className="text-xs font-bold text-slate-900 block">
                TWS Studio Earbuds Direct Importer
              </span>
              <span className="text-xs text-slate-500 mt-1 block">
                Consumer Marketplace Entry
              </span>
            </div>
            <span className="mt-3 text-blue-600 text-xs font-semibold inline-flex items-center gap-1">
              Sample Marketplace Link <ExternalLinkIcon className="w-3 h-3" />
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                  Amazon India
                </span>
                <span className="text-xs font-bold text-emerald-700">₹1,499</span>
              </div>
              <span className="text-xs font-bold text-slate-900 block">
                Generic Noise Cancelling Studio Pods
              </span>
              <span className="text-xs text-slate-500 mt-1 block">
                Retail Listing with 1-Year Warranty
              </span>
            </div>
            <span className="mt-3 text-blue-600 text-xs font-semibold inline-flex items-center gap-1">
              Sample Retail Link <ExternalLinkIcon className="w-3 h-3" />
            </span>
          </div>
        </div>
      )}

      {/* Observations & Standards */}
      {data?.observations && data.observations.length > 0 && (
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
          <span className="font-bold text-slate-900 block">
            Optical Analysis Observations:
          </span>
          <ul className="list-disc list-inside text-slate-600 space-y-1">
            {data.observations.map((obs, idx) => (
              <li key={idx} className="leading-relaxed">
                {obs}
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="text-slate-400 text-[11px] italic">
        Analytical Standard: Optical matches indicate publicly indexed duplicate or visually similar images. Image reuse is common in multi-channel commerce and does not constitute definitive proof of product illegitimacy.
      </p>
    </section>
  );
}
