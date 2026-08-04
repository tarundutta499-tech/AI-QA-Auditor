"use server"

import { GoogleGenAI } from '@google/genai'

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
