"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { siteData } from "@/data/siteData";
import { SectionHeading } from "@/components/ui/SectionHeading";
import Link from "next/link";

export default function Packages() {
  const { packages } = siteData;

  const dayNightPackages = packages.slice(0, 4);
  const mealPlanPackages = packages.slice(4);

  return (
    <section id="packages" className="bg-sand-50 section-padding">
      <div className="container-custom">
        <SectionHeading
          badge="Rates & Packages"
          title="Choose your perfect"
          highlight="stay"
          subtitle="All prices in Sri Lankan Rupees (LKR). Packages include check-in from 2:00 PM."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {dayNightPackages.map((pkg, index) => (
            <PackageCard key={pkg.name} pkg={pkg} index={index} />
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6">
          {mealPlanPackages.map((pkg, index) => (
            <PackageCard key={pkg.name} pkg={pkg} index={index + 4} />
          ))}
        </div>
      </div>
    </section>
  );
}

function PackageCard({ pkg, index }: { pkg: any; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: index * 0.1 }}
      whileHover={{ y: -4 }}
      className={`bg-white rounded-2xl p-6 shadow-soft hover:shadow-lifted transition-all relative flex flex-col ${
        pkg.popular ? "ring-2 ring-bark" : ""
      }`}
    >
      {pkg.popular && (
        <span className="absolute top-0 right-6 -translate-y-1/2 bg-bark text-white text-xs font-medium px-3 py-1 rounded-full">
          Most Popular
        </span>
      )}
      <h3 className="text-lg font-display text-forest">{pkg.name}</h3>
      <div className="mt-2 flex items-baseline">
        <span className="text-sm text-sage-500 mr-1">Rs</span>
        <span className="text-3xl font-display text-bark">{pkg.price}</span>
        <span className="text-sm text-sage-500 ml-1">/ {pkg.unit}</span>
      </div>
      {pkg.timing && <div className="text-xs text-sage-400 mt-1">{pkg.timing}</div>}

      <ul className="mt-4 space-y-2 flex-grow">
        {pkg.features.map((feature: string, i: number) => (
          <li key={i} className="flex items-start gap-2">
            <Check size={16} className="text-bark/60 mt-0.5 shrink-0" />
            <span className="text-sm text-sage-600">{feature}</span>
          </li>
        ))}
      </ul>

      <Link
        href="https://wa.me/94756657000"
        target="_blank"
        rel="noopener noreferrer"
        className={`w-full mt-6 py-2 px-4 rounded-full text-center text-sm font-medium transition-colors ${
          pkg.popular
            ? "bg-bark text-white hover:bg-bark-dark"
            : "border border-bark text-bark hover:bg-bark hover:text-white"
        }`}
      >
        Book Now
      </Link>
    </motion.div>
  );
}
