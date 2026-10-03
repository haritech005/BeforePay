import sharp from "sharp";
import { querySerpApi } from "@/lib/serpapi/client";
import { SerpApiError, SerpApiBaseParams } from "@/lib/serpapi/types";
import { CheckResult } from "@/lib/types/investigation";

export interface VisualMatchItem {
  position?: number;
  title: string;
  link: string;
  source: string;
  sourceIcon?: string;
  thumbnail?: string;
  isTrustedCommerce?: boolean;
  price?: {
    extractedValue?: number;
    currency?: string;
    value?: string;
  };
}

export interface LensInvestigationData {
  imageUrl?: string;
  totalMatches: number;
  matches: VisualMatchItem[];
  candidateProductTitles?: string[];
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

const UNWANTED_SOURCE_KEYWORDS = [
  "facebook",
  "tiktok",
  "linkedin",
  "threads",
  "pinterest",
  "youtube",
  "twitter",
  "x.com",
];

const FOREIGN_SPAM_TLDS = /\.(ir|ru|cn|tr|pl|bd|vn|id|th|pk|sa|eg)\//i;

const TRUSTED_COMMERCE_DOMAINS = [
  "myntra.com",
  "flipkart.com",
  "amazon.",
  "meesho.com",
  "ajio.com",
  "tatacliq.com",
  "nykaaman.com",
  "nykaa.com",
  "snitch.co.in",
  "snitch.com",
  "bewakoof.com",
  "souledstore.com",
  "zara.com",
  "hm.com",
  "marksandspencer",
  "lifestyle",
  "shoppersstop.com",
  "campus-sutra",
  "campussutra",
  "bonkerscorner",
  "cahoot.in",
  "ottostore",
  "urban-scissors",
  "urbanscissors",
  "vastrado",
  "zantum",
  "tarakonline",
  "redtape",
  "maxfashion",
  "reliancetrends",
  "pantaloons",
];

function isLegitimateCommerceOrSocial(match: SerpApiLensMatch): boolean {
  const sourceLower = (match.source || "").toLowerCase();
  const linkLower = (match.link || "").toLowerCase();
  const titleLower = (match.title || "").toLowerCase();

  // Allow Instagram (genuine boutique drops & reels)
  if (sourceLower.includes("instagram") || linkLower.includes("instagram.com")) {
    return true;
  }

  // Reject explicitly noisy non-commerce social networks
  if (UNWANTED_SOURCE_KEYWORDS.some((kw) => sourceLower.includes(kw) || linkLower.includes(kw))) {
    return false;
  }

  // Reject foreign non-commerce spam domains
  if (FOREIGN_SPAM_TLDS.test(linkLower)) {
    return false;
  }

  // Reject obvious non-clothing / random resume / video titles
  if (titleLower.includes("founder of") || titleLower.includes("graduate") || titleLower.includes("linkedin")) {
    return false;
  }

  return true;
}

function isTrustedMarketplace(match: SerpApiLensMatch): boolean {
  const sourceLower = (match.source || "").toLowerCase();
  const linkLower = (match.link || "").toLowerCase();

  return TRUSTED_COMMERCE_DOMAINS.some(
    (domain) => sourceLower.includes(domain) || linkLower.includes(domain)
  );
}

function extractCleanProductTitle(rawTitle: string): string {
  return rawTitle
    .replace(/^Buy\s+/i, "")
    .replace(/\s*\|\s*.*$/, "")
    .replace(/\s*-\s*Buy.*$/i, "")
    .replace(/\s*Online.*$/i, "")
    .replace(/\s*at\s+(Myntra|Nykaa|Flipkart|Amazon|AJIO).*$/i, "")
    .replace(/\s*\([^)]*\)/g, "")
    .trim();
}

/**
 * Uploads a local image buffer to SerpApi's Image endpoint to obtain an image_id for Google Lens.
 */
async function uploadImageToSerpApi(buffer: Buffer): Promise<string> {
  const apiKey = process.env.SERPAPI_API_KEY;
  if (!apiKey) {
    throw new Error("SERPAPI_API_KEY is not configured.");
  }

  // Compress and resize using sharp to ensure it's under the 500KB SerpApi limit
  const optimizedBuffer = await sharp(buffer)
    .resize(1000, 1500, { fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 85 })
    .toBuffer();

  const formData = new FormData();
  const blob = new Blob([optimizedBuffer], { type: "image/jpeg" });
  formData.append("image", blob, "product.jpg");
  formData.append("api_key", apiKey);

  const uploadRes = await fetch("https://serpapi.com/image", {
    method: "POST",
    body: formData,
  });

  const uploadJson = await uploadRes.json();
  if (!uploadJson.image_id) {
    throw new Error(
      uploadJson.error || "Failed to upload image to Google Lens service."
    );
  }

  return uploadJson.image_id;
}

export interface InvestigateImageOptions {
  imageUrl?: string;
  imageBuffer?: Buffer;
}

/**
 * Investigates a product image using SerpApi Google Lens engine.
 * Supports public URLs, base64 data URIs, and raw Buffers from file uploads.
 */
export async function investigateProductImage(
  input: string | InvestigateImageOptions
): Promise<CheckResult<LensInvestigationData>> {
  const timestamp = new Date().toISOString();

  let targetUrl: string | undefined;
  let targetBuffer: Buffer | undefined;

  if (typeof input === "string") {
    const trimmed = input.trim();
    if (trimmed.startsWith("data:image/")) {
      const base64Data = trimmed.split(";base64,").pop();
      if (base64Data) {
        targetBuffer = Buffer.from(base64Data, "base64");
      }
    } else if (/^https?:\/\/.+/i.test(trimmed) && !trimmed.includes("localhost") && !trimmed.startsWith("blob:")) {
      targetUrl = trimmed;
    }
  } else if (input) {
    if (input.imageBuffer && input.imageBuffer.length > 0) {
      targetBuffer = input.imageBuffer;
    } else if (input.imageUrl) {
      const trimmed = input.imageUrl.trim();
      if (trimmed.startsWith("data:image/")) {
        const base64Data = trimmed.split(";base64,").pop();
        if (base64Data) {
          targetBuffer = Buffer.from(base64Data, "base64");
        }
      } else if (/^https?:\/\/.+/i.test(trimmed) && !trimmed.includes("localhost") && !trimmed.startsWith("blob:")) {
        targetUrl = trimmed;
      }
    }
  }

  if (!targetBuffer && !targetUrl) {
    return {
      status: "no_results",
      data: null,
      message:
        "No valid image file or publicly accessible image URL was provided for visual match analysis.",
      timestamp,
    };
  }

  try {
    let lensParams: SerpApiBaseParams;

    if (targetBuffer) {
      const imageId = await uploadImageToSerpApi(targetBuffer);
      lensParams = {
        engine: "google_lens",
        image_id: imageId,
        gl: "in",
        hl: "en",
      };
    } else {
      lensParams = {
        engine: "google_lens",
        url: targetUrl!,
        gl: "in",
        hl: "en",
      };
    }

    const response = await querySerpApi<SerpApiLensResponse>(lensParams);

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
    
    // Filter out Facebook, TikTok, random blogs, and noise
    const filteredMatches = rawMatches.filter(isLegitimateCommerceOrSocial);

    // Sort trusted e-commerce stores first, then social commerce
    const sortedMatches = [...filteredMatches].sort((a, b) => {
      const aTrusted = isTrustedMarketplace(a);
      const bTrusted = isTrustedMarketplace(b);
      if (aTrusted && !bTrusted) return -1;
      if (!aTrusted && bTrusted) return 1;
      return 0;
    });

    const matches: VisualMatchItem[] = sortedMatches.map((m, idx) => ({
      position: m.position || idx + 1,
      title: m.title || "Visual match listing",
      link: m.link || "#",
      source: m.source || "External Catalog",
      sourceIcon: m.source_icon,
      thumbnail: m.thumbnail,
      isTrustedCommerce: isTrustedMarketplace(m),
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
          imageUrl: targetUrl || "",
          totalMatches: 0,
          matches: [],
          observations: [
            "No verified commerce listings or identical catalog photos were found across major e-commerce platforms.",
          ],
        },
        message: "No verified product matches were found across trusted online catalogs.",
        timestamp,
        source: response.search_metadata?.google_lens_url,
      };
    }

    // Extract clean candidate product titles from trusted commerce listings for Google Shopping price comparison
    const candidateProductTitles = matches
      .filter((m) => m.isTrustedCommerce || !m.link.includes("instagram.com"))
      .map((m) => extractCleanProductTitle(m.title))
      .filter((t) => t.length > 5 && !t.startsWith("http"))
      .slice(0, 3);

    // Build objective forensic observations
    const uniqueSources = Array.from(new Set(matches.map((m) => m.source).filter(Boolean)));
    const observations: string[] = [];

    const trustedCount = matches.filter((m) => m.isTrustedCommerce).length;
    if (trustedCount > 0) {
      observations.push(
        `Identified ${trustedCount} direct optical match${trustedCount === 1 ? "" : "es"} on trusted e-commerce platforms (e.g. ${uniqueSources.filter((s) => TRUSTED_COMMERCE_DOMAINS.some((d) => s.toLowerCase().includes(d.split(".")[0]))).slice(0, 3).join(", ")}).`
      );
    } else {
      observations.push(
        `Identified ${matches.length} visual match${matches.length === 1 ? "" : "es"} across indexed commerce platforms.`
      );
    }

    const matchesWithPrice = matches.filter((m) => m.price?.value || m.price?.extractedValue);
    if (matchesWithPrice.length > 0) {
      observations.push(
        `Direct optical catalog listings range from ${matchesWithPrice[0].price?.value || "N/A"} upwards.`
      );
    }

    const data: LensInvestigationData = {
      imageUrl: targetUrl || "",
      totalMatches: matches.length,
      matches,
      candidateProductTitles,
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
