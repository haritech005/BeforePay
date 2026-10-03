import { SerpApiBaseParams, SerpApiError, SerpApiErrorKind } from "./types";

const SERPAPI_ENDPOINT = "https://serpapi.com/search.json";
const DEFAULT_TIMEOUT_MS = 25000;

/**
 * Validates and retrieves the server-side SERPAPI_API_KEY environment variable.
 * Throws a typed SerpApiError if missing or empty.
 */
export function getSerpApiKey(): string {
  const apiKey = process.env.SERPAPI_API_KEY?.trim();
  if (!apiKey) {
    throw new SerpApiError(
      "SERPAPI_API_KEY is not configured in server environment variables.",
      "AUTH_INVALID_KEY"
    );
  }
  return apiKey;
}

/**
 * Reusable server-side utility to make typed SerpApi search requests.
 *
 * @param params Search engine parameters (e.g. engine, q, etc.)
 * @param timeoutMs Request timeout in milliseconds (default: 15000ms)
 */
export async function querySerpApi<T = Record<string, unknown>>(
  params: SerpApiBaseParams,
  timeoutMs: number = DEFAULT_TIMEOUT_MS
): Promise<T> {
  const apiKey = getSerpApiKey();

  // Construct URL with query parameters
  const url = new URL(SERPAPI_ENDPOINT);
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("output", "json");

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      signal: controller.signal,
      cache: "no-store",
    });

    clearTimeout(timeoutId);

    const data = await response.json();

    if (!response.ok || data.error) {
      const errorMessage =
        data.error ||
        data.message ||
        `SerpApi request failed with status code ${response.status}`;

      let errorKind: SerpApiErrorKind = "UPSTREAM_ERROR";

      if (response.status === 401 || errorMessage.toLowerCase().includes("invalid api key")) {
        errorKind = "AUTH_INVALID_KEY";
      } else if (
        response.status === 429 ||
        errorMessage.toLowerCase().includes("run out of searches") ||
        errorMessage.toLowerCase().includes("quota")
      ) {
        errorKind = "QUOTA_EXHAUSTED";
      } else if (response.status === 400) {
        errorKind = "INVALID_PARAMS";
      }

      throw new SerpApiError(errorMessage, errorKind, response.status);
    }

    return data as T;
  } catch (err: unknown) {
    clearTimeout(timeoutId);

    if (err instanceof SerpApiError) {
      throw err;
    }

    if (err instanceof Error) {
      if (err.name === "AbortError" || err.message.includes("aborted")) {
        throw new SerpApiError(
          `SerpApi request timed out after ${timeoutMs}ms`,
          "TIMEOUT"
        );
      }
      throw new SerpApiError(
        `Network error during SerpApi search: ${err.message}`,
        "NETWORK_ERROR"
      );
    }

    throw new SerpApiError(
      "An unexpected error occurred during SerpApi search.",
      "UNKNOWN"
    );
  }
}
