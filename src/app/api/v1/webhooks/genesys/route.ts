import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { processAudit } from '@/lib/audit-service'

// Initialize Supabase admin client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function POST(req: Request) {
  try {
    // 1. Authenticate the incoming webhook
    const authHeader = req.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: "Missing or invalid Authorization header. Expected 'Bearer <API_KEY>'" }, { status: 401 })
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

    // 2. Parse the Webhook Payload
    const payload = await req.json()
    const { agent_email, client_name, text_transcript, duration } = payload

    if (!agent_email || !text_transcript) {
      return NextResponse.json({ success: false, error: "Missing required fields: agent_email, text_transcript" }, { status: 400 })
    }

    console.log(`[WEBHOOK] Received payload for company ${company_id}, Agent Email: ${agent_email}`)

    // 3. Resolve Agent ID
    const { data: agent } = await supabase
      .from('users')
      .select('id')
      .eq('email', agent_email)
      .eq('company_id', company_id)
      .single()

    if (!agent) {
      return NextResponse.json({ success: false, error: "Agent not found in this company." }, { status: 404 })
    }

    // 4. Resolve Default Scorecard
    const { data: scorecard } = await supabase
      .from('scorecards')
      .select('id')
      .eq('company_id', company_id)
      .limit(1)
      .single()

    if (!scorecard) {
      return NextResponse.json({ success: false, error: "No scorecards found for this company." }, { status: 400 })
    }

    // 5. Create the Call record
    const { data: callData, error: callError } = await supabase
      .from('calls')
      .insert({
        company_id,
        agent_id: agent.id,
        client_name: client_name || 'Webhook Client',
        duration: duration || 0,
        status: 'pending'
      })
      .select('id')
      .single()

    if (callError || !callData) {
      throw new Error(`Database error (calls): ${callError?.message}`)
    }

    console.log(`[WEBHOOK] Call ${callData.id} created. Processing audit in background...`)

    // 6. Process Audit Asynchronously (Do not await, return 202 immediately)
    processAudit({
      supabase,
      callId: callData.id,
      scorecardId: scorecard.id,
      agentId: agent.id,
      auditType: 'chat',
      chatTranscript: text_transcript
    }).catch(async (err) => {
      console.error("[WEBHOOK] Background Audit Processing Error:", err)
      await supabase.from('calls').update({ status: 'failed' }).eq('id', callData.id)
    })

    // 7. Return Success to Telephony System immediately
    return NextResponse.json({ 
      success: true, 
      call_id: callData.id,
      message: "Webhook accepted! Call created and AI audit queued in background."
    }, { status: 202 })

  } catch (error: any) {
    console.error("[WEBHOOK] Pipeline Error:", error)
    return NextResponse.json(
      { success: false, error: error.message || "An internal error occurred." },
      { status: 500 }
    )
  }
}
