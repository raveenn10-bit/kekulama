import { z } from "zod";

/**
 * Sanitizes string inputs by stripping unsafe script/HTML characters
 */
export function sanitizeText(input: unknown, maxLength: number = 200): string {
  if (typeof input !== "string") return "";
  return input
    .replace(/[<>'"&;`]/g, "")
    .trim()
    .slice(0, maxLength);
}

/**
 * Validates ISO Date format YYYY-MM-DD
 */
export const dateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Date must be in YYYY-MM-DD format" });

/**
 * Booking creation schema (shared by online & manual booking)
 */
export const createBookingSchema = z
  .object({
    guestName: z
      .string()
      .min(2, "Full name must be at least 2 characters")
      .max(80, "Full name must not exceed 80 characters")
      .transform((val) => sanitizeText(val, 80)),
    guestEmail: z
      .string()
      .email("A valid email address is required")
      .max(100)
      .toLowerCase()
      .trim(),
    guestPhone: z
      .string()
      .min(7, "Phone number is too short")
      .max(25, "Phone number is too long")
      .regex(/^[\d\s+\-()]+$/, "Phone contains invalid characters")
      .trim(),
    checkIn: dateStringSchema,
    checkOut: dateStringSchema,
    adults: z.number().int().min(1, "At least 1 adult is required").max(6, "Maximum 6 adults"),
    children: z.number().int().min(0).max(6).default(0),
    packagePlan: z
      .string()
      .min(2)
      .max(60)
      .transform((val) => sanitizeText(val, 60)),
    specialRequests: z
      .string()
      .max(500)
      .optional()
      .transform((val) => (val ? sanitizeText(val, 500) : "")),
    notes: z
      .string()
      .max(500)
      .optional()
      .transform((val) => (val ? sanitizeText(val, 500) : "")),
    totalAmount: z.number().nonnegative().optional(),
    source: z.enum(["direct", "manual", "booking.com", "airbnb"]).default("direct"),
  })
  .refine((data) => data.checkOut > data.checkIn, {
    message: "Check-out date must be after check-in date",
    path: ["checkOut"],
  });

export type CreateBookingInput = z.infer<typeof createBookingSchema>;

/**
 * Guest portal registration schema
 */
export const guestRegistrationSchema = z.object({
  token: z.string().length(32, "Invalid token format"),
  fullName: z
    .string()
    .min(2)
    .max(80)
    .transform((val) => sanitizeText(val, 80)),
  nationality: z
    .string()
    .min(2)
    .max(50)
    .transform((val) => sanitizeText(val, 50)),
  address: z
    .string()
    .min(5)
    .max(200)
    .transform((val) => sanitizeText(val, 200)),
  idType: z.enum(["nic", "passport"]),
  idNumber: z
    .string()
    .min(5)
    .max(30)
    .transform((val) => sanitizeText(val, 30)),
  specialRequests: z
    .string()
    .max(500)
    .optional()
    .transform((val) => (val ? sanitizeText(val, 500) : "")),
});

export type GuestRegistrationInput = z.infer<typeof guestRegistrationSchema>;

/**
 * Payment recording schema
 */
export const recordPaymentSchema = z.object({
  bookingId: z.string().min(5).max(30),
  amount: z.number().positive("Payment amount must be greater than zero"),
  method: z.enum(["cash", "bank_transfer"]),
  paymentDate: dateStringSchema,
  bankTransferReference: z
    .string()
    .max(60)
    .optional()
    .transform((val) => (val ? sanitizeText(val, 60) : "")),
  notes: z
    .string()
    .max(300)
    .optional()
    .transform((val) => (val ? sanitizeText(val, 300) : "")),
});

export type RecordPaymentInput = z.infer<typeof recordPaymentSchema>;

/**
 * Document upload metadata schema
 */
export const documentUploadSchema = z.object({
  bookingId: z.string().min(5).max(30),
  docType: z.enum(["nic_front", "nic_back", "passport_page", "optional_photo"]),
  mimeType: z.enum(["image/jpeg", "image/png", "image/webp"]),
  fileSizeBytes: z
    .number()
    .positive()
    .max(10 * 1024 * 1024, "File size must not exceed 10MB"),
});

export type DocumentUploadInput = z.infer<typeof documentUploadSchema>;

/**
 * Admin login schema
 */
export const adminLoginSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type AdminLoginInput = z.infer<typeof adminLoginSchema>;
