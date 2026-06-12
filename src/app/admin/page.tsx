"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Building2, UserPlus, ShieldAlert, CheckCircle2, Loader2 } from "lucide-react"

export default function SuperAdminPage() {
  const [companyName, setCompanyName] = useState("")
  const [adminName, setAdminName] = useState("")
  const [adminEmail, setAdminEmail] = useState("")
  const [adminPassword, setAdminPassword] = useState("")
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleOnboard = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const { createClient } = await import('@supabase/supabase-js')
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      const { data: { session } } = await supabase.auth.getSession()

      const response = await fetch('/api/admin/onboard-vendor', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || ''}`
        },
        body: JSON.stringify({ companyName, adminName, adminEmail, adminPassword })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to onboard vendor")
      }

      setSuccess(result.message)
      setCompanyName("")
      setAdminName("")
      setAdminEmail("")
      setAdminPassword("")
      
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#020617] p-8 selection:bg-blue-500/30 selection:text-white">
      <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
        
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <ShieldAlert className="w-8 h-8 text-red-500" />
            Super Admin Portal
          </h1>
          <p className="text-gray-400">
            Secure multi-tenant onboarding. Create isolated databases and Admin accounts for new BPO clients.
          </p>
        </div>

        <div className="bg-[#0B1120] border border-gray-800 rounded-2xl p-8">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-400" />
            Onboard New Vendor
          </h2>

          <form onSubmit={handleOnboard} className="space-y-6">
            
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm">
                {error}
              </div>
            )}
            
            {success && (
              <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-4 rounded-xl text-sm flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                {success}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Company Name</label>
                <Input
                  required
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  placeholder="e.g. Acme BPO Solutions"
                  className="bg-[#020617] border-gray-800 text-white placeholder:text-gray-600"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Head of QA (Name)</label>
                  <Input
                    required
                    value={adminName}
                    onChange={e => setAdminName(e.target.value)}
                    placeholder="Jane Doe"
                    className="bg-[#020617] border-gray-800 text-white placeholder:text-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Head of QA (Email)</label>
                  <Input
                    type="email"
                    required
                    value={adminEmail}
                    onChange={e => setAdminEmail(e.target.value)}
                    placeholder="jane@acme.com"
                    className="bg-[#020617] border-gray-800 text-white placeholder:text-gray-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Temporary Password</label>
                <Input
                  type="password"
                  required
                  value={adminPassword}
                  onChange={e => setAdminPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-[#020617] border-gray-800 text-white placeholder:text-gray-600"
                />
                <p className="text-xs text-gray-500 mt-1">They can change this after their first login.</p>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><UserPlus className="w-4 h-4 mr-2" /> Provision Client Account</>}
            </Button>

          </form>
        </div>

      </div>
    </div>
  )
}
