"use client";

import React from "react";
import { SellerReputationData } from "@/lib/investigation/sellerReputation";
import { CheckResult } from "@/lib/types/investigation";
import {
  ExternalLinkIcon,
  SearchIcon,
  AlertCircleIcon,
  ShieldCheckIcon,
} from "./Icons";

interface SellerReputationCardProps {
  reputationResult?: CheckResult<SellerReputationData> | null;
  sellerHandle?: string;
}

export default function SellerReputationCard({
  reputationResult,
  sellerHandle = "seller",
}: SellerReputationCardProps) {
  const displayHandle = sellerHandle.replace(/^@/, "");

  // Empty / No results state
  if (reputationResult && reputationResult.status === "no_results") {
    return (
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
          <span className="px-2.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono text-xs font-bold">
            0 Records
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
          <ShieldCheckIcon className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-bold text-slate-900">
              No Public Complaints or Forum Grievances Indexed
            </span>
            <p className="text-xs text-slate-600 leading-relaxed">
              {reputationResult.message ||
                `No indexed scam complaints or forum discussions were found under @"${displayHandle}".`}
            </p>
          </div>
        </div>

        <p className="text-slate-400 text-[11px] italic">
          Analytical Standard: The absence of indexed negative mentions does not guarantee seller safety. Newer accounts or sellers operating under alternate names may not have accumulated a public search footprint.
        </p>
      </section>
    );
  }

  // Failed state
  if (reputationResult && reputationResult.status === "failed") {
    return (
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

        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3">
          <AlertCircleIcon className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-bold text-rose-900">
              Reputation Search Service Warning
            </span>
            <p className="text-xs text-rose-800 leading-relaxed">
              {reputationResult.message ||
                "Unable to retrieve public complaint records at this time."}
            </p>
          </div>
        </div>
      </section>
    );
  }

  const data = reputationResult?.data;
  const mentions = data?.mentions || [];

  return (
    <section className="bg-white rounded-2xl shadow-xs p-5 sm:p-6 flex flex-col gap-4 border border-slate-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-blue-600 uppercase font-bold tracking-wider">
            05 // Reputation
          </span>
          <span className="text-slate-300">/</span>
          <h2 className="text-base font-bold text-slate-900">
            Public Discussions &amp; Forum Mentions
          </h2>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="px-2.5 py-0.5 rounded bg-blue-50 text-blue-700 font-mono text-xs font-bold border border-blue-100">
            {mentions.length > 0 ? `${mentions.length} Mentions Found` : "Reputation Scan Active"}
          </span>
          {reputationResult?.source && (
            <a
              href={reputationResult.source}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1 font-semibold"
            >
              Google Search
              <ExternalLinkIcon className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>

      {/* Target Handle Reputation Overview */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 border border-blue-100 flex items-center justify-center shrink-0">
            <SearchIcon className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-900 block">
              Search Target: @{displayHandle}
            </span>
            <p className="text-xs text-slate-600 mt-0.5 font-mono">
              Query: {data?.queryUsed || `"${displayHandle}" (scam OR complaint OR fraud OR review)`}
            </p>
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-2">
          {data?.summaryFindings?.hasDirectComplaints ? (
            <span className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-800 text-xs font-bold border border-rose-200">
              Grievance Boards Mentioned
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full bg-slate-200 text-slate-700 text-xs font-semibold">
              Public Discussion Records
            </span>
          )}
        </div>
      </div>

      {/* Mentions Grid */}
      {mentions.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {mentions.slice(0, 6).map((mention, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors flex flex-col justify-between gap-3"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold text-blue-700 px-2 py-0.5 rounded bg-blue-50 border border-blue-100 uppercase tracking-wider truncate max-w-[160px]">
                    {mention.source}
                  </span>
                  {mention.date && (
                    <span className="text-[11px] text-slate-400 font-mono">
                      {mention.date}
                    </span>
                  )}
                </div>

                <h4
                  className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug"
                  title={mention.title}
                >
                  {mention.title}
                </h4>

                {mention.snippet && (
                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed bg-white p-2.5 rounded-lg border border-slate-200/70 font-sans">
                    &ldquo;{mention.snippet}&rdquo;
                  </p>
                )}
              </div>

              <a
                href={mention.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-xs font-semibold inline-flex items-center gap-1 self-start"
              >
                <span>Inspect original discussion</span>
                <ExternalLinkIcon className="w-3 h-3" />
              </a>
            </div>
          ))}
        </div>
      ) : (
        /* Fallback sample representation */
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
          <ShieldCheckIcon className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-bold text-slate-900">
              No Indexed Consumer Disputes
            </span>
            <p className="text-xs text-slate-600 leading-relaxed">
              No indexed consumer court judgments, scam complaints, or grievance board threads were found associated with @{displayHandle}.
            </p>
          </div>
        </div>
      )}

      {/* Observations */}
      {data?.observations && data.observations.length > 0 && (
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
          <span className="font-bold text-slate-900 block">
            Reputation Scan Observations:
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
        Analytical Standard: Public forum posts and search snippets are unverified consumer statements and search engine extractions, not legal determinations. Always verify claims through primary sources.
      </p>
    </section>
  );
}
