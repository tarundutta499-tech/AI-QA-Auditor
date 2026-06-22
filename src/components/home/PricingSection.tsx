"use client"

import PricingCard from "@/components/shared/PricingCard"

export default function PricingSection() {
  return (
    <section id="pricing" className="py-32 bg-[#0B1120] relative border-y border-gray-800/50">
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-blue-900/10 to-transparent pointer-events-none" />
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Simple, Transparent Pricing</h2>
          <p className="text-xl text-gray-400 mb-10">No hidden fees. Scale your QA automation as you grow.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          <PricingCard 
            tier="Pilot (30 Days)"
            price="₹15k–20k"
            priceSuffix=""
            description="Test the AI with your own data for 30 days."
            features={[
              "Full platform access",
              "1 Custom Scorecard",
              "Guided onboarding",
              "Performance baseline report"
            ]}
            ctaText="Start Pilot"
            delay={0.1}
          />
          <PricingCard 
            tier="Small BPO"
            price="₹25,000"
            description="For teams of 25–100 agents."
            features={[
              "25-100 Active Agents",
              "Unlimited AI Audits",
              "Automated Coaching Notes",
              "Email Support"
            ]}
            ctaText="Subscribe"
            delay={0.2}
          />
          <PricingCard 
            tier="Medium BPO"
            price="₹50,000"
            description="For teams of 100–300 agents."
            features={[
              "100-300 Active Agents",
              "Unlimited AI Audits",
              "Advanced Analytics & Trends",
              "Priority Support"
            ]}
            isPopular={true}
            ctaText="Subscribe"
            delay={0.3}
          />
          <PricingCard 
            tier="Enterprise"
            price="Custom"
            description="Custom limits and integrations for large scale operations."
            features={[
              "300+ Active Agents",
              "Custom AI fine-tuning",
              "Telephony API Integrations",
              "Dedicated Account Manager"
            ]}
            ctaText="Contact Us"
            delay={0.4}
          />
        </div>
      </div>
    </section>
  )
}
