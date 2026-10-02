/**
 * Generic Investigation Check Status and Contract
 */
export type CheckStatus =
  | "success"
  | "no_results"
  | "failed"
  | "not_run";

export interface CheckResult<T> {
  status: CheckStatus;
  data: T | null;
  message?: string;
  timestamp?: string;
  source?: string;
}

/**
 * Top-level structured evidence aggregated across all 4 checks
 */
export interface InvestigationEvidence {
  sellerProfile: CheckResult<unknown>;
  imageMatches: CheckResult<unknown>;
  priceComparison: CheckResult<unknown>;
  reputationSearch: CheckResult<unknown>;
  executedAt: string;
}
