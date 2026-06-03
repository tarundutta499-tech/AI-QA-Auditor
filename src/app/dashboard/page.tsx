"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from '@supabase/ssr'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy, CheckCircle2, FileAudio, Users, BarChart3, Activity } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

export default function DashboardPage() {
  const [copied, setCopied] = useState(false)
  const [userName, setUserName] = useState("")
  
  // Dummy API key for demo
  const apiKey = "qac_live_8f92j3n84m92834nj89f23"
  const webhookUrl = "https://api.qacopilot.ai/v1/webhooks/genesys"

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    async function fetchUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase.from('users').select('name').eq('id', user.id).single()
        if (data) setUserName(data.name || "Manager")
      }
    }
    fetchUser()
  }, [])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Welcome back, {userName}</h1>
          <p className="text-muted-foreground mt-2">Here is what is happening across your QA pipeline today.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard/reports">
            <Button className="bg-blue-600 hover:bg-blue-500 text-white">View Analytics</Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-[#0B1120] border-gray-800 shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total Calls Audited</CardTitle>
            <FileAudio className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-white">1,284</div>
            <p className="text-xs text-green-400 mt-2 flex items-center gap-1">
               +12% from last week
            </p>
          </CardContent>
        </Card>
        <Card className="bg-[#0B1120] border-gray-800 shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Avg Empathy</CardTitle>
            <Activity className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-white">88%</div>
            <p className="text-xs text-green-400 mt-2 flex items-center gap-1">
               +2% from last week
            </p>
          </CardContent>
        </Card>
        <Card className="bg-[#0B1120] border-gray-800 shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Avg Compliance</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-white">96%</div>
            <p className="text-xs text-green-400 mt-2 flex items-center gap-1">
               Perfect score target
            </p>
          </CardContent>
        </Card>
        <Card className="bg-[#0B1120] border-gray-800 shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Active Agents</CardTitle>
            <Users className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-white">42</div>
            <p className="text-xs text-muted-foreground mt-2">
               Agents currently live
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        
        {/* Telephony Integration Webhook Instructions */}
        <div className="lg:col-span-2">
          <Card className="bg-[#0B1120] border-gray-800 h-full">
            <CardHeader>
              <CardTitle className="text-xl text-white">Telephony Integrations (Webhooks)</CardTitle>
              <CardDescription>
                Connect QA Copilot directly to your phone system (Genesys, Twilio, Amazon Connect). 
                Once connected, calls will be automatically audited by AI the second the customer hangs up.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800">
                <div className="text-sm font-medium text-gray-400 mb-2">Your Production Webhook URL</div>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-[#020617] p-3 rounded-lg text-green-400 font-mono text-sm border border-gray-800">
                    {webhookUrl}
                  </code>
                  <Button variant="outline" className="border-gray-700 hover:bg-gray-800" onClick={() => copyToClipboard(webhookUrl)}>
                    {copied ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-gray-400" />}
                  </Button>
                </div>
              </div>

              <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800">
                <div className="text-sm font-medium text-gray-400 mb-2">Secret API Key</div>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-[#020617] p-3 rounded-lg text-blue-400 font-mono text-sm border border-gray-800">
                    ••••••••••••••••••••••••••••
                  </code>
                  <Button variant="outline" className="border-gray-700 hover:bg-gray-800">
                    Reveal Key
                  </Button>
                </div>
              </div>

              <div className="pt-4 text-sm text-gray-500">
                <p>Read the <Link href="#" className="text-blue-400 hover:underline">Documentation</Link> for instructions on configuring the webhook in your specific PBX system.</p>
              </div>

            </CardContent>
          </Card>
        </div>

        {/* Quick Links */}
        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border-blue-500/20 h-full">
            <CardHeader>
              <CardTitle className="text-white text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="/dashboard/reports" className="block">
                <div className="p-4 rounded-xl bg-gray-900/40 border border-gray-800 hover:bg-gray-800 transition-colors flex items-center gap-4 group">
                  <div className="p-3 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                    <BarChart3 className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-white">Generate Reports</h3>
                    <p className="text-xs text-gray-400">Export CSV data for clients</p>
                  </div>
                </div>
              </Link>

              <Link href="/dashboard/agents" className="block">
                <div className="p-4 rounded-xl bg-gray-900/40 border border-gray-800 hover:bg-gray-800 transition-colors flex items-center gap-4 group">
                  <div className="p-3 bg-purple-500/10 rounded-lg group-hover:bg-purple-500/20 transition-colors">
                    <Users className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-white">Manage Team</h3>
                    <p className="text-xs text-gray-400">Add or remove QA analysts</p>
                  </div>
                </div>
              </Link>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  )
}
