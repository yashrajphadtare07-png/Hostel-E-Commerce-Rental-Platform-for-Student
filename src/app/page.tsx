import Navbar from "@/components/sections/navbar";
import HeroSection from "@/components/sections/hero";
import CategoriesSection from "@/components/sections/categories";
import FeaturedItems from "@/components/sections/featured-items";
import HowItWorks from "@/components/sections/how-it-works";
import CTABanner from "@/components/sections/cta-banner";
import Footer from "@/components/sections/footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      <HeroSection />
      <CategoriesSection />
      <FeaturedItems />
      <HowItWorks />
      <CTABanner />
      <Footer />
    </main>
  );
}
