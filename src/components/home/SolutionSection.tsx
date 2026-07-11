"use client"

import FeatureCard from "@/components/shared/FeatureCard"
import { Shield, Target, Activity, Layers, Sparkles, AlertOctagon, Clock, Globe } from "lucide-react"

export default function SolutionSection() {
  return (
    <section className="py-32 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Meet Nexaviq — The BPO Operations Engine</h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">Everything you need to automate QA, optimize AHT, and support your agents with cognitive real-time guidance.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <FeatureCard 
            icon={<Shield className="w-6 h-6 text-blue-400" />}
            title="100% Call Coverage"
            description="Every call automatically ingested and audited. No more relying on 2% random sampling."
            delay={0.1}
          />
          <FeatureCard 
            icon={<Target className="w-6 h-6 text-emerald-400" />}
            title="SOP Scorecard Builder"
            description="Build rubrics that grade agent compliance strictly according to your specific business SOPs."
            delay={0.2}
          />
          <FeatureCard 
            icon={<Activity className="w-6 h-6 text-violet-400 animate-pulse" />}
            title="Real-Time Co-Pilot"
            description="Lightweight Chrome extension assisting agents live with spoken scripts and guidelines on calls."
            delay={0.3}
          />
          <FeatureCard 
            icon={<Layers className="w-6 h-6 text-yellow-400" />}
            title="Zero After-Call Work"
            description="Instantly drafts summaries and disposition codes and pushes them directly to Salesforce/Zendesk."
            delay={0.4}
          />
          <FeatureCard 
            icon={<Sparkles className="w-6 h-6 text-blue-400" />}
            title="Pulse AI Chat Analyst"
            description="Conversational cognitive analyst allowing leadership to query compliance and AHT metrics."
            delay={0.5}
          />
          <FeatureCard 
            icon={<AlertOctagon className="w-6 h-6 text-red-400" />}
            title="Behavioral Escalations"
            description="AI monitors for sarcasm or abuse, instantly sending alert emails to supervisors on detection."
            delay={0.6}
          />
          <FeatureCard 
            icon={<Clock className="w-6 h-6 text-pink-400" />}
            title="AHT & FCR Diagnostics"
            description="Visual root cause engines highlighting silences, hold times, and repeat callback leaks."
            delay={0.7}
          />
          <FeatureCard 
            icon={<Globe className="w-6 h-6 text-indigo-400" />}
            title="Multi-Language Audits"
            description="Natively audits calls in English, Tagalog, Hindi, Spanish, and 90+ other global languages."
            delay={0.8}
          />
        </div>
      </div>
    </section>
  )
}
