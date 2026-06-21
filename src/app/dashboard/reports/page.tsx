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
    .select('*, calls!inner(*, users(name))')
    .order('created_at', { ascending: true })

  if (dbUser.role === 'agent') {
    query = query.eq('calls.agent_id', user.id)
  } else {
    query = query.eq('calls.company_id', dbUser.company_id)
  }

  const { data: audits } = await query

  const formattedData = (audits || []).map((item, index) => ({
    ...item,
    name: `Call ${index + 1}`,
    date: new Date(item.created_at).toLocaleDateString(),
    compliance_score: item.compliance_percent,
    empathy_score: item.empathy_score || 0,
    agent_name: item.calls?.users?.name || "Unknown"
  }))

  const agentMap: Record<string, { totalComp: number, totalEmp: number, count: number }> = {}
  formattedData.forEach(audit => {
    const aName = audit.agent_name
    if (!agentMap[aName]) {
      agentMap[aName] = { totalComp: 0, totalEmp: 0, count: 0 }
    }
    agentMap[aName].totalComp += (audit.compliance_score || 0)
    agentMap[aName].totalEmp += (audit.empathy_score || 0)
    agentMap[aName].count += 1
  })

  const aggregatedAgentData = Object.entries(agentMap).map(([name, stats]) => ({
    name,
    avgCompliance: Math.round(stats.totalComp / stats.count),
    avgEmpathy: Math.round(stats.totalEmp / stats.count),
    calls: stats.count
  }))

  return (
    <ReportsCharts 
      data={formattedData} 
      agentData={aggregatedAgentData} 
      role={dbUser.role} 
    />
  )
}
