import { NextRequest, NextResponse } from "next/server";
import { requireOwner } from "@/lib/security/authBridge";
import { adminDb } from "@/lib/firebase/admin";
import { executeBackup } from "@/lib/backup/backupEngine";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // Extend Vercel function duration for upload

/**
 * GET: Lists backup history for authorized Owners.
 * POST: Initiates an immediate manual encrypted backup to Google Drive.
 */
export async function GET(req: NextRequest) {
  try {
    const owner = await requireOwner(req);
    if (!owner) {
      return NextResponse.json(
        { error: "Forbidden: Owner access required." },
        { status: 403 }
      );
    }

    const snap = await adminDb
      .collection("backups")
      .orderBy("createdAt", "desc")
      .limit(30)
      .get();

    const backups = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));

    return NextResponse.json({ success: true, backups });
  } catch (err: any) {
    console.error("[BACKUP LIST ERROR]", err);
    return NextResponse.json(
      { error: err?.message || "Failed to retrieve backup history." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const owner = await requireOwner(req);
    if (!owner) {
      return NextResponse.json(
        { error: "Forbidden: Owner access required." },
        { status: 403 }
      );
    }

    const result = await executeBackup({
      actorId: owner.uid,
      actorEmail: owner.email,
      triggeredBy: "manual",
    });

    return NextResponse.json({
      success: true,
      backupId: result.backupId,
      filename: result.filename,
      sizeBytes: result.sizeBytes,
      sha256Checksum: result.sha256Checksum,
      driveFileId: result.driveFile.id,
      manifest: result.manifest,
      message: `Encrypted backup successfully created and uploaded to Google Drive.`,
    });
  } catch (err: any) {
    console.error("[MANUAL BACKUP ERROR]", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to execute manual backup." },
      { status: 500 }
    );
  }
}
