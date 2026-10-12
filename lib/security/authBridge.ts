import { adminAuth, adminDb, logAuditEvent } from "@/lib/firebase/admin";
import { UserRole } from "@/types/admin";

/**
 * Confirmed, immutable Owner UIDs for Kekulama Eco Cabana
 * Only these two accounts may receive Owner privileges:
 * 1. uaksPM6v5LRGmtR9BdYmVdNcksU2 (kekulamaecocabana@gmail.com)
 * 2. nfcCH0mfFMa1Yka50rBuXcRhCmY2 (chamilka.ch@gmail.com)
 */
export const APPROVED_OWNER_UIDS = [
  "uaksPM6v5LRGmtR9BdYmVdNcksU2",
  "nfcCH0mfFMa1Yka50rBuXcRhCmY2",
] as const;

export interface AuthenticatedUser {
  uid: string;
  email: string;
  role: UserRole;
  isApprovedOwner: boolean;
}

/**
 * Extracts and verifies the Firebase ID token from Authorization header or session cookie
 */
export async function verifyFirebaseSessionOrToken(req: Request): Promise<AuthenticatedUser | null> {
  try {
    let token: string | null = null;

    // 1. Try Authorization header: Bearer <token>
    const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7).trim();
    }

    // 2. Try cookie: session or __session or token
    if (!token) {
      const cookieHeader = req.headers.get("cookie");
      if (cookieHeader) {
        const cookies = Object.fromEntries(
          cookieHeader.split("; ").map((c) => {
            const [k, ...v] = c.split("=");
            return [k, v.join("=")];
          })
        );
        token = cookies["session"] || cookies["__session"] || cookies["token"] || null;
      }
    }

    if (!token) {
      return null;
    }

    // Verify token with Firebase Admin
    const decodedToken = await adminAuth.verifyIdToken(token);
    const uid = decodedToken.uid;
    const email = decodedToken.email || "";

    // Strictly enforce Owner privileges only for verified owner UIDs
    const isApprovedOwner = APPROVED_OWNER_UIDS.includes(uid as typeof APPROVED_OWNER_UIDS[number]);
    let role: UserRole = "reception";

    if (isApprovedOwner) {
      role = "owner";
    } else {
      // Check user record in Firestore
      const userDoc = await adminDb.collection("users").doc(uid).get();
      if (userDoc.exists) {
        const userData = userDoc.data();
        role = userData?.role || "reception";
      }
    }

    return {
      uid,
      email,
      role,
      isApprovedOwner,
    };
  } catch (err) {
    console.error("[AUTH BRIDGE] Failed to verify Firebase token:", err);
    return null;
  }
}

/**
 * Enforces that the request comes from an authenticated Owner
 */
export async function requireOwner(req: Request): Promise<AuthenticatedUser | null> {
  const user = await verifyFirebaseSessionOrToken(req);
  if (!user || user.role !== "owner" || !user.isApprovedOwner) {
    return null;
  }
  return user;
}

/**
 * Enforces that the request comes from Staff (Reception or Owner)
 */
export async function requireStaffOrOwner(req: Request): Promise<AuthenticatedUser | null> {
  const user = await verifyFirebaseSessionOrToken(req);
  if (!user || (user.role !== "owner" && user.role !== "reception")) {
    return null;
  }
  return user;
}

export interface VerifiedRegistrationToken {
  token: string;
  bookingId: string;
  guestName: string;
  expiresAt: string;
  status: "active" | "completed" | "expired";
}

/**
 * Verifies a single-use registration token against Firestore
 */
export async function verifyRegistrationToken(token: string): Promise<VerifiedRegistrationToken | null> {
  try {
    if (!token || typeof token !== "string" || token.length < 10) {
      return null;
    }

    const tokenDoc = await adminDb.collection("registration_tokens").doc(token).get();
    if (!tokenDoc.exists) {
      return null;
    }

    const data = tokenDoc.data() as VerifiedRegistrationToken;
    if (data.status !== "active") {
      return null;
    }

    if (new Date(data.expiresAt) < new Date()) {
      // Mark as expired
      await adminDb.collection("registration_tokens").doc(token).update({ status: "expired" });
      return null;
    }

    return data;
  } catch (err) {
    console.error("[AUTH BRIDGE] Error verifying registration token:", err);
    return null;
  }
}
