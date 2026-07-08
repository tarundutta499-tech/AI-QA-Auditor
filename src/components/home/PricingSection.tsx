"use client"

import { useState, useEffect } from "react"
import { PRICING_CONFIG } from "@/lib/pricing-config"
import PricingCard from "@/components/shared/PricingCard"
import PricingCalculator from "@/components/home/PricingCalculator"

export default function PricingSection() {
  const [selectedRegion, setSelectedRegion] = useState<string>("india")

  // Auto-detect browser locale / timezone on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const locale = navigator.language || ""
        const lower = locale.toLowerCase()
        if (lower.includes("in")) {
          setSelectedRegion("india")
        } else if (lower.includes("ph")) {
          setSelectedRegion("philippines")
        } else if (lower.includes("ae")) {
          setSelectedRegion("dubai")
        } else {
          const tz = Intl.DateTimeFormat().resolvedOptions().timeZone.toLowerCase()
          if (
            tz.includes("europe") || 
            tz.includes("london") || 
            tz.includes("paris") || 
            tz.includes("berlin") || 
            tz.includes("rome") || 
            tz.includes("madrid") || 
            tz.includes("warsaw") || 
            tz.includes("bucharest")
          ) {
            setSelectedRegion("eu")
          }
        }
      } catch (e) {
        console.error("Failed to auto-detect locale:", e)
      }
    }
  }, [])

  const config = PRICING_CONFIG[selectedRegion]

  return (
    <section id="pricing" className="py-32 bg-[#0B1120] relative border-y border-gray-800/50">
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-blue-900/10 to-transparent pointer-events-none" />
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Simple, Transparent Pricing</h2>
          <p className="text-xl text-gray-400 mb-8">No hidden fees. Scale your QA automation as you grow.</p>
          
          {/* Region Selector Tabs */}
          <div className="inline-flex p-1 bg-[#1E293B]/60 backdrop-blur-md rounded-2xl border border-gray-800/80 mb-8">
            {Object.values(PRICING_CONFIG).map((region) => (
              <button
                key={region.id}
                onClick={() => setSelectedRegion(region.id)}
                className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                  selectedRegion === region.id
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {region.name}
              </button>
            ))}
          </div>
          
          {/* Visual confirmation of active config */}
          <div className="text-sm text-gray-500 mt-2">
            Selected region: <span className="text-blue-400 font-semibold">{config.name}</span> (Rates in {config.currency})
          </div>
        </div>

        {/* Usage-Based Pricing Display */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="relative bg-[#0F172A]/90 backdrop-blur-md rounded-3xl p-8 md:p-12 border-2 border-blue-500 shadow-[0_0_50px_rgba(59,130,246,0.15)] overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 bg-blue-500/10 text-blue-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-6 border border-blue-500/20">
                  Pay-As-You-Go Usage Plan
                </div>
                
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">Enterprise QA, Automated</h3>
                <p className="text-gray-400 text-base mb-8 max-w-xl">
                  Analyze 100% of your customer calls with zero setup overhead. Fully compliant scorecard audits, custom AI insights, and instant agent feedback.
                </p>

                <ul className="space-y-3">
                  {[
                    "Unlimited calls & simultaneous processing",
                    "Full platform access (Scorecards, Dashboards, Reports)",
                    "PII Redaction & SOC-2 Level Security",
                    "API integrations & custom CRM webhooks",
                    "Continuous automated feedback & coaching tips"
                  ].map((feat, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-gray-300">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col items-center justify-center p-6 md:p-8 bg-[#1E293B]/40 rounded-2xl border border-gray-800/80 min-w-[280px] text-center">
                <span className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-2">Per-Minute Rate</span>
                
                <div className="flex items-baseline justify-center mb-1">
                  <span className="text-5xl md:text-6xl font-extrabold text-white tracking-tight">
                    {config.symbol}{config.rate < 0.1 ? config.rate.toFixed(3) : config.rate.toFixed(2)}
                  </span>
                  <span className="text-gray-400 text-lg font-medium ml-1">/min</span>
                </div>
                
                <span className="text-xs text-gray-500 mb-6">
                  No subscription needed. Billed monthly.
                </span>

                {/* Seat Cost Estimate */}
                <div className="w-full pt-4 border-t border-gray-800/80 mb-6">
                  <div className="text-xs text-gray-400 font-medium">Estimated monthly seat cost:</div>
                  <div className="text-lg font-bold text-white mt-1">
                    {config.symbol}
                    {Math.round(config.rate * config.avgCallMinutes * config.avgCallsPerAgentPerMonth).toLocaleString()}
                  </div>
                  <div className="text-[10px] text-gray-500 mt-0.5 leading-relaxed max-w-[220px] mx-auto">
                    ~ per active agent/month at typical volume ({config.avgCallsPerAgentPerMonth} calls/mo, {config.avgCallMinutes} min avg)
                  </div>
                </div>

                {/* Savings Badge */}
                {(() => {
                  const ourCostPerCallInLocal = (config.rate * config.avgCallMinutes) * (config.exchangeRateToUSD || 1);
                  const savings = Math.round((1 - ourCostPerCallInLocal / config.manualQaCostPerCall) * 100);
                  return (
                    <div className="w-full bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl py-2 px-3 text-xs font-semibold">
                      🚀 {savings}% cheaper than manual QA
                    </div>
                  );
                })()}

                <a 
                  href="/contact" 
                  className="w-full mt-6 py-3 px-6 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)] text-center"
                >
                  Contact Sales
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Savings Calculator */}
        <div className="max-w-4xl mx-auto mb-16">
          <PricingCalculator config={config} />
        </div>

        {/* Separate Pilot Program CTA Section */}
        <div className="max-w-4xl mx-auto pt-8 border-t border-gray-800/40">
          <div className="bg-[#0B1120]/60 backdrop-blur-sm rounded-3xl p-8 border border-gray-800/80 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex-1">
              <span className="inline-flex bg-violet-500/10 text-violet-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-3 border border-violet-500/20">
                Risk-Free Evaluation
              </span>
              <h3 className="text-xl md:text-2xl font-bold text-white mb-2">Start with a 30-Day Pilot Program</h3>
              <p className="text-sm text-gray-400 max-w-xl">
                Test the platform using your own audio data. Get a dedicated dashboard setup, custom scorecard alignment, and full platform access for 30 days.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0">
              <div className="text-left sm:text-right">
                <div className="text-xs text-gray-500">Pilot Package Price</div>
                <div className="text-2xl font-bold text-white">
                  {selectedRegion === "india" ? "₹15,000" : selectedRegion === "philippines" ? "$180" : selectedRegion === "dubai" ? "AED 660" : "€165"}
                </div>
                <div className="text-[10px] text-gray-500">Up to 1,000 audited calls included</div>
              </div>
              <a 
                href="/contact?subject=pilot" 
                className="py-3 px-6 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold rounded-xl transition-all border border-white/10"
              >
                Start Pilot
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
