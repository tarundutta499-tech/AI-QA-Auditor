import { createClient } from '@/utils/supabase/server'
import { ReportsCharts } from '@/components/reports/reports-charts'

export default async function ReportsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: dbUser } = await supabase.from('users').select('company_id, role').eq('id', user.id).single()
  if (!dbUser) return null

  const { createClient: createSupabaseClient } = await import('@supabase/supabase-js')
  const getAdminClient = () => createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const adminClient = getAdminClient()

  let query = adminClient
    .from('audits')
    .select('*, calls!inner(*, users(name)), audit_results(is_passed, scorecard_parameters(name))')
    .order('created_at', { ascending: true })

  if (dbUser.role === 'agent') {
    query = query.eq('calls.agent_id', user.id)
  } else {
    query = query.eq('calls.company_id', dbUser.company_id)
  }

  const { data: audits } = await query

  // Query Coaching Sessions
  let coachingQuery = adminClient
    .from('coaching')
    .select('*, audits!inner(created_at, compliance_percent, empathy_score, calls!inner(agent_id, company_id, users!inner(name)))')
    .order('created_at', { ascending: true })

  if (dbUser.role === 'agent') {
    coachingQuery = coachingQuery.eq('audits.calls.agent_id', user.id)
  } else {
    coachingQuery = coachingQuery.eq('audits.calls.company_id', dbUser.company_id)
  }

  const { data: coaching } = await coachingQuery

  // Query Calibrations
  let calibrationsQuery = adminClient
    .from('calibrations')
    .select('*, audits!inner(created_at, compliance_percent, calls!inner(agent_id, company_id, users!inner(name)))')

  if (dbUser.role === 'agent') {
    calibrationsQuery = calibrationsQuery.eq('audits.calls.agent_id', user.id)
  } else {
    calibrationsQuery = calibrationsQuery.eq('audits.calls.company_id', dbUser.company_id)
  }

  const { data: calibrations } = await calibrationsQuery

  const formattedData = (audits || []).map((item, index) => ({
    ...item,
    name: `Call ${index + 1}`,
    date: new Date(item.created_at).toLocaleDateString(),
    compliance_score: item.compliance_percent,
    empathy_score: item.empathy_score || 0,
    agent_name: item.calls?.users?.name || "Unknown"
  }))

  const agentMap: Record<string, { totalComp: number, totalEmp: number, count: number }> = {}
  const failureCounts: Record<string, number> = {}
  let totalFailures = 0

  ;(audits || []).forEach(audit => {
    // Aggregate Agent Data
    const aName = audit.calls?.users?.name || "Unknown"
    if (!agentMap[aName]) {
      agentMap[aName] = { totalComp: 0, totalEmp: 0, count: 0 }
    }
    agentMap[aName].totalComp += (audit.compliance_percent || 0)
    agentMap[aName].totalEmp += (audit.empathy_score || 0)
    agentMap[aName].count += 1

    // Aggregate Pareto Data (Root Cause Analysis)
    audit.audit_results?.forEach((result: any) => {
      if (result.is_passed === false && result.scorecard_parameters?.name) {
        const paramName = result.scorecard_parameters.name
        failureCounts[paramName] = (failureCounts[paramName] || 0) + 1
        totalFailures++
      }
    })
  })

  const aggregatedAgentData = Object.entries(agentMap).map(([name, stats]) => ({
    name,
    avgCompliance: Math.round(stats.totalComp / stats.count),
    avgEmpathy: Math.round(stats.totalEmp / stats.count),
    calls: stats.count
  }))

  let cumulativeCount = 0
  const paretoData = Object.entries(failureCounts)
    .sort((a, b) => b[1] - a[1]) // Sort descending by frequency
    .map(([name, count]) => {
      cumulativeCount += count
      return {
        name,
        count,
        cumulativePercentage: totalFailures > 0 ? Math.round((cumulativeCount / totalFailures) * 100) : 0
      }
    })

  // Format Coaching Efficacy
  const coachingData = (coaching || []).map((c: any) => ({
    id: c.id,
    agent_name: c.audits?.calls?.users?.name || "Unknown",
    date: new Date(c.created_at).toLocaleDateString(),
    compliance_before: c.audits?.compliance_percent || 0,
    empathy_before: c.audits?.empathy_score || 0,
    strengths: c.strengths,
    improvement_areas: c.improvement_areas,
    recommended_actions: c.recommended_actions
  }))

  // Format Calibrations
  const calibrationData = (calibrations || []).map((c: any) => ({
    id: c.id,
    qa_score: c.qa_score,
    ai_score: c.ai_score,
    variance: c.variance,
    agent_name: c.audits?.calls?.users?.name || "Unknown",
    date: new Date(c.audits?.created_at).toLocaleDateString()
  }))

  return (
    <ReportsCharts 
      data={formattedData} 
      agentData={aggregatedAgentData} 
      paretoData={paretoData}
      coachingData={coachingData}
      calibrationData={calibrationData}
      role={dbUser.role} 
    />
  )
}
