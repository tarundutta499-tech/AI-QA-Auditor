"use client"

import { useState } from "react"
import PricingCard from "@/components/shared/PricingCard"
import { motion } from "framer-motion"

export default function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(false)

  return (
    <section id="pricing" className="py-32 bg-[#0B1120] relative border-y border-gray-800/50">
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-blue-900/10 to-transparent pointer-events-none" />
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Simple, Transparent Pricing</h2>
          <p className="text-xl text-gray-400 mb-10">No hidden fees. Scale your QA automation as you grow.</p>
          
          {/* Toggle */}
          <div className="flex items-center justify-center gap-4">
            <span className={`text-sm ${!isAnnual ? 'text-white font-medium' : 'text-gray-400'}`}>Monthly</span>
            <button 
              onClick={() => setIsAnnual(!isAnnual)}
              className="relative w-14 h-8 bg-gray-800 rounded-full flex items-center p-1 cursor-pointer transition-colors hover:bg-gray-700"
            >
              <motion.div 
                animate={{ x: isAnnual ? 24 : 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="w-6 h-6 bg-blue-500 rounded-full shadow-md"
              />
            </button>
            <span className={`text-sm ${isAnnual ? 'text-white font-medium' : 'text-gray-400'}`}>
              Annually <span className="text-green-400 text-xs ml-1 font-bold bg-green-500/10 px-2 py-0.5 rounded-full">-20%</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <PricingCard 
            tier="Starter"
            price="₹4,999"
            description="Perfect for small teams moving away from manual QA."
            features={[
              "Up to 500 audits/month",
              "1 Scorecard template",
              "Basic AI coaching notes",
              "Email support"
            ]}
            ctaText="Request a Demo"
            isAnnual={isAnnual}
            delay={0.1}
          />
          <PricingCard 
            tier="Growth"
            price="₹12,999"
            description="For scale-ups automating high-volume BPO operations."
            features={[
              "Up to 3,000 audits/month",
              "Unlimited scorecards",
              "Advanced trend analytics",
              "Fatal error alerts",
              "Priority support"
            ]}
            isPopular={true}
            ctaText="Request a Demo"
            isAnnual={isAnnual}
            delay={0.2}
          />
          <PricingCard 
            tier="Enterprise"
            price="Custom"
            description="Custom limits and integrations for large enterprises."
            features={[
              "Unlimited audits",
              "Custom AI fine-tuning",
              "Full API access",
              "Dedicated Account Manager",
              "99.9% SLA Guarantee"
            ]}
            ctaText="Contact Us"
            isAnnual={isAnnual}
            delay={0.3}
          />
        </div>
      </div>
    </section>
  )
}
