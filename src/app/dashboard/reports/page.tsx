import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileSpreadsheet, FileText } from 'lucide-react'
import { QualityScoreChart, VolumeChart, DefectsChart, ChartData, DefectData } from '@/components/reports/trends-chart'
import { TimeSelector } from '@/components/reports/time-selector'
import { AgentLeaderboard, AgentRank } from '@/components/reports/agent-leaderboard'
import { FatalTracker, FatalViolation } from '@/components/reports/fatal-tracker'

export default async function ReportsPage(props: { searchParams: Promise<{ range?: string }> }) {
  const searchParams = await props.searchParams
  const range = searchParams.range || 'week'
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: dbUser } = await supabase.from('users').select('company_id').eq('id', user.id).single()
  if (!dbUser) return null

  const today = new Date()
  today.setHours(23, 59, 59, 999)
  
  let targetDate = new Date()
  let bucketCount = 7
  let bucketType = 'day'

  if (range === 'year') {
    targetDate.setFullYear(targetDate.getFullYear() - 1)
    bucketCount = 12
    bucketType = 'month'
  } else if (range === 'month') {
    targetDate.setDate(targetDate.getDate() - 30)
    bucketCount = 30
    bucketType = 'day'
  } else {
    targetDate.setDate(targetDate.getDate() - 6)
    bucketCount = 7
    bucketType = 'day'
  }
  
  targetDate.setHours(0, 0, 0, 0)

  // Fetch all audits, joined with calls, users, and audit_results to power all 5 widgets
  const { data: audits } = await supabase
    .from('audits')
    .select(`
      id, created_at, compliance_percent, overall_score,
      calls!inner(company_id, users(id, name)),
      audit_results(is_passed, scorecard_parameters(name, is_mandatory))
    `)
    .eq('calls.company_id', dbUser.company_id)
    .gte('created_at', targetDate.toISOString())

  let chartData: ChartData[] = []

  if (bucketType === 'month') {
    for (let i = 11; i >= 0; i--) {
      const d = new Date()
      d.setMonth(today.getMonth() - i)
      const monthStr = d.toLocaleDateString('en-US', { month: 'short' })
      const yearStr = d.getFullYear().toString()
      chartData.push({ name: `${monthStr} ${yearStr}`, score: 0, calls: 0, _totalScore: 0, _matchKey: `${d.getMonth()}-${d.getFullYear()}` } as any)
    }
  } else {
    for (let i = bucketCount - 1; i >= 0; i--) {
      const d = new Date()
      d.setDate(today.getDate() - i)
      const dayStr = range === 'month' ? d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : d.toLocaleDateString('en-US', { weekday: 'short' })
      const isoPrefix = d.toISOString().split('T')[0]
      chartData.push({ name: dayStr, score: 0, calls: 0, _totalScore: 0, _matchKey: isoPrefix } as any)
    }
  }

  const defectCounts: Record<string, number> = {}
  const agentStats: Record<string, { id: string, name: string, totalScore: number, audits: number }> = {}
  const fatalViolations: FatalViolation[] = []

  if (audits) {
    audits.forEach(audit => {
      const auditDateObj = new Date(audit.created_at)
      
      // 1. Chart Data
      let dayData
      if (bucketType === 'month') {
        const matchKey = `${auditDateObj.getMonth()}-${auditDateObj.getFullYear()}`
        dayData = chartData.find((d: any) => d._matchKey === matchKey)
      } else {
        const isoPrefix = auditDateObj.toISOString().split('T')[0]
        dayData = chartData.find((d: any) => d._matchKey === isoPrefix)
      }

      if (dayData) {
        dayData.calls += 1
        ;(dayData as any)._totalScore += (audit.compliance_percent || 0)
      }

      // 2. Agent Stats
      const callData: any = Array.isArray(audit.calls) ? audit.calls[0] : audit.calls
      const userData: any = callData ? (Array.isArray(callData.users) ? callData.users[0] : callData.users) : null
      const agentId = userData?.id
      
      if (agentId) {
        if (!agentStats[agentId]) {
          agentStats[agentId] = { id: agentId, name: userData?.name || 'Unknown', totalScore: 0, audits: 0 }
        }
        agentStats[agentId].audits++
        agentStats[agentId].totalScore += (audit.overall_score || 0)
      }

      // 3. Defects & Fatal Violations
      if (audit.audit_results) {
        audit.audit_results.forEach((res: any) => {
          if (res.is_passed === false) {
            const paramName = res.scorecard_parameters?.name || 'Unknown Parameter'
            
            // Defect count tracking
            if (!defectCounts[paramName]) {
              defectCounts[paramName] = 0
            }
            defectCounts[paramName]++

            // Fatal tracking
            if (res.scorecard_parameters?.is_mandatory) {
              fatalViolations.push({
                id: audit.id,
                parameter: paramName,
                agentName: userData?.name || 'Unknown',
                date: audit.created_at
              })
            }
          }
        })
      }
    })
    
    chartData.forEach(d => {
      if (d.calls > 0) {
        d.score = Math.round((d as any)._totalScore / d.calls)
      }
    })
  }

  const defectData: DefectData[] = Object.keys(defectCounts)
    .map(key => ({ parameter: key, count: defectCounts[key] }))
    .sort((a, b) => b.count - a.count)

  const agentRanks: AgentRank[] = Object.values(agentStats).map(s => ({
    id: s.id,
    name: s.name,
    score: Math.round(s.totalScore / s.audits),
    audits: s.audits
  }))

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Analytics & Reports</h1>
          <p className="text-muted-foreground mt-2">Export data and analyze historical QA performance.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <FileSpreadsheet className="h-4 w-4 text-emerald-500" />
            Export CSV
          </Button>
          <Button className="gap-2">
            <FileText className="h-4 w-4" />
            Export PDF Report
          </Button>
        </div>
      </div>

      <div className="space-y-8">
        <Card className="shadow-sm border-2">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-6 gap-4">
            <div>
              <CardTitle className="text-2xl">Overall Quality Trend</CardTitle>
              <CardDescription className="mt-1">Average AI evaluation score based on selected timeframe.</CardDescription>
            </div>
            <TimeSelector />
          </CardHeader>
          <CardContent className="pt-6">
            <QualityScoreChart data={chartData} />
          </CardContent>
        </Card>

        {/* 2-Column Grid for Leaderboard and Fatal Tracker */}
        <div className="grid md:grid-cols-2 gap-8">
          <AgentLeaderboard data={agentRanks} />
          <FatalTracker data={fatalViolations} />
        </div>

        <Card className="shadow-sm border-2">
          <CardHeader className="border-b pb-6">
            <CardTitle className="text-2xl">Audit Volume</CardTitle>
            <CardDescription className="mt-1">Number of AI QA Audits processed successfully.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <VolumeChart data={chartData} />
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
