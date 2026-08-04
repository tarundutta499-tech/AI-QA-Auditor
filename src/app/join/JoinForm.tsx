"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { User, Key } from "lucide-react"
import { acceptInvite } from './actions'

export function JoinForm({ token, email }: { token: string; email: string }) {
  const [fullName, setFullName] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append("token", token)
    formData.append("fullName", fullName)
    formData.append("password", password)

    const res = await acceptInvite(formData)
    setLoading(false)

    if (res?.error) {
      setError(res.error)
    } else {
      window.location.href = '/dashboard'
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-xs font-semibold">
          {error}
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-300">
          Email Address
        </label>
        <div className="mt-1">
          <Input
            type="email"
            value={email}
            disabled
            className="bg-[#020617] border-gray-800 text-gray-500 cursor-not-allowed"
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
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="bg-[#020617] border-gray-800 text-white pl-10 focus:border-blue-500 focus:ring-blue-500/20"
            placeholder="Jane Doe"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300">
          Set a Password
        </label>
        <div className="mt-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Key className="h-4 w-4 text-gray-500" />
          </div>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="bg-[#020617] border-gray-800 text-white pl-10 focus:border-blue-500 focus:ring-blue-500/20"
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
          {loading ? 'Joining...' : 'Accept Invite & Join'}
        </Button>
      </div>
    </form>
  )
}
