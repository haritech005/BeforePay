import { querySerpApi } from "@/lib/serpapi/client";
import { SerpApiError } from "@/lib/serpapi/types";
import { CheckResult } from "@/lib/types/investigation";

export interface ShoppingListingItem {
  position?: number;
  title: string;
  link: string;
  source: string;
  price: string;
  extractedPrice: number;
  savingsAmount?: number;
  savingsPercentage?: number;
  rating?: number;
  reviews?: number;
  thumbnail?: string;
  delivery?: string;
  tag?: string;
}

export interface PriceComparisonData {
  productName: string;
  quotedPrice: number;
  quotedPriceFormatted: string;
  cheaperListings: ShoppingListingItem[];
  totalQualifyingCount: number;
  cheapestListingPrice?: number;
  maximumSavingsAmount?: number;
  maximumSavingsPercentage?: number;
  allResultsCount: number;
  observations: string[];
}

interface SerpApiShoppingItem {
  position?: number;
  title?: string;
  link?: string;
  product_link?: string;
  source?: string;
  price?: string;
  extracted_price?: number;
  rating?: number;
  reviews?: number;
  thumbnail?: string;
  delivery?: string;
  tag?: string;
}

interface SerpApiShoppingResponse {
  search_metadata?: {
    status?: string;
    google_shopping_url?: string;
  };
  shopping_results?: SerpApiShoppingItem[];
  error?: string;
}

/**
 * Normalizes any currency string, number, or formatted text into a clean numeric value.
 * Handles ₹, Rs., $, commas, decimals, and spaces.
 */
export function parseNumericPrice(input: string | number | undefined | null): number | null {
  if (input === undefined || input === null) return null;
  if (typeof input === "number") {
    return isNaN(input) || input < 0 ? null : input;
  }

  const cleaned = input
    .replace(/[₹$€£\s]/g, "")
    .replace(/rs\.?/i, "")
    .replace(/,/g, "")
    .trim();

  const parsed = parseFloat(cleaned);
  return isNaN(parsed) || parsed < 0 ? null : parsed;
}

/**
 * Formats a numeric price into INR currency notation (e.g. ₹2,499).
 */
export function formatCurrencyINR(amount: number): string {
  return `₹${Math.round(amount).toLocaleString("en-IN")}`;
}

export interface PriceComparisonOptions {
  productName?: string;
  quotedPrice: string | number;
  lensKeywords?: string[];
}

/**
 * Dedicated function to search Google Shopping listings and filter for cheaper comparable alternatives.
 * Supports searching by direct product name and/or candidate keywords discovered via Google Lens.
 */
export async function compareProductPrices(
  input: string | PriceComparisonOptions,
  quotedPriceArg?: string | number
): Promise<CheckResult<PriceComparisonData>> {
  const timestamp = new Date().toISOString();

  let productName = "";
  let quotedPrice: string | number = "";
  let lensKeywords: string[] = [];

  if (typeof input === "string") {
    productName = input.trim();
    quotedPrice = quotedPriceArg || "";
  } else if (input) {
    productName = (input.productName || "").trim();
    quotedPrice = input.quotedPrice;
    lensKeywords = input.lensKeywords || [];
  }

  const numericQuotedPrice = parseNumericPrice(quotedPrice);

  if (numericQuotedPrice === null || numericQuotedPrice <= 0) {
    return {
      status: "no_results",
      data: null,
      message: "A valid positive quoted asking price is required to calculate price variances.",
      timestamp,
    };
  }

  // Determine search queries
  const queriesToRun: string[] = [];
  if (productName) {
    queriesToRun.push(productName);
  }
  for (const kw of lensKeywords) {
    const trimmed = (kw || "").trim();
    if (trimmed && !queriesToRun.includes(trimmed)) {
      queriesToRun.push(trimmed);
      if (queriesToRun.length >= 2) break; // Maximum 2 shopping queries
    }
  }

  if (queriesToRun.length === 0) {
    return {
      status: "no_results",
      data: null,
      message: "Please provide a product title or upload a product photo to locate online market prices.",
      timestamp,
    };
  }

  try {
    const rawResults: SerpApiShoppingItem[] = [];
    let shoppingSourceUrl: string | undefined;

    for (const query of queriesToRun) {
      try {
        const response = await querySerpApi<SerpApiShoppingResponse>({
          engine: "google_shopping",
          q: query,
          gl: "in",
          hl: "en",
        });

        if (response.search_metadata?.google_shopping_url && !shoppingSourceUrl) {
          shoppingSourceUrl = response.search_metadata.google_shopping_url;
        }

        if (response.shopping_results) {
          rawResults.push(...response.shopping_results);
        }
      } catch (qErr) {
        console.warn(`Google shopping query warning for '${query}':`, qErr);
      }
    }

    // Deduplicate by link or title
    const seenLinks = new Set<string>();
    const allValidItems: ShoppingListingItem[] = [];

    for (const item of rawResults) {
      const title = (item.title || "").trim();
      const link = item.link || item.product_link || "#";
      const source = (item.source || "Online Merchant").trim();

      if (!title || seenLinks.has(link)) continue;
      seenLinks.add(link);
      
      let itemPriceNum = item.extracted_price;
      if (itemPriceNum === undefined && item.price) {
        const parsed = parseNumericPrice(item.price);
        if (parsed !== null) {
          itemPriceNum = parsed;
        }
      }

      if (itemPriceNum !== undefined && itemPriceNum > 0 && title) {
        allValidItems.push({
          position: item.position,
          title,
          link,
          source,
          price: item.price || formatCurrencyINR(itemPriceNum),
          extractedPrice: itemPriceNum,
          rating: item.rating,
          reviews: item.reviews,
          thumbnail: item.thumbnail,
          delivery: item.delivery,
          tag: item.tag,
        });
      }
    }

    // Filter strictly cheaper listings: listingPrice < quotedPrice
    const cheaperListings: ShoppingListingItem[] = allValidItems
      .filter((item) => item.extractedPrice < numericQuotedPrice)
      .map((item) => {
        const savingsAmount = numericQuotedPrice - item.extractedPrice;
        const savingsPercentage = Math.round((savingsAmount / numericQuotedPrice) * 100);
        return {
          ...item,
          savingsAmount,
          savingsPercentage,
        };
      })
      .sort((a, b) => a.extractedPrice - b.extractedPrice); // Sort cheapest first

    const totalQualifyingCount = cheaperListings.length;
    const cheapestItem = cheaperListings[0];
    const maximumSavingsAmount = cheapestItem ? numericQuotedPrice - cheapestItem.extractedPrice : 0;
    const maximumSavingsPercentage = cheapestItem && numericQuotedPrice > 0
      ? Math.round((maximumSavingsAmount / numericQuotedPrice) * 100)
      : 0;

    const displayName = productName || (queriesToRun[0] || "Identified Product");
    const observations: string[] = [];

    if (totalQualifyingCount > 0 && cheapestItem) {
      observations.push(
        `Found ${totalQualifyingCount} comparable listing${totalQualifyingCount === 1 ? "" : "s"} priced below the seller's asking price (${formatCurrencyINR(numericQuotedPrice)}).`
      );
      observations.push(
        `Lowest comparable listing is available from ${cheapestItem.source} for ${formatCurrencyINR(cheapestItem.extractedPrice)}, offering up to ${maximumSavingsPercentage}% savings (${formatCurrencyINR(maximumSavingsAmount)} less).`
      );
    } else {
      observations.push(
        `Evaluated ${allValidItems.length} online merchant listings. No verified comparable products were found priced below the seller's asking price of ${formatCurrencyINR(numericQuotedPrice)}.`
      );
    }

    const data: PriceComparisonData = {
      productName: displayName,
      quotedPrice: numericQuotedPrice,
      quotedPriceFormatted: formatCurrencyINR(numericQuotedPrice),
      cheaperListings,
      totalQualifyingCount,
      cheapestListingPrice: cheapestItem?.extractedPrice,
      maximumSavingsAmount,
      maximumSavingsPercentage,
      allResultsCount: allValidItems.length,
      observations,
    };

    return {
      status: "success",
      data,
      timestamp,
      source: shoppingSourceUrl,
    };
  } catch (err: unknown) {
    const errorMsg =
      err instanceof SerpApiError
        ? err.message
        : err instanceof Error
        ? err.message
        : "Failed to connect to Google Shopping comparison service.";

    return {
      status: "failed",
      data: null,
      message: errorMsg,
      timestamp,
    };
  }
}
