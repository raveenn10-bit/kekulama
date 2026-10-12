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

    const docRef = adminDb.collection("guestDocuments").doc(documentId);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return NextResponse.json({ error: "Document not found." }, { status: 404 });
    }

    const docData = docSnap.data() as FirestoreGuestDocument;
    const now = new Date().toISOString();

    await docRef.update({
      verificationStatus: status,
      verifiedBy: owner.email,
      verifiedAt: now,
      rejectionReason: status === "rejected" ? rejectionReason || "Document does not match guest details" : null,
    });

    // Immutable audit log
    await logAuditEvent({
      actorId: owner.uid,
      actorEmail: owner.email,
      actorRole: "owner",
      action: status === "verified" ? "DOCUMENT_VERIFIED" : "DOCUMENT_REJECTED",
      targetResource: `guestDocuments/${documentId}`,
      details: {
        documentType: docData.documentType,
        bookingId: docData.bookingId,
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
