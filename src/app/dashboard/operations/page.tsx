"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from "recharts"
import { 
  Clock, 
  TrendingDown, 
  ArrowDownRight, 
  CheckCircle2, 
  AlertTriangle, 
  Cpu, 
  Workflow, 
  Layers, 
  RefreshCw,
  Search,
  Database,
  ShieldAlert
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function OperationsDashboard() {
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncLogs, setSyncLogs] = useState([
    { id: "1", time: "Just now", agent: "John Doe", callId: "c-897", summary: "Customer requested a billing refund for double charge. Refund processed via Stripe API.", disposition: "Billing - Refund", status: "synced", crm: "Salesforce" },
    { id: "2", time: "4 mins ago", agent: "Sarah Jenkins", callId: "c-896", summary: "Account lockout. Guided customer to reset password using two-factor link.", disposition: "Account - Lockout", status: "synced", crm: "Zendesk" },
    { id: "3", time: "12 mins ago", agent: "Michael Chang", callId: "c-895", summary: "General pricing inquiry. Explained enterprise tiers and email threshold features.", disposition: "Sales - Inquiry", status: "synced", crm: "Salesforce" }
  ])

  const triggerSync = () => {
    setIsSyncing(true)
    setTimeout(() => {
      setIsSyncing(false)
      // add a mock synced log
      setSyncLogs(prev => [
        {
          id: Date.now().toString(),
          time: "Just now",
          agent: "Priya Sharma",
          callId: `c-${Math.floor(Math.random() * 100) + 900}`,
          summary: "Agent resolved customer routing query. Validated SOP compliance during transfer.",
          disposition: "Routing - Escalation",
          status: "synced",
          crm: "Salesforce"
        },
        ...prev
      ])
    }, 1500)
  }

  // AHT daily chart data
  const ahtTrendData = [
    { day: "Mon", totalAht: 275, talkTime: 180, holdTime: 65, deadAir: 30 },
    { day: "Tue", totalAht: 260, talkTime: 175, holdTime: 55, deadAir: 30 },
    { day: "Wed", totalAht: 252, talkTime: 170, holdTime: 52, deadAir: 30 },
    { day: "Thu", totalAht: 248, talkTime: 168, holdTime: 50, deadAir: 30 },
    { day: "Fri", totalAht: 242, talkTime: 165, holdTime: 48, deadAir: 29 }
  ]

  // FCR repeat category data
  const fcrLeakageData = [
    { category: "System Outage", count: 48, cost: "$1,440" },
    { category: "Agent Instructions", count: 32, cost: "$960" },
    { category: "Routing Error", count: 18, cost: "$540" },
    { category: "Tool Access Blocked", count: 12, cost: "$360" }
  ]

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <Workflow className="h-7 w-7 text-emerald-500" />
            Operations & ACW Dashboard
          </h1>
          <p className="text-gray-400 text-sm">
            Optimize Average Handle Time (AHT), track First Call Resolution (FCR) leakage, and manage automated CRM wrap-up logs.
          </p>
        </div>
        <Button 
          onClick={triggerSync} 
          disabled={isSyncing}
          className="rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold h-11 px-6 shadow-lg shadow-emerald-500/10"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
          {isSyncing ? "Syncing Logs..." : "Force Sync CRM Queue"}
        </Button>
      </div>

      {/* Top operational metrics cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-[#0B1120] border-gray-800 shadow-xl overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/5 to-transparent pointer-events-none" />
          <CardContent className="p-6 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm font-semibold">Total ACW Saved</span>
              <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg"><TrendingDown className="w-4 h-4" /></div>
            </div>
            <div className="text-3xl font-bold text-white">14,820 <span className="text-xs text-gray-400 font-normal">mins</span></div>
            <p className="text-xs text-emerald-400 flex items-center gap-1">
              <ArrowDownRight className="w-3.5 h-3.5" /> Zero After-Call Work (ACW) applied site-wide
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#0B1120] border-gray-800 shadow-xl overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 to-transparent pointer-events-none" />
          <CardContent className="p-6 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm font-semibold">Average Handle Time (AHT)</span>
              <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg"><Clock className="w-4 h-4" /></div>
            </div>
            <div className="text-3xl font-bold text-white">4m 02s <span className="text-xs text-gray-400 font-normal">avg</span></div>
            <p className="text-xs text-blue-400">
              Shaved off 33 seconds average compared to manual QA benchmarks
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#0B1120] border-gray-800 shadow-xl overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-tr from-violet-500/5 to-transparent pointer-events-none" />
          <CardContent className="p-6 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm font-semibold">First Call Resolution (FCR)</span>
              <div className="p-2 bg-violet-500/10 text-violet-400 rounded-lg"><CheckCircle2 className="w-4 h-4" /></div>
            </div>
            <div className="text-3xl font-bold text-white">82% <span className="text-xs text-gray-400 font-normal">target: 80%</span></div>
            <div className="text-xs text-violet-400 flex items-center gap-2 pt-2">
              <div className="w-full bg-violet-950/80 rounded-full h-2 overflow-hidden">
                <div className="bg-violet-500 h-full rounded-full" style={{ width: '82%' }}></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* AHT DIAGNOSTIC ENGINE CHART */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="bg-[#0B1120] border-gray-800 shadow-xl">
            <CardHeader>
              <CardTitle className="text-white text-base">AHT Component Diagnostics</CardTitle>
              <CardDescription>Visual trend showing Talk Time, Hold Time, and Dead Air averages by day (seconds)</CardDescription>
            </CardHeader>
            <CardContent className="pt-2 h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={ahtTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="day" stroke="#9ca3af" fontSize={12} />
                  <YAxis stroke="#9ca3af" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff' }}
                    labelStyle={{ color: '#9ca3af' }}
                  />
                  <Line type="monotone" dataKey="totalAht" name="Total AHT" stroke="#3b82f6" strokeWidth={3} activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="talkTime" name="Talk Time" stroke="#10b981" strokeWidth={2} />
                  <Line type="monotone" dataKey="holdTime" name="Hold Time" stroke="#f59e0b" strokeWidth={2} />
                  <Line type="monotone" dataKey="deadAir" name="Dead Air" stroke="#ef4444" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* CRM AUTO-LOGGING QUEUE STATUS */}
          <Card className="bg-[#0B1120] border-gray-800 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between border-b border-gray-800/80 pb-4">
              <div>
                <CardTitle className="text-white text-base">Live CRM Wrap-up & Logging Stream</CardTitle>
                <CardDescription>Nexaviq Auto-dispositions pushed to client CRM tools</CardDescription>
              </div>
              <div className="text-xs text-gray-500 flex items-center gap-1"><Database className="w-3.5 h-3.5" /> CRM: Connected</div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {syncLogs.map((log) => (
                <div key={log.id} className="p-4 rounded-xl bg-[#020617] border border-gray-800/80 flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-semibold text-gray-300">{log.agent}</span>
                      <span className="text-gray-600">•</span>
                      <span className="text-gray-500">{log.time}</span>
                      <span className="text-gray-600">•</span>
                      <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-400 font-mono text-[10px]">{log.callId}</span>
                    </div>
                    <p className="text-sm text-gray-400 leading-relaxed font-semibold">
                      {log.summary}
                    </p>
                    <div className="text-xs text-gray-500">
                      Auto-disposition code: <strong className="text-emerald-400 font-mono">{log.disposition}</strong>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className="px-3 py-1 rounded-full bg-emerald-950/50 border border-emerald-800/40 text-emerald-400 text-xs font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Synced
                    </span>
                    <span className="text-[10px] text-gray-600">to {log.crm}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

        </div>

        {/* RIGHT COLUMN: FCR LEAKAGE MONITOR */}
        <div className="lg:col-span-5 space-y-6">
          
          <Card className="bg-[#0B1120] border-gray-800 shadow-xl h-full flex flex-col justify-between">
            <CardHeader className="border-b border-gray-800/80 pb-4">
              <CardTitle className="text-white text-base">FCR Leakage & Repeat Call Root Causes</CardTitle>
              <CardDescription>Firms losing operational capacity to repeat callers</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              
              <div className="p-4 bg-red-500/10 border-2 border-red-500/20 rounded-2xl flex items-start gap-3 text-red-200">
                <ShieldAlert className="w-5 h-5 text-red-500 shrink-0 mt-0.5 animate-pulse" />
                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-white">Repeat Call Alert</h4>
                  <p className="text-xs text-red-300/80 leading-relaxed">
                    SOP parameters show that incomplete agent instructions on **Stripe Refunds** is driving a 15% increase in repeat callers this week.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">Leakage Categories</h4>
                
                {fcrLeakageData.map((item, i) => (
                  <div key={i} className="p-3 bg-[#020617]/50 rounded-xl border border-gray-800/80 flex items-center justify-between">
                    <div>
                      <span className="text-sm font-semibold text-white">{item.category}</span>
                      <p className="text-xs text-gray-500">Instances: {item.count} repeat calls</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-red-400 uppercase">Estimated Loss</span>
                      <p className="text-sm font-bold text-white font-mono">{item.cost}</p>
                    </div>
                  </div>
                ))}
              </div>

            </CardContent>
          </Card>

        </div>

      </div>

    </div>
  )
}
