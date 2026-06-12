import Link from "next/link"
import { ShieldCheck, Globe, Mail } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-[#020617] border-t border-gray-800/50 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
        
        {/* Brand Column */}
        <div className="md:col-span-2 space-y-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-blue-500 to-violet-600 p-1.5 rounded-lg">
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-white tracking-tight">QA Copilot</span>
          </Link>
          <p className="text-gray-400 text-sm max-w-xs">
            AI-powered QA for modern BPOs. Automatically audit 100% of your customer interactions with unprecedented accuracy.
          </p>
        </div>

        {/* Product Column */}
        <div>
          <h4 className="text-white font-semibold mb-4">Product</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li><Link href="/features" className="hover:text-blue-400 transition-colors">Features</Link></li>
            <li><Link href="/#how-it-works" className="hover:text-blue-400 transition-colors">How It Works</Link></li>
            <li><Link href="/#pricing" className="hover:text-blue-400 transition-colors">Pricing</Link></li>
          </ul>
        </div>
        
        {/* Company Column */}
        <div>
          <h4 className="text-white font-semibold mb-4">Company</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li><Link href="/contact" className="hover:text-blue-400 transition-colors">Contact</Link></li>
          </ul>
        </div>

      </div>
      
      <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-gray-800/50 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-gray-500 text-sm flex gap-4">
          <span>© 2026 QA Copilot. All rights reserved.</span>
        </p>
      </div>
    </footer>
  )
}
