import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import HeroSection from "@/components/home/HeroSection"
import ProblemSection from "@/components/home/ProblemSection"
import SolutionSection from "@/components/home/SolutionSection"
import HowItWorks from "@/components/home/HowItWorks"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#020617] selection:bg-blue-500/30 selection:text-white">
      <Navbar />
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <HowItWorks />
      <Footer />
    </div>
  )
}
