import fs from "fs";
import path from "path";
import { adminDb, isFirebaseAdminConfigured } from "../firebase/admin";
import { encryptToken, decryptToken } from "./tokenEncryption";
import { supabaseAdmin, isSupabaseConfigured } from "../supabase/admin";
import { GUEST_PRIVATE_BUCKET } from "../supabase/storage";

export interface GmailOAuthSettings {
  provider: "gmail";
  connectedEmail: string;
  encryptedRefreshToken: string | null;
  hasRefreshToken: boolean;
  scopes: string;
  tokenType: string;
  status: "active" | "inactive";
  updatedAt: string;
}

// In serverless environments (Vercel), process.cwd() is read-only, so use /tmp if needed
const getFallbackFilePath = (): string => {
  const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
  const baseDir = isServerless ? "/tmp" : process.cwd();
  return path.join(baseDir, ".system_settings.enc");
};

/**
 * Persists Gmail OAuth settings across multi-tier storage:
 * 1. Supabase PostgreSQL `public.system_settings` (ACID persistent across all Vercel instances)
 * 2. Cloud Firestore `system_settings/gmail_oauth` (with 2.5s timeout)
 * 3. Supabase Private Storage `system_settings/gmail_oauth.enc`
 * 4. Ephemeral local store `/tmp/.system_settings.enc`
 */
export async function saveGmailOAuthSettings(settings: GmailOAuthSettings): Promise<{ storageType: "supabase_db" | "firestore" | "supabase" | "encrypted_file" }> {
  let savedToSupabaseDb = false;
  let savedToFirestore = false;
  let savedToSupabaseStorage = false;

  // 1. Tier 1: Supabase PostgreSQL Database (Global persistent store)
  try {
    if (isSupabaseConfigured()) {
      const { error } = await supabaseAdmin.from("system_settings").upsert({
        id: "gmail_oauth",
        data: settings,
        updated_at: new Date().toISOString(),
      });
      if (!error) {
        savedToSupabaseDb = true;
      } else {
        console.warn("[SETTINGS STORAGE] Supabase DB write failed for Gmail:", error.message);
      }
    }
  } catch (dbErr: any) {
    console.warn("[SETTINGS STORAGE] Supabase DB exception:", dbErr?.message);
  }

  // 2. Tier 2: Cloud Firestore (with 2.5s timeout, only if credentials configured)
  if (isFirebaseAdminConfigured()) {
    try {
      const docRef = adminDb.collection("system_settings").doc("gmail_oauth");
      const writePromise = docRef.set(settings, { merge: true });
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 2500));
      await Promise.race([writePromise, timeoutPromise]);
      savedToFirestore = true;
    } catch (firestoreErr: any) {
      // Firestore write timed out or skipped
    }
  }

  // 3. Tier 3: Supabase Private Storage
  try {
    if (isSupabaseConfigured()) {
      const rawPayload = JSON.stringify(settings);
      const encryptedPayload = encryptToken(rawPayload);
      const buffer = Buffer.from(encryptedPayload, "utf-8");
      const { error } = await supabaseAdmin.storage
        .from(GUEST_PRIVATE_BUCKET)
        .upload("system_settings/gmail_oauth.enc", buffer, {
          contentType: "application/octet-stream",
          upsert: true,
        });
      if (!error) {
        savedToSupabaseStorage = true;
      }
    }
  } catch (supabaseErr: any) {}

  // 4. Tier 4: Fallback to AES-256-GCM encrypted local store
  try {
    const filePath = getFallbackFilePath();
    const rawPayload = JSON.stringify(settings);
    const encryptedPayload = encryptToken(rawPayload);
    fs.writeFileSync(filePath, encryptedPayload, "utf-8");
  } catch (fsErr: any) {}

  if (savedToSupabaseDb) return { storageType: "supabase_db" };
  if (savedToFirestore) return { storageType: "firestore" };
  if (savedToSupabaseStorage) return { storageType: "supabase" };
  return { storageType: "encrypted_file" };
}

/**
 * Retrieves Gmail OAuth settings.
 * Checks Supabase PostgreSQL first, then Firestore, then Supabase Storage, then local store.
 */
export async function getGmailOAuthSettings(): Promise<GmailOAuthSettings | null> {
  // 1. Tier 1: Supabase PostgreSQL Database (Fastest & Authoritative)
  try {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabaseAdmin
        .from("system_settings")
        .select("data")
        .eq("id", "gmail_oauth")
        .maybeSingle();

      if (!error && data?.data) {
        return data.data as GmailOAuthSettings;
      }
    }
  } catch (dbErr: any) {}

  // 2. Tier 2: Cloud Firestore (with 2.5s timeout, only if credentials configured)
  if (isFirebaseAdminConfigured()) {
    try {
      const docRef = adminDb.collection("system_settings").doc("gmail_oauth");
      const getPromise = docRef.get();
      const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 2500));
      const snap = (await Promise.race([getPromise, timeoutPromise])) as any;
      if (snap && snap.exists) {
        return snap.data() as GmailOAuthSettings;
      }
    } catch (firestoreErr: any) {}
  }

  // 3. Tier 3: Supabase Private Storage
  try {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabaseAdmin.storage
        .from(GUEST_PRIVATE_BUCKET)
        .download("system_settings/gmail_oauth.enc");
      if (!error && data) {
        const text = await data.text();
        const decryptedJson = decryptToken(text);
        if (decryptedJson) {
          return JSON.parse(decryptedJson) as GmailOAuthSettings;
        }
      }
    }
  } catch (supabaseErr: any) {}

  // 4. Tier 4: Try Encrypted Fallback File
  try {
    const filePath = getFallbackFilePath();
    if (fs.existsSync(filePath)) {
      const encryptedData = fs.readFileSync(filePath, "utf-8");
      const decryptedJson = decryptToken(encryptedData);
      if (decryptedJson) {
        return JSON.parse(decryptedJson) as GmailOAuthSettings;
      }
    }
  } catch (fsErr: any) {}

  return null;
}

export interface GoogleDriveOAuthSettings {
  provider: "google_drive";
  connectedEmail: string;
  encryptedRefreshToken: string | null;
  hasRefreshToken: boolean;
  folderId?: string;
  folderName?: string;
  scopes: string;
  tokenType: string;
  status: "active" | "inactive";
  updatedAt: string;
}

const getDriveFallbackFilePath = (): string => {
  const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
  const baseDir = isServerless ? "/tmp" : process.cwd();
  return path.join(baseDir, ".drive_settings.enc");
};

/**
 * Persists Google Drive OAuth settings across multi-tier storage:
 * 1. Supabase PostgreSQL `public.system_settings` (ACID persistent across all Vercel instances)
 * 2. Cloud Firestore `system_settings/google_drive_oauth` (with 2.5s timeout)
 * 3. Supabase Private Storage `system_settings/google_drive_oauth.enc` (AES-256-GCM encrypted)
 * 4. Ephemeral local store `/tmp/.drive_settings.enc`
 */
export async function saveDriveOAuthSettings(settings: GoogleDriveOAuthSettings): Promise<{ storageType: "supabase_db" | "firestore" | "supabase" | "encrypted_file" }> {
  let savedToSupabaseDb = false;
  let savedToFirestore = false;
  let savedToSupabaseStorage = false;

  // 1. Tier 1: Supabase PostgreSQL Database (Global persistent store across all lambdas)
  try {
    if (isSupabaseConfigured()) {
      const { error } = await supabaseAdmin.from("system_settings").upsert({
        id: "google_drive_oauth",
        data: settings,
        updated_at: new Date().toISOString(),
      });
      if (!error) {
        savedToSupabaseDb = true;
      } else {
        console.warn("[SETTINGS STORAGE] Supabase DB write failed for Drive:", error.message);
      }
    }
  } catch (dbErr: any) {
    console.warn("[SETTINGS STORAGE] Supabase DB exception for Drive:", dbErr?.message);
  }

  // 2. Tier 2: Cloud Firestore (with 2.5s timeout, only if credentials configured)
  if (isFirebaseAdminConfigured()) {
    try {
      const docRef = adminDb.collection("system_settings").doc("google_drive_oauth");
      const writePromise = docRef.set(settings, { merge: true });
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 2500));
      await Promise.race([writePromise, timeoutPromise]);
      savedToFirestore = true;
    } catch (firestoreErr: any) {
      // Firestore write timed out or skipped
    }
  }

  // 3. Tier 3: Supabase Private Storage (Persistent across all instances)
  try {
    if (isSupabaseConfigured()) {
      const rawPayload = JSON.stringify(settings);
      const encryptedPayload = encryptToken(rawPayload);
      const buffer = Buffer.from(encryptedPayload, "utf-8");
      const { error } = await supabaseAdmin.storage
        .from(GUEST_PRIVATE_BUCKET)
        .upload("system_settings/google_drive_oauth.enc", buffer, {
          contentType: "application/octet-stream",
          upsert: true,
        });
      if (!error) {
        savedToSupabaseStorage = true;
      }
    }
  } catch (supabaseErr: any) {
    console.warn("[SETTINGS STORAGE] Supabase storage write skipped for Drive OAuth:", supabaseErr?.message);
  }

  // 4. Tier 4: Fallback to AES-256-GCM encrypted local store
  try {
    const filePath = getDriveFallbackFilePath();
    const rawPayload = JSON.stringify(settings);
    const encryptedPayload = encryptToken(rawPayload);
    fs.writeFileSync(filePath, encryptedPayload, "utf-8");
  } catch (fsErr: any) {
    // Ephemeral write skipped
  }

  if (savedToSupabaseDb) return { storageType: "supabase_db" };
  if (savedToFirestore) return { storageType: "firestore" };
  if (savedToSupabaseStorage) return { storageType: "supabase" };
  return { storageType: "encrypted_file" };
}

/**
 * Retrieves Google Drive OAuth settings with multi-tier failover.
 * Checks Supabase PostgreSQL first, then Firestore, then Supabase Storage, then local store.
 */
export async function getDriveOAuthSettings(): Promise<GoogleDriveOAuthSettings | null> {
  // 1. Tier 1: Supabase PostgreSQL Database (Fastest & Authoritative across all Vercel containers)
  try {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabaseAdmin
        .from("system_settings")
        .select("data")
        .eq("id", "google_drive_oauth")
        .maybeSingle();

      if (!error && data?.data) {
        return data.data as GoogleDriveOAuthSettings;
      }
    }
  } catch (dbErr: any) {}

  // 2. Tier 2: Cloud Firestore (with 2.5s timeout, only if credentials configured)
  if (isFirebaseAdminConfigured()) {
    try {
      const docRef = adminDb.collection("system_settings").doc("google_drive_oauth");
      const getPromise = docRef.get();
      const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 2500));
      const snap = (await Promise.race([getPromise, timeoutPromise])) as any;
      if (snap && snap.exists) {
        return snap.data() as GoogleDriveOAuthSettings;
      }
    } catch (firestoreErr: any) {
      // Fall through to Supabase Storage
    }
  }

  // 3. Tier 3: Supabase Private Storage
  try {
    if (isSupabaseConfigured()) {
      // Check both new path and legacy path
      for (const storagePath of ["system_settings/google_drive_oauth.enc", ".system_settings/google_drive_oauth.enc"]) {
        const { data, error } = await supabaseAdmin.storage
          .from(GUEST_PRIVATE_BUCKET)
          .download(storagePath);
        if (!error && data) {
          const text = await data.text();
          const decryptedJson = decryptToken(text);
          if (decryptedJson) {
            return JSON.parse(decryptedJson) as GoogleDriveOAuthSettings;
          }
        }
      }
    }
  } catch (supabaseErr: any) {
    // Fall through to local fallback file
  }

  // 4. Tier 4: Try Encrypted Fallback File
  try {
    const filePath = getDriveFallbackFilePath();
    if (fs.existsSync(filePath)) {
      const encryptedData = fs.readFileSync(filePath, "utf-8");
      const decryptedJson = decryptToken(encryptedData);
      if (decryptedJson) {
        return JSON.parse(decryptedJson) as GoogleDriveOAuthSettings;
      }
    }
  } catch (fsErr: any) {
    console.warn("[SETTINGS STORAGE] Failed reading Drive fallback file:", fsErr?.message);
  }

  return null;
}


