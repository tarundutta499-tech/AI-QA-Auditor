import { MarketingNavbar } from "@/components/marketing/navbar"
import { MarketingFooter } from "@/components/marketing/footer"
import { FeatureCard } from "@/components/marketing/feature-card"
import { PricingCard } from "@/components/marketing/pricing-card"
import { TestimonialCard } from "@/components/marketing/testimonial-card"
import { DashboardPreview } from "@/components/marketing/dashboard-preview"
import { StepFlow } from "@/components/marketing/step-flow"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Shield, Target, Zap, HeartPulse, AlertOctagon, LineChart, ChevronRight } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#020617] selection:bg-blue-500/30 selection:text-white">
      <MarketingNavbar />

      {/* HERO SECTION */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/20 rounded-full blur-[120px] opacity-50" />
        <div className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-violet-600/20 rounded-full blur-[120px] opacity-40" />

        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            QA Copilot 2.0 is Live
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-8 leading-tight">
            Audit 100% of Customer <br className="hidden md:block" /> Interactions. <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-violet-500">Automatically.</span>
          </h1>

          <p className="text-xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">
            QA Copilot uses AI to score every call, chat, and email against your SOPs — in seconds. No sampling. No bias. No missed issues.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/login">
              <Button className="w-full sm:w-auto h-14 px-8 bg-blue-600 hover:bg-blue-500 text-white rounded-full text-lg shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all hover:scale-105 group">
                Start Free Trial
                <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Button variant="outline" className="w-full sm:w-auto h-14 px-8 border-gray-700 hover:bg-gray-800 text-gray-300 rounded-full text-lg">
              Watch Demo
            </Button>
          </div>

          <div className="mt-20 pt-10 border-t border-gray-800/50">
            <p className="text-sm text-gray-500 uppercase tracking-widest font-semibold mb-8">Trusted by QA teams at</p>
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
              {/* Placeholders for logos */}
              <div className="text-xl font-bold text-white">AcmeCorp</div>
              <div className="text-xl font-bold text-white">GlobalBPO</div>
              <div className="text-xl font-bold text-white">TechSupport.io</div>
              <div className="text-xl font-bold text-white">OmniChannel</div>
              <div className="text-xl font-bold text-white">Stratos</div>
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEM SECTION */}
      <section className="py-24 bg-[#0B1120] relative border-y border-gray-800/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">The Old Way Is Broken</h2>
            <p className="text-xl text-gray-400">Traditional QA is too slow, too biased, and covers too little.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#020617]/50 border border-red-900/30 p-8 rounded-2xl">
              <div className="text-red-500 text-4xl mb-4 font-black">2%</div>
              <h3 className="text-xl font-medium text-white mb-2">Blind Spots</h3>
              <p className="text-gray-400">You audit 2% of calls. The other 98% of customer interactions are completely invisible to management.</p>
            </div>
            <div className="bg-[#020617]/50 border border-orange-900/30 p-8 rounded-2xl">
              <div className="text-orange-500 text-4xl mb-4 font-black">Bias</div>
              <h3 className="text-xl font-medium text-white mb-2">Inconsistent Grading</h3>
              <p className="text-gray-400">Human reviewers are inconsistent. Scores vary wildly based on the auditor's mood, not the agent's merit.</p>
            </div>
            <div className="bg-[#020617]/50 border border-yellow-900/30 p-8 rounded-2xl">
              <div className="text-yellow-500 text-4xl mb-4 font-black">Delay</div>
              <h3 className="text-xl font-medium text-white mb-2">Too Late</h3>
              <p className="text-gray-400">Feedback reaches agents days or weeks later. Coaching never lands in time to actually fix behaviors.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SOLUTION SECTION */}
      <section id="features" className="py-32 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Meet QA Copilot — Your AI Quality Manager</h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">Everything you need to automate QA, identify compliance risks, and coach your agents effectively.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard 
              icon={<Shield className="w-6 h-6 text-blue-400" />}
              title="100% Coverage"
              description="Every single interaction audited automatically. Nothing slips through the cracks ever again."
              delay={0.1}
            />
            <FeatureCard 
              icon={<Target className="w-6 h-6 text-blue-400" />}
              title="SOP-Aware Scoring"
              description="Upload your own rubric. The AI grades strictly according to your specific business rules."
              delay={0.2}
            />
            <FeatureCard 
              icon={<Zap className="w-6 h-6 text-blue-400" />}
              title="Instant Feedback"
              description="Scores and actionable coaching notes delivered the exact moment a call or chat ends."
              delay={0.3}
            />
            <FeatureCard 
              icon={<HeartPulse className="w-6 h-6 text-blue-400" />}
              title="Empathy Detection"
              description="AI identifies tone, frustration, and empathy signals to ensure high emotional intelligence."
              delay={0.4}
            />
            <FeatureCard 
              icon={<AlertOctagon className="w-6 h-6 text-red-400" />}
              title="Fatal Error Flagging"
              description="Critical compliance breaches (like missing disclaimers) surfaced immediately to management."
              delay={0.5}
            />
            <FeatureCard 
              icon={<LineChart className="w-6 h-6 text-blue-400" />}
              title="Trend Analytics"
              description="Track agent performance over time with visual, drill-down dashboards."
              delay={0.6}
            />
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="py-32 bg-[#0B1120] relative border-y border-gray-800/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Up and Running in 3 Steps</h2>
            <p className="text-xl text-gray-400">Deploy enterprise AI QA without writing a single line of code.</p>
          </div>
          
          <StepFlow />
        </div>
      </section>

      {/* DASHBOARD PREVIEW */}
      <section className="py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Everything Your QA Team Needs. In One Place.</h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">A dark, beautiful interface designed specifically for high-volume BPO quality assurance teams.</p>
            <div className="inline-block px-4 py-1.5 rounded-full bg-gray-800/50 border border-gray-700 text-gray-300 text-sm font-medium tracking-wide uppercase">
              Product Preview
            </div>
          </div>
          
          <DashboardPreview />

          <div className="mt-20 text-center">
            <Button className="h-12 px-8 bg-white text-[#020617] hover:bg-gray-200 rounded-full font-medium">
              Request Full Demo
            </Button>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-32 bg-[#0B1120] relative border-y border-gray-800/50">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-blue-900/10 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Simple, Transparent Pricing</h2>
            <p className="text-xl text-gray-400">No hidden fees. Scale your QA automation as you grow.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <PricingCard 
              tier="Starter"
              price="₹4,999"
              description="Perfect for small teams moving away from manual QA."
              features={[
                "Up to 500 audits/month",
                "1 Scorecard template",
                "Basic AI coaching notes",
                "Email support"
              ]}
              delay={0.1}
            />
            <PricingCard 
              tier="Growth"
              price="₹12,999"
              description="For scale-ups automating high-volume BPO operations."
              features={[
                "Up to 3,000 audits/month",
                "Unlimited scorecards",
                "Advanced trend analytics",
                "Fatal error alerts",
                "Priority support"
              ]}
              isPopular={true}
              delay={0.2}
            />
            <PricingCard 
              tier="Enterprise"
              price="Custom"
              description="Custom limits and integrations for large enterprises."
              features={[
                "Unlimited audits",
                "Custom AI fine-tuning",
                "Full API access",
                "Dedicated Account Manager",
                "99.9% SLA Guarantee"
              ]}
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-32 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold text-white">QA Teams Love It</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <TestimonialCard 
              quote="We went from auditing 150 calls a month to 6,000. Our CSAT improved 11 points in just 90 days."
              author="Rajesh Kumar"
              role="Head of QA"
              company="Global Support BPO"
              avatarSeed={12}
              delay={0.1}
            />
            <TestimonialCard 
              quote="The SOP-aware scoring is exactly what we needed. It actually understands our complex rubrics and catches things humans miss."
              author="Elena Rodriguez"
              role="Director of Operations"
              company="FinTech Services"
              avatarSeed={45}
              delay={0.2}
            />
            <TestimonialCard 
              quote="Fatal error detection alone saved us from a major compliance breach last month. It paid for itself in an hour."
              author="Amit Patel"
              role="Compliance Officer"
              company="HealthCare Connect"
              avatarSeed={32}
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto relative rounded-3xl overflow-hidden border border-blue-500/30">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-violet-900" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
          
          <div className="relative z-10 py-20 px-8 text-center flex flex-col items-center">
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">Ready to Audit Every Interaction?</h2>
            <p className="text-xl text-blue-200 mb-10 max-w-2xl">
              Join the forward-thinking QA teams already using AI to drive compliance and coaching at massive scale.
            </p>
            <div className="flex flex-col items-center gap-4">
              <Link href="/login">
                <Button className="h-14 px-10 bg-white text-blue-900 hover:bg-gray-100 rounded-full text-lg font-bold shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-all hover:scale-105">
                  Start Your Free 14-Day Trial
                </Button>
              </Link>
              <p className="text-sm text-blue-300">No credit card required. Cancel anytime.</p>
            </div>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  )
}
