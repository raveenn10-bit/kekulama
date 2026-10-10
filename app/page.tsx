import dynamic from "next/dynamic";
import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Packages from "@/components/sections/Packages";

// Dynamically imported background systems & below-the-fold modules for blazing fast first-load JS
const DynamicSky = dynamic(() => import("@/components/ui/DynamicSky"), {
  ssr: false,
});

const AmbientAudioPlayer = dynamic(
  () => import("@/components/ui/AmbientAudioPlayer"),
  {
    ssr: false,
  }
);

const RealtimeBookingTable = dynamic(
  () => import("@/components/sections/RealtimeBookingTable")
);
const Amenities = dynamic(() => import("@/components/sections/Amenities"));
const Gallery = dynamic(() => import("@/components/sections/Gallery"));
const Experiences = dynamic(() => import("@/components/sections/Experiences"));
const LocationGuide = dynamic(() => import("@/components/sections/LocationGuide"));
const Reviews = dynamic(() => import("@/components/sections/Reviews"));
const FAQ = dynamic(() => import("@/components/sections/FAQ"));
const CTA = dynamic(() => import("@/components/sections/CTA"));
const Contact = dynamic(() => import("@/components/sections/Contact"));

export default function Home() {
  return (
    <>
      <DynamicSky />
      <AmbientAudioPlayer />
      <Hero />
      <About />
      <Packages />
      <RealtimeBookingTable />
      <Amenities />
      <Gallery />
      <Experiences />
      <LocationGuide />
      <Reviews />
      <FAQ />
      <CTA />
      <Contact />
    </>
  );
}
