import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import InteractiveDemo from "@/components/home/InteractiveDemo"

export const metadata = {
  title: 'Try AI Demo - QA Insight AI',
  description: 'Test the Gemini 1.5 Flash AI grading engine on a sample customer service call.',
}

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-[#020617] selection:bg-blue-500/30 selection:text-white flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-12">
        <InteractiveDemo />
      </main>
      <Footer />
    </div>
  )
}
