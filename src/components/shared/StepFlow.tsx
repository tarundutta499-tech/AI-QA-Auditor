"use client"

import { motion } from "framer-motion"
import { FileUp, Headphones, BarChart } from "lucide-react"

export default function StepFlow() {
  const steps = [
    {
      icon: FileUp,
      title: "Upload Your SOP",
      description: "Upload your exact grading rubric or SOP document. The AI learns your specific business rules in seconds."
    },
    {
      icon: Headphones,
      title: "Connect Interactions",
      description: "Connect your call recordings or chat transcripts. Or stream interactions automatically via API."
    },
    {
      icon: BarChart,
      title: "Get Instant Reports",
      description: "Get instant AI audit reports with detailed scores, flagged fatal errors, and personalized coaching notes."
    }
  ]

  return (
    <div className="relative mt-16 max-w-5xl mx-auto px-4 md:px-0">
      {/* Connecting Line (Desktop) */}
      <div className="absolute top-12 left-24 right-24 h-0.5 bg-gradient-to-r from-blue-900/50 via-violet-500/50 to-blue-900/50 hidden md:block" />
      
      {/* Animated glowing progress line (Desktop) */}
      <motion.div 
        className="absolute top-12 left-24 h-0.5 bg-gradient-to-r from-blue-500 to-violet-400 hidden md:block"
        initial={{ width: "0%" }}
        whileInView={{ width: "calc(100% - 192px)" }}
        viewport={{ once: true }}
        transition={{ duration: 1.5, ease: "easeInOut", delay: 0.5 }}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
        {/* Connecting Line (Mobile) */}
        <div className="absolute top-0 bottom-0 left-12 w-0.5 bg-gradient-to-b from-blue-900/50 via-violet-500/50 to-blue-900/50 block md:hidden" />

        {steps.map((step, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.4 }}
            className="relative flex md:flex-col items-center md:text-center text-left gap-6 md:gap-0"
          >
            <div className="relative w-24 h-24 md:mb-6 shrink-0 bg-[#0B1120] rounded-full z-10">
              <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl" />
              <div className="relative w-full h-full border-2 border-gray-800 rounded-full flex items-center justify-center group hover:border-blue-500 transition-colors">
                <step.icon className="w-10 h-10 text-blue-400" />
                
                {/* Step Number Badge */}
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-[0_0_10px_rgba(37,99,235,0.5)]">
                  {i + 1}
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold text-white mb-2 md:mb-3">{step.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{step.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
