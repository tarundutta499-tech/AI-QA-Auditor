import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { processAudit } from '@/lib/audit-service'
import { GoogleGenAI } from '@google/genai'
import { writeFile, unlink } from 'fs/promises'
import os from 'os'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

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
        } else if (call.audio_url) {
          let geminiFile: any = null
          let tempFilePath = ''
          const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

          try {
            console.log(`Downloading audio for call ${call.id}...`)
            const res = await fetch(call.audio_url)
            if (!res.ok) throw new Error(`Failed to download audio: ${res.statusText}`)
            const buffer = Buffer.from(await res.arrayBuffer())
            
            const tempFileName = `${uuidv4()}-audio.mp3`
            tempFilePath = path.join(os.tmpdir(), tempFileName)
            await writeFile(tempFilePath, buffer)

            console.log(`Uploading audio to Gemini for call ${call.id}...`)
            geminiFile = await ai.files.upload({
              file: tempFilePath,
              config: { mimeType: call.audio_url.toLowerCase().endsWith('.wav') ? 'audio/wav' : 'audio/mp3' },
            })

            console.log(`Processing audit for call ${call.id}...`)
            await processAudit({
              supabase,
              callId: call.id,
              scorecardId,
              agentId: call.agent_id,
              auditType: 'audio',
              geminiFile
            })
            
            processedIds.push(call.id)
          } finally {
            // Clean up resources regardless of success/failure
            if (geminiFile) {
              await unlink(tempFilePath).catch(console.error)
              await ai.files.delete({ name: geminiFile.name }).catch(console.error)
            }
          }
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
