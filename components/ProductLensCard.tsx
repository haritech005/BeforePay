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
            <h2 className="text-base font-bold text-slate-900">
              3. Similar Products Found Online
            </h2>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
            0 matches
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
            <h2 className="text-base font-bold text-slate-900">
              3. Similar Products Found Online
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
          <h2 className="text-base font-bold text-slate-900">
            3. Similar Products Found Online
          </h2>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100">
            {matches.length > 0 ? `${matches.length} matches found` : "Image search"}
          </span>
          {lensResult?.source && (
            <a
              href={lensResult.source}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1 font-semibold"
            >
              Google Lens
              <ExternalLinkIcon className="w-3 h-3" />
            </a>
          )}
        </div>
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
                  <div className="relative w-full h-32 rounded-lg overflow-hidden bg-slate-200/80 border border-slate-200">
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
                    <span
                      className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border truncate max-w-[140px] ${
                        match.isTrustedCommerce
                          ? "text-emerald-800 bg-emerald-50 border-emerald-200"
                          : "text-blue-700 bg-blue-50 border-blue-100"
                      }`}
                    >
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
                <span>View store listing</span>
                <ExternalLinkIcon className="w-3 h-3" />
              </a>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
          <AlertCircleIcon className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-bold text-slate-900">
              No External Product Matches Found
            </span>
            <p className="text-xs text-slate-600 leading-relaxed">
              No duplicate or visually identical product listings were found across indexed online catalogs.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
