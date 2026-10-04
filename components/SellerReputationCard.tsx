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
  // Normalize handle
  const displayHandle = sellerHandle
    .trim()
    .replace(/^https?:\/\/(www\.)?instagram\.com\//i, "")
    .replace(/[/?#].*$/, "")
    .replace(/^@/, "");

  // Failed state
  if (reputationResult && reputationResult.status === "failed") {
    return (
      <section className="bg-white rounded-2xl shadow-xs p-5 sm:p-6 flex flex-col gap-4 border border-slate-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">
              5. Public Reviews &amp; Complaints
            </h2>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
          <AlertCircleIcon className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-semibold text-slate-800">
              Reputation Index Verification
            </span>
            <p className="text-xs text-slate-600 leading-relaxed">
              {reputationResult.message ||
                "Public grievance records could not be retrieved at this moment. Exercise standard payment precautions."}
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-bold text-slate-900">
            5. Public Reviews &amp; Complaints
          </h2>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
              mentions.length > 0
                ? "bg-amber-50 text-amber-800 border-amber-200"
                : "bg-emerald-50 text-emerald-800 border-emerald-200"
            }`}
          >
            {mentions.length > 0
              ? `${mentions.length} Complaint${mentions.length === 1 ? "" : "s"} Found`
              : "0 Complaints Found"}
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

      {/* Target Overview / Search Query */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 border border-blue-100 flex items-center justify-center shrink-0">
            <SearchIcon className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-900 block">
              Search Target: @{displayHandle}
            </span>
            <p className="text-xs text-slate-500 mt-0.5">
              Checked Reddit, Quora, consumer forums, and public complaint records.
            </p>
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-2">
          {data?.summaryFindings?.hasImpersonationAlerts ? (
            <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-900 text-xs font-bold border border-rose-300">
              Scam &amp; Clone Alerts Detected
            </span>
          ) : mentions.length > 0 ? (
            <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold border border-amber-300">
              Dispute Mentions Detected
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">
              Clean Public Track Record
            </span>
          )}
        </div>
      </div>

      {/* Grievances List or Clean Record Banner */}
      {mentions.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {mentions.map((mention, idx) => {
            const lowerSnippet = (mention.title + " " + mention.snippet).toLowerCase();
            const isScamAlert =
              lowerSnippet.includes("scam alert") ||
              lowerSnippet.includes("fake page") ||
              lowerSnippet.includes("fake account") ||
              lowerSnippet.includes("impersonation") ||
              lowerSnippet.includes("beware of fake") ||
              lowerSnippet.includes("duplicate account");

            return (
              <div
                key={idx}
                className={`p-4 rounded-xl ${
                  isScamAlert
                    ? "bg-rose-50/70 border-rose-200 hover:border-rose-300"
                    : "bg-amber-50/50 border-amber-200 hover:border-amber-300"
                } border transition-colors flex flex-col justify-between gap-3`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[11px] font-bold ${
                      isScamAlert ? "text-rose-900 bg-rose-100" : "text-amber-800 bg-amber-100"
                    } px-2 py-0.5 rounded uppercase tracking-wider truncate max-w-[160px]`}>
                      {mention.source}
                    </span>
                    <span className={`text-[10px] font-bold ${
                      isScamAlert
                        ? "text-rose-800 bg-rose-100 border-rose-300"
                        : "text-amber-800 bg-amber-100 border-amber-300"
                    } px-2 py-0.5 rounded border`}>
                      {isScamAlert ? "Scam Alert" : "Dispute Signal"}
                    </span>
                  </div>

                  <h4
                    className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug"
                    title={mention.title}
                  >
                    {mention.title}
                  </h4>

                  {mention.snippet && (
                    <p className={`text-xs text-slate-700 line-clamp-3 leading-relaxed bg-white p-2.5 rounded-lg border ${
                      isScamAlert ? "border-rose-200" : "border-amber-200"
                    } font-sans italic`}>
                      &ldquo;{mention.snippet}&rdquo;
                    </p>
                  )}
                </div>

                <a
                  href={mention.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-xs font-semibold inline-flex items-center gap-1 self-start pt-1"
                >
                  <span>Inspect original discussion</span>
                  <ExternalLinkIcon className="w-3 h-3" />
                </a>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 flex items-start gap-3">
          <ShieldCheckIcon className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-bold text-slate-900">
              No Public Scam Complaints or Grievances Indexed
            </span>
            <p className="text-xs text-slate-600 leading-relaxed">
              We searched public consumer grievance boards (Reddit, Consumer Complaints Court, Quora, and web discussions) for scam reports under @{displayHandle} and found zero unresolved customer complaints.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
