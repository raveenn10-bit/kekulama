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

    // 2. Fetch Document Metadata from Firestore 'guestDocuments'
    const docSnap = await adminDb.collection("guestDocuments").doc(documentId).get();
    if (!docSnap.exists) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    const documentData = docSnap.data() as FirestoreGuestDocument;

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
