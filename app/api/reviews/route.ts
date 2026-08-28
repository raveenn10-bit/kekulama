import { NextResponse } from "next/server";
import { getAutoSyncedReviews } from "@/lib/googleReviewsSync";

export async function GET() {
  const data = getAutoSyncedReviews();

  return NextResponse.json({
    success: true,
    ...data,
    source: "Google Maps Verified Reviews",
    placeId: "0x3ae1710054f6ee65:0x9cfbe90a9ea62167",
    mapsUrl: "https://maps.app.goo.gl/SjnALMB1tAHYKzkM6",
  });
}
