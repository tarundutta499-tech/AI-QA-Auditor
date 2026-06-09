import { GoogleGenAI } from '@google/genai'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import nodemailer from 'nodemailer'

// Initialize the new Google Gen AI SDK
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

// Initialize Supabase admin client for backend operations
// Note: We use the service role key here if available to bypass RLS for server-to-server operations,
// but for now we fallback to anon key since we might not have service role in the env.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

const SYSTEM_SOP = `You are an expert QA Manager at an enterprise BPO. Your job is to strictly audit the attached customer service call recording.
Grade the agent's performance against standard compliance and empathy metrics.

You MUST return your analysis as a strict, raw JSON object. Do NOT include markdown blocks like \`\`\`json. Return ONLY the raw JSON string matching this exact structure:
{
  "empathyScore": <number between 0 and 100>,
  "complianceScore": <number between 0 and 100>,
  "fatalErrors": [<array of strings containing any severe compliance violations like swearing, hanging up, or exposing PII. Empty array if none>],
  "coachingNotes": [<array of 3 specific, actionable coaching tips for the agent>],
  "callSummary": "<A clear 2-sentence summary of what the customer wanted and if it was resolved>",
  "checklist": [
    {
      "parameter": "Call Opening (Standard greeting used)",
      "status": "<Yes, No, or NA>",
      "reasoning": "<Short 1 sentence explanation>"
    },
    {
      "parameter": "Required Disclosures Stated",
      "status": "<Yes, No, or NA>",
      "reasoning": "<Short 1 sentence explanation>"
    },
    {
      "parameter": "Proper Call Closing (Thanked customer)",
      "status": "<Yes, No, or NA>",
      "reasoning": "<Short 1 sentence explanation>"
    }
  ]
}`

export async function POST(req: Request) {
  try {
    // 1. Authenticate the incoming webhook
    const authHeader = req.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: "Missing or invalid Authorization header." }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]

    // Verify API Key against the database
    const { data: apiKeyData, error: apiError } = await supabase
      .from('api_keys')
      .select('company_id')
      .eq('key_value', token)
      .single()

    if (apiError || !apiKeyData) {
      console.error("API Key Verification Failed:", apiError)
      return NextResponse.json({ success: false, error: "Invalid API Key." }, { status: 401 })
    }

    const company_id = apiKeyData.company_id

    // 2. Parse the PBX Payload
    const { audio_url, agent_id, client_name, duration } = await req.json()

    if (!audio_url) {
      return NextResponse.json({ success: false, error: "Missing audio_url in payload." }, { status: 400 })
    }

    console.log(`[WEBHOOK] Received call from company ${company_id}. Fetching audio...`)

    // 3. Fetch Audio
    const audioRes = await fetch(audio_url)
    if (!audioRes.ok) {
      throw new Error(`Failed to download audio from provided URL. Status: ${audioRes.status}`)
    }

    const arrayBuffer = await audioRes.arrayBuffer()
    const base64Audio = Buffer.from(arrayBuffer).toString('base64')
    
    // Determine mime type
    const mimeType = audio_url.toLowerCase().endsWith('.wav') ? 'audio/wav' : 
                     audio_url.toLowerCase().endsWith('.m4a') ? 'audio/m4a' : 'audio/mp3'

    console.log(`[WEBHOOK] Audio downloaded. Sending to Gemini 1.5 Flash...`)
    
    // 4. Run AI Analysis
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: SYSTEM_SOP },
            {
              inlineData: {
                data: base64Audio,
                mimeType: mimeType
              }
            }
          ]
        }
      ],
      config: {
        temperature: 0.0,
      }
    })

    const resultText = response.text
    if (!resultText) {
      throw new Error("Gemini returned an empty response")
    }

    // Clean up potential markdown wrappers
    const cleanedJson = resultText.replace(/```json/gi, '').replace(/```/g, '').trim()
    const scorecardData = JSON.parse(cleanedJson)

    console.log(`[WEBHOOK] AI Analysis complete. Saving to PostgreSQL...`)

    // 5. Database Ingestion
    // A. Create the Call record
    const { data: callData, error: callError } = await supabase
      .from('calls')
      .insert({
        company_id,
        agent_id: agent_id || null,
        client_name: client_name || 'Unknown Webhook Client',
        audio_url,
        duration: duration || 0,
        status: 'audited'
      })
      .select('id')
      .single()

    if (callError) throw new Error(`Database error (calls): ${callError.message}`)

    // B. Create the Audit record
    const { error: auditError } = await supabase
      .from('audits')
      .insert({
        call_id: callData.id,
        overall_score: scorecardData.complianceScore, // Simplified for now
        compliance_percent: scorecardData.complianceScore,
        empathy_score: scorecardData.empathyScore,
        raw_analysis: scorecardData.checklist,
        fatal_errors: scorecardData.fatalErrors,
        coaching_notes: scorecardData.coachingNotes,
        status: 'completed'
      })

    if (auditError) throw new Error(`Database error (audits): ${auditError.message}`)

    console.log(`[WEBHOOK] Successfully processed and ingested call ${callData.id}.`)

    // 6. Check Alert Threshold and Send Custom SMTP Email
    try {
      const { data: companySettings } = await supabase
        .from('companies')
        .select('smtp_host, smtp_port, smtp_user, smtp_pass, smtp_from_email, alert_threshold, escalation_email')
        .eq('id', company_id)
        .single()

      if (companySettings && companySettings.smtp_host) {
        const threshold = companySettings.alert_threshold || 80
        const overallScore = scorecardData.complianceScore
        
        if (overallScore < threshold) {
          // Fetch agent email if we have agent_id
          let agentEmail = null
          if (agent_id) {
            const { data: agentData } = await supabase.from('users').select('email').eq('id', agent_id).single()
            if (agentData) agentEmail = agentData.email
          }
          
          const recipients = []
          if (agentEmail) recipients.push(agentEmail)
          if (companySettings.escalation_email) recipients.push(companySettings.escalation_email)

          if (recipients.length > 0) {
            const transporter = nodemailer.createTransport({
              host: companySettings.smtp_host,
              port: companySettings.smtp_port || 587,
              secure: companySettings.smtp_port === 465,
              auth: {
                user: companySettings.smtp_user,
                pass: companySettings.smtp_pass
              }
            })

            const htmlContent = `
              <h2>⚠️ Critical QA Alert: Call Scored Below Threshold</h2>
              <p>A recent call audited by AI has scored below the acceptable threshold of ${threshold}%.</p>
              <ul>
                <li><strong>Client:</strong> ${client_name || 'Unknown'}</li>
                <li><strong>Compliance Score:</strong> ${overallScore}%</li>
                <li><strong>Empathy Score:</strong> ${scorecardData.empathyScore || 'N/A'}/100</li>
              </ul>
              <h3>AI Coaching Notes:</h3>
              <ul>
                ${scorecardData.coachingNotes.map((note: string) => `<li>${note}</li>`).join('')}
              </ul>
              <p>Please log in to the QA Copilot Dashboard to review the full audit.</p>
            `

            await transporter.sendMail({
              from: companySettings.smtp_from_email || '"QA Alerts" <alerts@yourcompany.com>',
              to: recipients.join(', '),
              subject: `QA Alert: Low Score Detected (${overallScore}%)`,
              html: htmlContent
            })
            console.log(`[WEBHOOK] Alert email dispatched to ${recipients.join(', ')}`)
          }
        }
      }
    } catch (emailError) {
      console.error("[WEBHOOK] Failed to send SMTP email:", emailError)
      // We don't fail the webhook if the email fails
    }

    // 7. Return Success to Telephony System
    return NextResponse.json({ 
      success: true, 
      call_id: callData.id,
      message: "Call successfully ingested and audited."
    }, { status: 200 })

  } catch (error: any) {
    console.error("[WEBHOOK] Pipeline Error:", error)
    return NextResponse.json(
      { success: false, error: error.message || "An internal error occurred." },
      { status: 500 }
    )
  }
}
