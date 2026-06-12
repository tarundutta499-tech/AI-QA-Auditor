"use client"

import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Mail, Globe, Clock } from "lucide-react"
import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Convert FormData to JSON
    const formData = new FormData(e.currentTarget)
    const data = Object.fromEntries(formData.entries())

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        setIsSuccess(true)
      } else {
        alert("Something went wrong. Please try again.")
      }
    } catch (error) {
      alert("Failed to submit form.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#020617] selection:bg-blue-500/30 selection:text-white">
      <Navbar />
      
      <div className="pt-32 pb-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-bl from-blue-900/20 to-transparent pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16 relative z-10">
          
          {/* Left Column - Info */}
          <div className="space-y-8 pt-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Let's Talk Quality</h1>
              <p className="text-xl text-gray-400">
                Tell us about your team and we'll show you exactly how QA Copilot fits your workflow. We typically respond within 4 hours.
              </p>
            </div>
            
            <div className="space-y-6 pt-8 border-t border-gray-800">
              <div className="flex items-center gap-4 text-gray-300">
                <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <div className="font-medium text-white">Email Us</div>
                  <div className="text-sm">hello@qacopilot.in</div>
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-gray-300">
                <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center shrink-0">
                  <Globe className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <div className="font-medium text-white">LinkedIn</div>
                  <Link href="#" className="text-sm hover:text-blue-400 transition-colors">Connect with our team</Link>
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-gray-300">
                <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <div className="font-medium text-white">Response Time</div>
                  <div className="text-sm">Typically within 4 hours</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Form */}
          <div className="bg-[#0B1120] border border-gray-800 rounded-3xl p-8 md:p-10 shadow-2xl relative">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-violet-500/20 blur-3xl rounded-full" />
            
            {isSuccess ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative z-10 h-full flex flex-col items-center justify-center text-center py-12"
              >
                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white text-xl font-bold">✓</div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Thanks!</h3>
                <p className="text-gray-400">
                  We'll reach out within 4 hours to confirm your demo slot.
                </p>
                <Button 
                  onClick={() => setIsSuccess(false)}
                  variant="outline" 
                  className="mt-8 border-gray-700 text-white hover:bg-gray-800"
                >
                  Submit Another Request
                </Button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-gray-300">Full Name</Label>
                  <Input id="fullName" name="fullName" required className="bg-[#020617] border-gray-800 text-white focus:border-blue-500" placeholder="John Doe" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-300">Work Email</Label>
                  <Input id="email" name="email" type="email" required className="bg-[#020617] border-gray-800 text-white focus:border-blue-500" placeholder="john@company.com" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company" className="text-gray-300">Company Name</Label>
                  <Input id="company" name="company" required className="bg-[#020617] border-gray-800 text-white focus:border-blue-500" placeholder="Acme BPO" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="teamSize" className="text-gray-300">Team Size</Label>
                    <select 
                      id="teamSize" 
                      name="teamSize"
                      required
                      className="flex h-10 w-full items-center justify-between rounded-md border border-gray-800 bg-[#020617] px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select size...</option>
                      <option value="1-10">1–10 Agents</option>
                      <option value="11-50">11–50 Agents</option>
                      <option value="51-200">51–200 Agents</option>
                      <option value="200+">200+ Agents</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="callVolume" className="text-gray-300">Monthly Call Volume</Label>
                    <select 
                      id="callVolume" 
                      name="callVolume"
                      required
                      className="flex h-10 w-full items-center justify-between rounded-md border border-gray-800 bg-[#020617] px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select volume...</option>
                      <option value="<1000">&lt;1,000</option>
                      <option value="1000-5000">1,000–5,000</option>
                      <option value="5000-20000">5,000–20,000</option>
                      <option value="20000+">20,000+</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message" className="text-gray-300">Anything specific you want to see in the demo?</Label>
                  <Textarea 
                    id="message" 
                    name="message"
                    className="bg-[#020617] border-gray-800 text-white focus:border-blue-500 min-h-[100px]" 
                    placeholder="e.g. We need to integrate with Genesys..." 
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full h-12 bg-blue-600 hover:bg-blue-500 text-white text-lg font-medium shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all disabled:opacity-50"
                >
                  {isSubmitting ? "Submitting..." : "Book My Demo"}
                </Button>
              </form>
            )}
          </div>

        </div>
      </div>

      <Footer />
    </div>
  )
}
