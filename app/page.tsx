import { BottomCta } from "@/components/homepage/BottomCta";
import { FeatureShowcase } from "@/components/homepage/FeatureShowcase";
import { Hero } from "@/components/homepage/Hero";
import { Testimonial } from "@/components/homepage/Testimonial";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";

export default function Page() {
  return (
    <div className="min-h-screen bg-surface">
      <Navbar />
      <main className="mx-auto max-w-[1720px] bg-surface">
        <Hero />
        <FeatureShowcase />
        <Testimonial />
        <BottomCta />
      </main>
      <div className="mx-auto max-w-[1720px] bg-surface">
        <Footer />
      </div>
    </div>
  );
}
