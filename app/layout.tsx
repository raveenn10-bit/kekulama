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
  title: "Kekulama Eco Cabana | Romantic Nature Sanctuary & Boutique Eco Lodge in Galle, Sri Lanka",
  description:
    "Secluded private A-frame timber eco cabana nestled in tranquil tea hills near Galle Fort. Perfect for couples, honeymooners, and international nature seekers. Authentic Sri Lankan hospitality, birdsong, organic meals, and serene luxury.",
  keywords: [
    "romantic eco cabana galle",
    "honeymoon nature resort sri lanka",
    "couples boutique retreat galle",
    "eco lodge near galle fort",
    "secluded tea estate villa galle",
    "sustainable travel sri lanka for foreigners",
    "private timber loft cabin galle",
    "best honeymoon stay in galle",
    "booking.com kekulama eco cabana",
    "airbnb superhost eco cabana galle",
    "galle southern expressway airport transfer stay",
    "romantic getaway southern province sri lanka",
  ],
  authors: [{ name: "Kekulama Eco Cabana Team" }],
  creator: "Kekulama Eco Cabana",
  publisher: "Kekulama Eco Cabana",
  formatDetection: {
    telephone: true,
    address: true,
    email: true,
  },
  alternates: {
    canonical: "https://kekulamaecocabana.com",
  },
  openGraph: {
    title: "Kekulama Eco Cabana | Romantic Nature Retreat & Boutique Lodge in Galle",
    description:
      "A secluded tropical A-frame sanctuary for couples & international travelers. Nestled in lush tea hills in Pinnaduwa, Galle. Wake up to birdsong and pure serenity.",
    url: "https://kekulamaecocabana.com",
    siteName: "Kekulama Eco Cabana",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/images/hero.jpg",
        width: 1200,
        height: 630,
        alt: "Kekulama Eco Cabana - Romantic Nature Sanctuary in Galle Sri Lanka",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kekulama Eco Cabana | Romantic Eco Lodge in Galle, Sri Lanka",
    description:
      "Secluded timber cabana in tranquil tea estate. Perfect romantic getaway for couples & foreign nature travelers in Galle.",
    images: ["/images/hero.jpg"],
  },
  icons: {
    icon: "/images/logo.jpg",
    apple: "/images/logo.jpg",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": ["LodgingBusiness", "Resort", "BedAndBreakfast"],
  "name": "Kekulama Eco Cabana",
  "alternateName": "Kekulama Eco Cabana Galle",
  "description": "Secluded private A-frame timber eco cabana nestled in tranquil tea hills in Pinnaduwa, Galle. Ideal for couples, honeymooners, and international nature seekers seeking authentic Sri Lankan serenity.",
  "url": "https://kekulamaecocabana.com",
  "telephone": "+94756657000",
  "email": "kekulamaecocabana@gmail.com",
  "priceRange": "$20 - $50 / night (LKR 6,000 - 15,000)",
  "currenciesAccepted": "USD, EUR, GBP, LKR",
  "paymentAccepted": "Cash, Bank Transfer, WhatsApp Direct, Booking.com, Airbnb",
  "checkinTime": "14:00",
  "checkoutTime": "10:00",
  "audience": {
    "@type": "Audience",
    "audienceType": "Couples, Honeymooners, International Travelers, Nature Enthusiasts, Digital Nomads"
  },
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "416/1, Pinnaduwa",
    "addressLocality": "Galle",
    "addressRegion": "Southern Province",
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
    "reviewCount": "24",
    "bestRating": "5",
    "worstRating": "1"
  },
  "sameAs": [
    "https://www.tripadvisor.com/Hotel_Review-g297896-d34099769-Reviews-Kekulama_Eco_Cabana-Galle_Galle_District_Southern_Province.html",
    "https://www.booking.com/searchresults.html?ss=Kekulama+Eco+Cabana+Galle+Sri+Lanka",
    "https://www.airbnb.com/rooms/1549628955214353080",
    "https://maps.app.goo.gl/SjnALMB1tAHYKzkM6",
    "https://www.facebook.com/Kekulamaecocabanagalle",
    "https://instagram.com/kekulamaecocabanagalle"
  ],
  "amenityFeature": [
    { "@type": "LocationFeatureSpecification", "name": "Romantic Loft Bedroom with Nature View", "value": true },
    { "@type": "LocationFeatureSpecification", "name": "Air Conditioning & Ceiling Fan", "value": true },
    { "@type": "LocationFeatureSpecification", "name": "Free High-Speed Wi-Fi", "value": true },
    { "@type": "LocationFeatureSpecification", "name": "Hot Water Shower with Pressure Pump", "value": true },
    { "@type": "LocationFeatureSpecification", "name": "45-inch Smart TV with Netflix & YouTube", "value": true },
    { "@type": "LocationFeatureSpecification", "name": "JBL Bluetooth Sound System", "value": true },
    { "@type": "LocationFeatureSpecification", "name": "Kitchenette & Refrigerator", "value": true },
    { "@type": "LocationFeatureSpecification", "name": "Private Tea Plantation & Bird Sanctuary", "value": true },
    { "@type": "LocationFeatureSpecification", "name": "Authentic Ceylon Breakfast & Local Dining", "value": true },
    { "@type": "LocationFeatureSpecification", "name": "Airport Pick-up / Taxi Arrangement", "value": true }
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
