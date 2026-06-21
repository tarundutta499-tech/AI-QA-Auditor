import { GoogleGenAI } from '@google/genai'

export interface ProcessAuditOptions {
  supabase: any
  callId: string
  scorecardId: string
  agentId: string
  auditType: 'audio' | 'chat'
  geminiFile?: any
  chatTranscript?: string
}

export async function processAudit({
  supabase,
  callId,
  scorecardId,
  agentId,
  auditType,
  geminiFile,
  chatTranscript
}: ProcessAuditOptions) {
  
  // 1. Fetch scorecard parameters
  const { data: parameters } = await supabase
    .from('scorecard_parameters')
    .select('*')
    .eq('scorecard_id', scorecardId)

  if (!parameters || parameters.length === 0) {
    throw new Error('Scorecard has no parameters')
  }

  // 2. Fetch Company Knowledge (RAG)
  // We need to fetch the company ID first if it's not provided, but agentId is tied to company_id
  const { data: agent } = await supabase.from('users').select('company_id').eq('id', agentId).single()
  let knowledgeContext = ''

  if (agent?.company_id) {
    const { data: knowledgeBase } = await supabase
      .from('company_knowledge')
      .select('title, content')
      .eq('company_id', agent.company_id)

    if (knowledgeBase && knowledgeBase.length > 0) {
      knowledgeContext = `\n\n--- COMPANY KNOWLEDGE BASE & RULES ---\n`
      knowledgeContext += `You MUST verify that the agent followed these internal processes exactly. If the agent violated these rules, you must severely penalize them in the audit.\n\n`
      knowledgeBase.forEach((kb: any) => {
        knowledgeContext += `[RULE: ${kb.title}]\n${kb.content}\n\n`
      })
      knowledgeContext += `----------------------------------------\n`
    }
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
  
  let transcriptData: any = null

  // PASS 1: Transcription (if audio)
  if (geminiFile) {
    const transcriptPrompt = `
Generate a precise, standardized transcript of this audio call with speaker labels (Agent, Customer) and timestamps.
IMPORTANT MASKING RULE: You MUST redact all Personally Identifiable Information (PII) including names, phone numbers, addresses, credit cards, company names, app names, or service names from the transcript text. Replace them with [REDACTED].
Return STRICTLY a JSON array of objects with this exact structure, and absolutely nothing else:
[
  { "speaker": "Agent", "timestamp": "0:00", "text": "Hello" }
]
`
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { fileData: { fileUri: geminiFile.uri, mimeType: geminiFile.mimeType } },
        transcriptPrompt
      ],
      config: { temperature: 0.0, topP: 0.1, responseMimeType: "application/json" }
    })
    
    if (!response.text) throw new Error("Failed to generate transcript from audio.")
    transcriptData = JSON.parse(response.text.replace(/```json\n?|```/g, '').trim())
  } else if (chatTranscript) {
    transcriptData = [ { speaker: "Chat", timestamp: "0:00", text: chatTranscript } ]
  } else {
    throw new Error("No audio file or chat transcript provided")
  }

  // PASS 2: QA Audit (based exclusively on the generated text transcript)
  const auditPrompt = `
You are an expert QA Auditor for customer support interactions. 
Analyze the following transcript of the interaction:
${JSON.stringify(transcriptData)}
${knowledgeContext}

1. Identify any "dead air" (silences > 30 seconds) or unusually long delays in response by analyzing the timestamps between messages.
2. Audit the call based strictly on the following scorecard parameters. For each parameter, you must extract exact evidence from the transcript BEFORE scoring.
${parameters.map((p: any) => `- ${p.name} (Max Score: ${p.max_score}, Weight: ${p.weightage})`).join('\n')}
3. Evaluate the agent's tone and empathy out of 100 based on the text.
4. Provide coaching feedback.

Return the result STRICTLY as a JSON object with this exact structure:
{
  "dead_air_events": [ { "start_time": "0:15", "duration_seconds": 35, "impact": "negative" } ],
  "audit_results": [
    {
      "parameter_name": "Greeting",
      "obtained_score": 10,
      "is_passed": true,
      "evidence": "Exact quote from transcript",
      "reasoning": "Why this score was given"
    }
  ],
  "coaching": {
    "strengths": "String",
    "improvement_areas": "String",
    "recommended_actions": "String"
  },
  "overall_compliance_percent": 100,
  "empathy_score": 100
}
`

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [auditPrompt],
    config: {
      temperature: 0.0,
      topP: 0.1,
      responseMimeType: "application/json",
    }
  })

  const resultText = response.text
  if (!resultText) throw new Error("No response from Gemini Audit Pass")
  
  const cleanJsonText = resultText.replace(/```json\n?|```/g, '').trim()
  const analysis = JSON.parse(cleanJsonText)

  // Calculate total score
  const maxScore = parameters.reduce((sum: number, p: any) => sum + p.max_score, 0)
  const obtainedScore = analysis.audit_results.reduce((sum: number, r: any) => sum + r.obtained_score, 0)

  // Update Call Status
  await supabase.from('calls').update({ status: 'audited' }).eq('id', callId)

  // Insert Transcript
  await supabase.from('transcripts').insert({
    call_id: callId,
    content: transcriptData,
    dead_air_events: analysis.dead_air_events
  })

  // Insert Audit
  const { data: audit } = await supabase.from('audits').insert({
    call_id: callId,
    scorecard_id: scorecardId,
    overall_score: obtainedScore,
    compliance_percent: analysis.overall_compliance_percent,
    empathy_score: analysis.empathy_score || 0
  }).select().single()

  if (audit) {
    const auditResultsToInsert = analysis.audit_results.map((res: any) => {
      const param = parameters.find((p: any) => p.name === res.parameter_name)
      return {
        audit_id: audit.id,
        parameter_id: param?.id,
        obtained_score: res.obtained_score,
        is_passed: res.is_passed,
        evidence: res.evidence,
        reasoning: res.reasoning
      }
    })
    
    // Only insert if parameters match
    const validResults = auditResultsToInsert.filter((r: any) => r.parameter_id)
    if (validResults.length > 0) {
      await supabase.from('audit_results').insert(validResults)
    }

    await supabase.from('coaching').insert({
      audit_id: audit.id,
      agent_id: agentId,
      strengths: analysis.coaching.strengths,
      improvement_areas: analysis.coaching.improvement_areas,
      recommended_actions: analysis.coaching.recommended_actions
    })
  }

  return { success: true, audit_id: audit?.id }
}
