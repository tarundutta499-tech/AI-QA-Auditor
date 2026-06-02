"use client"

import StepFlow from "@/components/shared/StepFlow"

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-32 bg-[#0B1120] relative border-y border-gray-800/50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Up and Running in 3 Steps</h2>
          <p className="text-xl text-gray-400">Deploy enterprise AI QA without writing a single line of code.</p>
        </div>
        
        <StepFlow />
      </div>
    </section>
  )
}
