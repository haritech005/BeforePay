import { querySerpApi } from "@/lib/serpapi/client";
import { SerpApiError } from "@/lib/serpapi/types";
import { CheckResult } from "@/lib/types/investigation";

export interface SellerProfileData {
  username: string;
  fullName?: string;
  biography?: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  isVerified: boolean;
  isPrivate: boolean;
  isProfessional: boolean;
  externalUrl?: string;
  profilePicUrl?: string;
  bioLinks?: Array<{ title?: string; url: string }>;
  profileUrl: string;
  signals: {
    hasExternalLink: boolean;
    isPrivateAccount: boolean;
    isVerifiedBadge: boolean;
    accountNotes: string[];
  };
}

/**
 * Normalizes an Instagram handle or profile URL into a clean username.
 */
export function normalizeInstagramHandle(input: string): string {
  let clean = input.trim();
  // Strip URL schemes and domain
  clean = clean.replace(/^https?:\/\/(www\.)?instagram\.com\//i, "");
  // Strip query parameters and trailing paths
  clean = clean.replace(/[/?#].*$/, "");
  // Strip leading @
  clean = clean.replace(/^@/, "");
  return clean.trim();
}

/**
 * Formats large counts into human-readable notation (e.g. 1.8K, 2.5M).
 */
export function formatCount(count: number): string {
  if (count >= 1_000_000) {
    return (count / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  }
  if (count >= 1_000) {
    return (count / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  }
  return count.toString();
}

interface SerpApiProfileResponse {
  search_metadata?: {
    status?: string;
    instagram_profile_url?: string;
  };
  profile_results?: {
    username?: string;
    full_name?: string;
    biography?: string;
    followers?: number;
    following?: number;
    posts?: number | unknown[];
    is_verified?: boolean;
    is_private?: boolean;
    is_professional_account?: boolean;
    external_url?: string;
    profile_pic_url?: string;
    serpapi_profile_pic_url?: string;
    bio_links?: Array<{ title?: string; url: string }>;
  };
  error?: string;
}

/**
 * Dedicated function to investigate an Instagram Seller Profile via SerpApi.
 */
export async function fetchSellerProfile(
  sellerInput: string
): Promise<CheckResult<SellerProfileData>> {
  const timestamp = new Date().toISOString();
  const handle = normalizeInstagramHandle(sellerInput);

  if (!handle) {
    return {
      status: "failed",
      data: null,
      message: "Please enter a valid Instagram handle or profile URL.",
      timestamp,
    };
  }

  if (!/^[a-zA-Z0-9._]{1,30}$/.test(handle)) {
    return {
      status: "failed",
      data: null,
      message:
        "Invalid handle format. Instagram handles may only contain letters, numbers, periods, and underscores (max 30 characters).",
      timestamp,
    };
  }

  try {
    const response = await querySerpApi<SerpApiProfileResponse>({
      engine: "instagram_profile",
      profile_id: handle,
    });

    if (response.error) {
      if (
        response.error.toLowerCase().includes("not found") ||
        response.error.toLowerCase().includes("doesn't exist")
      ) {
        return {
          status: "no_results",
          data: null,
          message: `Instagram profile @${handle} was not found on public index.`,
          timestamp,
          source: `https://www.instagram.com/${handle}`,
        };
      }

      return {
        status: "failed",
        data: null,
        message: response.error,
        timestamp,
        source: `https://www.instagram.com/${handle}`,
      };
    }

    const pr = response.profile_results;
    if (!pr || (!pr.username && pr.followers === undefined)) {
      return {
        status: "no_results",
        data: null,
        message: `No public profile details returned for @${handle}.`,
        timestamp,
        source: `https://www.instagram.com/${handle}`,
      };
    }

    let postsNum = 0;
    if (typeof pr.posts === "number") {
      postsNum = pr.posts;
    } else if (Array.isArray(pr.posts)) {
      postsNum = pr.posts.length;
    }

    const isPrivate = Boolean(pr.is_private);
    const isVerified = Boolean(pr.is_verified);
    const isProfessional = Boolean(pr.is_professional_account);
    const bioText = pr.biography || "";
    const externalLink = pr.external_url || (pr.bio_links && pr.bio_links[0]?.url);

    const accountNotes: string[] = [];
    if (isPrivate) {
      accountNotes.push("Account is set to private. Product listings and customer interactions cannot be publicly reviewed.");
    }
    if (isVerified) {
      accountNotes.push("Profile holds an Instagram verified badge.");
    }
    if (isProfessional) {
      accountNotes.push("Account is registered as a professional/business creator profile.");
    }
    if (!externalLink) {
      accountNotes.push("No external verified website or checkout link listed in bio.");
    }

    const sellerData: SellerProfileData = {
      username: pr.username || handle,
      fullName: pr.full_name,
      biography: bioText,
      followersCount: pr.followers || 0,
      followingCount: pr.following || 0,
      postsCount: postsNum,
      isVerified,
      isPrivate,
      isProfessional,
      externalUrl: externalLink,
      profilePicUrl: pr.serpapi_profile_pic_url || pr.profile_pic_url,
      bioLinks: pr.bio_links,
      profileUrl: `https://www.instagram.com/${pr.username || handle}`,
      signals: {
        hasExternalLink: Boolean(externalLink),
        isPrivateAccount: isPrivate,
        isVerifiedBadge: isVerified,
        accountNotes,
      },
    };

    return {
      status: "success",
      data: sellerData,
      timestamp,
      source: sellerData.profileUrl,
    };
  } catch (err: unknown) {
    const errorMsg =
      err instanceof SerpApiError
        ? err.message
        : err instanceof Error
        ? err.message
        : "Failed to connect to profile check service.";

    if (
      errorMsg.toLowerCase().includes("not found") ||
      errorMsg.toLowerCase().includes("doesn't exist")
    ) {
      return {
        status: "no_results",
        data: null,
        message: `Instagram profile @${handle} was not found on public index.`,
        timestamp,
        source: `https://www.instagram.com/${handle}`,
      };
    }

    return {
      status: "failed",
      data: null,
      message: errorMsg,
      timestamp,
      source: `https://www.instagram.com/${handle}`,
    };
  }
}
