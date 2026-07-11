"use server"

import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/utils/supabase/server'
import { GoogleGenAI } from '@google/genai'

function getAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function askPulseAI(query: string) {
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

    // 1. Fetch calls data
    const { data: calls } = await adminClient
      .from('calls')
      .select('*')
      .eq('company_id', dbUser.company_id)

    // 2. Fetch audits with results
    const { data: audits } = await adminClient
      .from('audits')
      .select(`
        id,
        overall_score,
        compliance_percent,
        empathy_score,
        created_at,
        calls (
          id,
          duration,
          transcript
        ),
        audit_results (
          obtained_score,
          is_passed,
          scorecard_parameters (
            name
          )
        )
      `)

    // Filter audits by company
    const companyCallsMap = new Map((calls || []).map(c => [c.id, c]))
    const companyAudits = (audits || []).filter((a: any) => a.calls && companyCallsMap.has(a.calls.id))

    // Formulate context summary for Gemini
    const callDataSummary = companyAudits.map((a: any, i) => {
      const failedParams = (a.audit_results || [])
        .filter((r: any) => !r.is_passed)
        .map((r: any) => r.scorecard_parameters?.name)
        .join(', ')

      return `Call #${i + 1}:
- ID: ${a.id.substring(0, 8)}
- Duration: ${a.calls?.duration || 0} seconds
- Compliance Score: ${a.compliance_percent}%
- Empathy Score: ${a.empathy_score || 0}%
- Failed Guidelines: [${failedParams || 'None'}]
- Transcript Segment: "${a.calls?.transcript ? a.calls.transcript.substring(0, 400) + '...' : 'N/A'}"`
    }).join('\n\n')

    // Initialize Gemini
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
    
    const systemPrompt = `You are "Nexaviq Pulse AI", a cognitive operations assistant for contact centers and BPOs.
You help BPO managers and directors analyze call audits and identify performance, compliance, and AHT (Average Handle Time) issues.

Below is the live operational data from the company's database:
- Total Calls Audited: ${companyAudits.length}
- Average AHT: ${companyAudits.length > 0 ? Math.round(companyAudits.reduce((sum, a) => sum + (a.calls?.duration || 0), 0) / companyAudits.length) : 0} seconds

Audits Context:
${callDataSummary || "No audits recorded yet in the database."}

Instructions:
1. Provide highly analytical, executive-ready responses.
2. If there are no audits, guide the user to upload calls first to get insights.
3. Be concise and use bullet points where helpful.
4. Reference specific Call IDs if referring to call audits.`

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { role: 'user', parts: [{ text: `System context:\n${systemPrompt}\n\nUser Question: ${query}` }] }
      ]
    })

    const answer = response.text || "I was unable to process the query. Please try again."
    return { success: true, answer }
  } catch (error: any) {
    console.error("Pulse AI error:", error)
    return { success: false, error: error.message }
  }
}
