import { unstable_noStore as noStore } from "next/cache";
import HeroSection from "@/components/sections/HeroSection";
import AboutPreview from "@/components/sections/AboutPreview";
import OfficeGallery from "@/components/sections/OfficeGallery";
import ProcessSteps from "@/components/sections/ProcessSteps";
import ServicesPreview from "@/components/sections/ServicesPreview";
import CtaSection from "@/components/sections/CtaSection";

export const dynamic = "force-dynamic";

export default function Home() {
  noStore();
  return (
    <>
      <HeroSection />
      {/* Curved transition from dark hero to light about */}
      <div className="bg-stone-50 -mt-1">
        <svg viewBox="0 0 1440 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full" preserveAspectRatio="none">
          <path d="M0 0L60 4C120 8 240 16 360 21.3C480 27 600 30 720 28C840 26 960 20 1080 17.3C1200 15 1320 16 1380 16.7L1440 17V48H1380C1320 48 1200 48 1080 48C960 48 840 48 720 48C600 48 480 48 360 48C240 48 120 48 60 48H0V0Z" fill="#1c1917"/>
        </svg>
      </div>
      <AboutPreview />
      <OfficeGallery />
      <ProcessSteps />
      <ServicesPreview />
      <CtaSection />
    </>
  );
}
