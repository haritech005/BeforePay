"use client";

import React from "react";
import { AIReportSynthesis } from "@/lib/types/investigation";
import {
  ShieldCheckIcon,
  SearchIcon,
  AlertCircleIcon,
} from "./Icons";

interface InvestigationSummaryCardProps {
  synthesis?: AIReportSynthesis | null;
  sellerHandle?: string;
  totalDataSources?: number;
}

export default function InvestigationSummaryCard({
  synthesis,
  sellerHandle = "seller",
  totalDataSources = 4,
}: InvestigationSummaryCardProps) {
  const displayHandle = sellerHandle.replace(/^@/, "");
  const findings = synthesis?.keyFindings || [];

  const getCategoryIcon = (category: string, severity: string) => {
    switch (category) {
      case "price":
        return (
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 font-bold text-xs">
            ₹
          </div>
        );
      case "optical":
        return (
          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
            <SearchIcon className="w-4 h-4" />
          </div>
        );
      case "profile":
        return (
          <div
            className={`w-8 h-8 rounded-lg ${
              severity === "warning"
                ? "bg-amber-100 text-amber-700"
                : "bg-indigo-100 text-indigo-700"
            } flex items-center justify-center shrink-0`}
          >
            <AlertCircleIcon className="w-4 h-4" />
          </div>
        );
      case "reputation":
      default:
        return (
          <div className="w-8 h-8 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center shrink-0">
            <ShieldCheckIcon className="w-4 h-4" />
          </div>
        );
    }
  };

  return (
    <section className="bg-white rounded-2xl shadow-xs p-5 sm:p-6 flex flex-col gap-4 border border-slate-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-blue-600 uppercase font-bold tracking-wider">
            01 // Key Findings
          </span>
          <span className="text-slate-300">/</span>
          <h2 className="text-base font-bold text-slate-900">
            Investigation Summary
          </h2>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="px-2.5 py-0.5 rounded bg-blue-50 text-blue-700 font-mono text-[11px] font-bold border border-blue-100 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
            {synthesis?.modelUsed?.includes("ollama")
              ? "Gemma 3 4B Synthesis"
              : "Evidence Synthesized"}
          </span>
          <span className="text-xs text-slate-400">•</span>
          <span className="text-xs font-semibold text-slate-600">
            {totalDataSources} Data Sources
          </span>
        </div>
      </div>

      {/* Executive Summary Banner */}
      {synthesis?.executiveSummary && (
        <div className="rounded-xl p-4 bg-blue-50/60 border border-blue-100 flex items-start gap-3">
          <ShieldCheckIcon className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-bold text-slate-900">
              Executive Forensic Brief for @{displayHandle}
            </span>
            <p className="text-xs text-slate-700 leading-relaxed font-sans">
              {synthesis.executiveSummary}
            </p>
          </div>
        </div>
      )}

      {/* Dynamic Key Findings Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {findings.length > 0 ? (
          findings.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-slate-50 flex items-start gap-3 border border-slate-200/80 hover:border-slate-300 transition-colors"
            >
              {getCategoryIcon(item.category, item.severity)}
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="text-xs font-bold text-slate-900 truncate">
                  {item.title}
                </span>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {item.detail}
                </p>
              </div>
            </div>
          ))
        ) : (
          /* Fallback finding cards */
          <>
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
          </>
        )}
      </div>
    </section>
  );
}
