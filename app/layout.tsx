import type { Metadata } from "next";
import { Cormorant_Garamond, Marcellus, Plus_Jakarta_Sans, Space_Grotesk } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navigation/Navbar";
import Footer from "@/components/sections/Footer";
import FloatingWhatsApp from "@/components/ui/FloatingWhatsApp";

const luxuryDisplay = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-luxury-display",
  display: "swap",
});

const luxuryEyebrow = Marcellus({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-luxury-eyebrow",
  display: "swap",
});

const luxuryBody = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-luxury-body",
  display: "swap",
});

const luxuryMono = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-luxury-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://kekulamaecocabana.com"),
  title: "Kekulama Eco Cabana — Luxury Nature Sanctuary in Galle, Sri Lanka",
  description:
    "Your exclusive sanctuary in nature's lap. Eco-luxury cabanas crafted from natural timbers amidst the emerald tea estates of Pinnaduwa, Galle. Reconnect with tranquility.",
  keywords: [
    "luxury eco cabana",
    "galle boutique hotel",
    "sri lanka luxury retreat",
    "eco resort galle",
    "tea estate villa",
    "pinnaduwa sanctuary",
    "kekulama eco cabana",
  ],
  openGraph: {
    title: "Kekulama Eco Cabana — Luxury Nature Sanctuary in Galle",
    description:
      "Eco-luxury cabanas nestled among rolling tea estates in Pinnaduwa, Galle. Sculptural timber architecture & pure serenity.",
    url: "https://kekulamaecocabana.com",
    siteName: "Kekulama Eco Cabana",
    locale: "en_US",
    type: "website",
    images: [{ url: "/images/hero.jpg", width: 1200, height: 630, alt: "Kekulama Eco Cabana Nature Sanctuary" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kekulama Eco Cabana — Luxury Nature Sanctuary",
    description: "Eco-luxury timber cabanas among tea estates in Galle, Sri Lanka.",
    images: ["/images/hero.jpg"],
  },
  icons: {
    icon: "/images/logo.jpg",
    apple: "/images/logo.jpg",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LodgingBusiness",
  "name": "Kekulama Eco Cabana",
  "description": "An idyllic eco-luxury sanctuary nestled among tea plantations in Pinnaduwa, Galle, Sri Lanka.",
  "url": "https://kekulamaecocabana.com",
  "telephone": "+94756657000",
  "email": "kekulamaecocabana@gmail.com",
  "priceRange": "LKR 6,000 - 15,000",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "416/1, Pinnaduwa",
    "addressLocality": "Galle",
    "postalCode": "800034",
    "addressCountry": "LK"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 6.0779352,
    "longitude": 80.2623579
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "5.0",
    "reviewCount": "19",
    "bestRating": "5"
  },
  "sameAs": [
    "https://www.tripadvisor.com/Hotel_Review-g297896-d34099769-Reviews-Kekulama_Eco_Cabana-Galle_Galle_District_Southern_Province.html",
    "https://maps.app.goo.gl/SjnALMB1tAHYKzkM6",
    "https://www.facebook.com/Kekulamaecocabanagalle",
    "https://instagram.com/kekulamaecocabanagalle"
  ],
  "amenityFeature": [
    { "@type": "LocationFeatureSpecification", "name": "45-inch Smart TV", "value": true },
    { "@type": "LocationFeatureSpecification", "name": "JBL Speaker", "value": true },
    { "@type": "LocationFeatureSpecification", "name": "Kitchenette & Cooker", "value": true },
    { "@type": "LocationFeatureSpecification", "name": "Hot Water Pressure Pump", "value": true },
    { "@type": "LocationFeatureSpecification", "name": "Tea Estate Panorama", "value": true }
  ]
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${luxuryDisplay.variable} ${luxuryEyebrow.variable} ${luxuryBody.variable} ${luxuryMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://api.openweathermap.org" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="font-body antialiased bg-eucalyptus-50 text-sage-900 overflow-x-hidden selection:bg-mint-200 selection:text-forest-dark">
        <Navbar />
        <main>{children}</main>
        <Footer />
        <FloatingWhatsApp />
      </body>
    </html>
  );
}
