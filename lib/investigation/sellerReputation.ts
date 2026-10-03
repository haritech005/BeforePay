import { querySerpApi } from "@/lib/serpapi/client";
import { SerpApiError } from "@/lib/serpapi/types";
import { CheckResult } from "@/lib/types/investigation";
import { normalizeInstagramHandle } from "./sellerProfile";

export interface ReputationMentionItem {
  position?: number;
  title: string;
  link: string;
  snippet: string;
  source: string;
  date?: string;
  platformType?: "forum" | "consumer_board" | "social_media" | "web";
}

export interface SellerReputationData {
  sellerHandle: string;
  queryUsed: string;
  totalMentions: number;
  mentions: ReputationMentionItem[];
  summaryFindings: {
    hasDirectComplaints: boolean;
    hasForumDiscussions: boolean;
    indexedPlatforms: string[];
  };
  observations: string[];
}

interface SerpApiOrganicResult {
  position?: number;
  title?: string;
  link?: string;
  snippet?: string;
  source?: string;
  date?: string;
}

interface SerpApiSearchResponse {
  search_metadata?: {
    status?: string;
    google_url?: string;
  };
  organic_results?: SerpApiOrganicResult[];
  discussions_and_forums?: Array<{
    title?: string;
    link?: string;
    snippet?: string;
    source?: string;
  }>;
  error?: string;
}

/**
 * Categorizes a domain name or URL into a broad platform classification.
 */
function classifyPlatform(url: string, source: string): "forum" | "consumer_board" | "social_media" | "web" {
  const lower = (url + " " + source).toLowerCase();
  if (
    lower.includes("consumercomplaints") ||
    lower.includes("complaintboard") ||
    lower.includes("mouthshut") ||
    lower.includes("trustpilot") ||
    lower.includes("consumeraffairs") ||
    lower.includes("cybercrime") ||
    lower.includes("nationalconsumerhelpline") ||
    lower.includes("voxya")
  ) {
    return "consumer_board";
  }
  if (
    lower.includes("reddit") ||
    lower.includes("quora") ||
    lower.includes("forum") ||
    lower.includes("community") ||
    lower.includes("team-bhp")
  ) {
    return "forum";
  }
  if (
    lower.includes("instagram") ||
    lower.includes("twitter") ||
    lower.includes("x.com") ||
    lower.includes("facebook") ||
    lower.includes("youtube")
  ) {
    return "social_media";
  }
  return "web";
}

/**
 * Validates that a search result is genuinely discussing the queried seller/brand,
 * preventing false-positive attribution of generic scam posts or unrelated companies.
 */
function isRelevantToSeller(
  item: { title: string; snippet: string; link: string },
  handle: string
): boolean {
  const combined = `${item.title} ${item.snippet} ${item.link}`.toLowerCase();
  const normalizedHandle = handle.toLowerCase().trim().replace(/^@/, "");
  const handleNoExt = normalizedHandle.replace(
    /\.(in|com|org|store|shop|online|co|net|co\.in)$/i,
    ""
  );

  // Form words from handle (e.g. houseofclothes -> house of clothes, brand_shop -> brand shop)
  const spacedHandle = normalizedHandle
    .replace(/[._-]/g, " ")
    .replace(/\b(in|com|official)\b/g, "")
    .trim();

  const targetTerms = [
    normalizedHandle,
    handleNoExt,
    `@${normalizedHandle}`,
    `@${handleNoExt}`,
    spacedHandle,
  ].filter((t) => t.length >= 3);

  // Must mention at least one variation of the target seller name/handle
  const mentionsSeller = targetTerms.some((term) =>
    combined.includes(term.toLowerCase())
  );

  if (!mentionsSeller) {
    return false;
  }

  // Prevent false-positive substring collisions (e.g. "houseofcb" vs "houseofclothes")
  if (
    combined.includes("houseofcb") &&
    !combined.includes("houseofclothes") &&
    !combined.includes("house of clothes")
  ) {
    return false;
  }

  return true;
}

/**
 * Detects whether a post snippet or title is a product sales drop, marketing post,
 * store announcement, or catalog listing from a boutique.
 */
function isPromotionalOrSellerPost(combinedText: string): boolean {
  const promoKeywords = [
    "dm for orders",
    "dm to order",
    "dm to buy",
    "dm for price",
    "dm for details",
    "dm us",
    "new arrivals",
    "new arrival",
    "new drop",
    "fresh drop",
    "new collection",
    "latest collection",
    "winter collection",
    "summer collection",
    "save to buy later",
    "save now and buy",
    "buy now",
    "order now",
    "link in bio",
    "free shipping",
    "cash on delivery",
    "cod available",
    "clicked on iphone",
    "clicked on i phone",
    "colour might slightly",
    "color might slightly",
    "color may vary",
    "photos are clicked",
    "visit us at",
    "store location",
    "store:",
    "shop no",
    "sizes:",
    "size:",
    "price:",
    "wash care:",
    "fabric:",
    "• follow",
    "follow for more",
    "follow our page",
    "knitted shirt",
    "linen shirt",
    "corduroy shirt",
    "cotton shirt",
    "baggy pants",
    "relaxed fit",
    "oversized",
    "available in store",
  ];

  return promoKeywords.some((kw) => combinedText.includes(kw));
}

/**
 * Validates whether a search result snippet represents a genuine third-party consumer grievance,
 * complaint, scam allegation, or dispute thread rather than promotional product marketing.
 */
function isConsumerGrievance(
  item: { title: string; snippet: string; link: string; source: string },
  handle: string
): boolean {
  // 1. Must strictly pertain to the queried seller
  if (!isRelevantToSeller(item, handle)) {
    return false;
  }

  const combinedText = `${item.title} ${item.snippet}`.toLowerCase();
  const lowerLink = item.link.toLowerCase();
  const platform = classifyPlatform(item.link, item.source);

  // Exclude primary profile page of the seller itself
  if (
    lowerLink.match(/instagram\.com\/[^/]+\/?$/) &&
    !combinedText.includes("complaint") &&
    !combinedText.includes("scam")
  ) {
    return false;
  }

  // 2. Immediate rejection of product sales / store promotional drops
  if (isPromotionalOrSellerPost(combinedText)) {
    return false;
  }

  // Strong negative consumer dispute indicators
  const explicitComplaintPatterns = [
    "scammer",
    "cheated me",
    "cheated by",
    "money lost",
    "lost my money",
    "not delivered",
    "never delivered",
    "never received",
    "not received",
    "fake account cheated",
    "no reply after payment",
    "blocked me after",
    "blocked after payment",
    "stole money",
    "consumer complaint",
    "complaint against",
    "filed a complaint",
    "defective item received",
    "cybercrime complaint",
    "police complaint",
    "consumer court",
    "refund not received",
    "return refused",
    "do not buy from this page",
    "do not order from this page",
    "fake page taking money",
  ];

  const hasExplicitComplaint = explicitComplaintPatterns.some((pattern) =>
    combinedText.includes(pattern)
  );

  // If on a dedicated consumer board (e.g. consumercomplaints, mouthshut, voxya, consumercourt, trustpilot)
  if (platform === "consumer_board") {
    return (
      hasExplicitComplaint ||
      combinedText.includes("complaint") ||
      combinedText.includes("scam") ||
      combinedText.includes("fraud")
    );
  }

  // If on Reddit/Quora discussion forums, verify it's a dispute thread or legitimacy check
  if (platform === "forum") {
    return (
      hasExplicitComplaint ||
      combinedText.includes("is this a scam") ||
      combinedText.includes("is legit") ||
      combinedText.includes("review") ||
      combinedText.includes("fake or real")
    );
  }

  // On social media (Instagram, Facebook), ONLY keep if explicit victim dispute statement exists
  return hasExplicitComplaint;
}

/**
 * Searches public Google index, forums, and complaint directories for mentions of the seller handle.
 * Filters results to highlight genuine consumer dispute and grievance records.
 *
 * @param sellerInput Raw or normalized Instagram handle
 */
export async function searchSellerReputation(
  sellerInput: string
): Promise<CheckResult<SellerReputationData>> {
  const timestamp = new Date().toISOString();
  const handle = normalizeInstagramHandle(sellerInput);

  if (!handle) {
    return {
      status: "no_results",
      data: null,
      message: "A valid seller handle is required to scan public reputation records.",
      timestamp,
    };
  }

  // Quota-optimized focused boolean search query
  const query = `"${handle}" (scam OR complaint OR fraud OR "not delivered" OR "bad experience" OR review)`;

  try {
    const response = await querySerpApi<SerpApiSearchResponse>({
      engine: "google",
      q: query,
      gl: "in",
      hl: "en",
      num: 10,
    });

    if (response.error) {
      if (
        response.error.toLowerCase().includes("hasn't returned any results") ||
        response.error.toLowerCase().includes("no results") ||
        response.error.toLowerCase().includes("not found")
      ) {
        return {
          status: "success",
          data: {
            sellerHandle: handle,
            queryUsed: query,
            totalMentions: 0,
            mentions: [],
            summaryFindings: {
              hasDirectComplaints: false,
              hasForumDiscussions: false,
              indexedPlatforms: [],
            },
            observations: [
              `No public scam complaints or consumer grievance threads were found indexed under @"${handle}".`,
              "Analytical Standard: Absence of indexed search complaints does not guarantee safety, as newer accounts may have limited dispute history.",
            ],
          },
          timestamp,
          source: response.search_metadata?.google_url,
        };
      }

      return {
        status: "failed",
        data: null,
        message: response.error,
        timestamp,
        source: response.search_metadata?.google_url,
      };
    }

    const organicList = response.organic_results || [];
    const forumList = response.discussions_and_forums || [];

    const rawItems = [
      ...organicList.map((item) => ({
        position: item.position,
        title: item.title || "Indexed public mention",
        link: item.link || "#",
        snippet: item.snippet || "",
        source: item.source || new URL(item.link || "https://google.com").hostname.replace(/^www\./, ""),
        date: item.date,
      })),
      ...forumList.map((forum, idx) => ({
        position: organicList.length + idx + 1,
        title: forum.title || "Community discussion thread",
        link: forum.link || "#",
        snippet: forum.snippet || "",
        source: forum.source || "Discussion Forum",
        date: undefined,
      })),
    ];

    // Deduplicate by URL and filter for genuine consumer grievances
    const seenUrls = new Set<string>();
    const filteredGrievances: ReputationMentionItem[] = [];

    for (const item of rawItems) {
      const normLink = item.link.toLowerCase().replace(/\/$/, "");
      if (!seenUrls.has(normLink) && item.link !== "#") {
        seenUrls.add(normLink);

        // Apply strict consumer grievance filter
        if (isConsumerGrievance(item, handle)) {
          filteredGrievances.push({
            ...item,
            platformType: classifyPlatform(item.link, item.source),
          });
        }
      }
    }

    const totalMentions = filteredGrievances.length;
    const indexedPlatforms = Array.from(new Set(filteredGrievances.map((m) => m.source).filter(Boolean)));
    const hasConsumerBoards = filteredGrievances.some((m) => m.platformType === "consumer_board");
    const hasForums = filteredGrievances.some((m) => m.platformType === "forum");

    const observations: string[] = [];
    if (totalMentions > 0) {
      observations.push(
        `Identified ${totalMentions} public consumer grievance record${totalMentions === 1 ? "" : "s"} / dispute thread${totalMentions === 1 ? "" : "s"} across ${indexedPlatforms.length} platform${indexedPlatforms.length === 1 ? "" : "s"}.`
      );
      if (hasConsumerBoards) {
        observations.push(
          "Formal consumer grievance boards or dispute resolution platforms were detected."
        );
      }
      if (hasForums) {
        observations.push(
          "Public community discussions regarding seller reliability or disputes were identified."
        );
      }
    } else {
      observations.push(
        `No public scam complaints, dispute threads, or consumer court orders were indexed under @"${handle}".`
      );
      observations.push(
        "Analytical Standard: Absence of indexed search complaints indicates a clean public record, but standard safe payment precautions (such as Cash on Delivery) remain recommended."
      );
    }

    const data: SellerReputationData = {
      sellerHandle: handle,
      queryUsed: query,
      totalMentions,
      mentions: filteredGrievances,
      summaryFindings: {
        hasDirectComplaints: totalMentions > 0,
        hasForumDiscussions: hasForums,
        indexedPlatforms,
      },
      observations,
    };

    return {
      status: "success",
      data,
      timestamp,
      source: response.search_metadata?.google_url,
    };
  } catch (err: unknown) {
    const errorMsg =
      err instanceof SerpApiError
        ? err.message
        : err instanceof Error
          ? err.message
          : "Failed to connect to reputation search service.";

    if (
      errorMsg.toLowerCase().includes("hasn't returned any results") ||
      errorMsg.toLowerCase().includes("no results") ||
      errorMsg.toLowerCase().includes("not found")
    ) {
      return {
        status: "success",
        data: {
          sellerHandle: handle,
          queryUsed: query,
          totalMentions: 0,
          mentions: [],
          summaryFindings: {
            hasDirectComplaints: false,
            hasForumDiscussions: false,
            indexedPlatforms: [],
          },
          observations: [
            `No public scam complaints or consumer grievance threads were found indexed under @"${handle}".`,
            "Analytical Standard: Absence of indexed search complaints indicates a clean public record.",
          ],
        },
        timestamp,
      };
    }

    return {
      status: "failed",
      data: null,
      message: errorMsg,
      timestamp,
    };
  }
}
