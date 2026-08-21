import type { Metadata } from "next";
import { DM_Serif_Display, DM_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navigation/Navbar";
import Footer from "@/components/sections/Footer";
import FloatingWhatsApp from "@/components/ui/FloatingWhatsApp";

const displayFont = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
  display: "swap",
});

const bodyFont = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://kekulamaecocabana.com"),
  title: "Kekulama Eco Cabana — Eco Retreat in Galle, Sri Lanka",
  description:
    "Your sustainable escape in nature's lap. Eco-friendly cabanas nestled among tea estates in Pinnaduwa, Galle. Book your stay & reconnect with the wild.",
  keywords: [
    "eco cabana",
    "galle",
    "sri lanka",
    "eco retreat",
    "tea estate",
    "pinnaduwa",
    "nature stay",
    "kekulama",
  ],
  openGraph: {
    title: "Kekulama Eco Cabana — Eco Retreat in Galle, Sri Lanka",
    description:
      "Eco-friendly cabanas nestled among tea estates in Pinnaduwa, Galle. Disconnect & recharge.",
    url: "https://kekulamaecocabana.com",
    siteName: "Kekulama Eco Cabana",
    locale: "en_US",
    type: "website",
    images: [{ url: "/images/hero.jpg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kekulama Eco Cabana",
    description: "Eco-friendly cabanas among tea estates in Galle, Sri Lanka.",
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
      className={`${displayFont.variable} ${bodyFont.variable}`}
      suppressHydrationWarning
    >
      <body className="font-body antialiased bg-sage-50 text-sage-900 overflow-x-hidden">
        <Navbar />
        <main>{children}</main>
        <Footer />
        <FloatingWhatsApp />
      </body>
    </html>
  );
}
