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
  
  const prompt = `
You are an expert QA Auditor for customer support interactions. 
Analyze the provided ${auditType === 'audio' ? 'audio call recording' : 'text chat transcript'}.${knowledgeContext}

1. Generate a standardized transcript with speaker labels (Agent, Customer) and timestamps.
   IMPORTANT MASKING RULE: You MUST redact all Personally Identifiable Information (PII) including names, phone numbers, addresses, credit cards, company names, app names, or service names from the transcript text. Replace them with [REDACTED].
2. Identify any "dead air" (silences > 30 seconds) or unusually long delays in response.
3. Audit the call based on the following scorecard parameters:
${parameters.map((p: any) => `- ${p.name} (Max Score: ${p.max_score}, Weight: ${p.weightage})`).join('\n')}
4. Provide coaching feedback.

Return the result STRICTLY as a JSON object with this exact structure:
{
  "transcript": [ { "speaker": "Agent", "timestamp": "0:00", "text": "Hello" } ],
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
  "overall_compliance_percent": 100
}
`

  const contents: any[] = []
  if (geminiFile) {
    contents.push(geminiFile)
  } else if (chatTranscript) {
    contents.push(`Here is the chat transcript to audit:\n\n${chatTranscript}`)
  } else {
    throw new Error("No audio file or chat transcript provided")
  }
  
  contents.push(prompt)

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: contents,
    config: {
      responseMimeType: "application/json",
    }
  })

  const resultText = response.text
  if (!resultText) throw new Error("No response from Gemini")
  
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
    content: analysis.transcript,
    dead_air_events: analysis.dead_air_events
  })

  // Insert Audit
  const { data: audit } = await supabase.from('audits').insert({
    call_id: callId,
    scorecard_id: scorecardId,
    overall_score: obtainedScore,
    compliance_percent: analysis.overall_compliance_percent
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
