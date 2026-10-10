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
    { label: "Live Rates", name: "Live Rates", href: "#booking" },
    { label: "Amenities", name: "Amenities", href: "#amenities" },
    { label: "Gallery", name: "Gallery", href: "#gallery" },
    { label: "Experiences", name: "Experiences", href: "#experiences" },
    { label: "Location", name: "Location", href: "#location" },
    { label: "Reviews", name: "Reviews", href: "#reviews" },
    { label: "FAQ", name: "FAQ", href: "#faq" },
    { label: "Contact", name: "Contact", href: "#contact" },
  ],

  hero: {
    badge: "Pinnaduwa, Galle · Sri Lanka",
    headline: "Disconnect & Recharge at",
    highlightWord: "Kekulama",
    subtitle:
      "Waking up to bird songs, lush green views, and zero city noise. Eco cabanas nestled among tea estates in the heart of southern Sri Lanka.",
    stats: [
      { value: "5.0 ★", label: "Google Rating" },
      { value: "100%", label: "Recommended" },
      { value: "12K+", label: "Social Followers" },
    ],
  },

  about: {
    headline: "Built from the land it",
    highlight: "sits in",
    paragraphs: [
      "Kekulama Eco Cabana is an idyllic retreat that blends sustainability with refined comfort. Set amidst lush tea hills and birdsong in Pinnaduwa, our eco-haven features architecturally unique cabanas crafted from local materials.",
      "Enjoy full privacy, fresh morning estate breezes, and complete modern comfort while staying seamlessly connected with the wilderness.",
    ],
    features: [
      {
        icon: "Home",
        title: "A-Frame Eco Cabanas",
        description: "Dual-level timber cabanas with loft bedrooms and panoramic nature views",
      },
      {
        icon: "Leaf",
        title: "Emerald Tea Estate Views",
        description: "Surrounded directly by tea plantations and indigenous tropical flora",
      },
      {
        icon: "Wifi",
        title: "Thoughtful Modern Amenities",
        description: "Smart TV, JBL sound, kitchenette, cooker, refrigerator & hot water pump",
      },
    ],
    image: "/images/cabana-garden.jpg",
  },

  packages: [
    {
      name: "Day Out — Non A/C",
      price: "6,000",
      unit: "day (room only)",
      features: ["Room access", "Tea garden views", "Kitchenette access", "Tea & coffee 🫖"],
    },
    {
      name: "Day Out — A/C",
      price: "8,000",
      unit: "day",
      features: [
        "Air-conditioned cabana",
        "Garden views & verandah",
        "Full smart amenities",
        "Tea & coffee 🫖",
      ],
    },
    {
      name: "Night Stay — Non A/C",
      price: "8,000",
      unit: "night",
      features: [
        "Overnight stay in loft",
        "Nature breeze & garden",
        "Smart TV & JBL audio",
        "Hot water with pressure pump",
      ],
    },
    {
      name: "Night Stay — A/C",
      price: "9,000",
      unit: "night",
      features: [
        "Air-conditioned cabana",
        "Overnight stay in loft",
        "Full smart amenities & TV",
        "Hot water & refrigerator",
      ],
    },
    {
      name: "Bed & Breakfast (B/B)",
      price: "11,000",
      unit: "night",
      timing: "2:00 PM – 10:00 AM",
      popular: true,
      badgeColor: "mint",
      features: [
        "A/C cabana overnight stay",
        "Authentic Sri Lankan breakfast",
        "Full amenities & loft view",
        "Tea estate morning tour",
      ],
    },
    {
      name: "Half Board (H/B)",
      price: "13,000",
      unit: "night",
      timing: "2:00 PM – 10:00 AM",
      features: [
        "A/C cabana overnight stay",
        "Breakfast + Curated dinner",
        "Full amenities & loft view",
        "Tea estate morning tour",
      ],
    },
    {
      name: "Full Board (F/B)",
      price: "15,000",
      unit: "night",
      timing: "2:00 PM – 10:00 AM",
      features: [
        "A/C cabana overnight stay",
        "Breakfast, Lunch & Dinner",
        "Full amenities & loft view",
        "All-day tea & coffee service",
      ],
    },
  ],

  amenities: [
    { icon: "Bath", label: "Bathroom Items", category: "Essentials" },
    { icon: "Shirt", label: "Fresh Towels", category: "Essentials" },
    { icon: "Coffee", label: "Tea & Coffee 🫖", category: "Refreshment" },
    { icon: "Tv", label: '45" Smart TV', category: "Entertainment" },
    { icon: "Speaker", label: "JBL Speaker", category: "Entertainment" },
    { icon: "Refrigerator", label: "Refrigerator", category: "Kitchen" },
    { icon: "Droplets", label: "Hot Water & Pump", category: "Comfort" },
    { icon: "CookingPot", label: "Cooker", category: "Kitchen" },
    { icon: "Wind", label: "Hair Dryer", category: "Essentials" },
    { icon: "TreePine", label: "Tea Estate View", category: "Nature" },
  ],

  gallery: [
    { src: "/images/hero.jpg", alt: "Cabana & Tea Estate Panorama", span: "large", category: "Exterior" },
    { src: "/images/cabana-front.jpg", alt: "Cabana Front & Pathway", category: "Exterior" },
    { src: "/images/loft-bedroom.jpg", alt: "A-Frame Loft Bedroom Window", span: "tall", category: "Interior" },
    { src: "/images/entrance.jpg", alt: "Estate Gateway & Signboard", category: "Property" },
    { src: "/images/cabana-side.jpg", alt: "Verandah with Climbing Vines", category: "Exterior" },
    { src: "/images/interior-lamps.jpg", alt: "Living Lounge with Warm Lamps", category: "Interior" },
    { src: "/images/cabana-trees.jpg", alt: "Lush Hillside Canopy", span: "wide", category: "Nature" },
    { src: "/images/kitchenette.jpg", alt: "Equipped Kitchenette Area", category: "Interior" },
    { src: "/images/interior-kitchen.jpg", alt: "Kitchen Counter & Loft Stairs", category: "Interior" },
    { src: "/images/door-vines.jpg", alt: "Rustic Entrance Doorway", category: "Exterior" },
    { src: "/images/cabana-garden.jpg", alt: "Stone Path & Garden Lawn", span: "wide", category: "Garden" },
    { src: "/images/interior-living.jpg", alt: "Spacious Living Area with Rug", category: "Interior" },
  ],

  experiences: [
    {
      icon: "Mountain",
      title: "Tea Estate Golden Hour Walk",
      description:
        "Wander through terraced emerald tea bushes at sunrise and sunset. Pure mountain air and tranquil pathways.",
      distance: "On Property",
      season: "Year-round",
      badge: "Must Try",
    },
    {
      icon: "Landmark",
      title: "Historic Galle Fort",
      description:
        "Explore cobblestone streets, Dutch ramparts, ocean bastions, charming cafes, and the iconic lighthouse.",
      distance: "15 min drive",
      season: "Year-round",
      badge: "UNESCO Heritage",
    },
    {
      icon: "Waves",
      title: "Unawatuna & Thalpe Beaches",
      description:
        "Crystal clear waters, natural rock pools, surfing spots, and beachfront dining along the southern coast.",
      distance: "20 min drive",
      season: "Year-round",
      badge: "Coastal Fun",
    },
    {
      icon: "Turtle",
      title: "Marine Turtle Sanctuary",
      description:
        "Support local marine conservation by visiting sea turtle rescue projects along the scenic coastline.",
      distance: "25 min drive",
      season: "Year-round",
      badge: "Eco Tour",
    },
  ],

  googleRatingStats: {
    score: 5.0,
    totalReviews: 19,
    recommendPercent: 100,
  },

  reviews: [
    {
      quote:
        "An absolute paradise! Waking up to bird songs, morning mist, and the lush tea estate view right from the bed was breathtaking. Super clean, fast WiFi, and the hosts were wonderfully hospitable.",
      text: "An absolute paradise! Waking up to bird songs, morning mist, and the lush tea estate view right from the bed was breathtaking. Super clean, fast WiFi, and the hosts were wonderfully hospitable.",
      author: "Nadeesha Fernando",
      country: "Colombo, Sri Lanka",
      rating: 5,
      date: "2 weeks ago",
      initials: "NF",
      avatarBg: "bg-mint-500",
      verified: true,
      source: "google",
    },
    {
      quote:
        "The best eco cabana experience in Galle. The A-frame loft design is unique and cozy. Having a kitchenette with a cooker, fridge, and hot water made our weekend stay effortless. 10/10 recommended!",
      text: "The best eco cabana experience in Galle. The A-frame loft design is unique and cozy. Having a kitchenette with a cooker, fridge, and hot water made our weekend stay effortless. 10/10 recommended!",
      author: "Tharindu Perera",
      country: "Kandy, Sri Lanka",
      rating: 5,
      date: "1 month ago",
      initials: "TP",
      avatarBg: "bg-eucalyptus-600",
      verified: true,
      source: "google",
    },
    {
      quote:
        "Zero city noise, pure peace. Loved relaxing on the verandah surrounded by tea plants. The 45' smart TV and JBL speaker were great touches for movie night. Will definitely return with friends!",
      text: "Zero city noise, pure peace. Loved relaxing on the verandah surrounded by tea plants. The 45' smart TV and JBL speaker were great touches for movie night. Will definitely return with friends!",
      author: "Samantha & Liam",
      country: "United Kingdom",
      rating: 5,
      date: "3 weeks ago",
      initials: "SL",
      avatarBg: "bg-bark",
      verified: true,
      source: "google",
    },
    {
      quote:
        "Unbeatable value for money in Galle. The Full Board meal package was delicious, fresh, and generous. If you need a digital detox or a romantic getaway in nature, this is the place.",
      text: "Unbeatable value for money in Galle. The Full Board meal package was delicious, fresh, and generous. If you need a digital detox or a romantic getaway in nature, this is the place.",
      author: "Dinuka Jayasuriya",
      country: "Galle, Sri Lanka",
      rating: 5,
      date: "2 months ago",
      initials: "DJ",
      avatarBg: "bg-forest",
      verified: true,
      source: "google",
    },
    {
      quote:
        "A hidden gem in Pinnaduwa! Close enough to Galle Fort yet completely isolated in serene nature. Beautiful garden landscaping with stepping stones and climbing vines. Outstanding service!",
      text: "A hidden gem in Pinnaduwa! Close enough to Galle Fort yet completely isolated in serene nature. Beautiful garden landscaping with stepping stones and climbing vines. Outstanding service!",
      author: "Elena Rostova",
      country: "Germany",
      rating: 5,
      date: "1 month ago",
      initials: "ER",
      avatarBg: "bg-mint-600",
      verified: true,
      source: "google",
    },
  ],

  contact: {
    phone: "075 665 7000",
    phoneRaw: "+94756657000",
    phoneDisplay: "075 665 7000",
    whatsapp: "+94 75 665 7000",
    whatsappRaw: "94756657000",
    email: "raveenn10@gmail.com",
    address: "416/1, Pinnaduwa, Galle, Sri Lanka 800034",
    mapCoords: { lat: 6.0779352, lng: 80.2623579 },
    googleMapsUrl: "https://maps.app.goo.gl/SjnALMB1tAHYKzkM6",
    tripadvisorUrl:
      "https://www.tripadvisor.com/Hotel_Review-g297896-d34099769-Reviews-Kekulama_Eco_Cabana-Galle_Galle_District_Southern_Province.html",
    bookingcomUrl:
      "https://www.booking.com/searchresults.html?ss=Kekulama+Eco+Cabana+Galle+Sri+Lanka",
    social: {
      facebook: "https://www.facebook.com/Kekulamaecocabanagalle",
      instagram: "https://instagram.com/kekulamaecocabanagalle",
      tiktok: "https://tiktok.com/@kekulama.eco.caba1",
      airbnb: "https://www.airbnb.com/rooms/1549628955214353080",
      tripadvisor:
        "https://www.tripadvisor.com/Hotel_Review-g297896-d34099769-Reviews-Kekulama_Eco_Cabana-Galle_Galle_District_Southern_Province.html",
      bookingcom:
        "https://www.booking.com/searchresults.html?ss=Kekulama+Eco+Cabana+Galle+Sri+Lanka",
    },
  },

  hours: [
    { label: "Check-in", time: "From 2:00 PM" },
    { label: "Check-out", time: "By 10:00 AM" },
    { label: "Host Availability", time: "Always available" },
  ],
};
