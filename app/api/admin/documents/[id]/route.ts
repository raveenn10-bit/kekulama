import { NextRequest, NextResponse } from "next/server";
import { requireStaffOrOwner } from "@/lib/security/authBridge";
import { adminDb, logAuditEvent } from "@/lib/firebase/admin";
import { createSignedDocumentUrl } from "@/lib/supabase/storage";
import { FirestoreGuestDocument } from "@/types/document";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Authorization: Only authenticated Staff (Reception) or Owner
    const authUser = await requireStaffOrOwner(req);
    if (!authUser) {
      return NextResponse.json(
        { error: "Forbidden: Staff or Owner access required." },
        { status: 403 }
      );
    }

    const documentId = params.id;
    if (!documentId) {
      return NextResponse.json({ error: "Missing document ID" }, { status: 400 });
    }

    // 2. Fetch Document Metadata from Supabase (Tier 1) or Firestore
    let documentData: FirestoreGuestDocument | null = null;

    try {
      const { supabaseAdmin, isSupabaseConfigured } = await import("@/lib/supabase/admin");
      if (isSupabaseConfigured()) {
        const { data: sbDoc } = await supabaseAdmin
          .from("guest_documents")
          .select("*")
          .or(`id.eq.${documentId},document_id.eq.${documentId}`)
          .maybeSingle();

        if (sbDoc) {
          documentData = {
            documentId: sbDoc.document_id || sbDoc.id,
            guestId: sbDoc.guest_id,
            bookingId: sbDoc.booking_id,
            documentType: sbDoc.document_type,
            storageProvider: sbDoc.storage_provider || "supabase",
            bucketName: sbDoc.bucket_name || "guest-private-documents",
            privateStoragePath: sbDoc.private_storage_path,
            mimeType: sbDoc.mime_type,
            fileSize: Number(sbDoc.file_size) || 0,
            verificationStatus: sbDoc.verification_status || "pending",
            uploadedBy: sbDoc.uploaded_by,
            uploadedAt: sbDoc.uploaded_at,
            retentionUntil: sbDoc.retention_until,
          };
        }
      }
    } catch (sbErr: any) {
      console.warn("[DOCUMENT GET SB WARNING]", sbErr?.message);
    }

    if (!documentData) {
      const { isFirebaseAdminConfigured } = await import("@/lib/firebase/admin");
      if (isFirebaseAdminConfigured()) {
        try {
          const docSnap = await adminDb.collection("guestDocuments").doc(documentId).get();
          if (docSnap.exists) {
            documentData = docSnap.data() as FirestoreGuestDocument;
          }
        } catch (fbErr: any) {
          console.warn("[DOCUMENT GET FIRESTORE WARNING]", fbErr?.message);
        }
      }
    }

    if (!documentData) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    // 3. Generate a short-lived (5-minute / 300-second) signed URL from Supabase Private Storage
    const signedUrlRes = await createSignedDocumentUrl({
      path: documentData.privateStoragePath,
      expiresInSeconds: 300,
    });

    if (signedUrlRes.error || !signedUrlRes.signedUrl) {
      return NextResponse.json(
        { error: `Failed to create secure view link: ${signedUrlRes.error}` },
        { status: 500 }
      );
    }

    // 4. Record Immutable Audit Log
    await logAuditEvent({
      actorId: authUser.uid,
      actorEmail: authUser.email,
      actorRole: authUser.role,
      action: "DOCUMENT_ACCESSED",
      targetResource: `guestDocuments/${documentId}`,
      details: {
        documentType: documentData.documentType,
        bookingId: documentData.bookingId,
        storagePath: documentData.privateStoragePath,
      },
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      document: documentData,
      signedUrl: signedUrlRes.signedUrl,
      expiresInSeconds: 300,
    });
  } catch (error: any) {
    console.error("[DOCUMENT GET API ERROR]", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
