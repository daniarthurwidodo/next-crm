import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { Pricing } from "@/components/landing/pricing";
import { HowItWorks } from "@/components/landing/how-it-works";
import { FAQ } from "@/components/landing/faq";

export default function Home() {
  return (
    <main className="flex flex-col items-center w-full min-h-screen bg-background text-foreground font-sans">
      <Hero />
      <Features />
      <Pricing />
      <HowItWorks />
      <FAQ />
    </main>
  );
}
