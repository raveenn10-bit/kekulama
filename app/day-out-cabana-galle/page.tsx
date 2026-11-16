import type { Metadata } from "next";
import SeoIntentPage, { SeoFaq } from "@/components/seo/SeoIntentPage";

const url = "https://www.kekulamaecocabanagalle.com/day-out-cabana-galle";

export const metadata: Metadata = {
  title: "Day Out Cabana Galle for Couples | Private A/C Escape",
  description:
    "Private couple day-out cabana in Galle from LKR 6,000; A/C couple escape LKR 8,000. Tea-garden views, kitchenette, Wi-Fi and direct booking.",
  keywords: [
    "day out cabana galle",
    "couple day out galle",
    "private day use room galle",
    "ac cabana day out galle",
    "day out packages galle for couples",
    "pinnaduwa cabana day out",
  ],
  alternates: { canonical: url },
  openGraph: {
    title: "Private Couple Day Out in Galle | Kekulama Eco Cabana",
    description: "A private A/C cabana day escape for two in the quiet tea hills of Pinnaduwa, Galle.",
    url,
    type: "website",
    images: [{
      url: "/images/couple-day-escape.webp",
      width: 1600,
      height: 900,
      alt: "Private couple day out tea setting at Kekulama Eco Cabana Galle",
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Day Out Cabana Galle for Couples | Kekulama",
    description: "Private day-out packages in Galle from LKR 6,000 with A/C option at LKR 8,000.",
    images: ["/images/couple-day-escape.webp"],
  },
};

const faqs: SeoFaq[] = [
  {
    question: "How much is a couple day out at Kekulama?",
    answer: "The Non-A/C Day Out is LKR 6,000. The private A/C Couple Day Escape is LKR 8,000 and includes the cabana's smart amenities, tea and coffee, and garden relaxation areas.",
  },
  {
    question: "What facilities are included in the A/C day-out package?",
    answer: "The A/C Couple Day Escape includes private cabana access, Starlink Wi-Fi, 45-inch Smart TV, JBL audio, kitchenette, refrigerator, hot-water shower, unlimited tea and coffee, and the complimentary M3 relaxation chair.",
  },
  {
    question: "Is Kekulama close to the Southern Expressway?",
    answer: "Yes. The cabana is about 1.5 km or two minutes from the Pinnaduwa Southern Expressway exit, making it convenient for visitors arriving from Colombo and other areas.",
  },
  {
    question: "Do I need to reserve a day-out package in advance?",
    answer: "Advance reservation is recommended because the private cabana is offered subject to availability. Dates can be checked online or confirmed directly through WhatsApp.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": `${url}#webpage`,
      url,
      name: "Day Out Cabana Galle for Couples",
      description: "Private couple day-out cabana packages in Pinnaduwa, Galle.",
      isPartOf: { "@id": "https://www.kekulamaecocabanagalle.com/#website" },
      about: { "@id": "https://www.kekulamaecocabanagalle.com/#business" },
    },
    {
      "@type": "OfferCatalog",
      name: "Kekulama Day Out Packages",
      itemListElement: [
        { "@type": "Offer", name: "Day Out Non-A/C", price: "6000", priceCurrency: "LKR", availability: "https://schema.org/InStock", url },
        { "@type": "Offer", name: "Couple Day Escape A/C", price: "8000", priceCurrency: "LKR", availability: "https://schema.org/InStock", url },
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
        { "@type": "ListItem", position: 2, name: "Day Out Cabana Galle", item: url },
      ],
    },
  ],
};

export default function DayOutCabanaGallePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SeoIntentPage
        eyebrow="Private couple day out · Galle"
        title="An unhurried day escape"
        accent="surrounded by green."
        intro="Spend a private day together inside a two-level A-frame cabana in Pinnaduwa's quiet tea hills. Choose an affordable Non-A/C stay or the complete A/C Couple Day Escape."
        heroImage="/images/couple-day-escape.webp"
        heroAlt="Private couple day-out tea setting in the garden at Kekulama Eco Cabana Galle"
        packageName="Couple Day Escape"
        price="8,000"
        priceNote="Private A/C day package; Non-A/C option LKR 6,000"
        bookingPackage="Couple Day Escape — A/C"
        features={["Private air-conditioned cabana for two", "Unlimited tea and coffee", "Starlink Wi-Fi, Smart TV and JBL audio", "Kitchenette and refrigerator", "Hot-water shower", "Complimentary M3 relaxation chair"]}
        highlights={[
          { title: "Easy access from the expressway", copy: "Kekulama is about two minutes from the Pinnaduwa Southern Expressway exit, making a private Galle day out simple to reach." },
          { title: "A real nature setting", copy: "Relax beside a working tea-garden landscape with birdsong, tropical greenery and a quiet verandah away from city traffic." },
          { title: "Comfort throughout the day", copy: "Use the A/C cabana, private bathroom, hot-water shower, kitchenette, refrigerator and entertainment facilities during your confirmed stay." },
          { title: "Clear direct rates", copy: "Choose LKR 6,000 for Non-A/C Day Out or LKR 8,000 for the A/C Couple Day Escape, subject to date availability." },
        ]}
        faqs={faqs}
        relatedHref="/honeymoon-cabana-galle"
        relatedLabel="Explore honeymoon stays"
      />
    </>
  );
}
