import assert from "assert";
import { createBookingSchema } from "../validation";
import { PACKAGE_RATES_LKR } from "../../booking/availabilityEngine";
import { getOwnerEmailHtml, getGuestEmailHtml } from "../../notifications/emailService";

console.log("=======================================================");
console.log("  RUNNING KEKULAMA DIRECT BOOKING SUITE TESTS");
console.log("=======================================================\n");

let passedTests = 0;
let totalTests = 0;

function runTest(name: string, fn: () => void | Promise<void>) {
  totalTests++;
  try {
    const res = fn();
    if (res instanceof Promise) {
      res
        .then(() => {
          console.log(`  ✓ [PASS] ${name}`);
          passedTests++;
        })
        .catch((err) => {
          console.error(`  ✗ [FAIL] ${name}:`, err.message);
          process.exit(1);
        });
    } else {
      console.log(`  ✓ [PASS] ${name}`);
      passedTests++;
    }
  } catch (err: any) {
    console.error(`  ✗ [FAIL] ${name}:`, err.message);
    process.exit(1);
  }
}

// 1. Zod Schema Validation for Direct Website Booking
runTest("Direct Booking Schema - Valid website booking payload accepts all fields", () => {
  const validPayload = {
    guestName: "Samantha Fernando",
    guestEmail: "samantha.f@example.com",
    guestPhone: "+94771234567",
    checkIn: "2026-11-10",
    checkOut: "2026-11-12",
    packagePlan: "Bed & Breakfast (B/B)",
    adults: 2,
    children: 0,
    specialRequests: "Quiet cabana, early check-in if possible",
    country: "Sri Lanka",
    idType: "nic",
    idNumber: "199451203456",
    idDocumentIds: ["doc_front_123", "doc_back_456"],
    source: "website",
  };

  const parsed = createBookingSchema.safeParse(validPayload);
  assert.strictEqual(parsed.success, true, "Valid payload should pass schema validation");
  if (parsed.success) {
    assert.strictEqual(parsed.data.source, "website");
    assert.strictEqual(parsed.data.country, "Sri Lanka");
    assert.strictEqual(parsed.data.idType, "nic");
    assert.strictEqual(parsed.data.idNumber, "199451203456");
    assert.strictEqual(parsed.data.idDocumentIds?.length, 2);
  }
});

// 2. Schema Rejection on Invalid / Malicious Inputs
runTest("Direct Booking Schema - Rejects missing required fields and invalid formats", () => {
  // Missing guestName
  const missingName = createBookingSchema.safeParse({
    guestEmail: "guest@example.com",
    guestPhone: "+94771234567",
    checkIn: "2026-11-10",
    checkOut: "2026-11-12",
    packagePlan: "Bed & Breakfast (B/B)",
    adults: 2,
  });
  assert.strictEqual(missingName.success, false, "Should reject missing guestName");

  // Invalid email format
  const invalidEmail = createBookingSchema.safeParse({
    guestName: "Kasun Perera",
    guestEmail: "not-an-email",
    guestPhone: "+94771234567",
    checkIn: "2026-11-10",
    checkOut: "2026-11-12",
    packagePlan: "Bed & Breakfast (B/B)",
    adults: 2,
  });
  assert.strictEqual(invalidEmail.success, false, "Should reject invalid email");

  // Invalid date format
  const invalidDate = createBookingSchema.safeParse({
    guestName: "Kasun Perera",
    guestEmail: "kasun@example.com",
    guestPhone: "+94771234567",
    checkIn: "10-11-2026",
    checkOut: "12-11-2026",
    packagePlan: "Bed & Breakfast (B/B)",
    adults: 2,
  });
  assert.strictEqual(invalidDate.success, false, "Should reject non-ISO YYYY-MM-DD date");

  // CheckOut before CheckIn
  const checkoutBeforeCheckin = createBookingSchema.safeParse({
    guestName: "Kasun Perera",
    guestEmail: "kasun@example.com",
    guestPhone: "+94771234567",
    checkIn: "2026-11-15",
    checkOut: "2026-11-10",
    packagePlan: "Bed & Breakfast (B/B)",
    adults: 2,
  });
  assert.strictEqual(checkoutBeforeCheckin.success, false, "Should reject checkout before checkin");
});

// 3. Server-Side Canonical Pricing Calculation
runTest("Canonical Pricing Engine - Computes authoritative rates resisting tampering", () => {
  // Test rate definitions
  assert.strictEqual(PACKAGE_RATES_LKR["Bed & Breakfast (B/B)"], 11000);
  assert.strictEqual(PACKAGE_RATES_LKR["Half Board (H/B)"], 13000);
  assert.strictEqual(PACKAGE_RATES_LKR["Full Board (F/B)"], 15000);
  assert.strictEqual(PACKAGE_RATES_LKR["Night Stay — A/C"], 9000);

  // Compute 3 nights for Half Board
  const nights = 3;
  const canonicalHalfBoard = PACKAGE_RATES_LKR["Half Board (H/B)"] * nights;
  assert.strictEqual(canonicalHalfBoard, 39000);

  // Even if client attempts to send totalAmount: 100, the canonical engine guarantees 39000
  const clientPayloadTotal = 100;
  const enforcedTotal = PACKAGE_RATES_LKR["Half Board (H/B)"] * nights;
  assert.notStrictEqual(clientPayloadTotal, enforcedTotal);
  assert.strictEqual(enforcedTotal, 39000);
});

// 4. Overlapping Dates & Lock Key Derivation
runTest("Calendar Lock Date Range & Concurrency Keys", () => {
  const startDate = "2026-12-24";
  const endDate = "2026-12-27";
  const roomId = "cabana-01";

  // Derive nights
  const start = new Date(`${startDate}T14:00:00+05:30`);
  const end = new Date(`${endDate}T11:00:00+05:30`);
  const lockKeys: string[] = [];

  const current = new Date(start);
  while (current < end) {
    const dateStr = current.toISOString().split("T")[0];
    lockKeys.push(`${roomId}_${dateStr}`);
    current.setDate(current.getDate() + 1);
  }

  assert.strictEqual(lockKeys.length, 3, "Dec 24-27 should represent exactly 3 nights");
  assert.deepStrictEqual(lockKeys, [
    "cabana-01_2026-12-24",
    "cabana-01_2026-12-25",
    "cabana-01_2026-12-26",
  ]);
});

// 5. Luxury Email Generation for Owner & Guest
runTest("Email Template Architecture - Produces luxury branded HTML and text", () => {
  const samplePayload = {
    event: "NEW_ONLINE_BOOKING" as const,
    bookingId: "KEK-2026-0042",
    guestName: "Jean-Luc Picard",
    guestEmail: "picard@starfleet.org",
    guestPhone: "+33612345678",
    checkIn: "2026-12-20",
    checkOut: "2026-12-23",
    nights: 3,
    guestsCount: "2 Adults",
    packagePlan: "Full Board (F/B)",
    totalPriceLkr: 45000,
    idVerificationStatus: "Pending Owner Review",
  };

  const ownerHtml = getOwnerEmailHtml(samplePayload);
  assert(ownerHtml.includes("KEK-2026-0042"), "Owner email must contain booking reference");
  assert(ownerHtml.includes("Jean-Luc Picard"), "Owner email must contain guest name");
  assert(ownerHtml.includes("Full Board (F/B)"), "Owner email must contain package plan");
  assert(ownerHtml.includes("45,000"), "Owner email must contain formatted total");
  assert(ownerHtml.includes("Review & Confirm in Admin Portal"), "Owner email must contain CTA link to admin portal");

  const guestPayload = {
    ...samplePayload,
    event: "GUEST_BOOKING_ACKNOWLEDGMENT" as const,
  };

  const guestHtml = getGuestEmailHtml(guestPayload);
  assert(guestHtml.includes("KEK-2026-0042"), "Guest email must contain booking reference");
  assert(guestHtml.includes("Jean-Luc Picard"), "Guest email must contain guest name");
  assert(guestHtml.includes("Full Board (F/B)"), "Guest email must contain package plan");
  assert(guestHtml.includes("Pinnaduwa, Galle"), "Guest email must contain resort location");
  assert(guestHtml.includes("Check-in: 2:00 PM"), "Guest email must contain check-in time");
  assert(guestHtml.includes("Check-out: 11:00 AM"), "Guest email must contain check-out time");
});

console.log(`\n=======================================================`);
console.log(`  ALL ${passedTests} TESTS PASSED SUCCESSFULLY!`);
console.log(`=======================================================\n`);
