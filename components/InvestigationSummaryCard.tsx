"use client";

import React from "react";
import { AIReportSynthesis } from "@/lib/types/investigation";
import {
  ShieldCheckIcon,
  SearchIcon,
  AlertCircleIcon,
  CheckCircleIcon,
  InfoIcon,
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
  // Clean handle: remove URL schemes, domain, and leading @
  const displayHandle = sellerHandle
    .trim()
    .replace(/^https?:\/\/(www\.)?instagram\.com\//i, "")
    .replace(/[/?#].*$/, "")
    .replace(/^@/, "");

  const findings = synthesis?.keyFindings || [];
  const verdictLevel = synthesis?.trustVerdictLevel || "caution";
  const verdictTitle =
    synthesis?.trustVerdictTitle || "EVIDENCE SYNTHESIZED — REVIEW FORENSIC SIGNALS";

  const getVerdictStyle = () => {
    switch (verdictLevel) {
      case "clean":
        return {
          bg: "bg-emerald-50",
          border: "border-emerald-200",
          badgeBg: "bg-emerald-600 text-white",
          text: "text-emerald-950",
          icon: <CheckCircleIcon className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />,
        };
      case "elevated_risk":
        return {
          bg: "bg-rose-50",
          border: "border-rose-200",
          badgeBg: "bg-rose-600 text-white",
          text: "text-rose-950",
          icon: <AlertCircleIcon className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />,
        };
      case "caution":
      default:
        return {
          bg: "bg-blue-50/70",
          border: "border-blue-200/80",
          badgeBg: "bg-blue-600 text-white",
          text: "text-slate-900",
          icon: <ShieldCheckIcon className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />,
        };
    }
  };

  const verdictStyle = getVerdictStyle();

  const getCategoryIcon = (category: string, severity: string) => {
    switch (category) {
      case "price":
        return (
          <div
            className={`w-9 h-9 rounded-xl ${
              severity === "warning"
                ? "bg-amber-100 text-amber-800"
                : "bg-emerald-100 text-emerald-800"
            } flex items-center justify-center shrink-0 font-bold text-sm shadow-2xs`}
          >
            ₹
          </div>
        );
      case "optical":
        return (
          <div
            className={`w-9 h-9 rounded-xl ${
              severity === "warning"
                ? "bg-amber-100 text-amber-800"
                : "bg-blue-100 text-blue-800"
            } flex items-center justify-center shrink-0 shadow-2xs`}
          >
            <SearchIcon className="w-4 h-4" />
          </div>
        );
      case "profile":
        return (
          <div
            className={`w-9 h-9 rounded-xl ${
              severity === "warning"
                ? "bg-amber-100 text-amber-800"
                : "bg-indigo-100 text-indigo-800"
            } flex items-center justify-center shrink-0 shadow-2xs`}
          >
            <ShieldCheckIcon className="w-4 h-4" />
          </div>
        );
      case "reputation":
      default:
        return (
          <div
            className={`w-9 h-9 rounded-xl ${
              severity === "warning"
                ? "bg-rose-100 text-rose-800"
                : "bg-slate-200 text-slate-800"
            } flex items-center justify-center shrink-0 shadow-2xs`}
          >
            <InfoIcon className="w-4 h-4" />
          </div>
        );
    }
  };

  return (
    <section className="bg-white rounded-2xl shadow-xs p-5 sm:p-6 flex flex-col gap-5 border border-slate-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-bold text-slate-900">
            1. Key Findings &amp; Summary
          </h2>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100">
            Verified Summary
          </span>
          <span className="text-xs font-medium text-slate-500">
            {totalDataSources} Data Sources
          </span>
        </div>
      </div>

      {/* Prominent Trust Verdict & Executive Summary Banner */}
      <div className={`rounded-2xl p-5 ${verdictStyle.bg} border ${verdictStyle.border} flex flex-col gap-3.5`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            {verdictStyle.icon}
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Trust Assessment for @{displayHandle}
              </span>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
                {verdictTitle}
              </h3>
            </div>
          </div>

          <span className={`self-start sm:self-auto px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${verdictStyle.badgeBg} shadow-2xs`}>
            {verdictLevel === "clean"
              ? "Verified Footprint"
              : verdictLevel === "elevated_risk"
              ? "High Caution"
              : "Compare Deals"}
          </span>
        </div>

        {/* Executive Summary in Plain English */}
        {synthesis?.executiveSummary && (
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans bg-white/80 p-3.5 rounded-xl border border-slate-200/60 shadow-2xs">
            {synthesis.executiveSummary}
          </p>
        )}

        {/* Bottom Line Advice */}
        {synthesis?.bottomLineRecommendation && (
          <div className="flex items-start gap-2 pt-1 text-xs text-slate-800">
            <span className="font-extrabold text-blue-700 uppercase tracking-wide shrink-0">
              Buyer Advice:
            </span>
            <span className="font-medium leading-relaxed">
              {synthesis.bottomLineRecommendation}
            </span>
          </div>
        )}
      </div>

      {/* 4 Core Pillars Grid */}
      <div>
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
          4-Point Forensic Breakdown
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {findings.length > 0 ? (
            findings.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-slate-50 flex items-start gap-3 border border-slate-200 hover:border-slate-300 transition-colors"
              >
                {getCategoryIcon(item.category, item.severity)}
                <div className="flex flex-col gap-1 min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-bold text-slate-900 truncate">
                      {item.title}
                    </span>
                    {item.severity === "warning" && (
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-100 text-amber-800 shrink-0">
                        Attention
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {item.detail}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="sm:col-span-2 p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
              <ShieldCheckIcon className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-bold text-slate-900">
                  Awaiting Investigation Evidence
                </span>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Run an investigation to evaluate pricing, photo authenticity, seller credibility, and public discussion records.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
