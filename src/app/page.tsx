import Link from 'next/link'
import { Activity, Sparkles, Check, ArrowRight, ShieldCheck, Target, Heart, Eye } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0A0A14] text-white selection:bg-purple-500/30 font-sans overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-600 to-transparent blur-[100px] rounded-full mix-blend-screen" />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-12">
          <Link href="/" className="flex items-center gap-2 font-bold text-white group">
            <div className="bg-gradient-to-br from-purple-500 to-blue-600 p-1.5 rounded-lg text-white shadow-lg shadow-purple-500/20 group-hover:scale-105 transition-transform">
              <Activity className="h-5 w-5" />
            </div>
            <span className="text-xl tracking-tight">QA Copilot</span>
          </Link>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/login" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
            Sign in
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 max-w-5xl mx-auto px-6 pt-24 pb-32 text-center">
        {/* Pill Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/20 bg-purple-500/10 text-purple-300 text-sm font-medium mb-8 backdrop-blur-sm shadow-[0_0_15px_rgba(147,51,234,0.15)] hover:bg-purple-500/20 transition-colors cursor-default">
          <Sparkles className="h-4 w-4" />
          Powered by Google Gemini 1.5 Flash
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white mb-6 leading-tight">
          Enterprise QA Audits <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-500 to-indigo-500">
            Made Effortless
          </span> with AI
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-3xl mx-auto leading-relaxed">
          Upload any call recording or chat transcript. Our AI extracts compliance parameters, 
          evaluates empathy, and grades agents against your exact company SOPs in seconds. 
          Built for modern BPOs and Quality Assurance teams.
        </p>

        {/* CTAs */}
        {/* Buttons removed as requested */}
      </main>

      {/* Purpose, Vision, Values Section */}
      <section id="about" className="relative z-10 max-w-7xl mx-auto px-6 py-24 border-t border-gray-800/50 bg-[#0A0A14]">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-4">
            Our Mission & Vision
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            We are building the future of customer experience by empowering humans with superhuman AI capabilities.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Purpose */}
          <div className="bg-[#12121A] border border-gray-800/60 p-8 rounded-3xl hover:border-purple-500/30 transition-colors group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-20 transition-opacity">
              <Target className="w-32 h-32 text-purple-500" />
            </div>
            <div className="h-14 w-14 bg-purple-500/10 border border-purple-500/20 rounded-2xl flex items-center justify-center mb-6">
              <Target className="h-7 w-7 text-purple-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Our Purpose</h3>
            <p className="text-gray-400 leading-relaxed relative z-10">
              To eliminate the massive inefficiencies in BPO operations by completely automating Quality Assurance. We exist so that QA teams stop listening to random 2% samples and start auditing 100% of interactions with perfect precision.
            </p>
          </div>

          {/* Vision */}
          <div className="bg-[#12121A] border border-gray-800/60 p-8 rounded-3xl hover:border-indigo-500/30 transition-colors group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-20 transition-opacity">
              <Eye className="w-32 h-32 text-indigo-500" />
            </div>
            <div className="h-14 w-14 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center mb-6">
              <Eye className="h-7 w-7 text-indigo-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Our Vision</h3>
            <p className="text-gray-400 leading-relaxed relative z-10">
              A world where every customer interaction is empathetic, compliant, and perfectly aligned with company values. We envision an enterprise ecosystem where "quality" is guaranteed on every call, not just a metric to guess at.
            </p>
          </div>

          {/* Values */}
          <div className="bg-[#12121A] border border-gray-800/60 p-8 rounded-3xl hover:border-pink-500/30 transition-colors group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-20 transition-opacity">
              <Heart className="w-32 h-32 text-pink-500" />
            </div>
            <div className="h-14 w-14 bg-pink-500/10 border border-pink-500/20 rounded-2xl flex items-center justify-center mb-6">
              <Heart className="h-7 w-7 text-pink-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Our Values</h3>
            <ul className="text-gray-400 space-y-3 relative z-10">
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> <strong>Uncompromising Accuracy</strong></li>
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> <strong>Data Security First</strong></li>
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> <strong>Radical Transparency</strong></li>
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> <strong>Empowering Agents</strong></li>
            </ul>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="border-t border-gray-800/50 bg-[#0A0A14] py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 font-bold text-white opacity-80">
            <Activity className="h-5 w-5 text-purple-500" />
            <span>QA Copilot</span>
          </div>
          <p className="text-gray-500 text-sm">© 2026 QA Copilot. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
