import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { processAudit } from '@/lib/audit-service'

// In a real production setup, we can use Vercel Cron to hit this endpoint 
// every 1 minute. We process up to 3 calls per minute to stay under timeout limits.
export async function GET() {
  // We use service role to run cron without user session
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  )
  
  try {
    // 1. Fetch pending calls
    const { data: pendingCalls, error: fetchError } = await supabase
      .from('calls')
      .select('id, agent_id, company_id, audio_url, raw_chat')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(3)

    if (fetchError) throw fetchError
    if (!pendingCalls || pendingCalls.length === 0) {
      return NextResponse.json({ message: 'No pending calls found.' }, { status: 200 })
    }

    const processedIds: string[] = []
    const failedIds: string[] = []

    // 2. Process each call
    for (const call of pendingCalls) {
      try {
        // Find default scorecard for the company
        const { data: scorecards } = await supabase
          .from('scorecards')
          .select('id')
          .eq('company_id', call.company_id)
          .limit(1)

        const scorecardId = scorecards && scorecards.length > 0 ? scorecards[0].id : null

        if (!scorecardId || !call.agent_id) {
          throw new Error('Missing scorecard or agent mapping')
        }

        const isChat = !!call.raw_chat

        // IMPORTANT: If it's an audio URL, in a real background worker we would download the file,
        // upload to Gemini File API, and pass geminiFile. 
        // For MVP, if they send audio via API, it requires downloading first.
        // For simplicity in this chat-focused update, we process chat seamlessly.
        
        if (isChat) {
          await processAudit({
            supabase,
            callId: call.id,
            scorecardId,
            agentId: call.agent_id,
            auditType: 'chat',
            chatTranscript: call.raw_chat
          })
          processedIds.push(call.id)
        } else {
          // Audio logic for cron requires downloading the remote file to tmpdir.
          // Implementing that requires fetching the URL and piping to fs.
          console.warn("Audio cron processing requires download step not fully implemented in MVP yet. Call ID:", call.id)
          failedIds.push(call.id)
        }

      } catch (err: any) {
        console.error(`Failed to process call ${call.id}:`, err)
        // Mark as failed so it doesn't infinitely loop
        await supabase.from('calls').update({ status: 'failed' }).eq('id', call.id)
        failedIds.push(call.id)
      }
    }

    return NextResponse.json({ 
      success: true, 
      processed: processedIds,
      failed: failedIds
    }, { status: 200 })

  } catch (error: any) {
    console.error('Queue Processing Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
