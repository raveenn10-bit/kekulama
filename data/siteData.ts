import { SiteData } from "@/types";

export const siteData: SiteData = {
  brand: {
    name: "Kekulama Eco Cabana",
    tagline: "Your sustainable escape in nature's lap",
    description:
      "An idyllic escape that blends sustainability with comfort. Set amidst breathtaking landscapes, this eco-friendly haven features charming cabanas crafted from natural materials.",
    location: "Pinnaduwa, Galle",
  },

  nav: [
    { label: "Home", name: "Home", href: "#home" },
    { label: "About", name: "About", href: "#about" },
    { label: "Packages", name: "Packages", href: "#packages" },
    { label: "Amenities", name: "Amenities", href: "#amenities" },
    { label: "Gallery", name: "Gallery", href: "#gallery" },
    { label: "Experiences", name: "Experiences", href: "#experiences" },
    { label: "Contact", name: "Contact", href: "#contact" },
  ],

  hero: {
    badge: "Pinnaduwa, Galle · Sri Lanka",
    headline: "Disconnect & Recharge at",
    highlightWord: "Kekulama",
    subtitle:
      "Waking up to bird songs, lush green views, and zero city noise. Eco cabanas nestled among tea estates in the heart of southern Sri Lanka.",
    stats: [
      { value: "100%", label: "Recommended" },
      { value: "19+", label: "5★ Reviews" },
      { value: "12K", label: "Community" },
    ],
  },

  about: {
    headline: "Built from the land it",
    highlight: "sits in",
    paragraphs: [
      "Kekulama Eco Cabana is an idyllic escape that blends sustainability with comfort. Set amidst breathtaking tea estates and lush landscapes, our eco-friendly haven features charming cabanas crafted from natural materials.",
      "Each cabana offers a private retreat with modern amenities, surrounded by nature. The perfect place to disconnect from the world and reconnect with yourself.",
    ],
    features: [
      {
        icon: "Home",
        title: "Eco Cabanas",
        description: "A-frame cabanas with loft bedrooms and panoramic views",
      },
      {
        icon: "Leaf",
        title: "Tea Estate Views",
        description: "Wake up to rolling green tea plantations all around",
      },
      {
        icon: "Wifi",
        title: "Modern Comfort",
        description: "Smart TVs, hot water, kitchen — nature meets convenience",
      },
    ],
    image: "/images/cabana-garden.jpg",
  },

  packages: [
    {
      name: "Day Out — Non A/C",
      price: "6,000",
      unit: "day (room only)",
      features: ["Room access", "Garden views", "Basic amenities", "Tea & coffee"],
    },
    {
      name: "Day Out — A/C",
      price: "8,000",
      unit: "day",
      features: [
        "Air conditioned room",
        "Garden views",
        "Full amenities",
        "Tea & coffee",
      ],
    },
    {
      name: "Night Stay — Non A/C",
      price: "8,000",
      unit: "night",
      features: [
        "Overnight stay",
        "Garden views",
        "Basic amenities",
        "Tea & coffee",
      ],
    },
    {
      name: "Night Stay — A/C",
      price: "9,000",
      unit: "night",
      features: [
        "Air conditioned room",
        "Overnight stay",
        "Full amenities",
        "Tea & coffee",
      ],
    },
    {
      name: "Bed & Breakfast (B/B)",
      price: "11,000",
      unit: "night",
      timing: "2:00 PM – 10:00 AM",
      popular: true,
      features: [
        "A/C room overnight",
        "Breakfast included",
        "Full amenities",
        "Tea estate views",
      ],
    },
    {
      name: "Half Board (H/B)",
      price: "13,000",
      unit: "night",
      timing: "2:00 PM – 10:00 AM",
      features: [
        "A/C room overnight",
        "Breakfast + Dinner",
        "Full amenities",
        "Tea estate views",
      ],
    },
    {
      name: "Full Board (F/B)",
      price: "15,000",
      unit: "night",
      timing: "2:00 PM – 10:00 AM",
      features: [
        "A/C room overnight",
        "Breakfast, Lunch & Dinner",
        "Full amenities",
        "Tea estate views",
      ],
    },
  ],

  amenities: [
    { icon: "Bath", label: "Bathroom Items" },
    { icon: "Shirt", label: "Fresh Towels" },
    { icon: "Coffee", label: "Tea & Coffee 🫖" },
    { icon: "Tv", label: '45" Smart TV' },
    { icon: "Speaker", label: "JBL Speaker" },
    { icon: "Refrigerator", label: "Refrigerator" },
    { icon: "Droplets", label: "Hot Water & Pump" },
    { icon: "CookingPot", label: "Cooker" },
    { icon: "Wind", label: "Hair Dryer" },
    { icon: "TreePine", label: "Tea Estate View" },
  ],

  gallery: [
    { src: "/images/hero.jpg", alt: "Cabana and tea estate", span: "large" },
    { src: "/images/cabana-front.jpg", alt: "Cabana front view" },
    { src: "/images/loft-bedroom.jpg", alt: "Loft bedroom with panoramic garden view", span: "tall" },
    { src: "/images/entrance.jpg", alt: "Property entrance & signage" },
    { src: "/images/cabana-side.jpg", alt: "Cabana side verandah with garden" },
    { src: "/images/interior-lamps.jpg", alt: "Interior living area with pendant lamps" },
    { src: "/images/cabana-trees.jpg", alt: "Cabana nestled among trees", span: "wide" },
    { src: "/images/kitchenette.jpg", alt: "Kitchenette area with cooker" },
    { src: "/images/interior-kitchen.jpg", alt: "Kitchen counter and loft stairs" },
    { src: "/images/door-vines.jpg", alt: "Entrance doorway with climbing vines" },
    { src: "/images/cabana-garden.jpg", alt: "Garden pathway and lawn", span: "wide" },
    { src: "/images/interior-living.jpg", alt: "Wide living room with rug & sofa" },
  ],

  experiences: [
    {
      icon: "Mountain",
      title: "Tea Estate Walks",
      description:
        "Stroll through the surrounding emerald tea plantations at golden hour. Unmatched tranquility right at your doorstep.",
      distance: "On property",
      season: "Year round",
    },
    {
      icon: "Landmark",
      title: "Galle Fort Ramparts",
      description:
        "UNESCO World Heritage Dutch fort, lighthouse, artisan boutiques, and sunset rampart walks just a quick ride away.",
      distance: "15 min drive",
      season: "Year round",
    },
    {
      icon: "Waves",
      title: "Southern Coast Beaches",
      description:
        "Golden sand beaches of Unawatuna, Thalpe, and Mirissa for swimming, surfing, and coastal dining.",
      distance: "20 min drive",
      season: "Year round",
    },
    {
      icon: "Turtle",
      title: "Turtle Conservation Project",
      description:
        "Visit local sea turtle sanctuaries dedicated to rescuing and nurturing endangered marine turtles.",
      distance: "25 min drive",
      season: "Year round",
    },
  ],

  reviews: [
    {
      quote:
        "The most peaceful place we stayed in Sri Lanka. Waking up to bird songs and the tea estate views was pure therapy. The cabana had every amenity we needed!",
      text: "The most peaceful place we stayed in Sri Lanka. Waking up to bird songs and the tea estate views was pure therapy. The cabana had every amenity we needed!",
      author: "Sarah & David",
      country: "Australia",
      rating: 5,
    },
    {
      quote:
        "Such a unique architectural gem! The A-frame loft bedroom with the triangular garden view was breathtaking. Amazing hospitality and great food.",
      text: "Such a unique architectural gem! The A-frame loft bedroom with the triangular garden view was breathtaking. Amazing hospitality and great food.",
      author: "Marco & Elena",
      country: "Italy",
      rating: 5,
    },
    {
      quote:
        "A true sanctuary to disconnect and recharge. Zero traffic noise, just lush greenery, morning mist, and fresh tea breeze. We will definitely return!",
      text: "A true sanctuary to disconnect and recharge. Zero traffic noise, just lush greenery, morning mist, and fresh tea breeze. We will definitely return!",
      author: "Kasun & Sanduni",
      country: "Sri Lanka",
      rating: 5,
    },
  ],

  contact: {
    phone: "075 665 7000",
    phoneRaw: "+94756657000",
    phoneDisplay: "075 665 7000",
    whatsapp: "+94 75 665 7000",
    whatsappRaw: "94756657000",
    email: "kekulamaecocabana@gmail.com",
    address: "416/1, Pinnaduwa, Galle, Sri Lanka 800034",
    mapCoords: { lat: 6.0779352, lng: 80.2623579 },
    social: {
      facebook: "https://www.facebook.com/Kekulamaecocabanagalle",
      instagram: "https://instagram.com/kekulamaecocabanagalle",
      tiktok: "https://tiktok.com/@kekulama.eco.caba1",
      airbnb: "https://www.airbnb.com/rooms/1549628955214353080",
    },
  },

  hours: [
    { label: "Check-in", time: "From 2:00 PM" },
    { label: "Check-out", time: "By 10:00 AM" },
    { label: "Host Availability", time: "Always available" },
  ],
};
