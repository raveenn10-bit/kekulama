import { NextRequest, NextResponse } from "next/server";
import { requireOwner } from "@/lib/security/authBridge";
import { adminDb, logAuditEvent } from "@/lib/firebase/admin";
import { DocVerificationStatus, FirestoreGuestDocument } from "@/types/document";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Authorization: Strict Owner check only (confirmed Owner UIDs)
    const owner = await requireOwner(req);
    if (!owner) {
      return NextResponse.json(
        { error: "Forbidden: Only confirmed Owners are authorized to verify guest identity documents." },
        { status: 403 }
      );
    }

    const documentId = params.id;
    const body = await req.json();
    const { status, rejectionReason } = body as {
      status: DocVerificationStatus;
      rejectionReason?: string;
    };

    if (!status || !["verified", "rejected"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be 'verified' or 'rejected'." },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    let updated = false;

    // 1. Tier 1: Supabase PostgreSQL (Global persistent store)
    try {
      const { supabaseAdmin, isSupabaseConfigured } = await import("@/lib/supabase/admin");
      if (isSupabaseConfigured()) {
        const { error: sbErr } = await supabaseAdmin
          .from("guest_documents")
          .update({
            verification_status: status,
          })
          .or(`id.eq.${documentId},document_id.eq.${documentId}`);

        if (!sbErr) {
          updated = true;
        }
      }
    } catch (sbErr: any) {
      console.warn("[DOCUMENT VERIFY SB WARNING]", sbErr?.message);
    }

    // 2. Tier 2: Cloud Firestore (if configured)
    const { isFirebaseAdminConfigured } = await import("@/lib/firebase/admin");
    if (isFirebaseAdminConfigured()) {
      try {
        const docRef = adminDb.collection("guestDocuments").doc(documentId);
        const docSnap = await docRef.get();
        if (docSnap.exists) {
          await docRef.update({
            verificationStatus: status,
            verifiedBy: owner.email,
            verifiedAt: now,
            rejectionReason: status === "rejected" ? rejectionReason || "Document does not match guest details" : null,
          });
          updated = true;
        }
      } catch (fbErr: any) {
        console.warn("[DOCUMENT VERIFY FIRESTORE WARNING]", fbErr?.message);
      }
    }

    // Immutable audit log
    await logAuditEvent({
      actorId: owner.uid,
      actorEmail: owner.email,
      actorRole: "owner",
      action: status === "verified" ? "DOCUMENT_VERIFIED" : "DOCUMENT_REJECTED",
      targetResource: `guestDocuments/${documentId}`,
      details: {
        documentId,
        status,
        rejectionReason: rejectionReason || null,
      },
      timestamp: now,
    });

    return NextResponse.json({
      success: true,
      documentId,
      verificationStatus: status,
      verifiedBy: owner.email,
      verifiedAt: now,
    });
  } catch (error: any) {
    console.error("[DOCUMENT VERIFY API ERROR]", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
