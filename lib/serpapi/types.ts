/**
 * Supported SerpApi Search Engines in BeforePay
 */
export type SerpApiEngine =
  | "google"
  | "google_shopping"
  | "google_lens"
  | "google_news"
  | "google_forums"
  | "instagram_profile";

/**
 * Base search parameters for SerpApi requests
 */
export interface SerpApiBaseParams {
  engine: SerpApiEngine;
  [key: string]: string | number | boolean | undefined;
}

/**
 * Standard SerpApi Error Response format
 */
export interface SerpApiErrorResponse {
  error?: string;
  message?: string;
}

/**
 * Structured SerpApi Error Classification
 */
export type SerpApiErrorKind =
  | "AUTH_INVALID_KEY"
  | "QUOTA_EXHAUSTED"
  | "TIMEOUT"
  | "INVALID_PARAMS"
  | "NETWORK_ERROR"
  | "UPSTREAM_ERROR"
  | "UNKNOWN";

export class SerpApiError extends Error {
  public readonly kind: SerpApiErrorKind;
  public readonly statusCode?: number;

  constructor(message: string, kind: SerpApiErrorKind, statusCode?: number) {
    super(message);
    this.name = "SerpApiError";
    this.kind = kind;
    this.statusCode = statusCode;
  }
}
