"use client"

import { motion } from "framer-motion"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PricingCardProps {
  tier: string
  price: string
  description: string
  features: string[]
  isPopular?: boolean
  delay?: number
}

export function PricingCard({ tier, price, description, features, isPopular, delay = 0 }: PricingCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className={`relative flex flex-col h-full bg-[#0B1120]/80 backdrop-blur-sm rounded-3xl p-8 ${
        isPopular ? "border-2 border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.15)]" : "border border-gray-800"
      }`}
    >
      {isPopular && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-500 to-violet-500 text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider">
          Most Popular
        </div>
      )}
      
      <div className="mb-8">
        <h3 className="text-xl font-medium text-white mb-2">{tier}</h3>
        <p className="text-gray-400 text-sm mb-6 h-10">{description}</p>
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-bold text-white">{price}</span>
          {price !== "Custom" && <span className="text-gray-400">/mo</span>}
        </div>
      </div>

      <ul className="space-y-4 mb-8 flex-grow">
        {features.map((feature, i) => (
          <li key={i} className="flex items-start gap-3">
            <Check className="h-5 w-5 text-blue-400 shrink-0" />
            <span className="text-gray-300 text-sm">{feature}</span>
          </li>
        ))}
      </ul>

      <Button 
        className={`w-full h-12 rounded-xl font-medium ${
          isPopular 
            ? "bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]" 
            : "bg-white/10 hover:bg-white/20 text-white"
        } transition-all`}
      >
        {price === "Custom" ? "Contact Sales" : "Start Free Trial"}
      </Button>
    </motion.div>
  )
}
