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
      .eq('role', 'agent')

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
        parameter_id,
        scorecard_parameters (
          name
        ),
        audits!inner (
          id,
          call_id,
          calls!inner (
            agent_id
          )
        )
      `)
      .eq('audits.calls.agent_id', agentId)
      .eq('is_passed', false)
      
    if (error) throw error

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

    return { success: true, failedParameters: sorted }
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
  failedParameters: { name: string; count: number }[]
) {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

    const prompt = `You are a BPO Director of Quality and Onboarding.
Prepare a custom New Hire Training / Refresher Syllabus and interactive review quiz for agent "${agentName}".

Runbook Context ("${runbookTitle}"):
"${runbookContent}"

Agent Performance Failures (Parameters they recently failed in audited calls):
${failedParameters.map(p => `- Failed "${p.name}" (${p.count} times)`).join('\n')}

Generate:
1. "focus_area": Briefly summarize how the agent is failing compliance parameters compared to the runbook instructions.
2. "daily_agenda": A Day 1 to Day 3 training roadmap showing what they should focus on.
3. "coaching_tips": 3 actionable study/practice tips.
4. "quiz": Generate 3 multiple-choice questions based on the runbook content to test their knowledge on their failed areas.

Output strictly in JSON format matching this schema:
{
  "focus_area": "Text summary",
  "daily_agenda": [
    { "day": "Day 1", "topic": "Topic name", "exercise": "Study guidelines..." }
  ],
  "coaching_tips": ["Tip 1", "Tip 2"],
  "quiz": [
    {
      "question": "Question text",
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
