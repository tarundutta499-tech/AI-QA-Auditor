"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createAgent } from '../actions'
import Link from 'next/link'
import { Copy, CheckCircle2, Loader2 } from 'lucide-react'

export default function NewAgentPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [inviteLink, setInviteLink] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setInviteLink(null)
    
    const formData = new FormData(e.currentTarget)
    
    try {
      const result = await createAgent(formData)
      if (result?.success && result?.token) {
        // Construct the full invite URL
        const url = `${window.location.origin}/join?token=${result.token}`
        setInviteLink(url)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create invite')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Invite Team Member</h1>
        <p className="text-muted-foreground mt-2">Generate a secure invite link for a QA Analyst or Agent to join your workspace.</p>
      </div>
      
      {!inviteLink ? (
        <form onSubmit={handleCreate}>
          <Card className="bg-[#0B1120] border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Member Details</CardTitle>
              <CardDescription>Enter the email address and role for the new member.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg text-sm">
                  {error}
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300">Email Address</Label>
                <Input 
                  id="email" 
                  name="email" 
                  type="email" 
                  required 
                  placeholder="jane@example.com" 
                  className="bg-[#020617] border-gray-800 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role" className="text-gray-300">Role</Label>
                <Select name="role" defaultValue="agent">
                  <SelectTrigger className="bg-[#020617] border-gray-800 text-white">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="agent">Support Agent</SelectItem>
                    <SelectItem value="qa">QA Analyst</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="pt-4 flex justify-end gap-4">
                <Link href="/dashboard/agents">
                  <Button variant="outline" type="button" className="border-gray-700 text-gray-300 hover:bg-gray-800">Cancel</Button>
                </Link>
                <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-500 text-white">
                  {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Generate Invite Link
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      ) : (
        <Card className="bg-green-500/5 border-green-500/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-green-500" />
              <CardTitle className="text-white">Invite Created Successfully!</CardTitle>
            </div>
            <CardDescription className="text-gray-400">
              We haven't set up automated emails yet. Please copy this secure link and send it directly to your team member so they can set up their account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-2 p-3 bg-[#020617] rounded-md border border-gray-800">
              <code className="text-blue-400 text-sm flex-1 break-all select-all">{inviteLink}</code>
              <Button size="icon" variant="outline" onClick={copyToClipboard} className="shrink-0 border-gray-700">
                {copied ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-gray-400" />}
              </Button>
            </div>

            <div className="flex justify-end gap-4">
              <Button variant="outline" onClick={() => setInviteLink(null)} className="border-gray-700 text-gray-300">Invite Another</Button>
              <Link href="/dashboard/agents">
                <Button className="bg-blue-600 hover:bg-blue-500">Back to Directory</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
