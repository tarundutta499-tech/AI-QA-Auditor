"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function CTABanner() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-6xl mx-auto relative rounded-3xl overflow-hidden border border-blue-500/30 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-violet-900" />
        
        {/* Subtle noise/texture overlay if desired, simulated with gradient stops */}
        <div className="absolute inset-0 bg-black/10 mix-blend-overlay" />
        
        {/* Glowing orb behind text */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/40 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 py-20 px-8 text-center flex flex-col items-center">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">Ready to Audit Every Interaction?</h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl">
            See how QA Insight AI can transform your team's quality operations in a personalised 30-minute demo.
          </p>
          <div className="flex flex-col items-center gap-4">
            <Link href="/contact">
              <Button className="h-14 px-10 bg-white text-blue-900 hover:bg-gray-100 rounded-full text-lg font-bold shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-all hover:scale-105">
                Book Your Demo
              </Button>
            </Link>
            <p className="text-sm text-blue-200">No commitment. No credit card. Just clarity.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
