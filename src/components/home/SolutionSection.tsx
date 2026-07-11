"use client"

import FeatureCard from "@/components/shared/FeatureCard"
import { Shield, Target, Globe, HeartPulse, AlertOctagon, LineChart, Sparkles, Layers } from "lucide-react"

export default function SolutionSection() {
  return (
    <section className="py-32 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Meet Nexaviq — Your AI Quality Manager</h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">Everything you need to automate QA, identify compliance risks, and coach your agents effectively.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <FeatureCard 
            icon={<Shield className="w-6 h-6 text-blue-400" />}
            title="100% Coverage"
            description="Every single customer call audited automatically. Nothing slips through the cracks."
            delay={0.1}
          />
          <FeatureCard 
            icon={<Target className="w-6 h-6 text-blue-400" />}
            title="SOP-Aware Scoring"
            description="Upload your own rubric. The AI grades strictly according to your specific business rules."
            delay={0.2}
          />
          <FeatureCard 
            icon={<Sparkles className="w-6 h-6 text-violet-400 animate-pulse" />}
            title="Real-Time Co-Pilot"
            description="Browser extension widgets guiding agents live with script suggestions and checklists."
            delay={0.3}
          />
          <FeatureCard 
            icon={<Layers className="w-6 h-6 text-emerald-400" />}
            title="CRM Auto-Logging"
            description="Pushes summary and disposition codes to Salesforce/Zendesk, reducing ACW to zero."
            delay={0.4}
          />
          <FeatureCard 
            icon={<Globe className="w-6 h-6 text-blue-400" />}
            title="Multi-Language"
            description="Natively audits calls in Hindi, Spanish, Tagalog, and 90+ other global languages."
            delay={0.5}
          />
          <FeatureCard 
            icon={<HeartPulse className="w-6 h-6 text-blue-400" />}
            title="Empathy Detection"
            description="AI identifies tone, frustration, and empathy signals to ensure high emotional intelligence."
            delay={0.6}
          />
          <FeatureCard 
            icon={<AlertOctagon className="w-6 h-6 text-red-400" />}
            title="Fatal Error Alerts"
            description="Critical compliance breaches (like missing disclaimers) trigger instant supervisor warnings."
            delay={0.7}
          />
          <FeatureCard 
            icon={<LineChart className="w-6 h-6 text-blue-400" />}
            title="Trend Analytics"
            description="Track agent performance over time with visual, drill-down dashboards."
            delay={0.8}
          />
        </div>
      </div>
    </section>
  )
}
