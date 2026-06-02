"use client"

import { motion } from "framer-motion"
import { FileUp, Headphones, BarChart } from "lucide-react"

export function StepFlow() {
  const steps = [
    {
      icon: FileUp,
      title: "Upload Your SOP",
      description: "Simply upload your existing QA scorecards and compliance rules (PDF or DOC). Our AI learns your exact grading criteria in seconds."
    },
    {
      icon: Headphones,
      title: "Connect Interactions",
      description: "Upload call recordings, chat transcripts, or email logs. Or connect directly via API to stream interactions in real-time."
    },
    {
      icon: BarChart,
      title: "Get Instant Audits",
      description: "Watch as QA Copilot instantly generates detailed scores, flags fatal errors, and writes coaching notes for every single agent."
    }
  ]

  return (
    <div className="relative mt-16 max-w-5xl mx-auto">
      {/* Connecting Line */}
      <div className="absolute top-12 left-24 right-24 h-0.5 bg-gradient-to-r from-blue-900/50 via-violet-500/50 to-blue-900/50 hidden md:block" />
      
      {/* Animated glowing progress line */}
      <motion.div 
        className="absolute top-12 left-24 h-0.5 bg-gradient-to-r from-blue-500 to-violet-400 hidden md:block"
        initial={{ width: "0%" }}
        whileInView={{ width: "calc(100% - 192px)" }}
        viewport={{ once: true }}
        transition={{ duration: 1.5, ease: "easeInOut", delay: 0.5 }}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        {steps.map((step, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.4 }}
            className="relative flex flex-col items-center text-center"
          >
            <div className="relative w-24 h-24 mb-6">
              <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl" />
              <div className="relative w-full h-full bg-[#0B1120] border-2 border-gray-800 rounded-full flex items-center justify-center z-10 group hover:border-blue-500 transition-colors">
                <step.icon className="w-10 h-10 text-blue-400" />
                
                {/* Step Number Badge */}
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-[0_0_10px_rgba(37,99,235,0.5)]">
                  {i + 1}
                </div>
              </div>
            </div>
            
            <h3 className="text-xl font-semibold text-white mb-3">{step.title}</h3>
            <p className="text-gray-400 text-sm leading-relaxed">{step.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
