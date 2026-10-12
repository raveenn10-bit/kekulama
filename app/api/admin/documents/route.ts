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

    let query: FirebaseFirestore.Query = adminDb.collection("guestDocuments");

    if (bookingId) {
      query = query.where("bookingId", "==", bookingId);
    }

    if (status) {
      query = query.where("verificationStatus", "==", status);
    }

    const snapshot = await query.get();
    const documents = snapshot.docs.map((doc) => ({
      documentId: doc.id,
      ...doc.data(),
    })) as FirestoreGuestDocument[];

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
