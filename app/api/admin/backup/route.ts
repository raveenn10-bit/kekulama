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

    const allBackups: any[] = [];
    const seenIds = new Set<string>();

    // 1. Tier 1: Supabase PostgreSQL (Fast, reliable, persistent across all serverless containers)
    try {
      const { supabaseAdmin, isSupabaseConfigured } = await import("@/lib/supabase/admin");
      if (isSupabaseConfigured()) {
        const { data: sbData, error: sbErr } = await supabaseAdmin
          .from("backups")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(30);

        if (!sbErr && sbData && Array.isArray(sbData)) {
          for (const b of sbData) {
            seenIds.add(b.id);
            allBackups.push({
              id: b.id,
              backupId: b.id,
              filename: b.filename,
              sizeBytes: Number(b.size_bytes) || 0,
              sha256Checksum: b.sha256_checksum,
              driveFileId: b.drive_file_id,
              driveFileName: b.drive_file_name,
              triggeredBy: b.triggered_by,
              status: b.status || "success",
              createdAt: b.created_at,
              manifest: b.manifest,
            });
          }
        }
      }
    } catch (sbError: any) {
      console.warn("[BACKUP LIST] Supabase fetch skipped:", sbError?.message);
    }

    // 2. Tier 2: Cloud Firestore (with 2.5s timeout)
    try {
      const getPromise = adminDb
        .collection("backups")
        .orderBy("createdAt", "desc")
        .limit(30)
        .get();
      const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 2500));
      const snap = (await Promise.race([getPromise, timeoutPromise])) as any;

      if (snap && snap.docs) {
        for (const d of snap.docs) {
          const docData = d.data();
          const docId = d.id || docData.backupId;
          if (!seenIds.has(docId)) {
            seenIds.add(docId);
            allBackups.push({
              id: docId,
              backupId: docData.backupId || docId,
              filename: docData.filename,
              sizeBytes: Number(docData.sizeBytes) || 0,
              sha256Checksum: docData.sha256Checksum,
              driveFileId: docData.driveFileId,
              driveFileName: docData.driveFileName,
              triggeredBy: docData.triggeredBy,
              status: docData.status || "success",
              createdAt: docData.createdAt,
              manifest: docData.manifest,
            });
          }
        }
      }
    } catch (fsError: any) {
      console.warn("[BACKUP LIST] Firestore fetch timed out or failed:", fsError?.message);
    }

    // Sort by createdAt descending
    allBackups.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    });

    return NextResponse.json({ success: true, backups: allBackups });
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
