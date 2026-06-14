"use client"

import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { Shield, FileUp, Zap, HeartPulse, AlertOctagon, LineChart, Database, Code, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { motion } from "framer-motion"

export default function FeaturesPage() {
  const features = [
    {
      title: "SOP Upload",
      description: "Upload your exact grading rubric or SOP document (PDF or Word doc). The AI learns your specific business rules in seconds.",
      icon: FileUp,
      align: "left"
    },
    {
      title: "100% Interaction Coverage",
      description: "Stop relying on 2% random sampling. QA Insight AI automatically ingests and audits every single call, chat, and email—ensuring nothing is missed.",
      icon: Shield,
      align: "right"
    },
    {
      title: "Empathy & Tone Scoring",
      description: "Go beyond just reading transcripts. Our AI detects frustration, warmth, and professionalism to ensure high emotional intelligence.",
      icon: HeartPulse,
      align: "left"
    },
    {
      title: "Fatal Error Detection",
      description: "Instantly detect critical compliance breaches—like missing mandatory disclaimers. Managers are alerted to fatal errors the moment they occur.",
      icon: AlertOctagon,
      align: "right"
    },
    {
      title: "Instant Coaching Notes",
      description: "Feedback is delivered the moment a call ends. Agents receive immediate AI-generated coaching notes highlighting exactly where they need to improve.",
      icon: Zap,
      align: "left"
    },
    {
      title: "Trend & Performance Reports",
      description: "Track performance over time with beautiful, drill-down dashboards. Generate weekly and monthly analytics for every agent on the floor.",
      icon: LineChart,
      align: "right"
    },
    {
      title: "Bulk Batch Uploads",
      description: "Easily drag and drop hundreds of call recordings or chat transcripts at once. Our ingestion engine processes massive batches in parallel.",
      icon: Database,
      align: "left"
    },
    {
      title: "Developer API Access",
      description: "Integrate QA Insight AI directly into your existing tech stack. Stream interactions automatically from your telephony or CRM directly via REST API.",
      icon: Code,
      align: "right"
    },
    {
      title: "Multi-Language Support",
      description: "Auditing global or diverse teams? QA Insight AI natively understands and audits interactions in Hindi, English, and regional languages.",
      icon: Globe,
      align: "left"
    }
  ]

  return (
    <div className="min-h-screen bg-[#020617] selection:bg-blue-500/30 selection:text-white">
      <Navbar />
      
      <div className="pt-32 pb-20 border-b border-gray-800/50 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[400px] bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">Built for the Way BPOs Actually Work</h1>
          <p className="text-xl text-gray-400">Everything you need to automate QA, enforce compliance, and build world-class customer support teams.</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-16 space-y-16">
        {features.map((feature, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            key={i} 
            className={`flex flex-col md:flex-row gap-8 items-center ${feature.align === 'right' ? 'md:flex-row-reverse' : ''}`}
          >
            
            {/* Text Side */}
            <div className="flex-1 space-y-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1E293B] to-[#0F172A] border border-gray-700 flex items-center justify-center shadow-lg">
                <feature.icon className="w-6 h-6 text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">{feature.title}</h2>
              <p className="text-base text-gray-400 leading-relaxed">{feature.description}</p>
            </div>

            {/* Visual Side Mockup */}
            <div className="flex-1 w-full">
              <div className="relative aspect-video rounded-2xl bg-[#0B1120] border border-gray-800 overflow-hidden shadow-2xl flex items-center justify-center group">
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 to-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Abstract UI Representation */}
                <div className="w-3/4 h-3/4 border border-gray-800 rounded-xl bg-[#020617]/50 flex flex-col p-4 gap-3 relative z-10">
                  <div className="w-1/3 h-4 bg-gray-800 rounded-md" />
                  <div className="w-full h-px bg-gray-800 my-2" />
                  <div className="flex gap-4">
                    <div className="w-1/2 h-20 bg-gray-800/50 rounded-lg flex items-center justify-center">
                      <feature.icon className="w-6 h-6 text-gray-600" />
                    </div>
                    <div className="w-1/2 space-y-2">
                      <div className="w-full h-3 bg-gray-800 rounded" />
                      <div className="w-5/6 h-3 bg-gray-800 rounded" />
                      <div className="w-4/6 h-3 bg-gray-800 rounded" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </motion.div>
        ))}
      </div>
      
      <div className="py-24 text-center border-t border-gray-800/50 bg-[#0B1120]">
        <h2 className="text-3xl font-bold text-white mb-6">Want to see these features live?</h2>
        <Link href="/contact">
          <Button className="h-14 px-10 bg-blue-600 hover:bg-blue-500 text-white rounded-full text-lg font-bold shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all hover:scale-105">
            Book a Demo
          </Button>
        </Link>
      </div>

      <Footer />
    </div>
  )
}
