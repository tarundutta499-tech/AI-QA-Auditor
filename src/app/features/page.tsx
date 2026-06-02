import { MarketingNavbar } from "@/components/marketing/navbar"
import { MarketingFooter } from "@/components/marketing/footer"
import { Shield, FileUp, Zap, HeartPulse, AlertOctagon, LineChart, Database, Code, Globe } from "lucide-react"

export default function FeaturesPage() {
  const features = [
    {
      title: "100% Coverage Auditing",
      description: "Stop relying on 2% random sampling. QA Copilot automatically ingests and audits every single customer interaction—ensuring nothing slips through the cracks and you have complete visibility over your BPO operations.",
      icon: Shield,
      align: "left"
    },
    {
      title: "SOP-Aware Custom Scorecards",
      description: "Upload your exact grading rubric or SOP document. The AI learns your specific business rules, compliance requirements, and grading weights, scoring agents exactly how your human QA team would.",
      icon: FileUp,
      align: "right"
    },
    {
      title: "Instant Agent Coaching",
      description: "Feedback is delivered the moment a call ends, not 3 weeks later. Agents receive immediate AI-generated coaching notes highlighting exactly what they did right and where they need to improve.",
      icon: Zap,
      align: "left"
    },
    {
      title: "Advanced Empathy Detection",
      description: "Go beyond just reading transcripts. Our AI analyzes sentiment, frustration markers, and tone to ensure your agents are providing empathetic, high-quality customer service.",
      icon: HeartPulse,
      align: "right"
    },
    {
      title: "Fatal Error Flagging",
      description: "Instantly detect critical compliance breaches—like missing mandatory disclaimers or violating HIPAA/PCI rules. Managers are immediately alerted to fatal errors before they become massive liabilities.",
      icon: AlertOctagon,
      align: "left"
    },
    {
      title: "Visual Trend Analytics",
      description: "Track performance over time with beautiful, drill-down dashboards. Identify systemic issues across your entire floor, or pinpoint specific training needs for individual agents.",
      icon: LineChart,
      align: "right"
    },
    {
      title: "Bulk Batch Uploads",
      description: "Easily drag and drop thousands of call recordings or chat transcripts at once. Our ingestion engine processes massive batches in parallel, giving you reports in minutes.",
      icon: Database,
      align: "left"
    },
    {
      title: "Developer API Access",
      description: "Integrate QA Copilot directly into your existing tech stack. Stream interactions automatically from Genesys, Zendesk, or Salesforce using our robust REST API.",
      icon: Code,
      align: "right"
    },
    {
      title: "Multi-Language Support",
      description: "Auditing global teams? QA Copilot natively understands and audits interactions in over 30 languages, including Spanish, French, German, Hindi, and Tagalog.",
      icon: Globe,
      align: "left"
    }
  ]

  return (
    <div className="min-h-screen bg-[#020617] selection:bg-blue-500/30 selection:text-white">
      <MarketingNavbar />
      
      <div className="pt-32 pb-20 border-b border-gray-800/50 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[400px] bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">Platform Features</h1>
          <p className="text-xl text-gray-400">Everything you need to automate QA, enforce compliance, and build world-class customer support teams.</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-24 space-y-32">
        {features.map((feature, i) => (
          <div key={i} className={`flex flex-col md:flex-row gap-12 items-center ${feature.align === 'right' ? 'md:flex-row-reverse' : ''}`}>
            
            {/* Text Side */}
            <div className="flex-1 space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1E293B] to-[#0F172A] border border-gray-700 flex items-center justify-center shadow-lg">
                <feature.icon className="w-8 h-8 text-blue-400" />
              </div>
              <h2 className="text-3xl font-bold text-white">{feature.title}</h2>
              <p className="text-lg text-gray-400 leading-relaxed">{feature.description}</p>
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

          </div>
        ))}
      </div>

      <MarketingFooter />
    </div>
  )
}
