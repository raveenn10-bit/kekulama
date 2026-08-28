export interface NavLink {
  label: string;
  name?: string;
  href: string;
}

export interface StatItem {
  value: string;
  label: string;
}

export interface Feature {
  icon: string;
  title: string;
  description: string;
}

export interface Package {
  name: string;
  price: string;
  unit: string;
  features: string[];
  popular?: boolean;
  timing?: string;
  badgeColor?: string;
}

export interface Amenity {
  icon: string;
  label: string;
  category?: string;
}

export interface GalleryImage {
  src: string;
  alt: string;
  span?: "wide" | "tall" | "large";
  category?: string;
}

export interface Experience {
  icon: string;
  title: string;
  description: string;
  distance: string;
  season: string;
  badge?: string;
}

export interface Review {
  quote: string;
  text?: string;
  author: string;
  country: string;
  rating: number;
  date?: string;
  initials?: string;
  avatarBg?: string;
  verified?: boolean;
  source?: "google" | "airbnb" | "facebook" | "booking";
}

export interface ContactInfo {
  phone: string;
  phoneRaw: string;
  phoneDisplay: string;
  whatsapp: string;
  whatsappRaw: string;
  email: string;
  address: string;
  mapCoords: { lat: number; lng: number };
  googleMapsUrl: string;
  tripadvisorUrl?: string;
  bookingcomUrl?: string;
  social: {
    facebook: string;
    instagram: string;
    tiktok: string;
    airbnb: string;
    tripadvisor?: string;
    bookingcom?: string;
  };
}

export interface SiteData {
  brand: {
    name: string;
    tagline: string;
    description: string;
    location: string;
  };
  nav: NavLink[];
  hero: {
    badge: string;
    headline: string;
    highlightWord: string;
    subtitle: string;
    stats: StatItem[];
  };
  about: {
    headline: string;
    highlight: string;
    paragraphs: string[];
    features: Feature[];
    image: string;
  };
  packages: Package[];
  amenities: Amenity[];
  gallery: GalleryImage[];
  experiences: Experience[];
  reviews: Review[];
  googleRatingStats: {
    score: number;
    totalReviews: number;
    recommendPercent: number;
  };
  contact: ContactInfo;
  hours: { label: string; time: string }[];
}
