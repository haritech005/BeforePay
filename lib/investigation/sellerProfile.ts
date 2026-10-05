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
    isLowFollowers: boolean;
    hasNoCodPolicy: boolean;
    hasNoReturnPolicy: boolean;
    isDirectWhatsAppOnly: boolean;
    impersonationRisk: "high" | "medium" | "low";
    suspectedCloneDetails?: {
      suspectedOfficialHandle?: string;
      reason: string;
    };
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
    const followers = pr.followers || 0;

    const lowerBio = bioText.toLowerCase();
    const hasNoCodPolicy =
      lowerBio.includes("cod not available") ||
      lowerBio.includes("no cod") ||
      lowerBio.includes("prepaid only") ||
      lowerBio.includes("advance payment") ||
      lowerBio.includes("no cash on delivery");
    const hasNoReturnPolicy =
      lowerBio.includes("no return") ||
      lowerBio.includes("return exchange") ||
      lowerBio.includes("no exchange") ||
      lowerBio.includes("no refund") ||
      lowerBio.includes("no replacement");
    const isDirectWhatsAppOnly =
      Boolean(
        externalLink?.includes("wa.me") ||
        externalLink?.includes("whatsapp") ||
        lowerBio.includes("whatsapp")
      ) &&
      !externalLink?.match(
        /https?:\/\/(www\.)?(myntra|amazon|flipkart|ajio|meesho|tira|[a-z0-9-]+\.(com|in|store|shop|co|org|net))/i
      );
    const isLowFollowers = followers < 500;

    let impersonationRisk: "high" | "medium" | "low" = "low";
    let suspectedCloneDetails:
      | { suspectedOfficialHandle?: string; reason: string }
      | undefined;

    const accountNotes: string[] = [];

    if (isPrivate) {
      accountNotes.push("Account is set to private. Product listings and customer interactions cannot be publicly reviewed.");
    }
    if (isVerified) {
      accountNotes.push("Profile holds an official Instagram verified badge.");
    }
    if (isProfessional) {
      accountNotes.push("Account is registered as a professional/business creator profile.");
    }
    if (!externalLink) {
      accountNotes.push("No external verified website or checkout link listed in bio.");
    }

    if (isLowFollowers) {
      accountNotes.push(`Low follower count (${followers} followers). Higher risk of newly created or clone accounts.`);
      if (hasNoCodPolicy || isDirectWhatsAppOnly) {
        impersonationRisk = "high";
        accountNotes.push("High Risk Payment Terms: Page refuses Cash on Delivery and directs all orders to private WhatsApp.");
      } else {
        impersonationRisk = "medium";
      }
    }

    if (hasNoCodPolicy) {
      accountNotes.push("Bio specifies 'COD Not Available' — 100% advance pre-payment required.");
    }
    if (hasNoReturnPolicy) {
      accountNotes.push("Bio specifies no returns or exchanges.");
    }

    // Check for brand impersonation / duplicate official accounts if account has low followers (< 2,000)
    if (followers < 2000) {
      try {
        const brandQuery = (pr.full_name || handle)
          .replace(/[._-]/g, " ")
          .replace(/\b(sarees?|clothing|store|shop|official|in|bangalore|delhi|mumbai)\b/gi, "")
          .trim();

        if (brandQuery.length >= 4) {
          const cloneSearch = await querySerpApi<{
            organic_results?: Array<{ title?: string; link?: string; snippet?: string }>;
          }>(
            {
              engine: "google",
              q: `site:instagram.com "${brandQuery}" -inurl:${handle}`,
              gl: "in",
              hl: "en",
              num: 5,
            },
            15000
          );

          if (cloneSearch.organic_results && cloneSearch.organic_results.length > 0) {
            for (const item of cloneSearch.organic_results) {
              const itemTitle = (item.title || "").toLowerCase();
              const itemSnippet = (item.snippet || "").toLowerCase();
              const itemLink = item.link || "";

              // Check if another profile for this brand has a follower count over 5,000
              const followerMatch = (itemTitle + " " + itemSnippet).match(/([0-9.,]+)\s*([km])?\s*followers/i);
              let discoveredFollowers = 0;
              if (followerMatch) {
                const num = parseFloat(followerMatch[1].replace(/,/g, ""));
                const multiplier = followerMatch[2]?.toLowerCase() === "m" ? 1_000_000 : followerMatch[2]?.toLowerCase() === "k" ? 1_000 : 1;
                discoveredFollowers = num * multiplier;
              }

              if (discoveredFollowers > 5000 && discoveredFollowers > followers * 10) {
                const handleMatch = itemLink.match(/instagram\.com\/([a-zA-Z0-9._]+)/i);
                const officialHandle = handleMatch ? handleMatch[1] : brandQuery;

                impersonationRisk = "high";
                suspectedCloneDetails = {
                  suspectedOfficialHandle: officialHandle,
                  reason: `Official account found (@${officialHandle} with ${discoveredFollowers.toLocaleString("en-IN")} followers) compared to queried account (${followers} followers).`,
                };
                accountNotes.push(
                  `Suspected Clone: Found official brand page (@${officialHandle} with ~${discoveredFollowers.toLocaleString("en-IN")} followers). This page (@${handle}) may be an unverified duplicate.`
                );
                break;
              }
            }
          }
        }
      } catch (cloneErr) {
        // Non-blocking duplicate search error
        console.warn(
          "Clone check non-blocking warning:",
          cloneErr instanceof Error ? cloneErr.message : cloneErr
        );
      }
    }

    const sellerData: SellerProfileData = {
      username: pr.username || handle,
      fullName: pr.full_name,
      biography: bioText,
      followersCount: followers,
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
        isLowFollowers,
        hasNoCodPolicy,
        hasNoReturnPolicy,
        isDirectWhatsAppOnly,
        impersonationRisk,
        suspectedCloneDetails,
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
