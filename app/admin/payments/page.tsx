"use client";

import React, { useState, useEffect } from "react";
import { CreditCard, PlusCircle, CheckCircle2, AlertTriangle, Printer, RotateCcw } from "lucide-react";
import { collection, onSnapshot, query, orderBy, doc, addDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { Booking, PaymentRecord } from "@/types/booking";
import { useAdminAuth } from "@/components/admin/AdminAuthContext";
import { generateReceiptId } from "@/lib/booking/referenceGenerator";

export default function AdminPaymentsPage() {
  const { user, role } = useAdminAuth();
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState("");
  const [amount, setAmount] = useState<number>(0);
  const [method, setMethod] = useState<"cash" | "bank_transfer">("cash");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const [receiptData, setReceiptData] = useState<{ payment: PaymentRecord; booking?: Booking } | null>(null);

  useEffect(() => {
    const qP = query(collection(db, "payments"), orderBy("createdAt", "desc"));
    const unsubP = onSnapshot(qP, (s) => setPayments(s.docs.map((d) => ({ id: d.id, ...d.data() } as PaymentRecord))));

    const qB = query(collection(db, "bookings"), orderBy("createdAt", "desc"));
    const unsubB = onSnapshot(qB, (s) => setBookings(s.docs.map((d) => d.data() as Booking)));

    return () => {
      unsubP();
      unsubB();
    };
  }, []);

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookingId || amount <= 0) return;
    setLoading(true);

    try {
      const booking = bookings.find((b) => b.id === selectedBookingId);
      if (!booking) return;

      const paymentId = generateReceiptId();
      const nowIso = new Date().toISOString();

      const newPayment: PaymentRecord = {
        id: paymentId,
        bookingId: selectedBookingId,
        amount,
        method,
        status: "recorded",
        paymentDate: nowIso.split("T")[0]!,
        bankTransferReference: reference || "",
        notes: notes || "",
        recordedBy: user?.uid || "staff",
        createdAt: nowIso,
      };

      await addDoc(collection(db, "payments"), newPayment);

      // Update booking paid and balance amounts
      const newPaid = (booking.paidAmount || 0) + amount;
      const newBalance = Math.max(0, (booking.totalAmount || 0) - newPaid);
      const newPaymentStatus = newBalance === 0 ? "paid" : newPaid > 0 ? "partially_paid" : "unpaid";

      await updateDoc(doc(db, "bookings", selectedBookingId), {
        paidAmount: newPaid,
        balanceAmount: newBalance,
        paymentStatus: newPaymentStatus,
        updatedAt: nowIso,
      });

      setIsModalOpen(false);
      setSelectedBookingId("");
      setAmount(0);
      setReference("");
      setNotes("");
    } catch (err) {
      console.error(err);
      alert("Failed to record payment.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = async (p: PaymentRecord) => {
    if (role !== "owner") {
      alert("Only the Owner can confirm payments.");
      return;
    }
    try {
      await updateDoc(doc(db, "payments", p.id), {
        status: "confirmed",
        confirmedBy: user?.uid || "owner",
        confirmedAt: new Date().toISOString(),
      });
    } catch (e) {
      console.error(e);
      alert("Error confirming payment.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CreditCard size={20} className="text-blue-600" />
            <span>Cash & Bank Transfer Payment Tracking</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manual payment ledger with receipt issuance and Owner confirmation.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer"
        >
          <PlusCircle size={14} />
          <span>Record New Payment</span>
        </button>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Receipt ID</th>
                <th className="py-3 px-4">Booking Ref</th>
                <th className="py-3 px-4">Guest</th>
                <th className="py-3 px-4">Amount (LKR)</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-xs text-slate-400">
                    No payment records in ledger yet.
                  </td>
                </tr>
              ) : (
                payments.map((p) => {
                  const booking = bookings.find((b) => b.id === p.bookingId);
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{p.id}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">{p.bookingId}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        {booking?.guestName || "Guest"}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        LKR {p.amount.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 uppercase text-[10px] font-bold text-slate-600">
                        {p.method.replace("_", " ")}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            p.status === "confirmed"
                              ? "bg-emerald-100 text-emerald-800"
                              : p.status === "reversed"
                              ? "bg-rose-100 text-rose-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">{p.paymentDate}</td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {p.status === "recorded" && role === "owner" && (
                            <button
                              onClick={() => handleConfirmPayment(p)}
                              className="px-2 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-[11px] font-semibold transition-all cursor-pointer"
                            >
                              Confirm
                            </button>
                          )}
                          <button
                            onClick={() => setReceiptData({ payment: p, booking })}
                            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                            title="Print Receipt"
                          >
                            <Printer size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleRecordPayment}
            className="bg-white max-w-md w-full rounded-2xl border border-slate-200 shadow-xl p-6 space-y-4 text-xs"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Record Payment in Ledger</h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Select Booking Reference *</label>
              <select
                required
                value={selectedBookingId}
                onChange={(e) => {
                  setSelectedBookingId(e.target.value);
                  const b = bookings.find((item) => item.id === e.target.value);
                  if (b && b.balanceAmount > 0) {
                    setAmount(b.balanceAmount);
                  }
                }}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 text-slate-900"
              >
                <option value="">Select Booking...</option>
                {bookings.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.id} — {b.guestName} (Bal: LKR {b.balanceAmount?.toLocaleString() || 0})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Payment Method *</label>
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 text-slate-900"
                >
                  <option value="cash">Cash Payment</option>
                  <option value="bank_transfer">Bank Transfer</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Amount Received (LKR) *</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 text-slate-900 font-bold"
                />
              </div>
            </div>

            {method === "bank_transfer" && (
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Bank Transfer Reference</label>
                <input
                  type="text"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="e.g. TXN-1092839182"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 text-slate-900 font-mono"
                />
              </div>
            )}

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Internal Notes</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Paid at reception upon check-in..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 text-slate-900"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-sm cursor-pointer disabled:opacity-50"
            >
              {loading ? "Recording..." : "Record Payment Entry"}
            </button>
          </form>
        </div>
      )}

      {/* Printable Receipt Modal */}
      {receiptData && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-sm w-full rounded-2xl border border-slate-200 shadow-2xl p-6 text-xs font-mono space-y-4">
            <div className="text-center border-b border-dashed border-slate-300 pb-3">
              <h3 className="font-bold text-sm tracking-tight font-sans text-slate-900">
                KEKULAMA ECO CABANA
              </h3>
              <p className="text-[10px] text-slate-500 font-sans">Pinnaduwa, Galle · Sri Lanka</p>
              <span className="text-[10px] text-slate-400 block mt-1">OFFICIAL PAYMENT RECEIPT</span>
            </div>

            <div className="space-y-1.5 text-[11px]">
              <div className="flex justify-between">
                <span>Receipt No:</span>
                <span className="font-bold">{receiptData.payment.id}</span>
              </div>
              <div className="flex justify-between">
                <span>Booking Ref:</span>
                <span>{receiptData.payment.bookingId}</span>
              </div>
              <div className="flex justify-between">
                <span>Guest:</span>
                <span>{receiptData.booking?.guestName || "Guest"}</span>
              </div>
              <div className="flex justify-between">
                <span>Payment Date:</span>
                <span>{receiptData.payment.paymentDate}</span>
              </div>
              <div className="flex justify-between">
                <span>Method:</span>
                <span className="uppercase">{receiptData.payment.method}</span>
              </div>
              <div className="flex justify-between border-t border-dashed border-slate-200 pt-2 font-bold text-sm">
                <span>AMOUNT PAID:</span>
                <span>LKR {receiptData.payment.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Remaining Bal:</span>
                <span>LKR {receiptData.booking?.balanceAmount?.toLocaleString() || 0}</span>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-3 flex gap-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold font-sans hover:bg-slate-800"
              >
                Print Receipt
              </button>
              <button
                onClick={() => setReceiptData(null)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold font-sans hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
