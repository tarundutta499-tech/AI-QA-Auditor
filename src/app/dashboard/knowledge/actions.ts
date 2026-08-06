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
  detailedFailures: { parameterName: string; clientName: string; date: string; reason: string; evidence: string }[]
) {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

    const prompt = `You are a BPO Quality Coach and Team Lead.
Review the actual call audit failures for agent "${agentName}" and write a highly personalized, conversational coaching plan and quiz.
Speak in a warm, encouraging, human-to-human tone (like a supportive Team Lead speaking directly to their agent). Avoid corporate jargon, textbook runbook language, or robotic boilerplate. Use "you" to refer to the agent.

Agent Performance Failures (Observed in Audits):
${detailedFailures.length > 0 
  ? detailedFailures.map((f, i) => `${i+1}. Parameter: "${f.parameterName}" | Client: "${f.clientName}" | Date: ${f.date}\n   What happened: ${f.reason}\n   Evidence: "${f.evidence}"`).join('\n\n')
  : 'None. The agent has a 100% compliance record.'}

CRITICAL RULES:
1. Ground the "focus_area" strictly in the audit observations list above. Explicitly cite the dates and clients. For example: "Reviewing your call on [Date] for [Client], I noticed you missed [Parameter] because [Reason]. Let's work on this."
2. The "daily_agenda" must be concrete, direct, and conversational. Give them specific, actionable exercises to do on their next shift (e.g. Day 1: "Avoid saying 'Thank you' during greetings, and practice the opening script using the mandatory word.").
3. The quiz must test them directly on their specific mistakes based on the audit notes. For example, if they failed by using forbidden words, ask a question about that specific rule.
4. If there are no compliance failures (empty list), set "focus_area" to "Congratulations, ${agentName}! You have a 100% compliance rating in recent audits. No active SOP gaps detected. Keep up the excellent work!" and generate a daily agenda focused on peer-mentoring and maintaining performance.

Output strictly in JSON format matching this schema:
{
  "focus_area": "Warm, direct coaching summary addressing the agent",
  "daily_agenda": [
    { "day": "Day 1", "topic": "Direct topic", "exercise": "Conversational instructions..." }
  ],
  "coaching_tips": ["Tip 1", "Tip 2"],
  "quiz": [
    {
      "question": "Question text addressing the mistake",
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
