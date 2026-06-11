"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { ShieldCheck, Loader2, Key, ArrowLeft, Building2, User } from "lucide-react"
import { registerCompany } from "./actions"

export default function SignupPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    const formData = new FormData(e.currentTarget)

    try {
      await registerCompany(formData)
      // registerCompany will redirect to /dashboard on success
    } catch (err: any) {
      setError(err.message || "Failed to create account.")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-blue-500/30 selection:text-white relative overflow-hidden">
      
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="absolute top-8 left-8 z-20">
        <Link href="/">
          <Button variant="ghost" className="text-gray-400 hover:text-white hover:bg-white/10 flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center text-blue-500 mb-6">
          <ShieldCheck className="w-16 h-16" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white tracking-tight">
          Create your Workspace
        </h2>
        <p className="mt-2 text-center text-sm text-gray-400">
          Start auditing 100% of your calls today.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-[#0B1120] py-8 px-4 shadow-2xl border border-gray-800/60 sm:rounded-2xl sm:px-10">
          
          <form className="space-y-6" onSubmit={handleSignup}>
            
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg text-sm text-center">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300">
                Company Name
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building2 className="h-4 w-4 text-gray-500" />
                </div>
                <Input
                  type="text"
                  name="companyName"
                  required
                  className="bg-[#020617] border-gray-800 text-white pl-10 focus:border-blue-500 focus:ring-blue-500/20 placeholder:text-gray-600"
                  placeholder="Acme BPO"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300">
                Your Full Name
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-gray-500" />
                </div>
                <Input
                  type="text"
                  name="fullName"
                  required
                  className="bg-[#020617] border-gray-800 text-white pl-10 focus:border-blue-500 focus:ring-blue-500/20 placeholder:text-gray-600"
                  placeholder="Jane Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300">
                Work Email
              </label>
              <div className="mt-1">
                <Input
                  type="email"
                  name="email"
                  required
                  className="bg-[#020617] border-gray-800 text-white focus:border-blue-500 focus:ring-blue-500/20 placeholder:text-gray-600"
                  placeholder="jane@acme.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300">
                Password
              </label>
              <div className="mt-1">
                <Input
                  type="password"
                  name="password"
                  required
                  minLength={6}
                  className="bg-[#020617] border-gray-800 text-white focus:border-blue-500 focus:ring-blue-500/20 placeholder:text-gray-600"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-[#0B1120] transition-colors"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 mr-2" />
                    Create Workspace
                  </>
                )}
              </Button>
            </div>
            
            <div className="text-sm text-center mt-4">
              <span className="text-gray-400">Already have an account? </span>
              <Link href="/login" className="font-medium text-blue-500 hover:text-blue-400 transition-colors">
                Log in
              </Link>
            </div>

          </form>
          
        </div>
      </div>
    </div>
  )
}
