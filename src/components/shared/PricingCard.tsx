"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Check, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface PricingCardProps {
  tier: string
  price: string
  priceSuffix?: string
  description: string
  features: string[]
  isPopular?: boolean
  ctaText: string
  delay?: number
  isAnnual?: boolean
}

export default function PricingCard({ tier, price, priceSuffix = "/mo", description, features, isPopular, ctaText, delay = 0, isAnnual = false }: PricingCardProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  // Apply 20% discount visually if annual is toggled
  const displayPrice = isAnnual && price !== "Custom" 
    ? `₹${(parseInt(price.replace(/,/g, '').replace('₹', '')) * 0.8).toLocaleString()}` 
    : price

  const handleSubscribe = async () => {
    if (price === "Custom" || tier.includes("Pilot")) {
      router.push('/contact')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier: tier })
      })

      if (res.status === 401) {
        // Not logged in, redirect to login
        router.push('/login?redirect=/pricing')
        return
      }

      const data = await res.json()
      
      if (data.url) {
        window.location.href = data.url
      } else {
        alert("Failed to start checkout: " + (data.error || "Unknown error"))
        setLoading(false)
      }
    } catch (err) {
      console.error(err)
      alert("Something went wrong.")
      setLoading(false)
    }
  }

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
          MOST POPULAR
        </div>
      )}
      
      <div className="mb-8">
        <h3 className="text-xl font-medium text-white mb-2">{tier}</h3>
        <p className="text-gray-400 text-sm mb-6 h-10">{description}</p>
        <div className="flex items-baseline gap-1 flex-wrap">
          <span className="text-3xl font-bold text-white break-all">{displayPrice}</span>
          {price !== "Custom" && priceSuffix && <span className="text-gray-400 shrink-0">{priceSuffix}</span>}
        </div>
        {isAnnual && price !== "Custom" && (
          <div className="text-green-400 text-xs mt-1 font-medium">Billed annually</div>
        )}
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
        onClick={handleSubscribe}
        disabled={loading}
        className={`w-full h-12 rounded-xl font-medium ${
          isPopular 
            ? "bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]" 
            : "bg-white/10 hover:bg-white/20 text-white"
        } transition-all`}
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (price === "Custom" ? "Contact Us" : "Subscribe Now")}
      </Button>
    </motion.div>
  )
}
