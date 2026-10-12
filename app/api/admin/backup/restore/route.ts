import { NextRequest, NextResponse } from "next/server";
import { requireOwner } from "@/lib/security/authBridge";
import { executeRestore } from "@/lib/backup/backupEngine";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Disaster Recovery Restore Endpoint:
 * Strictly restricted to verified Owners.
 * Supports Dry-Run Simulation mode and Live Restore with explicit confirmation.
 */
export async function POST(req: NextRequest) {
  try {
    const owner = await requireOwner(req);
    if (!owner) {
      return NextResponse.json(
        { error: "Forbidden: Owner access required." },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { backupId, dryRun = true, confirmRestore = false } = body;

    if (!backupId || typeof backupId !== "string") {
      return NextResponse.json(
        { error: "Missing required parameter: backupId" },
        { status: 400 }
      );
    }

    const result = await executeRestore({
      backupId,
      dryRun: Boolean(dryRun),
      confirmRestore: Boolean(confirmRestore),
      actorId: owner.uid,
    });

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("[RESTORE API ERROR]", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to process restore operation." },
      { status: 500 }
    );
  }
}
