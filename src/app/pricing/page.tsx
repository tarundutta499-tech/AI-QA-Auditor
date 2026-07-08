import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import PricingSection from "@/components/home/PricingSection"
import CTABanner from "@/components/home/CTABanner"

export const dynamic = "force-dynamic";

export const metadata = {
  title: 'Pricing - Nexaviq',
  description: 'Simple, transparent pricing for QA automation.',
}

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#020617] selection:bg-blue-500/30 selection:text-white flex flex-col">
      <Navbar />
      <main className="flex-1 pt-12">
        <PricingSection />
        <CTABanner />
      </main>
      <Footer />
    </div>
  )
}
