/**
 * Automated Security & Schema Validation Test Suite for Phase 02
 * Kekulama Eco Cabana Guest Management System
 */

import { canPerform, checkRateLimit, generateSecureToken } from "../auth";
import {
  sanitizeText,
  createBookingSchema,
  guestRegistrationSchema,
  recordPaymentSchema,
} from "../validation";
import { isRangeAvailable, BookingEvent } from "../../calendarSync";

let totalTests = 0;
let passedTests = 0;

function assert(condition: boolean, testName: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ [PASS] ${testName}`);
  } else {
    console.error(`  ✗ [FAIL] ${testName}`);
    throw new Error(`Test failed: ${testName}`);
  }
}

console.log("\n=======================================================");
console.log("  RUNNING PHASE 02 SECURITY & RBAC VALIDATION TESTS");
console.log("=======================================================\n");

// 1. RBAC Tests
console.log("1. RBAC Matrix & Principle of Least Privilege:");
assert(canPerform("CONFIRM_PAYMENT", "owner") === true, "Owner can confirm payments");
assert(canPerform("CONFIRM_PAYMENT", "reception") === false, "Reception CANNOT confirm payments");
assert(canPerform("VIEW_FINANCIAL_REPORTS", "owner") === true, "Owner can view financial reports");
assert(canPerform("VIEW_FINANCIAL_REPORTS", "reception") === false, "Reception CANNOT view financial reports");
assert(canPerform("MANAGE_BACKUPS", "owner") === true, "Owner can manage backups");
assert(canPerform("MANAGE_BACKUPS", "reception") === false, "Reception CANNOT manage backups");
assert(canPerform("RECORD_PAYMENT", "reception") === true, "Reception can record payments");
assert(canPerform("MANAGE_CHECKIN", "reception") === true, "Reception can manage checkin");
assert(canPerform("VIEW_DASHBOARD", "reception") === true, "Reception can view dashboard");

// 2. Input Sanitization & XSS Defense
console.log("\n2. Input Sanitization & Script Injection Defense:");
const maliciousInput = "<script>alert('xss')</script>John Doe";
const cleaned = sanitizeText(maliciousInput);
assert(!cleaned.includes("<script>"), "Strips script tags");
assert(!cleaned.includes("'"), "Strips single quotes");
assert(cleaned.includes("alert"), "Keeps safe alphanumeric text");

// 3. Booking Schema Validation
console.log("\n3. Zod Booking Schema Validation:");
const validBooking = createBookingSchema.safeParse({
  guestName: "Nimal Perera",
  guestEmail: "nimal@example.com",
  guestPhone: "+94771234567",
  checkIn: "2026-11-10",
  checkOut: "2026-11-12",
  adults: 2,
  children: 0,
  packagePlan: "Bed & Breakfast (B/B)",
  source: "direct",
});
assert(validBooking.success === true, "Valid booking passes schema");

const invalidDates = createBookingSchema.safeParse({
  guestName: "Nimal Perera",
  guestEmail: "nimal@example.com",
  guestPhone: "+94771234567",
  checkIn: "2026-11-12",
  checkOut: "2026-11-10", // CheckOut BEFORE CheckIn!
  adults: 2,
  children: 0,
  packagePlan: "Bed & Breakfast (B/B)",
});
assert(invalidDates.success === false, "Rejects checkOut before checkIn");

const invalidPhone = createBookingSchema.safeParse({
  guestName: "Nimal Perera",
  guestEmail: "nimal@example.com",
  guestPhone: "INVALID_PHONE$$$!",
  checkIn: "2026-11-10",
  checkOut: "2026-11-12",
  adults: 2,
  children: 0,
  packagePlan: "Bed & Breakfast (B/B)",
});
assert(invalidPhone.success === false, "Rejects malformed phone numbers");

// 4. Concurrency Double-Booking Check
console.log("\n4. Concurrency Double-Booking Logic:");
const mockBookings: BookingEvent[] = [
  {
    id: "B-1",
    startDate: "2026-11-10",
    endDate: "2026-11-13",
    source: "direct",
    summary: "Reserved",
  },
];
assert(
  isRangeAvailable("2026-11-10", "2026-11-12", mockBookings) === false,
  "Detects exact overlapping booking"
);
assert(
  isRangeAvailable("2026-11-12", "2026-11-15", mockBookings) === false,
  "Detects partial overlapping booking"
);
assert(
  isRangeAvailable("2026-11-13", "2026-11-15", mockBookings) === true,
  "Allows booking on checkout day of prior reservation"
);

// 5. Rate Limiting Protection
console.log("\n5. Rate Limiting Sliding Window Defense:");
const testIp = "192.168.1.100";
for (let i = 0; i < 5; i++) {
  checkRateLimit(testIp, { maxRequests: 5 });
}
const rateLimitedResult = checkRateLimit(testIp, { maxRequests: 5 });
assert(rateLimitedResult.allowed === false, "Enforces rate limit threshold after maximum requests");

// 6. Cryptographic Token Generation
console.log("\n6. Cryptographic Token Generation:");
const token1 = generateSecureToken();
const token2 = generateSecureToken();
assert(token1.length === 32, "Generates 32-character hexadecimal token");
assert(token1 !== token2, "Generates unique cryptographically secure tokens");

// 7. Authoritative Owner Authorization & UID Regression
console.log("\n7. Authoritative Owner Authorization & UID Regression:");
import("../authBridge").then(({ APPROVED_OWNER_UIDS }) => {
  assert(APPROVED_OWNER_UIDS.includes("uaksPM6v5LRGmtR9BdYmVdNcksU2"), "Primary Owner UID is registered");
  assert(APPROVED_OWNER_UIDS.includes("nfcCH0mfFMa1Yka50rBuXcRhCmY2"), "Secondary Owner UID is registered");
  assert(!APPROVED_OWNER_UIDS.includes("attacker-fake-uid" as any), "Attacker UID is rejected");
  assert(canPerform("CONFIRM_PAYMENT", "reception") === false, "Reception role rejected for Owner-only action");
  assert(canPerform("REVERSE_PAYMENT", "reception") === false, "Reception role rejected for Payment reversal");
  assert(canPerform("TRIGGER_BACKUP", "reception") === false, "Reception role rejected for Backup trigger");
  assert(canPerform("CONFIRM_PAYMENT", "owner") === true, "Owner role authorized for payment confirmation");

  console.log("\n=======================================================");
  console.log(`  ALL ${passedTests}/${totalTests} SECURITY TESTS PASSED!`);
  console.log("=======================================================\n");
});
