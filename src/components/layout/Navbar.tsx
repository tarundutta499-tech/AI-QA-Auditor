"use client"

import Link from "next/link"
import { motion, useScroll, useMotionValueEvent } from "framer-motion"
import { ShieldCheck, Menu, X } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const { scrollY } = useScroll()

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 20)
  })

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-[#020617]/80 backdrop-blur-md border-b border-gray-800/50 shadow-lg' : 'bg-transparent'}`}>
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
          <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
        </div>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
            Login
          </Link>
          <Link href="/contact">
            <Button className="bg-blue-600 hover:bg-blue-500 text-white rounded-full px-5 h-9 shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all hover:scale-105">
              Request a Demo
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
          initial={{ opacity: 0, x: 20 }} 
          animate={{ opacity: 1, x: 0 }} 
          exit={{ opacity: 0, x: 20 }}
          className="md:hidden fixed top-16 right-0 bottom-0 w-64 bg-[#020617] border-l border-gray-800/50 p-6 flex flex-col gap-4 shadow-xl z-40"
        >
          <Link href="/features" onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-white">Features</Link>
          <Link href="/#how-it-works" onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-white">How It Works</Link>
          <Link href="/#pricing" onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-white">Pricing</Link>
          <Link href="/contact" onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-white">Contact</Link>
          <hr className="border-gray-800 my-4" />
          <Link href="/login" onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-white">Login</Link>
          <Link href="/contact" onClick={() => setIsOpen(false)}>
            <Button className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-md mt-2">
              Request a Demo
            </Button>
          </Link>
        </motion.div>
      )}
    </nav>
  )
}
