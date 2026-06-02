import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  // This endpoint is completely separate from auth context, so we use a server-side admin client
  // to query companies based on the API Key
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  )
  
  try {
    // 1. Verify API Key
    const authHeader = req.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid Authorization header.' }, { status: 401 })
    }
    
    const apiKey = authHeader.split(' ')[1]
    
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('id, name')
      .eq('api_key', apiKey)
      .single()
      
    if (companyError || !company) {
      return NextResponse.json({ error: 'Invalid API Key.' }, { status: 401 })
    }

    // 2. Parse Request Body
    const body = await req.json().catch(() => ({}))
    const { type, audio_url, chat_transcript, agent_email, client_name, duration } = body

    const isChat = type === 'chat'
    
    if (!isChat && !audio_url) {
      return NextResponse.json({ error: 'audio_url is required for audio audits.' }, { status: 400 })
    }
    if (isChat && !chat_transcript) {
      return NextResponse.json({ error: 'chat_transcript is required for chat audits.' }, { status: 400 })
    }
    
    // 3. Find the Agent ID
    let agentId = null
    if (agent_email) {
      const { data: agent } = await supabase
        .from('users')
        .select('id')
        .eq('company_id', company.id)
        .eq('email', agent_email)
        .single()
      if (agent) agentId = agent.id
    }

    // 4. Insert the Call as Pending
    const { data: call, error: callError } = await supabase
      .from('calls')
      .insert({
        company_id: company.id,
        agent_id: agentId,
        client_name: client_name || 'API Upload',
        audio_url: audio_url || null,
        raw_chat: chat_transcript || null,
        duration: duration || null,
        status: 'pending' // Ready for queue processing
      })
      .select()
      .single()

    if (callError) {
      console.error("Failed to insert call via API:", callError)
      return NextResponse.json({ error: 'Failed to ingest call.' }, { status: 500 })
    }

    // 5. Fire off the background processing (Fire and Forget)
    // Note: In a true production environment, this should be sent to a Message Queue (like SQS or Upstash)
    // For now, we return 202 Accepted, indicating the call was received.
    
    // TODO: Trigger transcription worker queue here.

    return NextResponse.json({ 
      success: true, 
      message: 'Call received and queued for auditing.',
      call_id: call.id 
    }, { status: 202 })

  } catch (error: any) {
    console.error('Ingest API Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
