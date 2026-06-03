"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from '@supabase/ssr'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Loader2, TrendingUp, AlertTriangle, ShieldCheck, FileAudio, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import Scorecard from "@/components/dashboard/Scorecard"

export default function ReportsPage() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedAudit, setSelectedAudit] = useState<any | null>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    async function fetchAudits() {
      try {
        const { data: scorecards, error: dbError } = await supabase
          .from('demo_scorecards')
          .select('*')
          .order('created_at', { ascending: true })

        if (dbError) throw dbError
        
        // Format dates for charts
        const formattedData = (scorecards || []).map((item, index) => ({
          ...item,
          name: `Call ${index + 1}`,
          date: new Date(item.created_at).toLocaleDateString(),
        }))

        setData(formattedData)
      } catch (err: any) {
        console.error(err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    
    fetchAudits()
  }, [])

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl">
          <h3 className="font-bold mb-2">Failed to load analytics</h3>
          <p>{error}</p>
          <p className="mt-4 text-sm text-red-300">Did you run the SQL command in Supabase to create the table?</p>
        </div>
      </div>
    )
  }

  // Calculate Aggregates
  const avgEmpathy = data.length > 0 
    ? Math.round(data.reduce((acc, curr) => acc + curr.empathy_score, 0) / data.length) 
    : 0
  const avgCompliance = data.length > 0 
    ? Math.round(data.reduce((acc, curr) => acc + curr.compliance_score, 0) / data.length) 
    : 0

  if (selectedAudit) {
    // Reconstruct the data exactly how Scorecard.tsx expects it
    const scorecardData = {
      empathyScore: selectedAudit.empathy_score,
      complianceScore: selectedAudit.compliance_score,
      fatalErrors: selectedAudit.fatal_errors || [],
      coachingNotes: selectedAudit.coaching_notes || [],
      callSummary: selectedAudit.call_summary || ""
    }

    return (
      <div className="p-8 max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
        <Button 
          variant="outline" 
          onClick={() => setSelectedAudit(null)}
          className="border-gray-700 text-gray-300 hover:text-white bg-transparent"
        >
          ← Back to Analytics
        </Button>
        <Scorecard data={scorecardData} />
      </div>
    )
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      <div>
        <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Team Performance Analytics</h1>
        <p className="text-muted-foreground">Historical QA data and AI grading trends.</p>
      </div>

      {data.length === 0 ? (
        <div className="bg-[#0B1120] border border-border/50 rounded-3xl p-12 text-center text-gray-400">
          No audits found in the database. Go to the dashboard and run an AI Audit first!
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-[#0B1120] border-border/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">Total Calls Audited</CardTitle>
                <FileAudio className="h-4 w-4 text-blue-400" />
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-white">{data.length}</div>
                <p className="text-xs text-green-400 mt-2 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" /> +{data.length} this week
                </p>
              </CardContent>
            </Card>

            <Card className="bg-[#0B1120] border-border/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">Avg Empathy Score</CardTitle>
                <AlertTriangle className="h-4 w-4 text-yellow-400" />
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-white">{avgEmpathy}%</div>
                <p className="text-xs text-muted-foreground mt-2">Across all recorded calls</p>
              </CardContent>
            </Card>

            <Card className="bg-[#0B1120] border-border/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">Avg Compliance Score</CardTitle>
                <ShieldCheck className="h-4 w-4 text-green-400" />
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-white">{avgCompliance}%</div>
                <p className="text-xs text-muted-foreground mt-2">Strict QA protocol adherence</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <Card className="bg-[#0B1120] border-border/50">
            <CardHeader>
              <CardTitle className="text-white">Quality Assurance Trends</CardTitle>
              <CardDescription>Empathy vs Compliance scores over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                    <XAxis dataKey="name" stroke="#6b7280" tick={{ fill: '#6b7280' }} />
                    <YAxis stroke="#6b7280" tick={{ fill: '#6b7280' }} domain={[0, 100]} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }}
                      itemStyle={{ color: '#e2e8f0' }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    <Line 
                      type="monotone" 
                      name="Empathy Score"
                      dataKey="empathy_score" 
                      stroke="#3b82f6" 
                      strokeWidth={3}
                      activeDot={{ r: 8 }} 
                    />
                    <Line 
                      type="monotone" 
                      name="Compliance Score"
                      dataKey="compliance_score" 
                      stroke="#22c55e" 
                      strokeWidth={3}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Data Table */}
          <Card className="bg-[#0B1120] border-border/50">
            <CardHeader>
              <CardTitle className="text-white">Recent AI Audits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-400 uppercase border-b border-gray-800">
                    <tr>
                      <th className="px-4 py-3">Call</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Empathy</th>
                      <th className="px-4 py-3">Compliance</th>
                      <th className="px-4 py-3">Summary</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...data].reverse().map((audit, idx) => (
                      <tr key={audit.id} className="border-b border-gray-800/50 hover:bg-gray-800/20 transition-colors">
                        <td className="px-4 py-4 font-medium text-white">Call {data.length - idx}</td>
                        <td className="px-4 py-4 text-gray-400">{audit.date}</td>
                        <td className="px-4 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${audit.empathy_score >= 80 ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                            {audit.empathy_score}%
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${audit.compliance_score >= 90 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                            {audit.compliance_score}%
                          </span>
                        </td>
                        <td className="px-4 py-4 text-gray-400 max-w-xs truncate" title={audit.call_summary}>
                          {audit.call_summary}
                        </td>
                        <td className="px-4 py-4 text-right">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                            onClick={() => setSelectedAudit(audit)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Full Scorecard
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
