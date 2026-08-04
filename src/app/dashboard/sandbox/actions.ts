"use server"

import { GoogleGenAI } from '@google/genai'
import { createClient } from '@/utils/supabase/server'

interface ConversationMessage {
  role: 'agent' | 'customer'
  text: string
}

export async function sendSandboxTurn(
  scenario: string,
  history: ConversationMessage[],
  agentMessage: string
) {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

    const systemPrompt = `You are playing the role of a customer in a call center training simulation.
The scenario chosen by the agent/manager is: "${scenario}".

Your task is to stay in character. Speak naturally as a caller.
Keep your response short and conversational (1 to 2 sentences maximum) since this is a simulated phone call.

Analyze the agent's response:
- Empathy: Did they acknowledge your frustration?
- Clarity: Did they explain things clearly?
- Professionalism: Did they stay calm?

You must output your response strictly in JSON format matching this schema:
{
  "customer_response": "The actual text you say back to the agent as the customer.",
  "agent_empathy_score": 85, // Integer rating from 0 to 100 on their last response
  "coaching_tip": "A short, actionable tip for the agent to improve their next sentence.",
  "checklist_completed": ["Greeting", "Active Listening"] // Guidelines they successfully hit in their statement
}

Current Conversation History:
${history.map(h => `${h.role === 'agent' ? 'Agent' : 'Customer'}: ${h.text}`).join('\n')}
Agent's Latest Turn: "${agentMessage}"`

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: systemPrompt }] }],
      config: {
        responseMimeType: 'application/json'
      }
    })

    const resultText = response.text
    if (!resultText) throw new Error("No response from AI simulation client")

    const data = JSON.parse(resultText)
    return { success: true, data }
  } catch (error: any) {
    console.error("Sandbox Turn Error:", error)
    return { success: false, error: error.message }
  }
}

export async function generateSandboxReport(
  scenarioTitle: string,
  scenarioPrompt: string,
  checkpoints: string[],
  history: ConversationMessage[]
) {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

    const evaluationPrompt = `You are a professional BPO QA Supervisor evaluating an agent's performance in a voice mock-call training simulation.
Scenario Title: "${scenarioTitle}"
Scenario Context: "${scenarioPrompt}"

Objectives Scorecard Parameters to measure against:
${checkpoints.map((c, i) => `${i + 1}. ${c}`).join('\n')}

Here is the full conversation transcript:
${history.map(h => `${h.role === 'agent' ? 'Agent' : 'Customer'}: ${h.text}`).join('\n')}

Evaluate the agent's performance based on the transcript and objectives. Rate them on a scale of 0 to 100.
Provide a clear analysis of:
1. What the agent did well (Strengths).
2. What the agent could have done better (Improvements).
3. Parameter evaluation breakdown: for each parameter, evaluate if they passed or failed, and why.

Output strictly in JSON format matching this schema:
{
  "score": 85, // Overall grade from 0 to 100
  "strengths": ["Greeting was friendly and clear", "Kept calm even when client raised tone"],
  "improvements": ["Should have explicitly asked for verification before sharing account details", "Forgot to summarize action steps at the end"],
  "parameter_breakdown": [
    {
      "parameter": "Warm Greeting",
      "passed": true,
      "feedback": "Agent greeted with name and company branding clearly."
    }
  ]
}`

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: evaluationPrompt }] }],
      config: {
        responseMimeType: 'application/json'
      }
    })

    const resultText = response.text
    if (!resultText) throw new Error("No evaluation report generated")

    const data = JSON.parse(resultText)
    return { success: true, data }
  } catch (error: any) {
    console.error("Sandbox evaluation report error:", error)
    return { success: false, error: error.message }
  }
}

export async function getCompanyScorecards() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Unauthorized" }

    const { data: dbUser } = await supabase.from('users').select('company_id').eq('id', user.id).single()
    if (!dbUser?.company_id) return { success: false, error: "No company associated with user" }

    const { data: scorecards, error } = await supabase
      .from('scorecards')
      .select(`
        id,
        name,
        description,
        scorecard_parameters (
          id,
          name,
          max_score
        )
      `)
      .eq('company_id', dbUser.company_id)

    if (error) throw error
    return { success: true, scorecards: scorecards || [] }
  } catch (error: any) {
    console.error("Fetch scorecards error:", error)
    return { success: false, error: error.message }
  }
}

export async function getAIRecommendedScenarios() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Unauthorized" }

    const { data: dbUser } = await supabase.from('users').select('company_id').eq('id', user.id).single()
    if (!dbUser?.company_id) return { success: false, error: "No company associated with user" }

    // Fetch the 10 most recent audited calls to analyze performance bottlenecks
    const { data: recentCalls, error: fetchError } = await supabase
      .from('calls')
      .select(`
        id,
        summary,
        audits (
          compliance_percent,
          empathy_score,
          fatal_errors,
          coaching_notes
        )
      `)
      .eq('company_id', dbUser.company_id)
      .eq('status', 'audited')
      .order('created_at', { ascending: false })
      .limit(10)

    if (fetchError) throw fetchError

    // If no audited calls exist yet, return empty list (UI will fallback to default scorecards)
    if (!recentCalls || recentCalls.length === 0) {
      return { success: true, scenarios: [] }
    }

    // Format audit data for Gemini
    const auditsSummary = recentCalls.map((c: any, i) => {
      const audit = c.audits?.[0] || {}
      return `${i + 1}. Call Summary: "${c.summary || 'N/A'}". Compliance Score: ${audit.compliance_percent || 'N/A'}%. Empathy Score: ${audit.empathy_score || 'N/A'}%. Critical Failures: ${JSON.stringify(audit.fatal_errors || 'None')}. Coaching Notes: ${JSON.stringify(audit.coaching_notes || 'None')}.`
    }).join('\n')

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

    const analysisPrompt = `You are a BPO Training Operations Director.
Analyze the following recent BPO call audit logs to identify critical failure trends (e.g. agents failing script guidelines, customer disputes, poor empathy handling, product questions).
Generate exactly 3 custom training scenarios to help new hires practice solving these specific issues in the simulator.

Recent Call Audits & Bottlenecks:
${auditsSummary}

Ensure the training scenario Title clearly explains why it is recommended (e.g. "Auto-Billing Dispute (High Disagreements)" or "Identity Check Compliance (Failed SOP Procedural Step)").
Output strictly in JSON format matching this schema:
{
  "scenarios": [
    {
      "title": "Scenario Title",
      "description": "Short explanation of the recent failure trends this practice call targets to fix.",
      "difficulty": "Easy" | "Medium" | "Hard",
      "prompt": "Detailed system character instructions for the customer roleplayer simulator.",
      "initialCustomerGreeting": "First dialogue sentence from the customer.",
      "checkpoints": ["Objective 1", "Objective 2", "Objective 3"]
    }
  ]
}`

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: analysisPrompt }] }],
      config: {
        responseMimeType: 'application/json'
      }
    })

    const resultText = response.text
    if (!resultText) throw new Error("No scenarios recommended")

    const data = JSON.parse(resultText)
    return { success: true, scenarios: data.scenarios || [] }

  } catch (error: any) {
    console.error("Fetch AI recommendations error:", error)
    return { success: false, error: error.message }
  }
}
