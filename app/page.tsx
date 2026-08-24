import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Packages from "@/components/sections/Packages";
import Amenities from "@/components/sections/Amenities";
import Gallery from "@/components/sections/Gallery";
import Experiences from "@/components/sections/Experiences";
import Reviews from "@/components/sections/Reviews";
import CTA from "@/components/sections/CTA";
import Contact from "@/components/sections/Contact";
import DynamicSky from "@/components/ui/DynamicSky";
import AmbientAudioPlayer from "@/components/ui/AmbientAudioPlayer";

export default function Home() {
  return (
    <>
      <DynamicSky />
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
