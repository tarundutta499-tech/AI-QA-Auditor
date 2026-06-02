"use client"

import DashboardMockup from "@/components/shared/DashboardMockup"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function DashboardPreview() {
  return (
    <section className="py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Everything Your QA Team Needs. In One Place.</h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">A dark, beautiful interface designed specifically for high-volume BPO quality assurance teams.</p>
          <div className="inline-block px-4 py-1.5 rounded-full bg-gray-800/50 border border-gray-700 text-gray-300 text-sm font-medium tracking-wide uppercase">
            Product Preview
          </div>
        </div>
        
        <DashboardMockup />

        <div className="mt-20 text-center">
          <Link href="/contact">
            <Button className="h-14 px-8 bg-blue-600 text-white hover:bg-blue-500 rounded-full font-medium shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all hover:scale-105">
              Request a Demo
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
