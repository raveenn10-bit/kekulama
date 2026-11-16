import type { Metadata } from "next";
import SeoIntentPage, { SeoFaq } from "@/components/seo/SeoIntentPage";

const url = "https://www.kekulamaecocabanagalle.com/honeymoon-cabana-galle";

export const metadata: Metadata = {
  title: "Honeymoon Cabana Galle | Romantic Private Stay for Two",
  description:
    "Book a private honeymoon cabana in Galle from LKR 20,000. One-night romantic stay with wine, fruit basket and room decoration; meals optional.",
  keywords: [
    "honeymoon cabana galle",
    "romantic cabana galle",
    "private honeymoon stay galle",
    "couple hotel package galle",
    "romantic getaway galle sri lanka",
    "honeymoon package galle with meals",
  ],
  alternates: { canonical: url },
  openGraph: {
    title: "Private Honeymoon Cabana in Galle | Kekulama",
    description: "A private A-frame honeymoon escape in the tea hills of Galle with romantic room styling, wine and optional meals.",
    url,
    type: "website",
    images: [{
      url: "/images/honeymoon-with-meals.webp",
      width: 1600,
      height: 900,
      alt: "Romantic honeymoon dinner inside Kekulama Eco Cabana in Galle",
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Honeymoon Cabana Galle | Kekulama Eco Cabana",
    description: "Private one-night romantic stays for two from LKR 20,000 in Pinnaduwa, Galle.",
    images: ["/images/honeymoon-with-meals.webp"],
  },
};

const faqs: SeoFaq[] = [
  {
    question: "How much is the honeymoon package in Galle?",
    answer: "The one-night honeymoon package is LKR 20,000 without meals or LKR 25,000 with meals. Both options include wine, a fruit basket and romantic room decoration.",
  },
  {
    question: "Is the cabana private for the couple?",
    answer: "Yes. The A-frame cabana is reserved as a private stay for the confirmed guests, with its own loft bedroom, bathroom, kitchenette and relaxation areas.",
  },
  {
    question: "How far is Kekulama from Galle Fort and Unawatuna?",
    answer: "Kekulama is about 6.2 km or 12 minutes from Galle Fort and around 15 minutes from Unawatuna Beach, depending on traffic.",
  },
  {
    question: "How can I reserve the romantic room setup?",
    answer: "Choose the honeymoon package through the direct booking page or message the host on WhatsApp. Romantic arrangements are confirmed with the reservation and remain subject to availability.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": `${url}#webpage`,
      url,
      name: "Honeymoon Cabana Galle",
      description: "Private romantic honeymoon cabana packages in Galle, Sri Lanka.",
      isPartOf: { "@id": "https://www.kekulamaecocabanagalle.com/#website" },
      about: { "@id": "https://www.kekulamaecocabanagalle.com/#business" },
    },
    {
      "@type": "OfferCatalog",
      name: "Kekulama Honeymoon Packages",
      itemListElement: [
        { "@type": "Offer", name: "Honeymoon Package Without Meals", price: "20000", priceCurrency: "LKR", availability: "https://schema.org/InStock", url },
        { "@type": "Offer", name: "Honeymoon Package With Meals", price: "25000", priceCurrency: "LKR", availability: "https://schema.org/InStock", url },
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: { "@type": "Answer", text: faq.answer },
      })),
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://www.kekulamaecocabanagalle.com" },
        { "@type": "ListItem", position: 2, name: "Honeymoon Cabana Galle", item: url },
      ],
    },
  ],
};

export default function HoneymoonCabanaGallePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SeoIntentPage
        eyebrow="Private honeymoon cabana · Galle"
        title="A private honeymoon stay"
        accent="made for two."
        intro="Escape to a secluded two-level A-frame cabana in the tea hills of Pinnaduwa, just minutes from Galle Fort and Unawatuna. Choose a thoughtfully prepared romantic stay with or without meals."
        heroImage="/images/honeymoon-with-meals.webp"
        heroAlt="Candlelit romantic dinner for two inside Kekulama Eco Cabana Galle"
        packageName="Honeymoon Escape"
        price="20,000"
        priceNote="One night · without meals; with-meals option LKR 25,000"
        bookingPackage="Honeymoon Escape — Without Meals"
        features={["One-night private romantic stay", "Wine and fruit basket", "Romantic room decoration", "Private A-frame loft bedroom", "A/C, hot-water shower and kitchenette", "With-meals option available for LKR 25,000"]}
        highlights={[
          { title: "A secluded setting near Galle", copy: "Stay among tea hills and tropical greenery in Pinnaduwa while remaining about 12 minutes from Galle Fort and 15 minutes from Unawatuna Beach." },
          { title: "Romantic details prepared before arrival", copy: "Your selected package can include room decoration, wine and a fruit basket, all confirmed directly with the reservation." },
          { title: "Private A-frame comfort", copy: "Enjoy a two-level timber cabana with a loft bedroom, private bathroom, kitchenette, Smart TV, JBL audio and Starlink Wi-Fi." },
          { title: "Direct booking support", copy: "Check dates online or speak directly with the Kekulama host on WhatsApp for package availability and arrangement details." },
        ]}
        faqs={faqs}
        relatedHref="/day-out-cabana-galle"
        relatedLabel="Explore couple day out"
      />
    </>
  );
}
