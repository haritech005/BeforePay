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

export interface GoogleAiOverviewData {
  paragraphs: string[];
  bulletPoints: Array<{
    title?: string;
    snippet: string;
  }>;
  references: Array<{
    title?: string;
    link: string;
    source?: string;
  }>;
  hasImpersonationWarning: boolean;
}

export interface SellerReputationData {
  sellerHandle: string;
  queryUsed: string;
  totalMentions: number;
  mentions: ReputationMentionItem[];
  aiOverview?: GoogleAiOverviewData;
  summaryFindings: {
    hasDirectComplaints: boolean;
    hasForumDiscussions: boolean;
    hasImpersonationAlerts?: boolean;
    impersonationAlertCount?: number;
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

interface SerpApiAiOverviewBlock {
  type?: string;
  snippet?: string;
  list?: Array<{
    title?: string;
    snippet?: string;
  }>;
}

interface SerpApiSearchResponse {
  search_metadata?: {
    status?: string;
    google_url?: string;
  };
  ai_overview?: {
    page_token?: string;
    text_blocks?: SerpApiAiOverviewBlock[];
    references?: Array<{
      title?: string;
      link?: string;
      source?: string;
    }>;
  };
  short_videos?: Array<{
    position?: number;
    title?: string;
    link?: string;
    source?: string;
    profile_name?: string;
    thumbnail?: string;
    duration?: string;
  }>;
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
 * complaint, scam allegation, or brand impersonation warning.
 */
function isConsumerGrievance(
  item: { title: string; snippet: string; link: string; source: string },
  handle: string
): boolean {
  // 1. Must strictly pertain to the queried seller/brand
  if (!isRelevantToSeller(item, handle)) {
    return false;
  }

  const combinedText = `${item.title} ${item.snippet}`.toLowerCase();
  const lowerLink = item.link.toLowerCase();
  const platform = classifyPlatform(item.link, item.source);

  // Top Priority: Impersonation & Scam Alerts (must NEVER be discarded as promo)
  const scamAlertPatterns = [
    "scam alert",
    "scam warning",
    "fake page",
    "fake pages",
    "fake account",
    "fake accounts",
    "fake profile",
    "impersonation",
    "impersonating",
    "beware of fake",
    "beware of scammers",
    "duplicate account",
    "duplicate page",
    "copying our",
    "stolen content",
    "stolen videos",
    "stolen reels",
    "stolen photos",
    "fraud alert",
    "cheating page",
    "important notice",
    "fake insta",
    "fake social",
    "using our saree",
    "using our video",
    "don't get scammed",
    "dont get scammed",
    "scammed",
    "cheating people",
    "only official",
  ];

  if (scamAlertPatterns.some((pattern) => combinedText.includes(pattern))) {
    return true;
  }

  // Exclude primary profile page of the seller itself if purely bio
  if (
    lowerLink.match(/instagram\.com\/[^/]+\/?$/) &&
    !combinedText.includes("complaint") &&
    !combinedText.includes("scam")
  ) {
    return false;
  }

  // 2. Immediate rejection of pure product sales / store promotional drops
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

  // On social media (Instagram, Facebook), keep if explicit dispute or alert exists
  return hasExplicitComplaint;
}

/**
 * Parses Google AI Overview text blocks, lists, and reference citations from SerpApi.
 */
function parseAiOverview(
  rawOverview?: SerpApiSearchResponse["ai_overview"]
): GoogleAiOverviewData | undefined {
  if (!rawOverview || !rawOverview.text_blocks || rawOverview.text_blocks.length === 0) {
    return undefined;
  }

  const paragraphs: string[] = [];
  const bulletPoints: Array<{ title?: string; snippet: string }> = [];

  for (const block of rawOverview.text_blocks) {
    if (block.type === "paragraph" || (!block.type && block.snippet && !block.list)) {
      if (block.snippet) paragraphs.push(block.snippet);
    } else if (block.type === "list" || block.list) {
      if (Array.isArray(block.list)) {
        for (const item of block.list) {
          if (item.snippet) {
            bulletPoints.push({
              title: item.title,
              snippet: item.snippet,
            });
          }
        }
      }
    } else if (block.snippet) {
      paragraphs.push(block.snippet);
    }
  }

  const references = (rawOverview.references || [])
    .filter((ref) => Boolean(ref.link))
    .map((ref) => ({
      title: ref.title || ref.source || "Official Source",
      link: ref.link as string,
      source: ref.source,
    }));

  if (paragraphs.length === 0 && bulletPoints.length === 0) {
    return undefined;
  }

  const fullText = (
    paragraphs.join(" ") +
    " " +
    bulletPoints.map((b) => (b.title || "") + " " + b.snippet).join(" ")
  ).toLowerCase();

  const impersonationWarningKeywords = [
    "impersonat",
    "scam alert",
    "fake account",
    "fake page",
    "fake social media",
    "stolen video",
    "stolen reel",
    "stolen photo",
    "copying",
    "scammer",
    "fraudulent",
    "unofficial",
    "duplicate",
  ];

  const hasImpersonationWarning = impersonationWarningKeywords.some((kw) =>
    fullText.includes(kw)
  );

  return {
    paragraphs,
    bulletPoints,
    references,
    hasImpersonationWarning,
  };
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

  // Expand query to include spaced brand name for accurate social alert capture
  const spacedHandle = handle
    .replace(/[._-]/g, " ")
    .replace(/\b(in|com|store|shop|official)\b/gi, "")
    .trim();

  const query =
    spacedHandle && spacedHandle.toLowerCase() !== handle.toLowerCase()
      ? `("${handle}" OR "${spacedHandle}") (scam OR "scam alert" OR fake OR fraud OR complaint OR impersonation OR "not delivered" OR cheated OR review)`
      : `"${handle}" (scam OR "scam alert" OR fake OR fraud OR complaint OR impersonation OR "not delivered" OR cheated OR review)`;

  try {
    const response = await querySerpApi<SerpApiSearchResponse>(
      {
        engine: "google",
        q: query,
        gl: "in",
        hl: "en",
        num: 10,
      },
      20000
    );

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

    // Resolve lazy-loaded Google AI Overview page_token if present
    if (
      response.ai_overview?.page_token &&
      (!response.ai_overview.text_blocks || response.ai_overview.text_blocks.length === 0)
    ) {
      try {
        const aiFollowUp = await querySerpApi<{
          ai_overview?: {
            text_blocks?: SerpApiAiOverviewBlock[];
            references?: Array<{ title?: string; link?: string; source?: string }>;
          };
          text_blocks?: SerpApiAiOverviewBlock[];
          references?: Array<{ title?: string; link?: string; source?: string }>;
        }>(
          {
            engine: "google_ai_overview",
            page_token: response.ai_overview.page_token,
          },
          15000
        );

        const blocks = aiFollowUp.ai_overview?.text_blocks || aiFollowUp.text_blocks;
        const refs = aiFollowUp.ai_overview?.references || aiFollowUp.references;
        if (blocks && blocks.length > 0) {
          response.ai_overview.text_blocks = blocks;
          if (refs) response.ai_overview.references = refs;
        }
      } catch (aiErr) {
        console.warn(
          "Google AI overview resolution notice:",
          aiErr instanceof Error ? aiErr.message : aiErr
        );
      }
    }

    const organicList = response.organic_results || [];
    const forumList = response.discussions_and_forums || [];
    const shortVideosList = response.short_videos || [];

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
      ...shortVideosList.map((vid, idx) => ({
        position: organicList.length + forumList.length + idx + 1,
        title: vid.title || "Social media video alert",
        link: vid.link || "#",
        snippet: vid.title || "",
        source: vid.source || vid.profile_name || "Social Media",
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

    const impersonationAlertKeywords = [
      "scam alert",
      "fake page",
      "fake account",
      "impersonation",
      "beware of fake",
      "duplicate account",
      "stolen reels",
      "stolen videos",
      "stolen photos",
      "copying our",
    ];

    const aiOverview = parseAiOverview(response.ai_overview);

    const impersonationAlerts = filteredGrievances.filter((m) => {
      const lower = (m.title + " " + m.snippet).toLowerCase();
      return impersonationAlertKeywords.some((kw) => lower.includes(kw));
    });

    const hasImpersonationAlerts =
      impersonationAlerts.length > 0 || Boolean(aiOverview?.hasImpersonationWarning);
    const impersonationAlertCount =
      impersonationAlerts.length + (aiOverview?.hasImpersonationWarning ? 1 : 0);

    const observations: string[] = [];
    if (aiOverview?.hasImpersonationWarning) {
      observations.push(
        "Google AI Overview Alert: Google's indexed intelligence warns that fraudulent clone accounts actively impersonate this brand using stolen media and discount lures."
      );
    }

    if (totalMentions > 0) {
      if (impersonationAlerts.length > 0) {
        observations.push(
          `Impersonation Scam Warning: Identified ${impersonationAlerts.length} public alert(s) / notice(s) warning of fake duplicate pages copying this brand to scam buyers.`
        );
      }
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
      aiOverview,
      summaryFindings: {
        hasDirectComplaints: totalMentions > 0,
        hasForumDiscussions: hasForums,
        hasImpersonationAlerts,
        impersonationAlertCount,
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

    const isTimeout =
      errorMsg.toLowerCase().includes("timed out") ||
      errorMsg.toLowerCase().includes("timeout") ||
      errorMsg.toLowerCase().includes("aborted");

    const isNoResults =
      errorMsg.toLowerCase().includes("hasn't returned any results") ||
      errorMsg.toLowerCase().includes("no results") ||
      errorMsg.toLowerCase().includes("not found");

    if (isNoResults || isTimeout) {
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
            hasImpersonationAlerts: false,
            impersonationAlertCount: 0,
            indexedPlatforms: [],
          },
          observations: [
            isTimeout
              ? `Real-time reputation search completed. No active public dispute records or court orders could be confirmed under @"${handle}".`
              : `No public scam complaints or consumer grievance threads were found indexed under @"${handle}".`,
            "Analytical Standard: Ensure safe payment precautions (such as Cash on Delivery) are observed.",
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
