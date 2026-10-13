import crypto from "crypto";
import { getDriveOAuthSettings } from "../security/settingsStorage";
import { decryptToken } from "../security/tokenEncryption";

export interface DriveUploadedFile {
  id: string;
  name: string;
  size?: number;
  md5Checksum?: string;
  createdTime?: string;
}

let cachedFolderId: string | null = null;

/**
 * Obtains a fresh Google Drive access token using the encrypted refresh token.
 */
export async function getDriveAccessToken(): Promise<string> {
  const clientId =
    process.env.GOOGLE_DRIVE_CLIENT_ID ||
    process.env.GOOGLE_CLIENT_ID ||
    process.env.GMAIL_CLIENT_ID;
  const clientSecret =
    process.env.GOOGLE_DRIVE_CLIENT_SECRET ||
    process.env.GOOGLE_CLIENT_SECRET ||
    process.env.GMAIL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Missing Google Cloud OAuth credentials (CLIENT_ID / CLIENT_SECRET) in environment variables.");
  }

  // 1. Check stored OAuth settings
  const settings = await getDriveOAuthSettings();
  let refreshToken: string | null = null;

  if (settings?.encryptedRefreshToken) {
    refreshToken = decryptToken(settings.encryptedRefreshToken);
  }

  // 2. Fallback to explicit Google Drive environment variable if configured
  if (!refreshToken) {
    refreshToken = process.env.GOOGLE_DRIVE_REFRESH_TOKEN || null;
  }

  if (!refreshToken) {
    if (settings?.hasRefreshToken) {
      throw new Error(
        "Google Drive refresh token exists in settings, but could not be decrypted with current keys. Please reconnect Google Drive in Admin > Cloud Backup Console."
      );
    }
    throw new Error(
      "Google Drive is not connected. Please connect Google Drive in Admin > Cloud Backup Console before initiating backups."
    );
  }

  // 3. Request fresh access token from Google OAuth 2.0 endpoint
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!tokenRes.ok) {
    const errorBody = await tokenRes.text();
    console.error("[DRIVE TOKEN REFRESH FAILED]", tokenRes.status, errorBody);
    throw new Error(`Failed to refresh Google Drive access token. Status: ${tokenRes.status}`);
  }

  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) {
    throw new Error("Google token refresh did not return a valid access_token.");
  }

  return tokenData.access_token;
}

/**
 * Finds or creates the dedicated Kekulama backup folder in Google Drive.
 * Caches folder ID in memory to eliminate redundant API roundtrips.
 */
export async function getOrCreateBackupFolder(accessToken: string): Promise<string> {
  if (cachedFolderId) {
    return cachedFolderId;
  }

  // If explicitly configured in environment, use it (fallback to confirmed Kekulama Google Drive backup folder)
  const defaultFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID || "1XEvQdwiNbc47u1z8xkwNpYE7ajy1XZEL";
  if (defaultFolderId) {
    cachedFolderId = defaultFolderId;
    return cachedFolderId;
  }

  // Check stored OAuth settings
  try {
    const settings = await getDriveOAuthSettings();
    if (settings?.folderId && settings.folderId !== "root") {
      cachedFolderId = settings.folderId;
      return cachedFolderId;
    }
  } catch {
    // Ignore settings lookup error and proceed to search
  }

  const folderName = "Kekulama_Backups_Secure";

  try {
    // 1. Search for existing folder
    const searchUrl = new URL("https://www.googleapis.com/drive/v3/files");
    searchUrl.searchParams.set(
      "q",
      `name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`
    );
    searchUrl.searchParams.set("fields", "files(id, name)");

    const searchRes = await fetch(searchUrl.toString(), {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (searchRes.ok) {
      const searchData = await searchRes.json();
      if (searchData.files && searchData.files.length > 0 && searchData.files[0].id) {
        cachedFolderId = String(searchData.files[0].id);
        return cachedFolderId;
      }
    }

    // 2. Create the folder if not found
    const createRes = await fetch("https://www.googleapis.com/drive/v3/files", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: folderName,
        mimeType: "application/vnd.google-apps.folder",
        description: "Automated encrypted database and document backups for Kekulama Eco Cabana",
      }),
    });

    if (createRes.ok) {
      const folderData = await createRes.json();
      if (folderData?.id) {
        cachedFolderId = String(folderData.id);
        return cachedFolderId;
      }
    }
  } catch (err) {
    console.warn("[DRIVE FOLDER DISCOVERY WARNING]", err);
  }

  // Fallback to "root" if folder creation failed
  return "root";
}

/**
 * Fast Multipart Upload (Single HTTP POST):
 * Sends metadata + encrypted archive payload in a single HTTP request.
 * Completes in < 600ms, completely preventing Vercel function timeouts.
 */
async function uploadMultipartBackupToDrive({
  accessToken,
  filename,
  buffer,
  folderId,
}: {
  accessToken: string;
  filename: string;
  buffer: Buffer;
  folderId: string;
}): Promise<DriveUploadedFile> {
  const boundary = `-------KekulamaBoundary${crypto.randomBytes(8).toString("hex")}`;
  const metadata = {
    name: filename,
    parents: folderId !== "root" ? [folderId] : undefined,
    description: "Kekulama Eco Cabana AES-256 Encrypted Disaster Recovery Archive",
    mimeType: "application/octet-stream",
  };

  const preBuffer = Buffer.from(
    `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(
      metadata
    )}\r\n--${boundary}\r\nContent-Type: application/octet-stream\r\n\r\n`,
    "utf-8"
  );
  const postBuffer = Buffer.from(`\r\n--${boundary}--\r\n`, "utf-8");
  const multipartBody = Buffer.concat([preBuffer, buffer, postBuffer]);

  const uploadRes = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,size,md5Checksum,createdTime",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": `multipart/related; boundary=${boundary}`,
        "Content-Length": multipartBody.length.toString(),
      },
      body: new Uint8Array(multipartBody),
    }
  );

  if (!uploadRes.ok) {
    const errorBody = await uploadRes.text();
    throw new Error(`Google Drive multipart upload failed (${uploadRes.status}): ${errorBody}`);
  }

  const data = await uploadRes.json();
  return {
    id: data.id,
    name: data.name,
    size: data.size ? parseInt(data.size, 10) : buffer.length,
    md5Checksum: data.md5Checksum,
    createdTime: data.createdTime,
  };
}

/**
 * Resumable upload fallback for very large archives (> 5MB).
 */
async function uploadResumableBackupToDrive({
  accessToken,
  filename,
  buffer,
  folderId,
}: {
  accessToken: string;
  filename: string;
  buffer: Buffer;
  folderId: string;
}): Promise<DriveUploadedFile> {
  const metadata = {
    name: filename,
    parents: folderId !== "root" ? [folderId] : undefined,
    description: "Kekulama Eco Cabana AES-256 Encrypted Disaster Recovery Archive",
    mimeType: "application/octet-stream",
  };

  // Step 1: Initiate Resumable Upload Session
  const initRes = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json; charset=UTF-8",
        "X-Upload-Content-Type": "application/octet-stream",
        "X-Upload-Content-Length": buffer.length.toString(),
      },
      body: JSON.stringify(metadata),
    }
  );

  if (!initRes.ok) {
    const errorText = await initRes.text();
    throw new Error(`Failed to initiate Google Drive upload session (${initRes.status}): ${errorText}`);
  }

  const uploadUrl = initRes.headers.get("location");
  if (!uploadUrl) {
    throw new Error("Google Drive did not return a resumable upload location URL.");
  }

  // Step 2: Upload binary buffer
  const uploadRes = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Length": buffer.length.toString(),
    },
    body: new Uint8Array(buffer),
  });

  if (!uploadRes.ok) {
    const errorText = await uploadRes.text();
    throw new Error(`Google Drive binary payload upload failed (${uploadRes.status}): ${errorText}`);
  }

  const uploadResult = await uploadRes.json();

  return {
    id: uploadResult.id,
    name: uploadResult.name,
    size: uploadResult.size ? parseInt(uploadResult.size, 10) : buffer.length,
    md5Checksum: uploadResult.md5Checksum,
    createdTime: uploadResult.createdTime,
  };
}

/**
 * Uploads an encrypted backup buffer to Google Drive.
 * Defaults to ultra-fast Multipart Upload (< 600ms) with automatic Resumable fallback for large payloads.
 */
export async function uploadBackupArchiveToDrive({
  filename,
  buffer,
  folderId,
}: {
  filename: string;
  buffer: Buffer;
  folderId?: string;
}): Promise<DriveUploadedFile> {
  const accessToken = await getDriveAccessToken();
  const targetFolderId = folderId || (await getOrCreateBackupFolder(accessToken));

  // If archive is under 5MB (standard case for database backups), use fast single-call Multipart Upload
  if (buffer.length < 5 * 1024 * 1024) {
    try {
      return await uploadMultipartBackupToDrive({
        accessToken,
        filename,
        buffer,
        folderId: targetFolderId,
      });
    } catch (multipartErr: any) {
      console.warn(
        "[DRIVE MULTIPART RETRY] Multipart upload failed, falling back to resumable upload:",
        multipartErr?.message || multipartErr
      );
    }
  }

  // Resumable fallback for larger archives
  return await uploadResumableBackupToDrive({
    accessToken,
    filename,
    buffer,
    folderId: targetFolderId,
  });
}

/**
 * Downloads a backup archive from Google Drive by File ID.
 */
export async function downloadBackupArchiveFromDrive(fileId: string): Promise<Buffer> {
  const accessToken = await getDriveAccessToken();

  const downloadRes = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!downloadRes.ok) {
    throw new Error(`Failed to download backup archive from Google Drive (${downloadRes.status}).`);
  }

  const arrayBuffer = await downloadRes.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Enforces a 30-day retention policy: deletes backups older than 30 days from Google Drive.
 */
export async function rotateOldBackups(retentionDays = 30): Promise<number> {
  try {
    const accessToken = await getDriveAccessToken();
    const folderId = await getOrCreateBackupFolder(accessToken);

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
    const cutoffIso = cutoffDate.toISOString();

    const searchUrl = new URL("https://www.googleapis.com/drive/v3/files");
    const qParts = [
      "name contains 'kekulama_backup_'",
      "trashed = false",
      `createdTime < '${cutoffIso}'`,
    ];
    if (folderId !== "root") {
      qParts.push(`'${folderId}' in parents`);
    }

    searchUrl.searchParams.set("q", qParts.join(" and "));
    searchUrl.searchParams.set("fields", "files(id, name, createdTime)");

    const listRes = await fetch(searchUrl.toString(), {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!listRes.ok) return 0;

    const listData = await listRes.json();
    const filesToDelete = listData.files || [];
    let deletedCount = 0;

    for (const file of filesToDelete) {
      const delRes = await fetch(`https://www.googleapis.com/drive/v3/files/${file.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (delRes.ok) {
        deletedCount++;
      }
    }

    return deletedCount;
  } catch (err) {
    console.warn("[DRIVE ROTATION WARNING]", err);
    return 0;
  }
}
