import dynamic from "next/dynamic";
import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Packages from "@/components/sections/Packages";
import Amenities from "@/components/sections/Amenities";
import Gallery from "@/components/sections/Gallery";
import Experiences from "@/components/sections/Experiences";
import Reviews from "@/components/sections/Reviews";
import CTA from "@/components/sections/CTA";
import Contact from "@/components/sections/Contact";

// Dynamically imported background systems for lightning-fast initial page paint
const DynamicSky = dynamic(() => import("@/components/ui/DynamicSky"), {
  ssr: false,
});

const AmbientParticles = dynamic(
  () => import("@/components/ui/AmbientParticles"),
  {
    ssr: false,
  }
);

const AmbientAudioPlayer = dynamic(
  () => import("@/components/ui/AmbientAudioPlayer"),
  {
    ssr: false,
  }
);

export default function Home() {
  return (
    <>
      <DynamicSky />
      <AmbientParticles />
      <AmbientAudioPlayer />
      <Hero />
      <About />
      <Packages />
      <Amenities />
      <Gallery />
      <Experiences />
      <Reviews />
      <CTA />
      <Contact />
    </>
  );
}
