"use client";

import React from "react";
import { SafetyChecklistItem } from "@/lib/types/investigation";

interface BuyerChecklistCardProps {
  checklist?: SafetyChecklistItem[];
}

export default function BuyerChecklistCard({ checklist = [] }: BuyerChecklistCardProps) {
  return (
    <section className="bg-white rounded-2xl shadow-xs p-5 sm:p-6 flex flex-col gap-4 border border-slate-200">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-bold text-slate-900">
            6. Safe Buying Checklist
          </h2>
        </div>
        <span className="text-xs font-semibold text-slate-400">
          Actionable Safeguards
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {checklist.length > 0 ? (
          checklist.map((item, idx) => (
            <div
              key={item.id || idx}
              className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3 hover:border-slate-300 transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                {item.stepNumber || idx + 1}
              </div>
              <div className="flex flex-col gap-1 min-w-0">
                <span className="text-xs font-bold text-slate-900 leading-snug">
                  {item.title}
                </span>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {item.recommendation}
                </p>
                {item.reason && (
                  <p className="text-[11px] text-slate-500 italic pt-0.5">
                    Why: {item.reason}
                  </p>
                )}
              </div>
            </div>
          ))
        ) : (
          /* Default established safeguards */
          <>
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
          </>
        )}
      </div>
    </section>
  );
}
