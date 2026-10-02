import { querySerpApi } from "@/lib/serpapi/client";
import { SerpApiError } from "@/lib/serpapi/types";
import { CheckResult } from "@/lib/types/investigation";

export interface VisualMatchItem {
  position?: number;
  title: string;
  link: string;
  source: string;
  sourceIcon?: string;
  thumbnail?: string;
  price?: {
    extractedValue?: number;
    currency?: string;
    value?: string;
  };
}

export interface LensInvestigationData {
  imageUrl: string;
  totalMatches: number;
  matches: VisualMatchItem[];
  knowledgeGraph?: {
    title?: string;
    subtitle?: string;
    link?: string;
  };
  observations: string[];
}

interface SerpApiLensMatch {
  position?: number;
  title?: string;
  link?: string;
  source?: string;
  source_icon?: string;
  thumbnail?: string;
  price?: {
    extracted_value?: number;
    currency?: string;
    value?: string;
  };
}

interface SerpApiLensResponse {
  search_metadata?: {
    status?: string;
    google_lens_url?: string;
  };
  visual_matches?: SerpApiLensMatch[];
  knowledge_graph?: {
    title?: string;
    subtitle?: string;
    link?: string;
  };
  error?: string;
}

/**
 * Investigates a product image using SerpApi Google Lens engine.
 *
 * @param imageUrl Publicly accessible HTTP/HTTPS URL of the product image.
 */
export async function investigateProductImage(
  imageUrl: string
): Promise<CheckResult<LensInvestigationData>> {
  const timestamp = new Date().toISOString();
  const trimmedUrl = (imageUrl || "").trim();

  if (!trimmedUrl) {
    return {
      status: "no_results",
      data: null,
      message: "No product image URL was provided for visual match analysis.",
      timestamp,
    };
  }

  // Google Lens requires a valid publicly accessible HTTP/HTTPS URL
  if (!/^https?:\/\/.+/i.test(trimmedUrl)) {
    return {
      status: "no_results",
      data: null,
      message:
        "Google Lens optical search requires a publicly accessible web image URL (HTTP/HTTPS). Local or base64 uploads cannot be indexed by public search engines directly.",
      timestamp,
    };
  }

  try {
    const response = await querySerpApi<SerpApiLensResponse>({
      engine: "google_lens",
      url: trimmedUrl,
    });

    if (response.error) {
      return {
        status: "failed",
        data: null,
        message: response.error,
        timestamp,
        source: response.search_metadata?.google_lens_url,
      };
    }

    const rawMatches = response.visual_matches || [];
    const matches: VisualMatchItem[] = rawMatches.map((m, idx) => ({
      position: m.position || idx + 1,
      title: m.title || "Visual match listing",
      link: m.link || "#",
      source: m.source || "External Catalog",
      sourceIcon: m.source_icon,
      thumbnail: m.thumbnail,
      price: m.price
        ? {
            extractedValue: m.price.extracted_value,
            currency: m.price.currency,
            value: m.price.value,
          }
        : undefined,
    }));

    if (matches.length === 0) {
      return {
        status: "no_results",
        data: {
          imageUrl: trimmedUrl,
          totalMatches: 0,
          matches: [],
          observations: [
            "No visually matching products or duplicate catalog photos were indexed across major retail catalogs.",
          ],
        },
        message: "No visual image matches were found across indexed online catalogs.",
        timestamp,
        source: response.search_metadata?.google_lens_url,
      };
    }

    // Build objective forensic observations
    const uniqueSources = Array.from(new Set(matches.map((m) => m.source).filter(Boolean)));
    const observations: string[] = [];

    observations.push(
      `Identified ${matches.length} visual match${matches.length === 1 ? "" : "es"} across ${uniqueSources.length} external source platform${uniqueSources.length === 1 ? "" : "s"}.`
    );

    if (uniqueSources.length > 0) {
      observations.push(
        `Indexed sources include: ${uniqueSources.slice(0, 4).join(", ")}${uniqueSources.length > 4 ? ` and ${uniqueSources.length - 4} others` : ""}.`
      );
    }

    const matchesWithPrice = matches.filter((m) => m.price?.extractedValue);
    if (matchesWithPrice.length > 0) {
      observations.push(
        `Prices for identical or related items on external listings range from ${matchesWithPrice[0].price?.value || "N/A"} upwards.`
      );
    }

    const data: LensInvestigationData = {
      imageUrl: trimmedUrl,
      totalMatches: matches.length,
      matches,
      knowledgeGraph: response.knowledge_graph,
      observations,
    };

    return {
      status: "success",
      data,
      timestamp,
      source: response.search_metadata?.google_lens_url,
    };
  } catch (err: unknown) {
    const errorMsg =
      err instanceof SerpApiError
        ? err.message
        : err instanceof Error
        ? err.message
        : "Failed to connect to Google Lens search service.";

    return {
      status: "failed",
      data: null,
      message: errorMsg,
      timestamp,
    };
  }
}
