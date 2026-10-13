import { NextRequest, NextResponse } from "next/server";
import { requireStaffOrOwner } from "@/lib/security/authBridge";
import { adminDb } from "@/lib/firebase/admin";
import { FirestoreGuestDocument } from "@/types/document";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const user = await requireStaffOrOwner(req);
    if (!user) {
      return NextResponse.json(
        { error: "Forbidden: Staff or Owner access required." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const bookingId = searchParams.get("bookingId");
    const status = searchParams.get("status");

    const documents: FirestoreGuestDocument[] = [];
    const seenIds = new Set<string>();

    // 1. Tier 1: Supabase PostgreSQL (Global persistent store)
    try {
      const { supabaseAdmin, isSupabaseConfigured } = await import("@/lib/supabase/admin");
      if (isSupabaseConfigured()) {
        let sbQuery = supabaseAdmin.from("guest_documents").select("*");
        if (bookingId) sbQuery = sbQuery.eq("booking_id", bookingId);
        if (status) sbQuery = sbQuery.eq("verification_status", status);

        const { data: sbDocs, error: sbErr } = await sbQuery.order("uploaded_at", { ascending: false });
        if (!sbErr && sbDocs && Array.isArray(sbDocs)) {
          for (const d of sbDocs) {
            const docId = d.document_id || d.id;
            seenIds.add(docId);
            documents.push({
              documentId: docId,
              guestId: d.guest_id,
              bookingId: d.booking_id,
              documentType: d.document_type,
              storageProvider: d.storage_provider || "supabase",
              bucketName: d.bucket_name || "guest-private-documents",
              privateStoragePath: d.private_storage_path,
              mimeType: d.mime_type,
              fileSize: Number(d.file_size) || 0,
              verificationStatus: d.verification_status || "pending",
              uploadedBy: d.uploaded_by,
              uploadedAt: d.uploaded_at,
              retentionUntil: d.retention_until,
            });
          }
        }
      }
    } catch (sbErr: any) {
      console.warn("[ADMIN DOCS SB WARNING]", sbErr?.message);
    }

    // 2. Tier 2: Cloud Firestore (if configured)
    const { isFirebaseAdminConfigured } = await import("@/lib/firebase/admin");
    if (isFirebaseAdminConfigured()) {
      try {
        let query: FirebaseFirestore.Query = adminDb.collection("guestDocuments");
        if (bookingId) query = query.where("bookingId", "==", bookingId);
        if (status) query = query.where("verificationStatus", "==", status);

        const snapPromise = query.get();
        const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 2500));
        const snapshot = (await Promise.race([snapPromise, timeoutPromise])) as any;

        if (snapshot && snapshot.docs) {
          for (const doc of snapshot.docs) {
            const docId = doc.id;
            if (!seenIds.has(docId)) {
              seenIds.add(docId);
              documents.push({
                documentId: docId,
                ...doc.data(),
              } as FirestoreGuestDocument);
            }
          }
        }
      } catch (fbErr: any) {
        console.warn("[ADMIN DOCS FIRESTORE WARNING]", fbErr?.message);
      }
    }

    return NextResponse.json({
      success: true,
      count: documents.length,
      documents,
    });
  } catch (error: any) {
    console.error("[DOCUMENTS LIST API ERROR]", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
