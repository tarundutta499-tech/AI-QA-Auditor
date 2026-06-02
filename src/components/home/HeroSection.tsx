"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { motion, useAnimation, useInView } from "framer-motion"
import { useEffect, useState, useRef } from "react"

export default function HeroSection() {
  const [empathyScore, setEmpathyScore] = useState(0)
  const [complianceScore, setComplianceScore] = useState(0)
  
  const scorecardRef = useRef(null)
  const isInView = useInView(scorecardRef, { once: true, margin: "-100px" })

  // Number counting effect
  useEffect(() => {
    if (isInView) {
      const duration = 1500 // 1.5s
      const steps = 60
      const stepTime = Math.abs(Math.floor(duration / steps))
      
      let currentStep = 0
      
      const timer = setInterval(() => {
        currentStep++
        setEmpathyScore(Math.floor((currentStep / steps) * 87))
        setComplianceScore(Math.floor((currentStep / steps) * 92))
        
        if (currentStep >= steps) {
          clearInterval(timer)
          setEmpathyScore(87)
          setComplianceScore(92)
        }
      }, stepTime)
      
      return () => clearInterval(timer)
    }
  }, [isInView])

  const scrollToHowItWorks = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    document.querySelector('#how-it-works')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden flex flex-col items-center">
      {/* Abstract Animated Background Elements */}
      <motion.div 
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/20 rounded-full blur-[120px]" 
      />
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.4, 0.2]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-violet-600/20 rounded-full blur-[120px]" 
      />

      <div className="relative max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        
        {/* Left: Text Content */}
        <div className="text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              QA Copilot 2.0 is Live
            </div>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-6 leading-tight"
          >
            Audit 100% of Customer Interactions. <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-violet-500">Automatically.</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-gray-400 mb-10 leading-relaxed max-w-2xl mx-auto lg:mx-0"
          >
            QA Copilot uses AI to score every call, chat, and email against your SOPs — in seconds. No sampling. No bias. No missed issues.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
          >
            <Link href="/contact" className="w-full sm:w-auto">
              <Button className="w-full h-14 px-8 bg-blue-600 hover:bg-blue-500 text-white rounded-full text-lg shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all hover:scale-105 group">
                Request a Demo
                <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="#how-it-works" onClick={scrollToHowItWorks} className="w-full sm:w-auto">
              <Button variant="ghost" className="w-full h-14 px-8 text-gray-300 hover:text-white hover:bg-white/5 rounded-full text-lg">
                See How It Works
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Right: Animated Mockup */}
        <motion.div 
          ref={scorecardRef}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="relative w-full max-w-md mx-auto perspective-1000"
        >
          {/* Glassmorphism Card */}
          <div className="bg-[#0B1120]/80 backdrop-blur-md border border-gray-800 rounded-3xl p-6 shadow-2xl relative transform rotate-y-[-10deg] rotate-x-[5deg] hover:rotate-0 transition-transform duration-700">
            
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-white font-medium text-lg">Audit: Call #4829</h3>
                <p className="text-gray-400 text-sm">Agent: Priya Sharma</p>
              </div>
              <div className="bg-green-500/20 text-green-400 border border-green-500/30 px-3 py-1 rounded-full text-sm font-bold">
                Grade: A
              </div>
            </div>

            <div className="space-y-5">
              {/* Stat 1 */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-300">Empathy Score</span>
                  <span className="text-white font-bold">{empathyScore}/100</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full transition-all duration-300 ease-out" style={{ width: `${empathyScore}%` }} />
                </div>
              </div>

              {/* Stat 2 */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-300">Compliance Score</span>
                  <span className="text-white font-bold">{complianceScore}/100</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div className="bg-violet-500 h-2 rounded-full transition-all duration-300 ease-out" style={{ width: `${complianceScore}%` }} />
                </div>
              </div>

              {/* Stat 3 */}
              <div className="flex justify-between items-center bg-[#020617] p-3 rounded-lg border border-gray-800">
                <span className="text-gray-300 text-sm">Fatal Errors</span>
                <span className="text-gray-500 text-sm font-medium bg-gray-800 px-2 py-0.5 rounded">None detected</span>
              </div>
              
              <div className="flex justify-between items-center bg-[#020617] p-3 rounded-lg border border-gray-800">
                <span className="text-gray-300 text-sm">Call Duration</span>
                <span className="text-white text-sm font-medium">04:12</span>
              </div>
            </div>

          </div>
          
          {/* Decorative floating elements */}
          <div className="absolute -top-6 -right-6 w-24 h-24 bg-blue-500/20 rounded-full blur-xl" />
          <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-violet-500/20 rounded-full blur-xl" />
        </motion.div>
      </div>

      {/* Trust Bar */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.8 }}
        className="mt-24 pt-10 border-t border-gray-800/50 w-full max-w-7xl mx-auto px-6 text-center"
      >
        <p className="text-sm text-gray-500 uppercase tracking-widest font-semibold mb-8">Trusted by QA teams at</p>
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
          <div className="text-xl font-bold text-white">AcmeCorp</div>
          <div className="text-xl font-bold text-white">Teleperformance</div>
          <div className="text-xl font-bold text-white">Concentrix</div>
          <div className="text-xl font-bold text-white">iEnergizer</div>
          <div className="text-xl font-bold text-white">GlobalBPO</div>
        </div>
      </motion.div>
    </section>
  )
}
