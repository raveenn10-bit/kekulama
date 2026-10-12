import crypto from "crypto";
import { adminDb, logAuditEvent } from "../firebase/admin";
import { supabaseAdmin, isSupabaseConfigured } from "../supabase/admin";
import { GUEST_PRIVATE_BUCKET } from "../supabase/storage";
import {
  uploadBackupArchiveToDrive,
  downloadBackupArchiveFromDrive,
  rotateOldBackups,
  DriveUploadedFile,
} from "./googleDriveService";

export const BACKUP_COLLECTIONS = [
  "bookings",
  "rooms",
  "room_calendar_locks",
  "payments",
  "users",
  "guestDocuments",
  "system_settings",
  "registration_tokens",
  "audit_logs",
  "notification_logs",
] as const;

export type BackupCollectionName = (typeof BACKUP_COLLECTIONS)[number];

export interface CollectionBackupStats {
  count: number;
  sampleIds: string[];
}

export interface BackupManifest {
  version: "2.0";
  backupId: string;
  createdAt: string;
  project: string;
  collections: Record<string, CollectionBackupStats>;
  files: {
    count: number;
    totalSizeBytes: number;
    paths: string[];
  };
  sha256Checksum: string;
  encryptionAlgorithm: "aes-256-gcm";
}

export interface BackupExecutionResult {
  success: boolean;
  backupId: string;
  filename: string;
  sizeBytes: number;
  sha256Checksum: string;
  driveFile: DriveUploadedFile;
  manifest: BackupManifest;
  createdAt: string;
}

export interface StoredStorageFile {
  path: string;
  mimeType: string;
  size: number;
  dataBase64: string;
}

function getBackupEncryptionKey(): Buffer {
  const secret =
    process.env.BACKUP_ENCRYPTION_KEY ||
    process.env.OAUTH_ENCRYPTION_KEY ||
    process.env.APP_SECRET ||
    "kekulama-luxury-backup-secure-passphrase-2026";
  return crypto.createHash("sha256").update(secret).digest();
}

/**
 * Executes a complete, production-grade encrypted backup:
 * 1. Exports 10 Firestore collections with document IDs and timestamps
 * 2. Downloads authorized Supabase guest identification documents
 * 3. Generates cryptographic SHA-256 manifest
 * 4. Encrypts payload with military-grade AES-256-GCM
 * 5. Performs resumable upload to Google Drive & verifies file integrity
 * 6. Rotates backups older than 30 days
 */
export async function executeBackup(options?: {
  actorId?: string;
  actorEmail?: string;
  triggeredBy?: "manual" | "scheduled";
}): Promise<BackupExecutionResult> {
  const now = new Date().toISOString();
  const timestampClean = now.replace(/[:.]/g, "-");
  const backupId = `bkp_${timestampClean}`;
  const filename = `kekulama_backup_${timestampClean}.enc`;

  // 1. Export Cloud Firestore Collections in Parallel (Eliminates sequential roundtrip latency)
  const backupCollectionsData: Record<string, any[]> = {};
  const collectionStats: Record<string, CollectionBackupStats> = {};

  await Promise.all(
    BACKUP_COLLECTIONS.map(async (colName) => {
      try {
        const snap = await adminDb.collection(colName).get();
        const docs = snap.docs.map((doc) => ({
          _id: doc.id,
          ...doc.data(),
        }));
        backupCollectionsData[colName] = docs;
        collectionStats[colName] = {
          count: docs.length,
          sampleIds: docs.slice(0, 3).map((d) => d._id),
        };
      } catch (colErr: any) {
        console.warn(`[BACKUP WARNING] Failed exporting collection ${colName}:`, colErr?.message || colErr);
        backupCollectionsData[colName] = [];
        collectionStats[colName] = { count: 0, sampleIds: [] };
      }
    })
  );

  // 2. Export Supabase Guest Storage Files in Parallel
  const storageFiles: StoredStorageFile[] = [];
  const filePaths: string[] = [];
  let totalFileSizeBytes = 0;

  if (isSupabaseConfigured() && backupCollectionsData["guestDocuments"]) {
    const guestDocs = backupCollectionsData["guestDocuments"];
    const docsWithFiles = guestDocs.filter(
      (doc) => doc.privateStoragePath && typeof doc.privateStoragePath === "string"
    );

    const downloadResults = await Promise.all(
      docsWithFiles.map(async (doc) => {
        try {
          const { data, error } = await supabaseAdmin.storage
            .from(GUEST_PRIVATE_BUCKET)
            .download(doc.privateStoragePath);

          if (!error && data) {
            const arrayBuffer = await data.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            return {
              path: doc.privateStoragePath as string,
              mimeType: (doc.mimeType as string) || "application/octet-stream",
              size: buffer.length,
              dataBase64: buffer.toString("base64"),
            };
          }
        } catch (downloadErr: any) {
          console.warn(`[BACKUP WARNING] Could not download storage file ${doc.privateStoragePath}:`, downloadErr?.message);
        }
        return null;
      })
    );

    for (const res of downloadResults) {
      if (res) {
        totalFileSizeBytes += res.size;
        filePaths.push(res.path);
        storageFiles.push({
          path: res.path,
          mimeType: res.mimeType,
          size: res.size,
          dataBase64: res.dataBase64,
        });
      }
    }
  }

  // 3. Assemble Unencrypted Payload
  const payloadObject = {
    version: "2.0",
    backupId,
    createdAt: now,
    project: "kekulama",
    collections: backupCollectionsData,
    storageFiles,
  };

  const rawJson = JSON.stringify(payloadObject);

  // 4. Compute SHA-256 Checksum
  const sha256Checksum = crypto.createHash("sha256").update(rawJson, "utf8").digest("hex");

  // 5. Generate Manifest
  const manifest: BackupManifest = {
    version: "2.0",
    backupId,
    createdAt: now,
    project: "kekulama",
    collections: collectionStats,
    files: {
      count: storageFiles.length,
      totalSizeBytes: totalFileSizeBytes,
      paths: filePaths,
    },
    sha256Checksum,
    encryptionAlgorithm: "aes-256-gcm",
  };

  // 6. Encrypt with AES-256-GCM (96-bit random IV, 128-bit auth tag)
  const key = getBackupEncryptionKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

  const ciphertext = Buffer.concat([cipher.update(rawJson, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  const encryptedEnvelope = JSON.stringify({
    format: "kekulama_encrypted_backup_v2",
    manifest,
    iv: iv.toString("hex"),
    authTag: authTag.toString("hex"),
    ciphertext: ciphertext.toString("base64"),
  });

  const archiveBuffer = Buffer.from(encryptedEnvelope, "utf-8");

  // 7. Upload to Google Drive (Fast Multipart Upload, with Resumable fallback)
  const driveFile = await uploadBackupArchiveToDrive({
    filename,
    buffer: archiveBuffer,
  });

  // 8. Enforce 30-day retention asynchronously in background (does not block HTTP response)
  rotateOldBackups(30).catch((rotErr) => {
    console.warn("[DRIVE ROTATION ASYNC WARNING]", rotErr?.message || rotErr);
  });

  // 9. Store Record in Firestore & write audit log in parallel
  await Promise.all([
    adminDb.collection("backups").doc(backupId).set({
      backupId,
      filename,
      sizeBytes: archiveBuffer.length,
      sha256Checksum,
      manifest,
      driveFileId: driveFile.id,
      driveFileName: driveFile.name,
      driveMd5Checksum: driveFile.md5Checksum || null,
      triggeredBy: options?.triggeredBy || "manual",
      actorId: options?.actorId || "owner",
      actorEmail: options?.actorEmail || null,
      status: "success",
      createdAt: now,
    }).catch((dbErr) => {
      console.warn("[BACKUP DB LOG WARNING] Could not persist backup record in Firestore:", dbErr);
    }),

    logAuditEvent({
      actorId: options?.actorId || "owner",
      actorEmail: options?.actorEmail || "owner",
      actorRole: "owner",
      action: "BACKUP_TRIGGERED",
      targetResource: `backups/${backupId}`,
      details: {
        filename,
        driveFileId: driveFile.id,
        sizeBytes: archiveBuffer.length,
        collectionsBackedUp: Object.keys(backupCollectionsData),
        fileCount: storageFiles.length,
        triggeredBy: options?.triggeredBy || "manual",
      },
      timestamp: now,
    }).catch((auditErr) => {
      console.warn("[BACKUP AUDIT LOG WARNING] Write skipped:", auditErr);
    }),
  ]);

  return {
    success: true,
    backupId,
    filename,
    sizeBytes: archiveBuffer.length,
    sha256Checksum,
    driveFile,
    manifest,
    createdAt: now,
  };
}

export interface RestorePreview {
  backupId: string;
  createdAt: string;
  manifest: BackupManifest;
  collectionsToRestore: Record<string, number>;
  filesToRestore: number;
}

export interface RestoreResult {
  dryRun: boolean;
  success: boolean;
  backupId: string;
  verified: boolean;
  preview?: RestorePreview;
  restoredCollections?: Record<string, number>;
  restoredFilesCount?: number;
  message: string;
}

/**
 * Decrypts and unpacks a backup archive buffer.
 * Performs cryptographic auth-tag validation and SHA-256 integrity verification.
 */
export function decryptBackupArchive(archiveBuffer: Buffer): { manifest: BackupManifest; payload: any } {
  const envelope = JSON.parse(archiveBuffer.toString("utf-8"));
  if (envelope.format !== "kekulama_encrypted_backup_v2" || !envelope.iv || !envelope.authTag || !envelope.ciphertext) {
    throw new Error("Invalid or corrupted backup archive envelope format.");
  }

  const key = getBackupEncryptionKey();
  const iv = Buffer.from(envelope.iv, "hex");
  const authTag = Buffer.from(envelope.authTag, "hex");
  const ciphertextBuffer = Buffer.from(envelope.ciphertext, "base64");

  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(authTag);

  const decryptedRaw = Buffer.concat([decipher.update(ciphertextBuffer), decipher.final()]).toString("utf8");

  // Cryptographic integrity verification
  const computedHash = crypto.createHash("sha256").update(decryptedRaw, "utf8").digest("hex");
  if (computedHash !== envelope.manifest.sha256Checksum) {
    throw new Error(
      `Backup integrity verification failed: computed hash (${computedHash}) does not match manifest (${envelope.manifest.sha256Checksum}). Archive may have been tampered with.`
    );
  }

  const payload = JSON.parse(decryptedRaw);
  return { manifest: envelope.manifest, payload };
}

/**
 * Safe Restore Workflow:
 * - Dry-Run Mode: Validates archive, checks integrity, counts records, and returns preview WITHOUT writing to database.
 * - Live Mode: Requires explicit confirmation (confirmRestore: true). Restores collections with batch operations.
 */
export async function executeRestore({
  backupId,
  archiveBuffer,
  dryRun = true,
  confirmRestore = false,
  actorId = "owner",
}: {
  backupId: string;
  archiveBuffer?: Buffer;
  dryRun?: boolean;
  confirmRestore?: boolean;
  actorId?: string;
}): Promise<RestoreResult> {
  // 1. Retrieve Archive Buffer
  let bufferToDecrypt = archiveBuffer;
  if (!bufferToDecrypt) {
    // Look up Drive File ID from Firestore backups collection
    const backupDoc = await adminDb.collection("backups").doc(backupId).get();
    if (!backupDoc.exists) {
      throw new Error(`Backup record ${backupId} not found.`);
    }
    const backupData = backupDoc.data();
    if (!backupData?.driveFileId) {
      throw new Error(`Backup record ${backupId} does not reference a valid Google Drive file ID.`);
    }
    bufferToDecrypt = await downloadBackupArchiveFromDrive(backupData.driveFileId);
  }

  // 2. Decrypt and verify archive
  const { manifest, payload } = decryptBackupArchive(bufferToDecrypt);

  const collectionsData: Record<string, any[]> = payload.collections || {};
  const storageFilesData: StoredStorageFile[] = payload.storageFiles || [];

  const collectionCounts: Record<string, number> = {};
  for (const [col, docs] of Object.entries(collectionsData)) {
    collectionCounts[col] = Array.isArray(docs) ? docs.length : 0;
  }

  // 3. Dry-Run Validation Mode (Safety First)
  if (dryRun || !confirmRestore) {
    return {
      dryRun: true,
      success: true,
      backupId,
      verified: true,
      preview: {
        backupId,
        createdAt: manifest.createdAt,
        manifest,
        collectionsToRestore: collectionCounts,
        filesToRestore: storageFilesData.length,
      },
      message:
        "Dry-run simulation completed. Cryptographic integrity and SHA-256 manifest verified. No database records were modified.",
    };
  }

  // 4. Live Restore Execution (Explicit Confirmation Required)
  const restoredCollections: Record<string, number> = {};

  for (const [colName, docs] of Object.entries(collectionsData)) {
    if (!Array.isArray(docs)) continue;

    // Use Firestore batched writes (up to 400 docs per batch)
    let batch = adminDb.batch();
    let batchCount = 0;

    for (const doc of docs) {
      const { _id, ...docBody } = doc;
      if (!_id) continue;

      const docRef = adminDb.collection(colName).doc(_id);
      batch.set(docRef, docBody, { merge: true });
      batchCount++;

      if (batchCount >= 400) {
        await batch.commit();
        batch = adminDb.batch();
        batchCount = 0;
      }
    }

    if (batchCount > 0) {
      await batch.commit();
    }

    restoredCollections[colName] = docs.length;
  }

  // 5. Restore Supabase Storage Files if needed
  let restoredFilesCount = 0;
  if (isSupabaseConfigured() && storageFilesData.length > 0) {
    for (const file of storageFilesData) {
      try {
        const fileBuffer = Buffer.from(file.dataBase64, "base64");
        await supabaseAdmin.storage.from(GUEST_PRIVATE_BUCKET).upload(file.path, fileBuffer, {
          contentType: file.mimeType,
          upsert: true,
        });
        restoredFilesCount++;
      } catch (uploadErr) {
        console.warn(`[RESTORE WARNING] Could not restore storage file ${file.path}:`, uploadErr);
      }
    }
  }

  // 6. Record Audit Event
  try {
    await logAuditEvent({
      actorId,
      actorRole: "owner",
      action: "BACKUP_RESTORED",
      targetResource: `backups/${backupId}`,
      details: {
        backupId,
        restoredCollections,
        restoredFilesCount,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (auditErr) {
    console.warn("[RESTORE AUDIT LOG WARNING] Write skipped:", auditErr);
  }

  return {
    dryRun: false,
    success: true,
    backupId,
    verified: true,
    restoredCollections,
    restoredFilesCount,
    message: `Disaster recovery restore completed successfully. Restored ${Object.keys(restoredCollections).length} collections and ${restoredFilesCount} files.`,
  };
}
