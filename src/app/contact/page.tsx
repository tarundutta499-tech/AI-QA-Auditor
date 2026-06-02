"use client"

import { MarketingNavbar } from "@/components/marketing/navbar"
import { MarketingFooter } from "@/components/marketing/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Mail, MessageSquare, Building2, MapPin } from "lucide-react"

export default function ContactPage() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Placeholder for form submission
    alert("Thanks for reaching out! A member of our team will contact you shortly.")
  }

  return (
    <div className="min-h-screen bg-[#020617] selection:bg-blue-500/30 selection:text-white">
      <MarketingNavbar />
      
      <div className="pt-32 pb-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-bl from-blue-900/20 to-transparent pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16 relative z-10">
          
          {/* Left Column - Info */}
          <div className="space-y-8 pt-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Let's transform your QA process.</h1>
              <p className="text-xl text-gray-400">
                Whether you have questions about custom pricing, API integrations, or want a personalized demo, our team is ready to help.
              </p>
            </div>
            
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 inline-flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
              </span>
              <span className="text-blue-400 font-medium">We typically respond within 4 hours.</span>
            </div>

            <div className="space-y-6 pt-8 border-t border-gray-800">
              <div className="flex items-center gap-4 text-gray-300">
                <Mail className="w-6 h-6 text-blue-400" />
                <span>sales@qacopilot.ai</span>
              </div>
              <div className="flex items-center gap-4 text-gray-300">
                <MessageSquare className="w-6 h-6 text-blue-400" />
                <span>Support via Live Chat available in Dashboard</span>
              </div>
              <div className="flex items-center gap-4 text-gray-300">
                <Building2 className="w-6 h-6 text-blue-400" />
                <span>Enterprise SLA available</span>
              </div>
            </div>
          </div>

          {/* Right Column - Form */}
          <div className="bg-[#0B1120] border border-gray-800 rounded-3xl p-8 md:p-10 shadow-2xl relative">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-violet-500/20 blur-3xl rounded-full" />
            
            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-gray-300">First Name</Label>
                  <Input id="firstName" required className="bg-[#020617] border-gray-800 text-white focus:border-blue-500" placeholder="John" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-gray-300">Last Name</Label>
                  <Input id="lastName" required className="bg-[#020617] border-gray-800 text-white focus:border-blue-500" placeholder="Doe" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300">Work Email</Label>
                <Input id="email" type="email" required className="bg-[#020617] border-gray-800 text-white focus:border-blue-500" placeholder="john@company.com" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company" className="text-gray-300">Company</Label>
                  <Input id="company" required className="bg-[#020617] border-gray-800 text-white focus:border-blue-500" placeholder="Acme BPO" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="teamSize" className="text-gray-300">Team Size</Label>
                  <select 
                    id="teamSize" 
                    className="flex h-10 w-full items-center justify-between rounded-md border border-gray-800 bg-[#020617] px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select size...</option>
                    <option value="1-50">1-50 Agents</option>
                    <option value="51-200">51-200 Agents</option>
                    <option value="201-1000">201-1,000 Agents</option>
                    <option value="1000+">1,000+ Agents</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message" className="text-gray-300">How can we help?</Label>
                <Textarea 
                  id="message" 
                  required 
                  className="bg-[#020617] border-gray-800 text-white focus:border-blue-500 min-h-[120px]" 
                  placeholder="Tell us about your current QA process and what you're looking to achieve..." 
                />
              </div>

              <Button type="submit" className="w-full h-12 bg-blue-600 hover:bg-blue-500 text-white text-lg font-medium shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all">
                Send Message
              </Button>
            </form>
          </div>

        </div>
      </div>

      <MarketingFooter />
    </div>
  )
}
