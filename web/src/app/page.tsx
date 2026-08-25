import { Navbar } from "@/components/landing/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { WorkflowSection } from "@/components/landing/WorkflowSection";
import { StakeholdersSection } from "@/components/landing/StakeholdersSection";
import { TeamSection } from "@/components/landing/TeamSection";
import { Footer } from "@/components/landing/Footer";
import { ScrollToTop } from "@/components/landing/ScrollToTop";

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-[#111111] font-sans selection:bg-[#88d937] selection:text-[#111111]">
      {/* Top Navbar */}
      <Navbar />

      {/* Main Page Content */}
      <main>
        <HeroSection />
        <StakeholdersSection />
        <WorkflowSection />
        <FeaturesSection />
        <TeamSection />
      </main>

      {/* Footer */}
      <Footer />

      {/* Floating Scroll To Top Button */}
      <ScrollToTop />
    </div>
  );
}
