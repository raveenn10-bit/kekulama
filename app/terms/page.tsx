import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Scale, ArrowLeft, Clock, ShieldAlert, Sparkles, Mail, MapPin } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service | Kekulama Eco Cabana Galle",
  description:
    "Official Terms of Service and Guest Booking Conditions for Kekulama Eco Cabana Galle, Sri Lanka. Learn about our check-in, reservation, and sanctuary guidelines.",
  alternates: {
    canonical: "https://www.kekulamaecocabanagalle.com/terms",
  },
};

export default function TermsOfServicePage() {
  const lastUpdated = "October 12, 2026";

  return (
    <div className="min-h-screen bg-sand-50/60 text-sage-900 pt-28 sm:pt-36 pb-20 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb & Back Link */}
        <div className="mb-8 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-eyebrow tracking-widest uppercase text-forest hover:text-mint-600 transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Back to Sanctuary</span>
          </Link>
          <span className="text-[11px] font-mono text-sage-500">
            Last Updated: {lastUpdated}
          </span>
        </div>

        {/* Header Hero */}
        <header className="mb-12 border-b border-sage-200/80 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest/5 text-forest border border-forest/10 text-xs font-eyebrow uppercase tracking-[0.2em] mb-4">
            <Scale size={13} className="text-forest" />
            <span>Guest Agreement & Sanctuary Policies</span>
          </div>
          <h1 className="font-display text-3xl sm:text-5xl text-forest tracking-tight font-normal mb-4">
            Terms of Service
          </h1>
          <p className="font-body text-sm sm:text-base text-sage-700 leading-relaxed max-w-3xl">
            Welcome to Kekulama Eco Cabana Galle. By booking a stay, reserving a day experience, or utilizing our
            online reservation platforms, you agree to comply with and be bound by the following Terms of Service.
            Please read these conditions carefully before confirming your reservation.
          </p>
        </header>

        {/* Main Content Body */}
        <div className="space-y-10 font-body text-xs sm:text-sm text-sage-800 leading-relaxed">
          {/* Section 1 */}
          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-sage-200/80 shadow-sm space-y-3">
            <h2 className="font-display text-xl sm:text-2xl text-forest flex items-center gap-2">
              <span className="text-mint-600 font-mono text-sm">01.</span>
              <span>The Sanctuary Contract</span>
            </h2>
            <p>
              These Terms constitute a legally binding agreement between you (&ldquo;Guest&rdquo;) and{" "}
              <strong>Kekulama Eco Cabana Galle</strong> (&ldquo;Resort&rdquo;), located in Pinnaduwa, Galle, Sri Lanka.
              Confirmation of any reservation via our direct website, WhatsApp concierge, or verified partner platforms
              confirms full acceptance of these terms.
            </p>
          </section>

          {/* Section 2 */}
          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-sage-200/80 shadow-sm space-y-4">
            <h2 className="font-display text-xl sm:text-2xl text-forest flex items-center gap-2">
              <span className="text-mint-600 font-mono text-sm">02.</span>
              <span>Reservations, Pricing & Payment</span>
            </h2>
            <ul className="space-y-2 pl-4 list-disc marker:text-mint-600">
              <li>
                <strong>Direct Bookings:</strong> All reservations made through our online booking engine are processed in Sri Lankan Rupees (LKR) or United States Dollars (USD) according to current published rates.
              </li>
              <li>
                <strong>Booking Guarantee:</strong> A booking is finalized only upon receipt of advance deposit confirmation or authorization by our reservation management desk.
              </li>
              <li>
                <strong>Taxes & Service Charges:</strong> All quoted rates include statutory resort amenities unless explicitly specified during booking.
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-sage-200/80 shadow-sm space-y-4">
            <h2 className="font-display text-xl sm:text-2xl text-forest flex items-center gap-2">
              <span className="text-mint-600 font-mono text-sm">03.</span>
              <span>Check-In & Check-Out Times</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-sand-50/70 rounded-xl border border-sage-200">
                <div className="flex items-center gap-2 font-bold text-forest text-xs uppercase tracking-wider mb-1">
                  <Clock size={15} className="text-mint-600" />
                  <span>Check-In</span>
                </div>
                <div className="text-base sm:text-lg font-display text-forest">From 2:00 PM</div>
                <p className="text-xs text-sage-600 mt-1">
                  Early arrival is subject to cabana availability and prior coordination with our host.
                </p>
              </div>

              <div className="p-4 bg-sand-50/70 rounded-xl border border-sage-200">
                <div className="flex items-center gap-2 font-bold text-forest text-xs uppercase tracking-wider mb-1">
                  <Clock size={15} className="text-mint-600" />
                  <span>Check-Out</span>
                </div>
                <div className="text-base sm:text-lg font-display text-forest">Until 11:00 AM</div>
                <p className="text-xs text-sage-600 mt-1">
                  Late checkout requires prior management approval to allow for thorough housekeeping.
                </p>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-sage-200/80 shadow-sm space-y-3">
            <h2 className="font-display text-xl sm:text-2xl text-forest flex items-center gap-2">
              <span className="text-mint-600 font-mono text-sm">04.</span>
              <span>Guest Identification & Tourism Compliance</span>
            </h2>
            <p>
              In strict accordance with the regulations set forth by the Sri Lanka Tourism Development Authority (SLTDA)
              and local law enforcement:
            </p>
            <ul className="space-y-1.5 pl-4 list-disc marker:text-mint-600">
              <li>All primary guests must present a valid government-issued photo ID (Sri Lankan National Identity Card or International Passport) upon check-in.</li>
              <li>Only registered guests are permitted overnight stay in the private A-frame timber cabana.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-sage-200/80 shadow-sm space-y-3">
            <h2 className="font-display text-xl sm:text-2xl text-forest flex items-center gap-2">
              <span className="text-mint-600 font-mono text-sm">05.</span>
              <span>Sanctuary Guidelines & Nature Preservation</span>
            </h2>
            <p>
              Kekulama is an eco-sanctuary situated in a serene tropical tea estate. To preserve peace and safety:
            </p>
            <ul className="space-y-2 pl-4 list-disc marker:text-mint-600">
              <li>
                <strong>Tranquility Hours:</strong> Loud music and disruptive disturbances are prohibited after 10:00 PM to respect neighboring estates and nocturnal wildlife.
              </li>
              <li>
                <strong>Fire Safety:</strong> Smoking and open flames are strictly forbidden inside the timber loft cabana. Dedicated outdoor smoking zones are provided on the grounds.
              </li>
              <li>
                <strong>Flora & Wildlife:</strong> Guests are requested to respect tea plantations, fruit trees, and endemic birds inhabiting the sanctuary.
              </li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-sage-200/80 shadow-sm space-y-3">
            <h2 className="font-display text-xl sm:text-2xl text-forest flex items-center gap-2">
              <span className="text-mint-600 font-mono text-sm">06.</span>
              <span>Cancellation & Date Amendments</span>
            </h2>
            <p>
              We understand travel plans can shift unexpectedly. Our cancellation guidelines are structured as follows:
            </p>
            <ul className="space-y-1.5 pl-4 list-disc marker:text-mint-600">
              <li>Cancellations notified at least 7 days prior to scheduled check-in: Eligible for full refund or date rescheduling.</li>
              <li>Cancellations within 3 to 6 days prior to check-in: Subject to 50% cancellation fee or date credit.</li>
              <li>No-shows or cancellations within 48 hours of arrival: Full reservation amount is non-refundable.</li>
            </ul>
          </section>

          {/* Section 7 */}
          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-sage-200/80 shadow-sm space-y-3">
            <h2 className="font-display text-xl sm:text-2xl text-forest flex items-center gap-2">
              <span className="text-mint-600 font-mono text-sm">07.</span>
              <span>Governing Law & Jurisdiction</span>
            </h2>
            <p>
              These Terms of Service and any contractual relations arising out of your booking shall be governed by
              and construed exclusively in accordance with the laws of the Democratic Socialist Republic of Sri Lanka.
              Any disputes shall be submitted to the exclusive jurisdiction of the Courts of Galle, Sri Lanka.
            </p>
          </section>
        </div>

        {/* Footer Navigation Back */}
        <div className="mt-14 pt-8 border-t border-sage-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <Link
            href="/"
            className="text-forest hover:text-mint-600 font-eyebrow uppercase tracking-widest flex items-center gap-1.5"
          >
            <ArrowLeft size={13} />
            <span>Return to Kekulama Homepage</span>
          </Link>
          <div className="flex items-center gap-3 text-sage-500 font-mono">
            <Link href="/privacy" className="hover:text-forest underline">
              Privacy Policy
            </Link>
            <span>·</span>
            <span>&copy; {new Date().getFullYear()} Kekulama Eco Cabana</span>
          </div>
        </div>
      </div>
    </div>
  );
}
