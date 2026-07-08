import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"

export const metadata = {
  title: "Terms of Service - Nexaviq",
  description: "Terms and conditions for using the Nexaviq conversational intelligence and quality assurance platform."
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#020617] text-gray-300 selection:bg-blue-500/30 selection:text-white">
      <Navbar />
      
      <div className="pt-32 pb-24 max-w-4xl mx-auto px-6 space-y-8">
        <div className="border-b border-gray-800 pb-8">
          <h1 className="text-4xl font-extrabold text-white mb-4">Terms of Service</h1>
          <p className="text-sm text-gray-500">Last updated: July 8, 2026</p>
        </div>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white">1. Agreement to Terms</h2>
          <p className="leading-relaxed">
            Welcome to Nexaviq (the &quot;Product&quot;), operated by <strong>Nexaviq Technologies Pvt. Ltd.</strong> (&quot;Company&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;). 
            By accessing or using our platform and website at <a href="https://nexaviq.com" className="text-blue-400 hover:underline">https://nexaviq.com</a>, you agree to be bound by these Terms of Service. If you do not agree, you must not use our services.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white">2. Description of Service</h2>
          <p className="leading-relaxed">
            Nexaviq is an AI-powered Quality Assurance and Conversation Intelligence platform designed for Contact Centers, BPOs, Service Desks, Customer Support teams, and Enterprises. It automatically ingests, transcribes, and audits customer interactions against standard operating procedures (SOPs).
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white">3. User Obligations and Account</h2>
          <p className="leading-relaxed">
            You must maintain the security of your account and credentials. You are fully responsible for all activities that occur under your account. You agree to provide accurate, current, and complete registration information.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white">4. Data Ownership &amp; Intellectual Property</h2>
          <p className="leading-relaxed">
            The customer interactions, audio files, and transcripts you upload remain your sole property. Nexaviq does not claim ownership over your data. However, the software, layout, platform code, custom modules, AI algorithms, and branding are the exclusive intellectual property of Nexaviq Technologies Pvt. Ltd.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white">5. Governing Law and Jurisdiction</h2>
          <p className="leading-relaxed">
            These Terms shall be governed by and defined in accordance with the laws of <strong>India</strong>. You consent that the courts of <strong>Noida, Uttar Pradesh</strong> shall have exclusive jurisdiction to resolve any dispute which may arise under or in connection with these terms.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white">6. Contact Us</h2>
          <p className="leading-relaxed">
            If you have any questions or concerns about these Terms of Service, please contact us at:
          </p>
          <div className="bg-[#0B1120] border border-gray-800 rounded-2xl p-6 text-sm space-y-1">
            <p className="text-white font-semibold">Nexaviq Technologies Pvt. Ltd.</p>
            <p>Headquarters: Noida, Uttar Pradesh, India</p>
            <p>Email: <a href="mailto:support@nexaviq.com" className="text-blue-400 hover:underline">support@nexaviq.com</a></p>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  )
}
