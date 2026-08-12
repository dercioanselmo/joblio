import { redirect } from "next/navigation";
import { BottomCta } from "@/components/homepage/BottomCta";
import { FeatureShowcase } from "@/components/homepage/FeatureShowcase";
import { Hero } from "@/components/homepage/Hero";
import { Testimonial } from "@/components/homepage/Testimonial";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { createInsforgeServer } from "@/lib/insforge-server";

// project-overview.md: "Logged in users → redirect to dashboard." This check
// was missing entirely — the homepage always rendered the marketing content
// regardless of session, so a signed-in user landing on "/" never bounced to
// /dashboard. Logged-out visitors still see the full marketing page below;
// only an authenticated session short-circuits it.
export default async function Page() {
  const insforge = await createInsforgeServer();
  const { data } = await insforge.auth.getCurrentUser();
  if (data?.user) {
    redirect("/dashboard");
  }

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
