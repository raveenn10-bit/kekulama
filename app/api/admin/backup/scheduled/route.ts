import { NextRequest, NextResponse } from "next/server";
import { executeBackup } from "@/lib/backup/backupEngine";
import { sendNotification } from "@/lib/notifications/emailService";
import { verifyFirebaseSessionOrToken } from "@/lib/security/authBridge";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // Up to 60s for Vercel Cron serverless execution

/**
 * Scheduled Backup Trigger:
 * Invoked daily by Vercel Cron at 02:00 AM Asia/Colombo (20:30 UTC).
 * Validates CRON_SECRET or Owner authorization.
 * Sends Gmail notification alert on failure.
 */
export async function GET(req: NextRequest) {
  return handleScheduledBackup(req);
}

export async function POST(req: NextRequest) {
  return handleScheduledBackup(req);
}

async function handleScheduledBackup(req: NextRequest) {
  try {
    // 1. Authenticate Request:
    // Option A: Vercel Cron passes Authorization: Bearer <CRON_SECRET>
    const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");
    const cronSecret = process.env.CRON_SECRET;
    let isAuthorized = false;

    if (cronSecret && authHeader === `Bearer ${cronSecret}`) {
      isAuthorized = true;
    }

    // Option B: Vercel Cron Header `x-vercel-cron` in production
    if (!isAuthorized && req.headers.get("x-vercel-cron") === "1" && !cronSecret) {
      isAuthorized = true;
    }

    // Option C: Authenticated Owner
    if (!isAuthorized) {
      const user = await verifyFirebaseSessionOrToken(req);
      if (user?.role === "owner" && user.isApprovedOwner) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return NextResponse.json(
        { error: "Unauthorized: Invalid cron secret or Owner credentials." },
        { status: 401 }
      );
    }

    // 2. Execute Automated Backup
    const result = await executeBackup({
      actorId: "system:vercel_cron",
      actorEmail: process.env.OWNER_EMAIL || "kekulamaecocabana@gmail.com",
      triggeredBy: "scheduled",
    });

    return NextResponse.json({
      success: true,
      backupId: result.backupId,
      filename: result.filename,
      sizeBytes: result.sizeBytes,
      driveFileId: result.driveFile.id,
      sha256Checksum: result.sha256Checksum,
      manifest: result.manifest,
      message: "Scheduled automated backup executed and uploaded to Google Drive successfully.",
    });
  } catch (err: any) {
    console.error("[SCHEDULED BACKUP FAILED]", err);

    // 3. Send Critical Gmail Alert to Owner on Failure
    try {
      await sendNotification({
        event: "BACKUP_FAILURE",
        details: err?.message || "Automated backup runner encountered an unhandled exception.",
      });
    } catch (notifErr) {
      console.error("[FAILED TO SEND BACKUP ALERT EMAIL]", notifErr);
    }

    return NextResponse.json(
      {
        success: false,
        error: err?.message || "Scheduled backup failed.",
      },
      { status: 500 }
    );
  }
}
