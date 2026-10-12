export type BookingStatus =
  | "pending"
  | "confirmed"
  | "registered"
  | "checked_in"
  | "checked_out"
  | "cancelled";

export type BookingSource = "direct" | "manual" | "booking.com" | "airbnb";

export type PaymentStatus = "unpaid" | "partially_paid" | "paid" | "refunded";

export type PaymentMethod = "cash" | "bank_transfer";

export interface Booking {
  id: string; // e.g., KEK-2026-1042
  roomId: string; // Default: 'cabana-01'
  roomName: string; // Default: 'A-Frame Eco Cabana'
  guestId?: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  nights: number;
  adults: number;
  children: number;
  packagePlan: string; // e.g., 'Bed & Breakfast (B/B)', 'Full Board (F/B)'
  totalAmount: number; // LKR
  paidAmount: number; // LKR
  balanceAmount: number; // LKR
  source: BookingSource;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  specialRequests?: string;
  notes?: string;
  registrationToken?: string;
  isRegistered?: boolean;
  actualCheckInTime?: string;
  actualCheckOutTime?: string;
  cancelledAt?: string;
  cancelReason?: string;
  createdBy?: string; // uid or 'guest'
  createdAt: string;
  updatedAt: string;
}

export interface RoomCalendarLock {
  id: string; // roomId_YYYY-MM-DD
  roomId: string;
  date: string; // YYYY-MM-DD
  bookingId: string;
  status: "confirmed" | "hold";
  expiresAt?: string;
  createdAt: string;
}

export interface PaymentRecord {
  id: string; // PAY-XXXXXX
  bookingId: string;
  amount: number; // LKR
  method: PaymentMethod;
  status: "recorded" | "confirmed" | "reversed";
  paymentDate: string; // YYYY-MM-DD
  bankTransferReference?: string;
  proofStoragePath?: string;
  notes?: string;
  recordedBy: string; // uid of staff/owner
  confirmedBy?: string; // uid of owner
  confirmedAt?: string;
  reversedBy?: string;
  reversedReason?: string;
  reversedAt?: string;
  createdAt: string;
}
