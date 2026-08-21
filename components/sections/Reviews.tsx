"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";
import SectionHeading from "@/components/ui/SectionHeading";
import { siteData } from "@/data/siteData";

export default function Reviews() {
  const { reviews } = siteData;

  return (
    <section id="reviews" className="section-padding bg-sage-50">
      <div className="container-custom">
        <SectionHeading
          badge="Guest Reviews"
          title="What visitors"
          highlight="say"
        />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          {reviews.map((review, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                duration: 0.6,
                delay: index * 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
              whileHover={{ y: -4 }}
              className="bg-white rounded-2xl p-7 shadow-soft flex flex-col"
            >
              <div className="flex flex-row gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    fill="currentColor"
                    size={16}
                    className="text-bark"
                  />
                ))}
              </div>
              
              <blockquote className="text-sage-700 leading-relaxed mt-4 text-[15px] flex-grow">
                &#x201C;{review.text}&#x201D;
              </blockquote>
              
              <div className="mt-6 flex flex-col">
                <span className="text-sm font-semibold text-forest">
                  {review.author}
                </span>
                {review.country && (
                  <span className="text-xs text-sage-400">
                    {review.country}
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
