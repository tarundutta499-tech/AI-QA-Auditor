"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from '@supabase/ssr'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertTriangle, Plus, Search, Frown, MessageSquareWarning } from "lucide-react"
import { format } from "date-fns"

export default function DsatPage() {
  const [dsatRecords, setDsatRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [companyId, setCompanyId] = useState<string | null>(null)
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: userData } = await supabase
      .from('users')
      .select('company_id')
      .eq('id', user.id)
      .single()
      
    if (userData?.company_id) {
      setCompanyId(userData.company_id)
      
      const { data: records } = await supabase
        .from('dsat_records')
        .select(`
          *,
          calls ( client_name, audio_url )
        `)
        .eq('company_id', userData.company_id)
        .order('created_at', { ascending: false })
        
      setDsatRecords(records || [])
    }
    setLoading(false)
  }

  async function simulateDSAT() {
    if (!companyId) return
    
    // Find a call to attach this DSAT to
    const { data: calls } = await supabase
      .from('calls')
      .select('id')
      .eq('company_id', companyId)
      .limit(1)
      
    const callId = calls && calls.length > 0 ? calls[0].id : null

    // Insert dummy record
    const { error } = await supabase.from('dsat_records').insert({
      company_id: companyId,
      call_id: callId,
      score: Math.floor(Math.random() * 3) + 1, // 1 to 3
      customer_feedback: "The agent was very rude and didn't solve my problem.",
      root_cause_category: "Agent Behavior",
      ai_analysis: "The agent interrupted the customer 3 times and used an aggressive tone when discussing the refund policy. Immediate coaching on de-escalation is required."
    })

    if (!error) {
      fetchData()
    } else {
      alert("Error inserting DSAT: " + error.message)
    }
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <AlertTriangle className="text-red-500 w-8 h-8" />
            DSAT Analysis
          </h1>
          <p className="text-muted-foreground mt-2">Track customer dissatisfaction and view AI root-cause analysis.</p>
        </div>
        <Button onClick={simulateDSAT} className="bg-red-600 hover:bg-red-700 text-white gap-2">
          <Plus className="w-4 h-4" /> Simulate DSAT Alert
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-[#0B1120] border-gray-800 shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total DSATs (30d)</CardTitle>
            <Frown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-white">{dsatRecords.length}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-[#0B1120] border-gray-800 shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Top Root Cause</CardTitle>
            <MessageSquareWarning className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-white">Agent Behavior</div>
            <p className="text-xs text-muted-foreground mt-1">Responsible for 45% of DSATs</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-[#0B1120] border-gray-800 shadow-xl">
        <CardHeader>
          <CardTitle className="text-white">Recent DSAT Alerts</CardTitle>
          <CardDescription>All negatively scored calls with AI Analysis</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-400">Loading...</div>
          ) : dsatRecords.length === 0 ? (
            <div className="text-center py-12 text-gray-400 border border-dashed border-gray-800 rounded-xl">
              <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-gray-600" />
              <p>No DSAT records found.</p>
              <p className="text-sm mt-2">Click "Simulate DSAT Alert" to test the integration.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-gray-800 hover:bg-transparent">
                  <TableHead className="text-gray-400">Date</TableHead>
                  <TableHead className="text-gray-400">Client</TableHead>
                  <TableHead className="text-gray-400">Score</TableHead>
                  <TableHead className="text-gray-400">Root Cause</TableHead>
                  <TableHead className="text-gray-400 max-w-md">AI Analysis</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dsatRecords.map((record) => (
                  <TableRow key={record.id} className="border-gray-800 hover:bg-gray-900/50">
                    <TableCell className="text-gray-300">
                      {format(new Date(record.created_at), 'MMM d, yyyy HH:mm')}
                    </TableCell>
                    <TableCell className="text-gray-300">
                      {record.calls?.client_name || 'Unknown'}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-500/10 text-red-500 border border-red-500/20">
                        {record.score}/5
                      </span>
                    </TableCell>
                    <TableCell className="text-gray-300">
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
                        {record.root_cause_category}
                      </span>
                    </TableCell>
                    <TableCell className="text-gray-400 max-w-md text-sm truncate" title={record.ai_analysis}>
                      {record.ai_analysis}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
