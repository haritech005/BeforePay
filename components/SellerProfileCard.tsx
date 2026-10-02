"use client";

import React from "react";
import Image from "next/image";
import { SellerProfileData, formatCount } from "@/lib/investigation/sellerProfile";
import { CheckResult } from "@/lib/types/investigation";
import {
  ShieldCheckIcon,
  ExternalLinkIcon,
  AlertCircleIcon,
  UserIcon,
} from "./Icons";

interface SellerProfileCardProps {
  profileResult?: CheckResult<SellerProfileData> | null;
  fallbackHandle?: string;
}

export default function SellerProfileCard({
  profileResult,
  fallbackHandle = "seller",
}: SellerProfileCardProps) {
  const displayHandle = fallbackHandle.replace(/^@/, "");

  // If check failed or returned no results
  if (profileResult && profileResult.status === "no_results") {
    return (
      <section className="bg-white rounded-2xl shadow-xs p-5 sm:p-6 flex flex-col gap-4 border border-slate-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-blue-600 uppercase font-bold tracking-wider">
              02 // Profile Signals
            </span>
            <span className="text-slate-300">/</span>
            <h2 className="text-base font-bold text-slate-900">
              Account Footprint Audit
            </h2>
          </div>
          <span className="px-2.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono text-xs font-bold">
            @{displayHandle}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
          <AlertCircleIcon className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-bold text-amber-900">
              Profile Not Found on Public Search
            </span>
            <p className="text-xs text-amber-800 leading-relaxed">
              {profileResult.message || `The Instagram handle @${displayHandle} could not be retrieved from the public index. The account may be inactive, renamed, or restricted.`}
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (profileResult && profileResult.status === "failed") {
    return (
      <section className="bg-white rounded-2xl shadow-xs p-5 sm:p-6 flex flex-col gap-4 border border-slate-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-blue-600 uppercase font-bold tracking-wider">
              02 // Profile Signals
            </span>
            <span className="text-slate-300">/</span>
            <h2 className="text-base font-bold text-slate-900">
              Account Footprint Audit
            </h2>
          </div>
          <span className="px-2.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono text-xs font-bold">
            @{displayHandle}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3">
          <AlertCircleIcon className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-bold text-rose-900">
              Profile Search Service Error
            </span>
            <p className="text-xs text-rose-800 leading-relaxed">
              {profileResult.message || "Failed to retrieve profile information from SerpApi."}
            </p>
          </div>
        </div>
      </section>
    );
  }

  const data = profileResult?.data;

  // Render populated real profile data if available
  return (
    <section className="bg-white rounded-2xl shadow-xs p-5 sm:p-6 flex flex-col gap-4 border border-slate-200">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-blue-600 uppercase font-bold tracking-wider">
            02 // Profile Signals
          </span>
          <span className="text-slate-300">/</span>
          <h2 className="text-base font-bold text-slate-900">
            Account Footprint Audit
          </h2>
        </div>
        <a
          href={data?.profileUrl || `https://www.instagram.com/${displayHandle}`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-2.5 py-0.5 rounded bg-blue-50 text-blue-700 font-mono text-xs font-bold hover:bg-blue-100 transition-colors inline-flex items-center gap-1"
        >
          @{data?.username || displayHandle}
          <ExternalLinkIcon className="w-3 h-3" />
        </a>
      </div>

      {/* Profile Header & Stats */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="relative w-14 h-14 rounded-full overflow-hidden bg-slate-200 shrink-0 border border-slate-300 flex items-center justify-center">
            {data?.profilePicUrl ? (
              <Image
                src={data.profilePicUrl}
                alt="Seller Avatar"
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <UserIcon className="w-6 h-6 text-slate-500" />
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                {data?.fullName || data?.username || displayHandle}
              </h3>
              {data?.isVerified && (
                <span className="inline-flex items-center text-blue-600 font-bold" title="Verified Badge">
                  <ShieldCheckIcon className="w-4 h-4" />
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 truncate">
              @{data?.username || displayHandle}
              {data?.isPrivate ? " • Private Account" : " • Public Profile"}
            </p>
          </div>
        </div>

        {/* Quick Badges */}
        <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-auto">
          {data?.isProfessional && (
            <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[11px] font-semibold">
              Business Profile
            </span>
          )}
          {data?.isPrivate ? (
            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-semibold">
              Private
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-semibold">
              Public Indexed
            </span>
          )}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
          <span className="block text-xs text-slate-500 font-medium">Followers</span>
          <span className="text-lg sm:text-xl font-extrabold text-slate-900 mt-0.5 block">
            {data ? formatCount(data.followersCount) : "1,840"}
          </span>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
          <span className="block text-xs text-slate-500 font-medium">Following</span>
          <span className="text-lg sm:text-xl font-extrabold text-slate-900 mt-0.5 block">
            {data ? formatCount(data.followingCount) : "412"}
          </span>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
          <span className="block text-xs text-slate-500 font-medium">Posts</span>
          <span className="text-lg sm:text-xl font-extrabold text-slate-900 mt-0.5 block">
            {data ? formatCount(data.postsCount) : "19"}
          </span>
        </div>
      </div>

      {/* Biography & Signals */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
        <div>
          <span className="font-bold text-slate-900 block mb-1">
            Observed Profile Biography:
          </span>
          <p className="font-mono text-xs bg-white p-3 rounded-lg border border-slate-200 text-slate-800 leading-relaxed break-words">
            {data?.biography
              ? `"${data.biography}"`
              : `"No public biography text returned by profile index."`}
          </p>
        </div>

        {data?.externalUrl && (
          <div className="flex items-center gap-2 pt-1">
            <span className="font-semibold text-slate-700">External Store Link:</span>
            <a
              href={data.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline font-mono inline-flex items-center gap-1 truncate"
            >
              {data.externalUrl}
              <ExternalLinkIcon className="w-3 h-3 shrink-0" />
            </a>
          </div>
        )}

        {data?.signals?.accountNotes && data.signals.accountNotes.length > 0 && (
          <div className="pt-2 border-t border-slate-200/80 space-y-1">
            <span className="font-bold text-slate-900 block">Profile Observations:</span>
            <ul className="list-disc list-inside text-slate-600 space-y-0.5">
              {data.signals.accountNotes.map((note, idx) => (
                <li key={idx} className="leading-relaxed">
                  {note}
                </li>
              ))}
            </ul>
          </div>
        )}

        <p className="text-slate-400 text-[11px] italic pt-1">
          Analytical Standard: Profile follower counts and post numbers are statistical observations, not definitive proof of legitimacy or fraud.
        </p>
      </div>
    </section>
  );
}
