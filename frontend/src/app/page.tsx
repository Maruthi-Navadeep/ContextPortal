import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { HeroSection } from "@/components/sections/hero";
import { ProblemSection } from "@/components/sections/problem";
import { SolutionSection } from "@/components/sections/solution";
import { TokenCalculatorSection } from "@/components/sections/token-calculator";
import { ConnectSection } from "@/components/sections/connect";
import { TrustSection } from "@/components/sections/trust";
import { FinalCtaSection } from "@/components/sections/final-cta";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-[#09090b] text-[#fafafa]">
      <Navbar />
      <main className="flex flex-1 flex-col">
        <HeroSection />
        <ProblemSection />
        <SolutionSection />
        <TokenCalculatorSection />
        <ConnectSection />
        <TrustSection />
        <FinalCtaSection />
      </main>
      <Footer />
    </div>
  );
}
