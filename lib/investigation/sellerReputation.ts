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
    lower.includes("cybercrime")
  ) {
    return "consumer_board";
  }
  if (
    lower.includes("reddit") ||
    lower.includes("quora") ||
    lower.includes("forum") ||
    lower.includes("community")
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
 * Searches public Google index, forums, and complaint directories for mentions of the seller handle.
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
  const query = `"${handle}" (scam OR complaint OR fraud OR review OR "not delivered" OR fake)`;

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
              `No public scam complaints or consumer grievance threads were found indexed under the exact handle @"${handle}".`,
              "Standard Note: Absence of indexed search complaints does not provide definitive confirmation of safety, as new or renamed accounts may have limited search history.",
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

    // Deduplicate by URL
    const seenUrls = new Set<string>();
    const deduplicatedMentions: ReputationMentionItem[] = [];

    for (const item of rawItems) {
      const normLink = item.link.toLowerCase().replace(/\/$/, "");
      if (!seenUrls.has(normLink) && item.link !== "#") {
        seenUrls.add(normLink);
        deduplicatedMentions.push({
          ...item,
          platformType: classifyPlatform(item.link, item.source),
        });
      }
    }

    const totalMentions = deduplicatedMentions.length;
    const indexedPlatforms = Array.from(new Set(deduplicatedMentions.map((m) => m.source).filter(Boolean)));
    const hasConsumerBoards = deduplicatedMentions.some((m) => m.platformType === "consumer_board");
    const hasForums = deduplicatedMentions.some((m) => m.platformType === "forum");

    const observations: string[] = [];
    if (totalMentions > 0) {
      observations.push(
        `Retrieved ${totalMentions} indexed community mention${totalMentions === 1 ? "" : "s"} / search record${totalMentions === 1 ? "" : "s"} across ${indexedPlatforms.length} distinct platform${indexedPlatforms.length === 1 ? "" : "s"}.`
      );
      if (hasConsumerBoards) {
        observations.push(
          "Consumer grievance boards or dispute resolution platforms were detected in indexed results."
        );
      }
      if (hasForums) {
        observations.push(
          "Public discussions and community thread discussions were identified."
        );
      }
    } else {
      observations.push(
        `No public scam complaints or consumer grievance threads were found indexed under the exact handle @"${handle}".`
      );
      observations.push(
        "Standard Note: Absence of indexed search complaints does not provide definitive confirmation of safety, as new or renamed accounts may have limited search history."
      );
    }

    const data: SellerReputationData = {
      sellerHandle: handle,
      queryUsed: query,
      totalMentions,
      mentions: deduplicatedMentions,
      summaryFindings: {
        hasDirectComplaints: hasConsumerBoards,
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
            `No public scam complaints or consumer grievance threads were found indexed under the exact handle @"${handle}".`,
            "Standard Note: Absence of indexed search complaints does not provide definitive confirmation of safety, as new or renamed accounts may have limited search history.",
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
