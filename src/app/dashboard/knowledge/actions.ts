"use server"

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addKnowledge(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: dbUser } = await supabase.from('users').select('company_id').eq('id', user.id).single()
  if (!dbUser?.company_id) throw new Error("No company found")

  const title = formData.get('title') as string
  const content = formData.get('content') as string

  if (!title || !content) {
    throw new Error("Title and content are required.")
  }

  const { error } = await supabase.from('company_knowledge').insert({
    company_id: dbUser.company_id,
    title,
    content
  })

  if (error) {
    console.error("Failed to add knowledge:", error)
    throw new Error("Database error occurred.")
  }

  revalidatePath('/dashboard/knowledge')
  return { success: true }
}

export async function deleteKnowledge(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: dbUser } = await supabase.from('users').select('company_id').eq('id', user.id).single()
  
  // Note: RLS ensures they can only delete their own company's knowledge
  const { error } = await supabase.from('company_knowledge').delete().eq('id', id).eq('company_id', dbUser?.company_id)

  if (error) {
    console.error("Failed to delete knowledge:", error)
    throw new Error("Database error occurred.")
  }

  revalidatePath('/dashboard/knowledge')
  return { success: true }
}

export async function getCompanyAgents() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Unauthorized" }

    const { data: dbUser } = await supabase.from('users').select('company_id').eq('id', user.id).single()
    if (!dbUser?.company_id) return { success: false, error: "No company associated with user" }

    const { data: agents, error } = await supabase
      .from('users')
      .select('id, name, email, role')
      .eq('company_id', dbUser.company_id)

    if (error) throw error
    return { success: true, agents: agents || [] }
  } catch (error: any) {
    console.error("Fetch company agents error:", error)
    return { success: false, error: error.message }
  }
}

export async function getAgentFailedParameters(agentId: string) {
  try {
    const supabase = await createClient()
    
    // Fetch audit results for this agent where is_passed = false
    const { data: results, error } = await supabase
      .from('audit_results')
      .select(`
        id,
        is_passed,
        reasoning,
        evidence,
        scorecard_parameters (
          name
        ),
        audits!inner (
          id,
          overall_score,
          compliance_percent,
          created_at,
          calls!inner (
            id,
            client_name
          )
        )
      `)
      .eq('audits.calls.agent_id', agentId)
      .eq('is_passed', false)
      .order('audits.created_at', { ascending: false })
      
    if (error) throw error

    // Format failures list
    const failuresList = results?.map((r: any) => ({
      parameterName: r.scorecard_parameters?.name || 'Unknown Parameter',
      callId: r.audits?.calls?.id,
      clientName: r.audits?.calls?.client_name || 'Client Name',
      date: r.audits?.created_at ? new Date(r.audits.created_at).toLocaleDateString() : 'N/A',
      reason: r.reasoning || 'Did not meet scorecard criteria',
      evidence: r.evidence || ''
    })) || []

    // Count parameters occurrences
    const counts: { [name: string]: number } = {}
    results?.forEach((r: any) => {
      const name = r.scorecard_parameters?.name
      if (name) {
        counts[name] = (counts[name] || 0) + 1
      }
    })

    const sorted = Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)

    return { 
      success: true, 
      failedParameters: sorted,
      detailedFailures: failuresList 
    }
  } catch (error: any) {
    console.error("Failed parameters fetch error:", error)
    return { success: false, error: error.message }
  }
}

import { GoogleGenAI } from '@google/genai'

export async function generateRefresherPlan(
  agentName: string,
  runbookTitle: string,
  runbookContent: string,
  detailedFailures: { parameterName: string; clientName: string; date: string; reason: string; evidence: string }[]
) {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

    const prompt = `You are a BPO Director of Quality and Onboarding.
Prepare a custom New Hire Training / Refresher Syllabus and interactive review quiz for agent "${agentName}".
You MUST ground your analysis strictly in the provided real-world audit observations. Do NOT make up any generic or hypothetical compliance issues.

Runbook Context ("${runbookTitle}"):
"${runbookContent}"

Agent Performance Failures (Observed in Audits):
${detailedFailures.length > 0 
  ? detailedFailures.map((f, i) => `${i+1}. Parameter: "${f.parameterName}" | Client: "${f.clientName}" | Date: ${f.date}\n   Observation: ${f.reason}\n   Evidence: "${f.evidence}"`).join('\n\n')
  : 'None. The agent has a 100% compliance record.'}

CRITICAL RULES:
1. Ground your focus area strictly in the audit observations provided above. Citing which call dates and client observations they were noted in is mandatory.
2. In the "focus_area", write a professional evaluation detailing how the agent failed those specific parameters, referring to the evidence.
3. If there are no compliance failures (empty list), set "focus_area" to "Congratulations! Agent ${agentName} has a 100% compliance rating in recent audits. No active SOP gaps detected." and generate a daily agenda that consists of maintaining high standards and peer-mentoring.
4. Generate daily agenda topics that align with the runbook guidelines to remediate these specific failures.

Output strictly in JSON format matching this schema:
{
  "focus_area": "Detailed summary citing specific dates and observations",
  "daily_agenda": [
    { "day": "Day 1", "topic": "Topic name", "exercise": "Study guidelines..." }
  ],
  "coaching_tips": ["Tip 1", "Tip 2"],
  "quiz": [
    {
      "question": "Question text based on the runbook to test them on their weak points",
      "options": ["A", "B", "C", "D"],
      "answer": "Correct option text exactly"
    }
  ]
}`

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseMimeType: 'application/json'
      }
    })

    const resultText = response.text
    if (!resultText) throw new Error("No plan generated")

    const data = JSON.parse(resultText)
    return { success: true, data }

  } catch (error: any) {
    console.error("Refresher generation error:", error)
    return { success: false, error: error.message }
  }
}
