import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"

export const metadata = {
  title: "Privacy Policy - Nexaviq",
  description: "Privacy practices and policies for the Nexaviq conversational intelligence platform."
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#020617] text-gray-300 selection:bg-blue-500/30 selection:text-white">
      <Navbar />
      
      <div className="pt-32 pb-24 max-w-4xl mx-auto px-6 space-y-8">
        <div className="border-b border-gray-800 pb-8">
          <h1 className="text-4xl font-extrabold text-white mb-4">Privacy Policy</h1>
          <p className="text-sm text-gray-500">Last updated: July 8, 2026</p>
        </div>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white">1. Introduction</h2>
          <p className="leading-relaxed">
            At Nexaviq (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), operated by <strong>Nexaviq Technologies Pvt. Ltd.</strong>, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website <a href="https://nexaviq.com" className="text-blue-400 hover:underline">https://nexaviq.com</a> and use our quality assurance platform.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white">2. Information We Collect</h2>
          <p className="leading-relaxed font-semibold">a. Customer Interaction Data</p>
          <p className="leading-relaxed">
            We ingest call audio recordings and metadata (durations, agent IDs, client names) that you upload to execute automated audits. This data is processed securely through encrypted API connections.
          </p>
          <p className="leading-relaxed font-semibold">b. Personal Data</p>
          <p className="leading-relaxed">
            When you register, book a demo, or contact support, we collect contact details such as name, work email address, phone number, company name, and payment billing details.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white">3. How We Use Your Information</h2>
          <p className="leading-relaxed">
            We use the information we collect to:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-sm">
            <li>Provide, maintain, and optimize our conversational intelligence audits.</li>
            <li>Manage accounts, bill subscriptions, and handle customer support tickets.</li>
            <li>Train custom transcription models or scoring rule maps *only* if explicitly agreed in enterprise SLAs (otherwise, standard data retention applies).</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white">4. Data Security</h2>
          <p className="leading-relaxed">
            We implement industry-standard encryption protocols (SSL/TLS for transit, AES-256 for at-rest storage) and host metadata on secure cloud infrastructures to protect files and logs from unauthorized access.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white">5. Governing Law and Contact Info</h2>
          <p className="leading-relaxed">
            Our data practices are governed by the laws of <strong>India</strong>. Noida, Uttar Pradesh, serves as the legal headquarters for resolving disputes. 
            If you have questions, please reach out:
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
