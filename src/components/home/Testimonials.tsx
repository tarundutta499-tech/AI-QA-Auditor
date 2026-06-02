"use client"

import TestimonialCard from "@/components/shared/TestimonialCard"

export default function Testimonials() {
  return (
    <section className="py-32 relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-5xl font-bold text-white">QA Teams Love It</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <TestimonialCard 
            quote="We went from auditing 150 calls a month to 6,000. Our CSAT improved 11 points in 90 days."
            author="Priya Sharma"
            role="QA Manager"
            company="Concentrix"
            avatarSeed={12}
            delay={0.1}
          />
          <TestimonialCard 
            quote="The SOP-aware scoring is exactly what we needed. It actually understands our rubric."
            author="Rahul Mehra"
            role="Quality Lead"
            company="Teleperformance"
            avatarSeed={45}
            delay={0.2}
          />
          <TestimonialCard 
            quote="Fatal error detection alone saved us from a major compliance breach."
            author="Anjali Verma"
            role="Head of Quality"
            company="iEnergizer"
            avatarSeed={32}
            delay={0.3}
          />
        </div>
      </div>
    </section>
  )
}
