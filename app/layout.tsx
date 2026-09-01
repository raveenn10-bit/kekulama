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
  metadataBase: new URL("https://www.kekulamaecocabanagalle.com"),
  title: {
    default: "Kekulama Eco Cabana Galle | #1 Romantic Eco Cabana & Boutique Stay in Galle",
    template: "%s | Kekulama Eco Cabana Galle",
  },
  description:
    "Experience the #1 secluded eco cabana in Galle, Sri Lanka. Private A-frame timber loft, romantic honeymoon retreats, day outs, emerald tea estate views & authentic Ceylon hospitality.",
  keywords: [
    "kekulama eco cabana galle",
    "eco cabana galle",
    "cabana in galle",
    "best cabana in galle",
    "honeymoon cabana galle sri lanka",
    "romantic cabana in galle for couples",
    "couples day out galle cabana",
    "day out cabana galle",
    "private cabin stay galle pinnaduwa",
    "eco lodge near galle fort",
    "sustainable travel sri lanka for foreigners",
    "a-frame timber cabin galle",
    "tea estate resort galle",
    "best honeymoon stay in galle",
    "romantic getaway southern province sri lanka",
    "booking.com kekulama eco cabana galle",
    "airbnb superhost eco cabana galle",
    "galle southern expressway airport transfer stay",
  ],
  authors: [{ name: "Kekulama Eco Cabana Galle Team" }],
  creator: "Kekulama Eco Cabana Galle",
  publisher: "Kekulama Eco Cabana Galle",
  applicationName: "Kekulama Eco Cabana",
  category: "Travel & Hospitality",
  formatDetection: {
    telephone: true,
    address: true,
    email: true,
  },
  alternates: {
    canonical: "https://www.kekulamaecocabanagalle.com",
  },
  openGraph: {
    title: "Kekulama Eco Cabana Galle | #1 Romantic Eco Cabana & Nature Stay in Galle",
    description:
      "A secluded tropical A-frame sanctuary for couples & international travelers in Pinnaduwa, Galle. Wake up to birdsong, tea hills, and pure serenity.",
    url: "https://www.kekulamaecocabanagalle.com",
    siteName: "Kekulama Eco Cabana Galle",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/images/hero.jpg",
        width: 1200,
        height: 630,
        alt: "Kekulama Eco Cabana Galle - Romantic Nature Sanctuary in Galle Sri Lanka",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kekulama Eco Cabana Galle | #1 Romantic Eco Lodge in Galle, Sri Lanka",
    description:
      "Secluded timber cabana in tranquil tea estate in Galle. Perfect romantic getaway for couples & foreign nature travelers.",
    images: ["/images/hero.jpg"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/icon-48.png", sizes: "48x48", type: "image/png" },
      { url: "/icon-96.png", sizes: "96x96", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: ["/favicon.ico"],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
  verification: {
    google: "googlefb5ea8e96cdbde57",
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
  "@graph": [
    {
      "@type": ["LodgingBusiness", "Resort", "BedAndBreakfast", "LocalBusiness", "Hotel"],
      "@id": "https://www.kekulamaecocabanagalle.com/#business",
      name: "Kekulama Eco Cabana Galle",
      alternateName: [
        "Kekulama Eco Cabana",
        "Kekulama Cabana Galle",
        "Kekulama Eco Lodge Galle",
        "Kekulama Galle"
      ],
      description:
        "Secluded private A-frame timber eco cabana nestled in tranquil tea hills in Pinnaduwa, Galle. Ideal for couples, honeymooners, day outs, and international nature seekers seeking authentic Sri Lankan serenity.",
      url: "https://www.kekulamaecocabanagalle.com",
      logo: "https://www.kekulamaecocabanagalle.com/icon-512.png",
      image: [
        "https://www.kekulamaecocabanagalle.com/images/hero.jpg",
        "https://www.kekulamaecocabanagalle.com/images/loft-bedroom.jpg",
        "https://www.kekulamaecocabanagalle.com/images/cabana-front.jpg",
        "https://www.kekulamaecocabanagalle.com/images/cabana-garden.jpg"
      ],
      telephone: "+94756657000",
      email: "kekulamaecocabana@gmail.com",
      priceRange: "$20 - $50 / night (LKR 6,000 - 15,000)",
      currenciesAccepted: "USD, EUR, GBP, LKR",
      paymentAccepted: "Cash, Bank Transfer, WhatsApp Direct, Booking.com, Airbnb",
      checkinTime: "14:00",
      checkoutTime: "10:00",
      audience: {
        "@type": "Audience",
        audienceType: "Couples, Honeymooners, International Travelers, Nature Enthusiasts, Digital Nomads"
      },
      address: {
        "@type": "PostalAddress",
        streetAddress: "416/1, Pinnaduwa",
        addressLocality: "Galle",
        addressRegion: "Southern Province",
        postalCode: "80000",
        addressCountry: "LK"
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: 6.0779352,
        longitude: 80.2623579
      },
      hasMap: "https://maps.app.goo.gl/SjnALMB1tAHYKzkM6",
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "5.0",
        reviewCount: "24",
        bestRating: "5",
        worstRating: "1"
      },
      sameAs: [
        "https://www.tripadvisor.com/Hotel_Review-g297896-d34099769-Reviews-Kekulama_Eco_Cabana-Galle_Galle_District_Southern_Province.html",
        "https://www.booking.com/searchresults.html?ss=Kekulama+Eco+Cabana+Galle+Sri+Lanka",
        "https://www.airbnb.com/rooms/1549628955214353080",
        "https://maps.app.goo.gl/SjnALMB1tAHYKzkM6",
        "https://www.facebook.com/Kekulamaecocabanagalle",
        "https://instagram.com/kekulamaecocabanagalle"
      ],
      amenityFeature: [
        { "@type": "LocationFeatureSpecification", name: "Romantic Loft Bedroom with Nature View", value: true },
        { "@type": "LocationFeatureSpecification", name: "Air Conditioning & Ceiling Fan", value: true },
        { "@type": "LocationFeatureSpecification", name: "Free High-Speed Wi-Fi", value: true },
        { "@type": "LocationFeatureSpecification", name: "Hot Water Shower with Pressure Pump", value: true },
        { "@type": "LocationFeatureSpecification", name: "45-inch Smart TV with Netflix & YouTube", value: true },
        { "@type": "LocationFeatureSpecification", name: "JBL Bluetooth Sound System", value: true },
        { "@type": "LocationFeatureSpecification", name: "Kitchenette & Refrigerator", value: true },
        { "@type": "LocationFeatureSpecification", name: "Private Tea Plantation & Bird Sanctuary", value: true },
        { "@type": "LocationFeatureSpecification", name: "Authentic Ceylon Breakfast & Local Dining", value: true },
        { "@type": "LocationFeatureSpecification", name: "Airport Pick-up / Taxi Arrangement", value: true }
      ]
    },
    {
      "@type": "WebSite",
      "@id": "https://www.kekulamaecocabanagalle.com/#website",
      url: "https://www.kekulamaecocabanagalle.com",
      name: "Kekulama Eco Cabana Galle",
      publisher: {
        "@id": "https://www.kekulamaecocabanagalle.com/#business"
      }
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "https://www.kekulamaecocabanagalle.com"
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Eco Cabanas & Packages",
          item: "https://www.kekulamaecocabanagalle.com/#packages"
        },
        {
          "@type": "ListItem",
          position: 3,
          name: "Live Rates & Booking",
          item: "https://www.kekulamaecocabanagalle.com/#booking"
        }
      ]
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "Where is Kekulama Eco Cabana located in Galle?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Kekulama Eco Cabana is located at 416/1, Pinnaduwa, Galle 80000, Sri Lanka. It is just 2 minutes from the Pinnaduwa Southern Expressway exit (1.5 hours from Colombo Airport) and 12-15 minutes from Galle Fort and Unawatuna Beach."
          }
        },
        {
          "@type": "Question",
          name: "Is Kekulama Eco Cabana suitable for honeymoons and romantic couples?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes, Kekulama is designed as a secluded romantic nature retreat for couples and honeymooners with private A-frame timber lofts, tea estate views, birdsong mornings, and intimate verandah dining."
          }
        },
        {
          "@type": "Question",
          name: "What are the Day Out and Night Stay package rates in Galle?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Packages start from LKR 6,000/day for Day Out (Non-A/C), LKR 8,000/day for Day Out (A/C), LKR 8,000/night for Night Stay (Non-A/C), and LKR 9,000/night for Night Stay (A/C)."
          }
        },
        {
          "@type": "Question",
          name: "How far is the cabana from UNESCO Galle Fort and beaches?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Kekulama Eco Cabana is approximately 6 km (12 minutes drive) from Galle Fort, 15 minutes from Unawatuna Beach, and 20 minutes from Jungle Beach."
          }
        },
        {
          "@type": "Question",
          name: "How do I book direct for the best rate guarantee?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "You can book directly with the host via WhatsApp at +94 75 665 7000 for instant date confirmation and the lowest direct rates."
          }
        }
      ]
    }
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
        <link rel="icon" href="/favicon.ico" sizes="48x48" />
        <link rel="icon" href="/icon-48.png" sizes="48x48" type="image/png" />
        <link rel="icon" href="/icon-192.png" sizes="192x192" type="image/png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="geo.region" content="LK-31" />
        <meta name="geo.placename" content="Galle, Southern Province, Sri Lanka" />
        <meta name="geo.position" content="6.0779352;80.2623579" />
        <meta name="ICBM" content="6.0779352, 80.2623579" />
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
