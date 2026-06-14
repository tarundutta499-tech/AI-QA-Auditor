import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import DashboardPreview from "@/components/home/DashboardPreview"
import CTABanner from "@/components/home/CTABanner"

export const metadata = {
  title: 'Platform Preview - QA Insight AI',
  description: 'Everything your QA team needs in one place.',
}

export default function PlatformPage() {
  return (
    <div className="min-h-screen bg-[#020617] selection:bg-blue-500/30 selection:text-white flex flex-col">
      <Navbar />
      <main className="flex-1 pt-12">
        <DashboardPreview />
        <CTABanner />
      </main>
      <Footer />
    </div>
  )
}
