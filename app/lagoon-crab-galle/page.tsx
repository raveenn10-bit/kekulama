import type { Metadata } from "next";
import LagoonCrabExperience from "@/components/lagoon-crab/LagoonCrabExperience";

const url = "https://www.kekulamaecocabanagalle.com/lagoon-crab-galle";

export const metadata: Metadata = {
  title: "Lagoon Crab Galle | Sri Lankan Crab Experience at Kekulama",
  description: "Enquire about a Sri Lankan lagoon crab dining experience during your private Kekulama Eco Cabana stay in Pinnaduwa, Galle. Ask for availability and today's price.",
  keywords: ["lagoon crab galle", "sri lankan crab curry galle", "crab dining experience galle", "romantic dinner galle", "kekulama eco cabana dining"],
  alternates: { canonical: url },
  openGraph: { title: "Sri Lankan Lagoon Crab Experience in Galle | Kekulama", description: "A private Sri Lankan crab dining arrangement to enquire about during your Kekulama stay in Pinnaduwa, Galle.", url, type: "website", images: [{ url: "/images/lagoon-crab/lagoon-crab-hero.webp", width: 1672, height: 941, alt: "Illustrative Sri Lankan lagoon crab curry presentation" }] },
  twitter: { card: "summary_large_image", title: "Lagoon Crab Galle | Kekulama Eco Cabana", description: "Enquire about availability, serving details and today's price for a Sri Lankan lagoon crab experience.", images: ["/images/lagoon-crab/lagoon-crab-hero.webp"] },
};

const faqs = [
  { question: "Is lagoon crab available every day?", answer: "Availability can vary. Contact the Kekulama host before your stay to confirm current availability, serving details and today's price." },
  { question: "Is the crab meal included in every cabana package?", answer: "No. The lagoon crab experience is an optional dining enquiry and must be discussed and confirmed separately with the host." },
  { question: "Can I request lagoon crab for a romantic stay?", answer: "You may ask the host about arranging it alongside a confirmed couple or honeymoon stay. The exact setup is subject to availability and confirmation." },
  { question: "Is Kekulama located beside a lagoon?", answer: "No. Kekulama Eco Cabana is in Pinnaduwa, Galle, in a green tea-garden setting. Lagoon crab describes the culinary experience, not the property location." },
];

const jsonLd = { "@context": "https://schema.org", "@graph": [
  { "@type": "WebPage", "@id": `${url}#webpage`, url, name: "Lagoon Crab Galle", description: "Sri Lankan lagoon crab dining enquiries during a Kekulama Eco Cabana stay in Pinnaduwa, Galle.", isPartOf: { "@id": "https://www.kekulamaecocabanagalle.com/#website" }, about: { "@id": "https://www.kekulamaecocabanagalle.com/#business" }, primaryImageOfPage: { "@type": "ImageObject", url: "https://www.kekulamaecocabanagalle.com/images/lagoon-crab/lagoon-crab-hero.webp", caption: "Illustrative Sri Lankan lagoon crab curry presentation" } },
  { "@type": "FAQPage", mainEntity: faqs.map((faq) => ({ "@type": "Question", name: faq.question, acceptedAnswer: { "@type": "Answer", text: faq.answer } })) },
  { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: "https://www.kekulamaecocabanagalle.com" }, { "@type": "ListItem", position: 2, name: "Lagoon Crab Galle", item: url }] },
] };

export default function LagoonCrabGallePage() {
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} /><LagoonCrabExperience /></>;
}
