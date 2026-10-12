import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Shield, ArrowLeft, Lock, FileText, CheckCircle2, Mail, MapPin } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy | Kekulama Eco Cabana Galle",
  description:
    "Official Privacy Policy of Kekulama Eco Cabana Galle. Learn how we safeguard your guest information, reservation records, and adhere to Google API Services User Data Policy.",
  alternates: {
    canonical: "https://www.kekulamaecocabanagalle.com/privacy",
  },
};

export default function PrivacyPolicyPage() {
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
            <Shield size={13} className="text-forest" />
            <span>Privacy & Data Protection</span>
          </div>
          <h1 className="font-display text-3xl sm:text-5xl text-forest tracking-tight font-normal mb-4">
            Privacy Policy
          </h1>
          <p className="font-body text-sm sm:text-base text-sage-700 leading-relaxed max-w-3xl">
            At Kekulama Eco Cabana Galle, we value the trust you place in us when reserving your stay in our private
            tropical tea sanctuary. This Privacy Policy details our unwavering commitment to protecting personal guest
            records, handling data with cryptographic integrity, and strictly adhering to global data protection principles.
          </p>
        </header>

        {/* Main Content Body */}
        <div className="space-y-10 font-body text-xs sm:text-sm text-sage-800 leading-relaxed">
          {/* Section 1 */}
          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-sage-200/80 shadow-sm space-y-3">
            <h2 className="font-display text-xl sm:text-2xl text-forest flex items-center gap-2">
              <span className="text-mint-600 font-mono text-sm">01.</span>
              <span>Operator & Contact Identity</span>
            </h2>
            <p>
              This website and its associated reservation management systems are owned and operated by{" "}
              <strong>Kekulama Eco Cabana Galle</strong> (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;), a registered boutique eco-retreat
              located in Pinnaduwa, Galle, Southern Province, Sri Lanka.
            </p>
            <div className="p-4 bg-sand-50/70 rounded-xl space-y-1 text-xs font-mono text-sage-700">
              <div className="flex items-center gap-2">
                <MapPin size={13} className="text-forest" />
                <span>Pinnaduwa, Galle, Southern Province, Sri Lanka</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={13} className="text-forest" />
                <span>kekulamaecocabana@gmail.com</span>
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-sage-200/80 shadow-sm space-y-4">
            <h2 className="font-display text-xl sm:text-2xl text-forest flex items-center gap-2">
              <span className="text-mint-600 font-mono text-sm">02.</span>
              <span>Information We Collect</span>
            </h2>
            <p>
              To process your reservation, provide personalized hospitality, and comply with Sri Lanka Tourism Development
              Authority (SLTDA) legal requirements, we collect:
            </p>
            <ul className="space-y-2 pl-4 list-disc marker:text-mint-600">
              <li>
                <strong>Guest Contact Details:</strong> Full name, email address, WhatsApp/mobile telephone number, and residential nationality.
              </li>
              <li>
                <strong>Booking & Stay Parameters:</strong> Check-in and check-out dates, selected packages (e.g., Honeymoon, Nature Day Out), special dietary requests, and payment confirmation receipts.
              </li>
              <li>
                <strong>Official Identification:</strong> National Identity Card (NIC) or Passport digital copies required for in-person check-in verification in accordance with national tourism safety regulations.
              </li>
              <li>
                <strong>Technical Metadata:</strong> Anonymized analytical metrics (browser type, device viewport, session performance) collected through privacy-focused analytics to improve web experience.
              </li>
            </ul>
          </section>

          {/* Section 3 - Google OAuth & API Limited Use (CRITICAL FOR GOOGLE AUDIT) */}
          <section className="bg-white p-6 sm:p-8 rounded-2xl border-2 border-forest/20 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-forest">
              <Lock size={18} className="text-forest" />
              <h2 className="font-display text-xl sm:text-2xl">
                03. Google API Services & Limited Use Disclosure
              </h2>
            </div>

            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl text-emerald-950 text-xs sm:text-sm font-medium">
              Kekulama Eco Cabana&rsquo;s use and transfer to any other app of information received from Google APIs will adhere to the{" "}
              <a
                href="https://developers.google.com/terms/api-services-user-data-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-bold hover:text-emerald-800"
              >
                Google API Services User Data Policy
              </a>
              , including the <strong>Limited Use</strong> requirements.
            </div>

            <p>
              Our production system integrates with Google Cloud APIs strictly for administrative resilience and guest communication:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-sand-50/80 rounded-xl border border-sage-200 space-y-2">
                <div className="font-bold text-forest text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-mint-600" />
                  <span>Google Drive API (`drive.file`)</span>
                </div>
                <p className="text-xs text-sage-700 leading-relaxed">
                  We use the least-privilege <code>drive.file</code> scope exclusively to create and synchronize encrypted, compressed database backup archives into a dedicated folder in the verified owner account. We <strong>never</strong> view, read, index, or access any other files, folders, or personal documents in your Google Drive.
                </p>
              </div>

              <div className="p-4 bg-sand-50/80 rounded-xl border border-sage-200 space-y-2">
                <div className="font-bold text-forest text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-mint-600" />
                  <span>Gmail API (`gmail.send`)</span>
                </div>
                <p className="text-xs text-sage-700 leading-relaxed">
                  We use the <code>gmail.send</code> scope solely to dispatch transactional booking confirmations, arrival directions, and automated system alerts. We <strong>never</strong> read, store, or access your inbox messages.
                </p>
              </div>
            </div>

            <p className="text-xs text-sage-600 pt-2">
              Google user data is never shared with third parties, never used for advertising or marketing profiling, and never used to train machine learning models.
            </p>
          </section>

          {/* Section 4 */}
          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-sage-200/80 shadow-sm space-y-3">
            <h2 className="font-display text-xl sm:text-2xl text-forest flex items-center gap-2">
              <span className="text-mint-600 font-mono text-sm">04.</span>
              <span>Data Encryption & Storage Security</span>
            </h2>
            <p>
              We implement industry-grade technical safeguards to prevent unauthorized access, alteration, or disclosure:
            </p>
            <ul className="space-y-2 pl-4 list-disc marker:text-mint-600">
              <li>
                <strong>Encryption in Transit:</strong> All HTTP communications are strictly forced over TLS 1.3 / HTTPS with HSTS preloaded.
              </li>
              <li>
                <strong>Encryption at Rest:</strong> Cloud database backups and OAuth credentials are authenticated and encrypted using <strong>AES-256-GCM</strong> with cryptographically random initialization vectors and SHA-256 integrity checksums.
              </li>
              <li>
                <strong>Access Control:</strong> Administrative and database disaster recovery consoles are restricted exclusively to authenticated resort Owners via cryptographic role-based tokens.
              </li>
              <li>
                <strong>Retention & Deletion:</strong> Database backup archives in Google Drive are automatically rotated on a rolling 30-day lifecycle, ensuring personal records are not retained indefinitely.
              </li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-sage-200/80 shadow-sm space-y-3">
            <h2 className="font-display text-xl sm:text-2xl text-forest flex items-center gap-2">
              <span className="text-mint-600 font-mono text-sm">05.</span>
              <span>Your Rights & Data Portability</span>
            </h2>
            <p>
              Under applicable personal data protection laws (including the Sri Lankan Personal Data Protection Act No. 9 of 2022 and GDPR for international travelers), you have the right to:
            </p>
            <ul className="space-y-1.5 pl-4 list-disc marker:text-mint-600">
              <li>Request a copy of your personal guest records stored in our systems.</li>
              <li>Request correction or updating of any inaccurate contact or passport details.</li>
              <li>Request the complete deletion of your registration documents post-departure, subject to statutory tourism accounting obligations.</li>
            </ul>
            <p className="pt-2">
              To exercise any of these rights, please contact our management team directly at{" "}
              <a href="mailto:kekulamaecocabana@gmail.com" className="text-forest font-semibold underline">
                kekulamaecocabana@gmail.com
              </a>.
            </p>
          </section>

          {/* Section 6 */}
          <section className="bg-white p-6 sm:p-8 rounded-2xl border border-sage-200/80 shadow-sm space-y-3">
            <h2 className="font-display text-xl sm:text-2xl text-forest flex items-center gap-2">
              <span className="text-mint-600 font-mono text-sm">06.</span>
              <span>Policy Updates</span>
            </h2>
            <p>
              We reserve the right to modify this Privacy Policy as our services and regulatory requirements evolve. Any modifications will be posted directly to this URL with an updated revision date.
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
            <Link href="/terms" className="hover:text-forest underline">
              Terms of Service
            </Link>
            <span>·</span>
            <span>&copy; {new Date().getFullYear()} Kekulama Eco Cabana</span>
          </div>
        </div>
      </div>
    </div>
  );
}
