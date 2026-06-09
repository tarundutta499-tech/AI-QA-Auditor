"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from '@supabase/ssr'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Scale, Target, TrendingDown, Eye } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function CalibrationsPage() {
  const [calibrations, setCalibrations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [metrics, setMetrics] = useState({
    avgVariance: 0,
    totalCalibrations: 0
  })

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Since calibrations doesn't have company_id, we get it via audits -> calls
      // But for simplicity in this demo, we can just fetch all calibrations linked to the user's company calls
      
      const { data: userData } = await supabase.from('users').select('company_id').eq('id', user.id).single()
      if (!userData?.company_id) return

      // Find calls for this company
      const { data: calls } = await supabase.from('calls').select('id').eq('company_id', userData.company_id)
      const callIds = calls?.map(c => c.id) || []
      
      if (callIds.length === 0) {
        setLoading(false)
        return
      }

      // Find audits for these calls
      const { data: audits } = await supabase.from('audits').select('id').in('call_id', callIds)
      const auditIds = audits?.map(a => a.id) || []

      if (auditIds.length === 0) {
        setLoading(false)
        return
      }

      // Fetch calibrations for these audits
      const { data: calibData } = await supabase
        .from('calibrations')
        .select(`
          *,
          users ( name )
        `)
        .in('audit_id', auditIds)
        
      if (calibData) {
        setCalibrations(calibData)
        
        const totalVar = calibData.reduce((acc, c) => acc + Math.abs(c.variance || 0), 0)
        setMetrics({
          avgVariance: calibData.length > 0 ? Math.round(totalVar / calibData.length) : 0,
          totalCalibrations: calibData.length
        })
      }
      
      setLoading(false)
    }
    
    fetchData()
  }, [])

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
          <Scale className="text-blue-500 w-8 h-8" />
          Calibration Assistant
        </h1>
        <p className="text-muted-foreground mt-2">Compare Human QA scores with AI scores to ensure accuracy and alignment.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-[#0B1120] border-gray-800 shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Average AI Variance</CardTitle>
            <TrendingDown className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-white">±{metrics.avgVariance}%</div>
            <p className="text-xs text-muted-foreground mt-2">
               Target is &lt; 5%
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-[#0B1120] border-gray-800 shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total Calibrations</CardTitle>
            <Target className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-white">{metrics.totalCalibrations}</div>
            <p className="text-xs text-muted-foreground mt-2">
               Audits reviewed by human QAs
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-[#0B1120] border-gray-800 shadow-xl">
        <CardHeader>
          <CardTitle className="text-white">Recent Calibrations</CardTitle>
          <CardDescription>History of QA reviews on AI generated audits</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-400">Loading...</div>
          ) : calibrations.length === 0 ? (
            <div className="text-center py-12 text-gray-400 border border-dashed border-gray-800 rounded-xl">
              <Scale className="w-12 h-12 mx-auto mb-4 text-gray-600" />
              <p>No calibrations found.</p>
              <p className="text-sm mt-2">Go to an Audit and click "Calibrate" to add one.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-gray-800 hover:bg-transparent">
                  <TableHead className="text-gray-400">QA Analyst</TableHead>
                  <TableHead className="text-gray-400">AI Score</TableHead>
                  <TableHead className="text-gray-400">Human Score</TableHead>
                  <TableHead className="text-gray-400">Variance</TableHead>
                  <TableHead className="text-gray-400">Disagreement Areas</TableHead>
                  <TableHead className="text-right text-gray-400">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {calibrations.map((calib) => (
                  <TableRow key={calib.id} className="border-gray-800 hover:bg-gray-900/50">
                    <TableCell className="text-gray-300 font-medium">
                      {calib.users?.name || 'Unknown QA'}
                    </TableCell>
                    <TableCell className="text-blue-400 font-medium">
                      {calib.ai_score}%
                    </TableCell>
                    <TableCell className="text-purple-400 font-medium">
                      {calib.qa_score}%
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${
                        Math.abs(calib.variance) > 5 
                          ? 'bg-red-500/10 text-red-500 border-red-500/20' 
                          : 'bg-green-500/10 text-green-500 border-green-500/20'
                      }`}>
                        {calib.variance > 0 ? '+' : ''}{calib.variance}%
                      </span>
                    </TableCell>
                    <TableCell className="text-gray-400 text-sm max-w-[200px] truncate" title={JSON.stringify(calib.disagreement_areas)}>
                      {calib.disagreement_areas ? "Recorded" : "None"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/dashboard/audits/${calib.audit_id}`}>
                        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-gray-800">
                          <Eye className="w-4 h-4 mr-2" /> View Audit
                        </Button>
                      </Link>
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
