"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ShieldCheck, Menu, X } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"

export function MarketingNavbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#020617]/80 backdrop-blur-md border-b border-gray-800/50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-gradient-to-br from-blue-500 to-violet-600 p-1.5 rounded-lg group-hover:shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-all">
            <ShieldCheck className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-white tracking-tight">QA Copilot</span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
          <Link href="/features" className="hover:text-white transition-colors">Features</Link>
          <Link href="/#how-it-works" className="hover:text-white transition-colors">How It Works</Link>
          <Link href="/#pricing" className="hover:text-white transition-colors">Pricing</Link>
          <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
          <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
        </div>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
            Sign in
          </Link>
          <Link href="/login">
            <Button className="bg-blue-600 hover:bg-blue-500 text-white rounded-full px-5 h-9 shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all hover:scale-105">
              Start Free Trial
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button className="md:hidden text-gray-300 hover:text-white" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }} 
          exit={{ opacity: 0, y: -10 }}
          className="md:hidden bg-[#020617] border-b border-gray-800/50 p-6 flex flex-col gap-4 shadow-xl"
        >
          <Link href="/features" onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-white">Features</Link>
          <Link href="/#how-it-works" onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-white">How It Works</Link>
          <Link href="/#pricing" onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-white">Pricing</Link>
          <Link href="/blog" onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-white">Blog</Link>
          <Link href="/contact" onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-white">Contact</Link>
          <hr className="border-gray-800 my-2" />
          <Link href="/login" onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-white">Sign in</Link>
          <Link href="/login" onClick={() => setIsOpen(false)}>
            <Button className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-md mt-2">
              Start Free Trial
            </Button>
          </Link>
        </motion.div>
      )}
    </nav>
  )
}
