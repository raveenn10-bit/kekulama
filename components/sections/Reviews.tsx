"use client";

import React from "react";
import { motion } from "framer-motion";
import { Star, CheckCircle, ExternalLink } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { siteData } from "@/data/siteData";

export default function Reviews() {
  const { reviews, googleRatingStats, contact } = siteData;

  return (
    <section id="reviews" className="section-padding bg-gradient-to-b from-white via-eucalyptus-50/50 to-mint-50/40 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/2 left-0 w-80 h-80 bg-mint-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-eucalyptus-200/25 rounded-full blur-3xl pointer-events-none" />

      <div className="container-custom relative z-10">
        <SectionHeading
          badge="Verified Guest Feedback"
          title="Google Maps"
          highlight="Reviews"
          subtitle="Authentic impressions from global travellers who found serenity at Kekulama Eco Cabana."
        />

        {/* Google Maps Score Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto -mt-4 mb-12 bg-white/90 backdrop-blur-md rounded-3xl p-5 sm:p-6 shadow-soft border border-mint-100 flex flex-wrap items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            {/* Google G Logo Badge */}
            <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-sage-200 flex items-center justify-center p-2 flex-shrink-0">
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
                <span className="text-3xl font-display font-normal text-forest">
                  {googleRatingStats.score.toFixed(1)}
                </span>
                <div className="flex items-center gap-0.5 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill="currentColor" />
                  ))}
                </div>
              </div>
              <span className="font-eyebrow text-[10.5px] uppercase tracking-[0.2em] text-sage-600 font-normal">
                Official Google Maps Rating · 100% Recommended
              </span>
            </div>
          </div>

          <a
            href={contact.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-mint-100/90 text-mint-900 hover:bg-mint-500 hover:text-white transition-all font-body text-xs font-semibold uppercase tracking-[0.12em] shadow-sm"
          >
            <span>Read on Google</span>
            <ExternalLink size={12} />
          </a>
        </motion.div>

        {/* Mobile Horizontal Snap Row / Desktop 3-Col Grid */}
        <div className="flex overflow-x-auto snap-x snap-mandatory gap-5 pb-6 pt-2 px-1 md:grid md:grid-cols-2 lg:grid-cols-3 md:overflow-visible md:pb-0 no-scrollbar">
          {reviews.map((review, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{
                duration: 0.5,
                delay: index * 0.05,
                ease: [0.16, 1, 0.3, 1],
              }}
              whileHover={{ y: -5 }}
              className="snap-center flex-shrink-0 w-[84vw] md:w-auto bg-white/95 backdrop-blur-md rounded-3xl p-7 shadow-soft hover:shadow-glow transition-all duration-300 flex flex-col justify-between border border-mint-100 hover:border-mint-300"
            >
              <div>
                {/* Header: Avatar, Name, Rating & Google Icon */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-11 h-11 rounded-full ${
                        review.avatarBg || "bg-mint-500"
                      } text-white font-display text-base font-normal flex items-center justify-center shadow-sm flex-shrink-0`}
                    >
                      {review.initials || review.author.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-body text-sm font-semibold text-forest">
                          {review.author}
                        </span>
                        {review.verified && (
                          <CheckCircle size={13} className="text-mint-600" />
                        )}
                      </div>
                      <span className="font-body font-light text-[11px] text-sage-500 block">
                        {review.country} {review.date ? `· ${review.date}` : ""}
                      </span>
                    </div>
                  </div>

                  {/* Google Badge Icon */}
                  <div className="w-6 h-6 rounded-full bg-sage-50 p-1 flex items-center justify-center flex-shrink-0">
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
                <div className="flex items-center gap-1 mb-3.5 text-amber-400">
                  {[...Array(review.rating || 5)].map((_, i) => (
                    <Star key={i} fill="currentColor" size={15} />
                  ))}
                </div>

                {/* Quote Text in Cormorant Garamond */}
                <blockquote className="font-display italic text-base sm:text-lg text-sage-800 leading-lux-relaxed font-normal">
                  &#x201C;{review.quote || review.text}&#x201D;
                </blockquote>
              </div>

              <div className="mt-6 pt-3.5 border-t border-sage-100 flex items-center justify-between font-eyebrow text-[10px] uppercase tracking-[0.2em] text-sage-400">
                <span>Verified Google Review</span>
                <span className="text-mint-700 font-semibold">5.0 Star Experience</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Mobile Swipe Hint */}
        <div className="flex md:hidden items-center justify-center gap-1.5 font-eyebrow text-[11px] uppercase tracking-[0.2em] text-sage-400 mt-3">
          <span>👈 Swipe for all Google reviews 👉</span>
        </div>
      </div>
    </section>
  );
}
