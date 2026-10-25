import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Direct Cabana Reservation | Best Rates & Instant Booking",
  description:
    "Check live availability and book your romantic A-frame timber eco cabana in Galle, Sri Lanka. Guaranteed best direct prices, instant confirmation, no booking fees, and 24/7 host concierge.",
  keywords: [
    "book cabana galle",
    "kekulama eco cabana booking",
    "galle cabana reservations",
    "couples day out booking galle",
    "honeymoon cabana booking sri lanka",
    "direct booking eco cabana galle",
    "pinnaduwa cabana reservation",
    "galle private cabana night stay",
    "day out package booking galle",
  ],
  alternates: {
    canonical: "https://www.kekulamaecocabanagalle.com/book",
  },
  openGraph: {
    title: "Direct Cabana Reservation | Kekulama Eco Cabana Galle",
    description:
      "Reserve your secluded romantic retreat in the tea hills of Galle. Best direct rates, instant confirmation, and authentic Ceylon hospitality.",
    url: "https://www.kekulamaecocabanagalle.com/book",
    siteName: "Kekulama Eco Cabana Galle",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/images/hero.jpg",
        width: 1200,
        height: 630,
        alt: "Book Kekulama Eco Cabana Galle",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Direct Cabana Reservation | Kekulama Eco Cabana Galle",
    description:
      "Reserve your secluded romantic retreat in the tea hills of Galle with instant confirmation and best rate guarantee.",
    images: ["/images/hero.jpg"],
  },
};

export default function BookLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
