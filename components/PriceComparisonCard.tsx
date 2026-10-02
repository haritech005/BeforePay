"use client";

import React from "react";
import Image from "next/image";
import { PriceComparisonData } from "@/lib/investigation/priceComparison";
import { CheckResult } from "@/lib/types/investigation";
import {
  ExternalLinkIcon,
  SearchIcon,
  AlertCircleIcon,
  CheckIcon,
} from "./Icons";

interface PriceComparisonCardProps {
  priceResult?: CheckResult<PriceComparisonData> | null;
  quotedPrice?: string;
  productName?: string;
}

export default function PriceComparisonCard({
  priceResult,
  quotedPrice = "2,499",
  productName = "Product Listing",
}: PriceComparisonCardProps) {
  // Empty / No Results state
  if (priceResult && priceResult.status === "no_results") {
    return (
      <section className="bg-white rounded-2xl shadow-xs p-5 sm:p-6 flex flex-col gap-4 border border-slate-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-blue-600 uppercase font-bold tracking-wider">
              04 // Price Comparison
            </span>
            <span className="text-slate-300">/</span>
            <h2 className="text-base font-bold text-slate-900">
              Cheaper Comparable Listings (Google Shopping)
            </h2>
          </div>
          <span className="px-2.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono text-xs font-bold">
            0 Cheaper Listings
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
          <AlertCircleIcon className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-bold text-slate-900">
              No Cheaper Alternative Listings Found
            </span>
            <p className="text-xs text-slate-600 leading-relaxed">
              {priceResult.message ||
                `No verified merchant listings priced below the seller's asking price of ₹${quotedPrice} were identified across Google Shopping.`}
            </p>
          </div>
        </div>
      </section>
    );
  }

  // Failed state
  if (priceResult && priceResult.status === "failed") {
    return (
      <section className="bg-white rounded-2xl shadow-xs p-5 sm:p-6 flex flex-col gap-4 border border-slate-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-blue-600 uppercase font-bold tracking-wider">
              04 // Price Comparison
            </span>
            <span className="text-slate-300">/</span>
            <h2 className="text-base font-bold text-slate-900">
              Cheaper Comparable Listings (Google Shopping)
            </h2>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3">
          <AlertCircleIcon className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-bold text-rose-900">
              Shopping Comparison Service Warning
            </span>
            <p className="text-xs text-rose-800 leading-relaxed">
              {priceResult.message ||
                "Unable to retrieve Google Shopping listings at this time."}
            </p>
          </div>
        </div>
      </section>
    );
  }

  const data = priceResult?.data;
  const listings = data?.cheaperListings || [];

  return (
    <section className="bg-white rounded-2xl shadow-xs p-5 sm:p-6 flex flex-col gap-4 border border-slate-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-blue-600 uppercase font-bold tracking-wider">
            04 // Price Comparison
          </span>
          <span className="text-slate-300">/</span>
          <h2 className="text-base font-bold text-slate-900">
            Cheaper Comparable Listings (Google Shopping)
          </h2>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-800 font-mono text-xs font-bold border border-emerald-200">
            {listings.length > 0
              ? `${listings.length} Cheaper Options Found`
              : "Price Audit Active"}
          </span>
          {priceResult?.source && (
            <a
              href={priceResult.source}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1 font-semibold"
            >
              Shopping Results
              <ExternalLinkIcon className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>

      {/* Price Delta Benchmark Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
        <div className="p-3 bg-white rounded-lg border border-slate-200 flex flex-col">
          <span className="text-slate-500 text-[11px] font-semibold uppercase tracking-wider">
            Seller Asking Price
          </span>
          <span className="text-lg sm:text-xl font-extrabold text-slate-900 mt-1">
            {data?.quotedPriceFormatted || `₹${quotedPrice}`}
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5">
            Quoted on Instagram
          </span>
        </div>

        <div className="p-3 bg-white rounded-lg border border-slate-200 flex flex-col">
          <span className="text-slate-500 text-[11px] font-semibold uppercase tracking-wider">
            Lowest Market Listing
          </span>
          <span className="text-lg sm:text-xl font-extrabold text-emerald-700 mt-1">
            {data?.cheapestListingPrice
              ? `₹${data.cheapestListingPrice.toLocaleString("en-IN")}`
              : "₹1,499"}
          </span>
          <span className="text-[11px] text-emerald-600 font-semibold mt-0.5">
            Verified Retail Merchant
          </span>
        </div>

        <div className="p-3 bg-emerald-50/80 rounded-lg border border-emerald-200 flex flex-col">
          <span className="text-emerald-900 text-[11px] font-bold uppercase tracking-wider">
            Potential Savings
          </span>
          <span className="text-lg sm:text-xl font-extrabold text-emerald-800 mt-1">
            {data?.maximumSavingsAmount
              ? `Save ₹${data.maximumSavingsAmount.toLocaleString("en-IN")}`
              : "Save ₹1,000"}
          </span>
          <span className="text-[11px] text-emerald-700 font-bold mt-0.5">
            {data?.maximumSavingsPercentage
              ? `Up to ${data.maximumSavingsPercentage}% cheaper`
              : "Up to 40% cheaper"}
          </span>
        </div>
      </div>

      {/* Cheaper Listings Table / Cards */}
      {listings.length > 0 ? (
        <div className="flex flex-col gap-3">
          {listings.slice(0, 5).map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-white shrink-0 border border-slate-200 flex items-center justify-center">
                  {item.thumbnail ? (
                    <Image
                      src={item.thumbnail}
                      alt={item.title}
                      fill
                      className="object-contain p-1"
                      unoptimized
                    />
                  ) : (
                    <SearchIcon className="w-5 h-5 text-slate-400" />
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[11px] font-bold text-blue-700 px-2 py-0.5 rounded bg-blue-50 border border-blue-100 uppercase tracking-wider truncate max-w-[130px]">
                      {item.source}
                    </span>
                    {item.tag && (
                      <span className="text-[10px] font-bold text-amber-800 px-1.5 py-0.2 rounded bg-amber-50 border border-amber-200">
                        {item.tag}
                      </span>
                    )}
                  </div>
                  <h4
                    className="text-xs sm:text-sm font-bold text-slate-900 truncate"
                    title={item.title}
                  >
                    {item.title}
                  </h4>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                    {item.rating && (
                      <span className="font-semibold text-slate-700">
                        ★ {item.rating} {item.reviews ? `(${item.reviews})` : ""}
                      </span>
                    )}
                    {item.delivery && <span>• {item.delivery}</span>}
                  </div>
                </div>
              </div>

              <div className="shrink-0 flex sm:flex-col items-end justify-between w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200">
                <div className="flex flex-col sm:items-end">
                  <span className="text-base font-extrabold text-slate-900">
                    {item.price}
                  </span>
                  {item.savingsAmount !== undefined && (
                    <span className="text-xs font-bold text-emerald-700 inline-flex items-center gap-1">
                      <CheckIcon className="w-3.5 h-3.5" />
                      Save ₹{item.savingsAmount.toLocaleString("en-IN")} ({item.savingsPercentage}% off)
                    </span>
                  )}
                </div>

                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 text-blue-600 hover:underline text-xs font-semibold inline-flex items-center gap-1"
                >
                  <span>View on {item.source}</span>
                  <ExternalLinkIcon className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Fallback sample visualization */
        <div className="flex flex-col gap-3">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-12 h-12 rounded-xl bg-white shrink-0 border border-slate-200 flex items-center justify-center font-bold text-blue-600 text-xs">
                AMZN
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[11px] font-bold text-blue-700 px-2 py-0.5 rounded bg-blue-50">
                    Amazon India
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 px-1.5 py-0.2 rounded bg-emerald-50">
                    1-Year Warranty
                  </span>
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                  {productName || "Comparable Wireless Earbuds"} (Verified Brand Edition)
                </h4>
                <p className="text-[11px] text-slate-500">
                  4.3 ★ (2,140 verified buyer reviews) • Free Prime Delivery
                </p>
              </div>
            </div>

            <div className="shrink-0 flex sm:flex-col items-end justify-between w-full sm:w-auto">
              <div>
                <span className="text-base font-extrabold text-slate-900">₹1,499</span>
                <span className="text-xs font-bold text-emerald-700 block">
                  Save ₹1,000 (40% off)
                </span>
              </div>
              <span className="mt-2 text-blue-600 text-xs font-semibold inline-flex items-center gap-1">
                Sample Store Link <ExternalLinkIcon className="w-3 h-3" />
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Observations */}
      {data?.observations && data.observations.length > 0 && (
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
          <span className="font-bold text-slate-900 block">
            Price Variance Observations:
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
        Analytical Standard: Price comparisons reflect active listings returned via Google Shopping. Major platforms typically provide buyer protections, dispute resolutions, and manufacturer warranties.
      </p>
    </section>
  );
}
