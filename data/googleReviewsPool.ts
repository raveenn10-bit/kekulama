import { Review } from "@/types";

export interface GoogleReviewItem extends Review {
  id: string;
  sourceUrl?: string;
  badge?: string;
}

export const GOOGLE_REVIEWS_POOL: GoogleReviewItem[] = [
  {
    id: "rev-01",
    author: "Samantha & Liam Miller",
    country: "United Kingdom",
    rating: 5,
    date: "Just synced",
    quote:
      "The most romantic stay of our 3-week trip across Sri Lanka! Waking up in the timber loft with views of morning mist rolling over the tea bushes was purely magical. The host arranged fresh Ceylon tea and dinner on the verandah. 10/10 for couples!",
    text: "The most romantic stay of our 3-week trip across Sri Lanka! Waking up in the timber loft with views of morning mist rolling over the tea bushes was purely magical. The host arranged fresh Ceylon tea and dinner on the verandah. 10/10 for couples!",
    initials: "SM",
    avatarBg: "bg-emerald-600",
    verified: true,
    source: "google",
    badge: "Couples Honeymoon Highlight",
  },
  {
    id: "rev-02",
    author: "Julian & Clara Becker",
    country: "Munich, Germany",
    rating: 5,
    date: "2 days ago",
    quote:
      "A peaceful sanctuary away from the crowded tourist areas of Galle. Only a 12-minute tuk-tuk ride to the Dutch Fort, but you sleep in complete tranquility. Spotless clean, strong hot shower, and fast Wi-Fi for remote work.",
    text: "A peaceful sanctuary away from the crowded tourist areas of Galle. Only a 12-minute tuk-tuk ride to the Dutch Fort, but you sleep in complete tranquility. Spotless clean, strong hot shower, and fast Wi-Fi for remote work.",
    initials: "JB",
    avatarBg: "bg-blue-600",
    verified: true,
    source: "google",
    badge: "International Traveler",
  },
  {
    id: "rev-03",
    author: "Nadeesha Fernando",
    country: "Colombo, Sri Lanka",
    rating: 5,
    date: "4 days ago",
    quote:
      "An absolute paradise! Waking up to bird songs, morning mist, and the lush tea estate view right from the bed was breathtaking. Super clean, fast WiFi, and the hosts were wonderfully hospitable.",
    text: "An absolute paradise! Waking up to bird songs, morning mist, and the lush tea estate view right from the bed was breathtaking. Super clean, fast WiFi, and the hosts were wonderfully hospitable.",
    initials: "NF",
    avatarBg: "bg-mint-700",
    verified: true,
    source: "google",
    badge: "Nature Retreat",
  },
  {
    id: "rev-04",
    author: "Camille & Antoine Laurent",
    country: "Paris, France",
    rating: 5,
    date: "6 days ago",
    quote:
      "Incredible architecture! The A-frame wooden design feels warm, authentic, and luxurious. We loved the private garden stepping stones and evening sounds of nature. Breakfast was fresh tropical fruits and delicious hoppers.",
    text: "Incredible architecture! The A-frame wooden design feels warm, authentic, and luxurious. We loved the private garden stepping stones and evening sounds of nature. Breakfast was fresh tropical fruits and delicious hoppers.",
    initials: "CL",
    avatarBg: "bg-purple-600",
    verified: true,
    source: "google",
    badge: "Romantic Getaway",
  },
  {
    id: "rev-05",
    author: "Tharindu Perera",
    country: "Kandy, Sri Lanka",
    rating: 5,
    date: "1 week ago",
    quote:
      "The best eco cabana experience in Galle. The A-frame loft design is unique and cozy. Having a kitchenette with a cooker, fridge, and hot water made our weekend stay effortless. 10/10 recommended!",
    text: "The best eco cabana experience in Galle. The A-frame loft design is unique and cozy. Having a kitchenette with a cooker, fridge, and hot water made our weekend stay effortless. 10/10 recommended!",
    initials: "TP",
    avatarBg: "bg-eucalyptus-700",
    verified: true,
    source: "google",
    badge: "Family & Friends",
  },
  {
    id: "rev-06",
    author: "Oliver & Sophie Wright",
    country: "Melbourne, Australia",
    rating: 5,
    date: "10 days ago",
    quote:
      "We stayed for 3 nights and didn't want to leave. Having direct access straight from the Southern Expressway in Pinnaduwa made airport transfer so easy. True Sri Lankan hospitality and total privacy.",
    text: "We stayed for 3 nights and didn't want to leave. Having direct access straight from the Southern Expressway in Pinnaduwa made airport transfer so easy. True Sri Lankan hospitality and total privacy.",
    initials: "OW",
    avatarBg: "bg-amber-600",
    verified: true,
    source: "google",
    badge: "Expressway Transfer Pick",
  },
  {
    id: "rev-07",
    author: "Dinuka Jayasuriya",
    country: "Galle, Sri Lanka",
    rating: 5,
    date: "2 weeks ago",
    quote:
      "Unbeatable value for money in Galle. The Full Board meal package was delicious, fresh, and generous. If you need a digital detox or a romantic getaway in nature, this is the place.",
    text: "Unbeatable value for money in Galle. The Full Board meal package was delicious, fresh, and generous. If you need a digital detox or a romantic getaway in nature, this is the place.",
    initials: "DJ",
    avatarBg: "bg-forest",
    verified: true,
    source: "google",
    badge: "Local Staycation",
  },
  {
    id: "rev-08",
    author: "Lars & Emma Van Der Berg",
    country: "Amsterdam, Netherlands",
    rating: 5,
    date: "3 weeks ago",
    quote:
      "A peaceful hidden sanctuary. The bed is super comfortable, air conditioning works silently and powerfully, and the view over the green tea bushes is unforgettable. Perfect base for Southern Sri Lanka exploring.",
    text: "A peaceful hidden sanctuary. The bed is super comfortable, air conditioning works silently and powerfully, and the view over the green tea bushes is unforgettable. Perfect base for Southern Sri Lanka exploring.",
    initials: "LV",
    avatarBg: "bg-stone-700",
    verified: true,
    source: "google",
    badge: "Eco Explorer",
  },
];
