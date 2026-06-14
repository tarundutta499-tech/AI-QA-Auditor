"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from '@supabase/ssr'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy, CheckCircle2, FileAudio, Users, BarChart3, Activity, Eye, EyeOff } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const [copied, setCopied] = useState(false)
  const [userName, setUserName] = useState("")
  const [showKey, setShowKey] = useState(false)
  const [role, setRole] = useState("agent")
  
  const [metrics, setMetrics] = useState({
    totalCalls: 0,
    avgEmpathy: 0,
    avgCompliance: 0,
    activeAgents: 0
  })
  
  const [apiData, setApiData] = useState({
    key: "Loading...",
    webhookUrl: "Loading..."
  })

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    async function fetchDashboardData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: userData } = await supabase
        .from('users')
        .select('name, company_id, role')
        .eq('id', user.id)
        .single()
        
      if (!userData) return
      
      setUserName(userData.name || "User")
      setRole(userData.role || "agent")
      
      const companyId = userData.company_id
      if (!companyId) return

      // Fetch calls
      let callsQuery = supabase.from('calls').select('id', { count: 'exact' }).eq('company_id', companyId)
      if (userData.role === 'agent') {
        callsQuery = callsQuery.eq('agent_id', user.id)
      }
      const { data: callsData, count: callsCount } = await callsQuery

      // Active agents count
      const { count: agentsCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', companyId)
        .eq('role', 'agent')

      const callIds = callsData?.map((c: any) => c.id) || []

      let avgCompliance = 0
      let avgEmpathy = 0
      
      if (callIds.length > 0) {
        const { data: auditsData } = await supabase
          .from('audits')
          .select('compliance_percent, empathy_score')
          .in('call_id', callIds)
          
        if (auditsData && auditsData.length > 0) {
          const totalComp = auditsData.reduce((acc: number, a: any) => acc + (Number(a.compliance_percent) || 0), 0)
          const totalEmp = auditsData.reduce((acc: number, a: any) => acc + (Number(a.empathy_score) || 0), 0)
          
          avgCompliance = Math.round(totalComp / auditsData.length)
          avgEmpathy = Math.round(totalEmp / auditsData.length)
        }
      }

      setMetrics({
        totalCalls: callsCount || 0,
        avgCompliance,
        avgEmpathy,
        activeAgents: agentsCount || 0
      })

      if (userData.role !== 'agent') {
        const { data: keyData } = await supabase
          .from('api_keys')
          .select('key_value')
          .eq('company_id', companyId)
          .single()
          
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://api.qacopilot.ai'
          
        setApiData({
          key: keyData?.key_value || "No API key generated yet",
          webhookUrl: `${baseUrl}/api/v1/webhooks/genesys`
        })
      }
    }
    fetchDashboardData()
  }, [])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const isManager = role !== 'agent'

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {userName}</h1>
          <p className="text-muted-foreground mt-2">
            {isManager ? "Here is what is happening across your QA pipeline today." : "Here is your recent performance overview."}
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard/reports">
            <Button>View {isManager ? "Analytics" : "My Scores"}</Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {isManager ? "Total Calls Audited" : "My Audited Calls"}
            </CardTitle>
            <FileAudio className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{metrics.totalCalls}</div>
          </CardContent>
        </Card>
        <Card className="shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {isManager ? "Avg Empathy" : "My Avg Empathy"}
            </CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{metrics.avgEmpathy}%</div>
          </CardContent>
        </Card>
        <Card className="shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {isManager ? "Avg Compliance" : "My Avg Compliance"}
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{metrics.avgCompliance}%</div>
          </CardContent>
        </Card>
        {isManager && (
          <Card className="shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Agents</CardTitle>
              <Users className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{metrics.activeAgents}</div>
            </CardContent>
          </Card>
        )}
      </div>

      {isManager && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          
          {/* Telephony Integration Webhook Instructions */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-xl">Telephony Integrations (Webhooks)</CardTitle>
                <CardDescription>
                  Connect QA Insight AI directly to your phone system (Genesys, Twilio, Amazon Connect). 
                  Once connected, calls will be automatically audited by AI the second the customer hangs up.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                
                <div className="bg-muted/50 p-4 rounded-xl border">
                  <div className="text-sm font-medium text-muted-foreground mb-2">Your Production Webhook URL</div>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-background p-3 rounded-lg text-green-500 font-mono text-sm border">
                      {apiData.webhookUrl}
                    </code>
                    <Button variant="outline" onClick={() => copyToClipboard(apiData.webhookUrl)}>
                      {copied ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <div className="bg-muted/50 p-4 rounded-xl border">
                  <div className="text-sm font-medium text-muted-foreground mb-2">Secret API Key</div>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-background p-3 rounded-lg text-blue-500 font-mono text-sm border">
                      {showKey ? apiData.key : "••••••••••••••••••••••••••••"}
                    </code>
                    <Button variant="outline" onClick={() => setShowKey(!showKey)}>
                      {showKey ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                      {showKey ? "Hide" : "Reveal Key"}
                    </Button>
                  </div>
                </div>

              </CardContent>
            </Card>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <Card className="h-full bg-gradient-to-br from-primary/5 to-purple-500/5">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Link href="/dashboard/reports" className="block">
                  <div className="p-4 rounded-xl bg-background border hover:bg-muted/50 transition-colors flex items-center gap-4 group">
                    <div className="p-3 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                      <BarChart3 className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <h3 className="font-medium">Generate Reports</h3>
                      <p className="text-xs text-muted-foreground">Export CSV data for clients</p>
                    </div>
                  </div>
                </Link>

                <Link href="/dashboard/agents" className="block">
                  <div className="p-4 rounded-xl bg-background border hover:bg-muted/50 transition-colors flex items-center gap-4 group">
                    <div className="p-3 bg-purple-500/10 rounded-lg group-hover:bg-purple-500/20 transition-colors">
                      <Users className="w-5 h-5 text-purple-500" />
                    </div>
                    <div>
                      <h3 className="font-medium">Manage Team</h3>
                      <p className="text-xs text-muted-foreground">Add or remove QA analysts</p>
                    </div>
                  </div>
                </Link>
              </CardContent>
            </Card>
          </div>

        </div>
      )}
    </div>
  )
}
