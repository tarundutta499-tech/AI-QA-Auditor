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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 max-w-screen-2xl mx-auto">
          <PricingCard 
            tier="Pilot"
            price="₹15,000"
            priceSuffix=""
            description="Test the AI with your own data for 30 days."
            features={[
              "Up to 1,000 calls",
              "Full platform access",
              "1 Custom Scorecard",
              "Performance baseline"
            ]}
            ctaText="Start Pilot"
            delay={0.1}
          />
          <PricingCard 
            tier="Starter"
            price="₹25,000"
            description="Perfect for small teams."
            features={[
              "Up to 5,000 calls/mo",
              "Full platform access",
              "Automated Coaching",
              "Email Support"
            ]}
            ctaText="Subscribe"
            delay={0.2}
          />
          <PricingCard 
            tier="Growth"
            price="₹50,000"
            description="For growing BPO operations."
            features={[
              "Up to 15,000 calls/mo",
              "Advanced Analytics",
              "Unlimited Scorecards",
              "Priority Support"
            ]}
            isPopular={true}
            ctaText="Subscribe"
            delay={0.3}
          />
          <PricingCard 
            tier="Scale"
            price="₹1,00,000"
            description="High volume automated QA."
            features={[
              "Up to 50,000 calls/mo",
              "Custom AI fine-tuning",
              "API Integrations",
              "Priority Support"
            ]}
            ctaText="Subscribe"
            delay={0.4}
          />
          <PricingCard 
            tier="Enterprise"
            price="Custom"
            description="Custom limits for massive scale operations."
            features={[
              "Unlimited calls",
              "Custom AI fine-tuning",
              "SSO & SAML Security",
              "Custom BI Integrations"
            ]}
            ctaText="Contact Us"
            delay={0.5}
          />
        </div>
      </div>
    </section>
  )
}
