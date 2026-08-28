"use client";

import React, { useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Star, CheckCircle, ExternalLink, RefreshCw, MessageSquarePlus, Sparkles, Heart } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { siteData } from "@/data/siteData";
import { LUXURY_EASING, LUXURY_DURATION } from "@/lib/motion";
import { useAutoScroll } from "@/hooks/useAutoScroll";
import { getAutoSyncedReviews, SyncedReviewsPayload } from "@/lib/googleReviewsSync";

export default function Reviews() {
  const { contact } = siteData;
  const shouldReduceMotion = useReducedMotion();
  const scrollRef = useAutoScroll({ interval: 4200 });

  // Load deterministic 2-day synced reviews immediately, then hydrate via API
  const [syncedData, setSyncedData] = useState<SyncedReviewsPayload>(() => getAutoSyncedReviews());
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    async function fetchFreshReviews() {
      try {
        const res = await fetch("/api/reviews");
        const json = await res.json();
        if (json.success && json.displayedReviews) {
          setSyncedData(json);
        }
      } catch {
        // Fallback to deterministic client sync
        setSyncedData(getAutoSyncedReviews());
      }
    }
    fetchFreshReviews();
  }, []);

  const handleManualSync = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/reviews");
      const json = await res.json();
      if (json.success) setSyncedData(json);
    } catch {}
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const reviews = syncedData.displayedReviews;
  const featured = syncedData.featuredReview;

  return (
    <section id="reviews" className="section-padding bg-gradient-to-b from-white via-eucalyptus-50/50 to-mint-50/40 relative overflow-hidden">
      {/* Background Ambience Glows */}
      <div className="absolute top-1/2 left-0 w-80 h-80 bg-mint-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-eucalyptus-200/25 rounded-full blur-3xl pointer-events-none" />

      <div className="container-custom relative z-10">
        <SectionHeading
          badge="Verified Guest Feedback"
          title="Google & TripAdvisor"
          highlight="Guest Reviews"
          subtitle="Authentic impressions from international couples and travelers who experienced tranquility at Kekulama Eco Cabana."
        />

        {/* ── 2-DAY AUTO-SYNC STATUS BADGE STRIP ── */}
        <div className="max-w-4xl mx-auto -mt-6 mb-8 flex items-center justify-between gap-3 flex-wrap bg-white/95 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl border border-stone-200 shadow-sm text-xs font-body">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="flex items-center gap-1.5 font-bold text-forest">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              Google Reviews Auto-Sync:
            </span>
            <span className="inline-flex items-center gap-1 text-emerald-900 bg-emerald-100 px-2.5 py-0.5 rounded-md font-semibold text-[11px]">
              Rotates 1 Review Every 2 Days
            </span>
            <span className="text-sage-500 text-[11px] hidden sm:inline-block">
              (Next sync rotation in ~{syncedData.nextSyncInHours}h)
            </span>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <a
              href="https://maps.app.goo.gl/SjnALMB1tAHYKzkM6"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-forest hover:text-emerald-700 font-semibold text-[11px] hover:underline"
            >
              <MessageSquarePlus size={13} />
              <span>Write a Review</span>
            </a>
            <button
              onClick={handleManualSync}
              className="p-1 rounded-lg hover:bg-stone-100 text-stone-500 hover:text-forest transition-colors cursor-pointer"
              title="Refresh Review Feed"
            >
              <RefreshCw size={13} className={isRefreshing ? "animate-spin text-emerald-600" : ""} />
            </button>
          </div>
        </div>

        {/* ── DUAL AUTHORITY SUMMARY CARDS: Google Maps & TripAdvisor ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto mb-10">
          {/* Google Maps Score Summary Card */}
          <motion.div
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: LUXURY_DURATION.medium, ease: LUXURY_EASING.quintOut }}
            className="bg-white rounded-3xl p-5 sm:p-6 shadow-[0_10px_30px_rgba(20,35,25,0.06)] border border-stone-200 flex flex-wrap items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3.5">
              {/* Google G Logo Badge */}
              <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-stone-200 flex items-center justify-center p-2 flex-shrink-0">
                <svg className="w-7 h-7" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-display font-bold text-forest">
                    {syncedData.ratingScore.toFixed(1)}
                  </span>
                  <div className="flex items-center gap-0.5 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={15} fill="currentColor" />
                    ))}
                  </div>
                </div>
                <span className="font-eyebrow text-[10px] uppercase tracking-[0.2em] text-sage-700 font-bold block">
                  Google Maps · {syncedData.allReviewsCount}+ Verified Reviews
                </span>
              </div>
            </div>

            <a
              href={contact.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-800 text-white hover:bg-forest transition-all font-body text-xs font-bold uppercase tracking-[0.12em] shadow-sm ml-auto"
            >
              <span>Google Page</span>
              <ExternalLink size={12} />
            </a>
          </motion.div>

          {/* TripAdvisor Score Summary Card */}
          <motion.div
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: LUXURY_DURATION.medium, ease: LUXURY_EASING.quintOut, delay: 0.1 }}
            className="bg-white rounded-3xl p-5 sm:p-6 shadow-[0_10px_30px_rgba(20,35,25,0.06)] border border-[#00AA6C]/30 flex flex-wrap items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3.5">
              {/* TripAdvisor Logo Badge */}
              <div className="w-12 h-12 rounded-2xl bg-[#00AA6C]/10 border border-[#00AA6C]/30 flex items-center justify-center p-2 flex-shrink-0">
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="11" fill="#00AA6C" />
                  <circle cx="8" cy="12" r="2.8" fill="white" />
                  <circle cx="8" cy="12" r="1.4" fill="#00AA6C" />
                  <circle cx="16" cy="12" r="2.8" fill="white" />
                  <circle cx="16" cy="12" r="1.4" fill="#00AA6C" />
                  <path d="M12 9.5l-1.8 2.5h3.6l-1.8-2.5z" fill="white" />
                  <path d="M5 8.5c1.8-1 3.5-1 5 0M14 8.5c1.8-1 3.5-1 5 0" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-display font-bold text-forest">5.0</span>
                  {/* TripAdvisor 5 Green Bubbles */}
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="w-3 h-3 rounded-full bg-[#00AA6C] inline-block shadow-sm" />
                    ))}
                  </div>
                </div>
                <span className="font-eyebrow text-[10px] uppercase tracking-[0.2em] text-[#00875A] font-bold block">
                  TripAdvisor · Top Rated Eco Stay
                </span>
              </div>
            </div>

            <a
              href={contact.tripadvisorUrl || "https://www.tripadvisor.com/Hotel_Review-g297896-d34099769-Reviews-Kekulama_Eco_Cabana-Galle_Galle_District_Southern_Province.html"}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#00AA6C] text-white hover:bg-[#00875A] transition-all font-body text-xs font-bold uppercase tracking-[0.12em] shadow-sm ml-auto"
            >
              <span>TripAdvisor</span>
              <ExternalLink size={12} />
            </a>
          </motion.div>
        </div>

        {/* ── 2-DAY FEATURED GUEST HIGHLIGHT CARD ── */}
        {featured && (
          <motion.div
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: LUXURY_DURATION.medium, ease: LUXURY_EASING.quintOut }}
            className="max-w-4xl mx-auto mb-8 bg-gradient-to-r from-emerald-900 to-forest rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden"
          >
            <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[10.5px] font-eyebrow uppercase tracking-wider font-bold">
                <Sparkles size={13} className="text-amber-300" />
                <span>Featured 2-Day Guest Highlight</span>
              </span>
              <span className="text-xs text-emerald-200/90 font-body">
                Auto-Synced: {syncedData.lastSyncedAt}
              </span>
            </div>

            <blockquote className="font-display italic text-lg sm:text-2xl text-emerald-50 leading-relaxed mb-6 font-normal">
              &#x201C;{featured.quote}&#x201D;
            </blockquote>

            <div className="flex items-center justify-between flex-wrap gap-4 pt-4 border-t border-white/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white text-forest font-display font-bold flex items-center justify-center text-sm shadow-md">
                  {featured.initials}
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm font-body">
                    {featured.author}
                  </h4>
                  <span className="text-xs text-emerald-200">
                    {featured.country} · {featured.badge || "Verified Guest"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 text-amber-300">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill="currentColor" />
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── MOBILE HORIZONTAL SNAP / DESKTOP 3-COL GRID OF ROTATING REVIEWS ── */}
        <div
          ref={scrollRef}
          className="flex overflow-x-auto snap-x snap-mandatory gap-5 pb-6 pt-2 px-1 md:grid md:grid-cols-2 lg:grid-cols-3 md:overflow-visible md:pb-0 no-scrollbar"
        >
          {reviews.map((review, index) => (
            <motion.div
              key={review.id || index}
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{
                duration: LUXURY_DURATION.medium,
                delay: index * 0.05,
                ease: LUXURY_EASING.quintOut,
              }}
              whileHover={shouldReduceMotion ? {} : { y: -4 }}
              className="snap-center flex-shrink-0 w-[84vw] md:w-auto bg-white rounded-3xl p-7 shadow-[0_10px_30px_rgba(20,35,25,0.06)] hover:shadow-xl transition-all duration-300 flex flex-col justify-between border border-stone-200 hover:border-emerald-500/50"
            >
              <div>
                {/* Header: Avatar, Name, Rating & Google Icon */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-11 h-11 rounded-full ${
                        review.avatarBg || "bg-emerald-700"
                      } text-white font-display text-base font-bold flex items-center justify-center shadow-sm flex-shrink-0`}
                    >
                      {review.initials || review.author.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-body text-sm font-bold text-forest">
                          {review.author}
                        </span>
                        {review.verified && (
                          <CheckCircle size={14} className="text-emerald-600" />
                        )}
                      </div>
                      <span className="font-body font-normal text-[11px] text-sage-600 block">
                        {review.country} {review.date ? `· ${review.date}` : ""}
                      </span>
                    </div>
                  </div>

                  {/* Google Badge Icon */}
                  <div className="w-6 h-6 rounded-full bg-stone-50 p-1 flex items-center justify-center flex-shrink-0 border border-stone-200">
                    <svg className="w-full h-full" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                      />
                    </svg>
                  </div>
                </div>

                {/* Stars */}
                <div className="flex items-center gap-1 mb-3 text-amber-400">
                  {[...Array(review.rating || 5)].map((_, i) => (
                    <Star key={i} fill="currentColor" size={15} />
                  ))}
                </div>

                {/* Quote Text in Cormorant Garamond */}
                <blockquote className="font-display italic text-base sm:text-lg text-sage-800 leading-relaxed font-normal">
                  &#x201C;{review.quote || review.text}&#x201D;
                </blockquote>
              </div>

              <div className="mt-6 pt-3.5 border-t border-stone-100 flex items-center justify-between font-eyebrow text-[10px] uppercase tracking-[0.2em] text-sage-500 font-bold">
                <span>Verified Google Review</span>
                <span className="text-emerald-800 font-bold">5.0 Star Experience</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Mobile Swipe Hint */}
        <div className="flex md:hidden items-center justify-center gap-1.5 font-eyebrow text-[11px] font-bold uppercase tracking-[0.2em] text-sage-500 mt-3">
          <span>👈 Swipe for all synced Google reviews 👉</span>
        </div>
      </div>
    </section>
  );
}
