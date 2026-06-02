"use client"

import { motion } from "framer-motion"
import { Quote } from "lucide-react"

interface TestimonialCardProps {
  quote: string
  author: string
  role: string
  company: string
  avatarSeed: number
  delay?: number
}

export function TestimonialCard({ quote, author, role, company, avatarSeed, delay = 0 }: TestimonialCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="relative bg-[#0B1120]/80 backdrop-blur-sm border border-gray-800 rounded-3xl p-8"
    >
      <Quote className="absolute top-6 right-8 h-12 w-12 text-gray-800/50" />
      
      <p className="text-lg text-gray-300 mb-8 relative z-10">"{quote}"</p>
      
      <div className="flex items-center gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={`https://i.pravatar.cc/150?u=${avatarSeed}`} 
          alt={author} 
          className="w-12 h-12 rounded-full border border-gray-700"
        />
        <div>
          <h4 className="text-white font-medium">{author}</h4>
          <p className="text-sm text-gray-500">{role}, {company}</p>
        </div>
      </div>
    </motion.div>
  )
}
