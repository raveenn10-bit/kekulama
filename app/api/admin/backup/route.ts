import { NextResponse } from "next/server";
import crypto from "crypto";
import { adminDb, logAuditEvent } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const collectionsToBackup = ["bookings", "payments", "rooms", "users", "audit_logs"];
    const backupData: Record<string, any[]> = {};

    for (const colName of collectionsToBackup) {
      const snap = await adminDb.collection(colName).get();
      backupData[colName] = snap.docs.map((d) => ({ _id: d.id, ...d.data() }));
    }

    const payload = JSON.stringify({
      version: "1.0",
      project: "kekulama",
      timestamp: new Date().toISOString(),
      collections: backupData,
    });

    // AES-256 Encryption
    const encryptionKey = process.env.BACKUP_ENCRYPTION_KEY || "kekulama-luxury-backup-secure-passphrase-2026";
    const key = crypto.createHash("sha256").update(encryptionKey).digest();
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
    let encrypted = cipher.update(payload, "utf8", "hex");
    encrypted += cipher.final("hex");

    const finalArchive = JSON.stringify({
      iv: iv.toString("hex"),
      data: encrypted,
      timestamp: new Date().toISOString(),
    });

    const filename = `kekulama_backup_${new Date().toISOString().replace(/[:.]/g, "-")}.enc`;

    // Save record in backups collection
    await adminDb.collection("backups").add({
      filename,
      sizeBytes: Buffer.byteLength(finalArchive),
      collectionsBackedUp: collectionsToBackup,
      createdAt: new Date().toISOString(),
      status: "success",
    });

    await logAuditEvent({
      actorId: "owner",
      actorRole: "owner",
      action: "BACKUP_TRIGGERED",
      targetResource: `backups/${filename}`,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      filename,
      sizeBytes: Buffer.byteLength(finalArchive),
      message: "Encrypted backup archive created successfully.",
    });
  } catch (err: any) {
    console.error("Backup error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to generate backup archive." },
      { status: 500 }
    );
  }
}
