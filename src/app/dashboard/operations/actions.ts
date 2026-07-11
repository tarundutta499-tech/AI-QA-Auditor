"use server"

import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/utils/supabase/server'

function getAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function getLiveOperationsData() {
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    const { data: dbUser } = await supabase
      .from('users')
      .select('company_id')
      .eq('id', user.id)
      .single()

    if (!dbUser?.company_id) throw new Error("Company not found")

    const adminClient = getAdminClient()

    // 1. Fetch Calls
    const { data: calls, error: callsError } = await adminClient
      .from('calls')
      .select('*')
      .eq('company_id', dbUser.company_id)

    if (callsError) throw callsError

    // 2. Fetch Audits with Agent name and Call metadata
    const { data: audits, error: auditsError } = await adminClient
      .from('audits')
      .select(`
        id,
        summary,
        created_at,
        calls (
          id,
          duration,
          call_sid,
          agent_id,
          users (
            name
          )
        )
      `)
      .order('created_at', { ascending: false })

    if (auditsError) throw auditsError

    // Filter audits by company calls (since Postgres join may not filter main table if RLS is enabled)
    const companyCallsMap = new Map(calls.map(c => [c.id, c]))
    const companyAudits = (audits || []).filter((a: any) => a.calls && companyCallsMap.has(a.calls.id))

    // Calculate metrics
    const totalCalls = calls?.length || 0
    
    // Average Handle Time (AHT) calculation
    const totalDuration = calls?.reduce((sum, c) => sum + (c.duration || 0), 0) || 0
    const avgAhtSec = totalCalls > 0 ? Math.round(totalDuration / totalCalls) : 0
    const minutes = Math.floor(avgAhtSec / 60)
    const seconds = avgAhtSec % 60
    const ahtText = totalCalls > 0 ? `${minutes}m ${seconds < 10 ? '0' : ''}${seconds}s` : "0m 00s"

    // ACW Time Saved calculation (2 minutes saved per audit)
    const totalAudits = companyAudits.length
    const acwSavedMins = totalAudits * 2

    // Map audits to sync logs
    const mappedLogs = companyAudits.map((a: any) => {
      const agentName = a.calls?.users?.name || "Agent"
      const cleanSummary = a.summary || "Call audited successfully. Compliance checks completed."
      return {
        id: a.id,
        time: new Date(a.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        agent: agentName,
        callId: a.calls?.call_sid ? a.calls.call_sid.substring(0, 8) : a.calls?.id?.substring(0, 8) || "N/A",
        summary: cleanSummary,
        disposition: "QA - Automated",
        status: "synced",
        crm: "Salesforce"
      }
    })

    return {
      success: true,
      metrics: {
        acwSavedMins,
        ahtText,
        totalCalls,
        totalAudits
      },
      logs: mappedLogs.slice(0, 5) // Return last 5 logs
    }
  } catch (error: any) {
    console.error("Failed to load operations metrics:", error)
    return { success: false, error: error.message }
  }
}
