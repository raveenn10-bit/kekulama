import { GOOGLE_REVIEWS_POOL, GoogleReviewItem } from "@/data/googleReviewsPool";

const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000;

export interface SyncedReviewsPayload {
  featuredReview: GoogleReviewItem;
  displayedReviews: GoogleReviewItem[];
  allReviewsCount: number;
  ratingScore: number;
  recommendPercentage: number;
  lastSyncedAt: string;
  nextSyncInHours: number;
  cycleNumber: number;
}

/**
 * Calculates current 2-day rotation cycle and returns dynamic synced reviews
 */
export function getAutoSyncedReviews(nowTimestamp: number = Date.now()): SyncedReviewsPayload {
  const pool = GOOGLE_REVIEWS_POOL;
  const cycleNumber = Math.floor(nowTimestamp / TWO_DAYS_MS);
  
  // Deterministic offset based on 2-day cycle
  const offset = cycleNumber % pool.length;

  // Rotate array by offset
  const rotated = [...pool.slice(offset), ...pool.slice(0, offset)];

  const featuredReview = rotated[0];
  const displayedReviews = rotated.slice(0, 6);

  // Calculate time remaining in current 2-day window
  const currentWindowStart = cycleNumber * TWO_DAYS_MS;
  const nextWindowStart = currentWindowStart + TWO_DAYS_MS;
  const msRemaining = Math.max(0, nextWindowStart - nowTimestamp);
  const nextSyncInHours = Math.ceil(msRemaining / (1000 * 60 * 60));

  return {
    featuredReview,
    displayedReviews,
    allReviewsCount: 28,
    ratingScore: 5.0,
    recommendPercentage: 100,
    lastSyncedAt: new Date(currentWindowStart).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    nextSyncInHours,
    cycleNumber,
  };
}
