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
    "kekulama",
  ],
  openGraph: {
    title: "Kekulama Eco Cabana — Luxury Nature Sanctuary in Galle",
    description:
      "Eco-luxury cabanas nestled among rolling tea estates in Pinnaduwa, Galle. Sculptural timber architecture & pure serenity.",
    url: "https://kekulamaecocabana.com",
    siteName: "Kekulama Eco Cabana",
    locale: "en_US",
    type: "website",
    images: [{ url: "/images/hero.jpg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kekulama Eco Cabana — Luxury Nature Sanctuary",
    description: "Eco-luxury timber cabanas among tea estates in Galle, Sri Lanka.",
  },
  icons: {
    icon: "/images/logo.jpg",
    apple: "/images/logo.jpg",
  },
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
      <body className="font-body antialiased bg-eucalyptus-50 text-sage-900 overflow-x-hidden selection:bg-mint-200 selection:text-forest-dark">
        <Navbar />
        <main>{children}</main>
        <Footer />
        <FloatingWhatsApp />
      </body>
    </html>
  );
}
