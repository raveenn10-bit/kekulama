import { NextRequest, NextResponse } from "next/server";
import { requireStaffOrOwner } from "@/lib/security/authBridge";
import { retryPendingNotifications } from "@/lib/notifications/emailService";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const user = await requireStaffOrOwner(req);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Staff or owner privileges required." },
        { status: 401 }
      );
    }
    const result = await retryPendingNotifications(15);
    return NextResponse.json({
      success: true,
      retriedCount: result.retried,
      successfulCount: result.successful,
      message: `Retried ${result.retried} notifications: ${result.successful} delivered successfully.`,
    });
  } catch (err: any) {
    console.error("[NOTIFICATIONS RETRY ERROR]", err);
    return NextResponse.json(
      { error: err?.message || "Failed to retry notifications." },
      { status: 500 }
    );
  }
}
