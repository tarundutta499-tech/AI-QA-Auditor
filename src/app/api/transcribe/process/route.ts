import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { GoogleGenAI } from '@google/genai'
import { processAudit } from '@/lib/audit-service'
import { after } from 'next/server'

export const maxDuration = 60; // Allow Vercel functions to run up to 60 seconds

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const callId = formData.get('call_id') as string
    const scorecardId = formData.get('scorecard_id') as string
    const agentId = formData.get('agent_id') as string
    const auditType = formData.get('audit_type') as string
    const chatTranscript = formData.get('chat_transcript') as string | null
    const geminiFileStr = formData.get('gemini_file') as string | null

    if (!callId || !scorecardId || !agentId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    let geminiFile = null
    if (geminiFileStr) {
      geminiFile = JSON.parse(geminiFileStr)
    }

    const getAdminClient = () => createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const adminSupabase = getAdminClient()
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

    // Schedule heavy AI auditing in the background to prevent Vercel 10s execution timeouts
    after(async () => {
      try {
        console.log(`[After] Starting background audit for call: ${callId}`)
        await processAudit({
          supabase: adminSupabase,
          callId: callId,
          scorecardId,
          agentId,
          auditType: auditType as 'audio' | 'chat',
          geminiFile,
          chatTranscript: chatTranscript || undefined
        })
        console.log(`[After] Background audit completed for call: ${callId}`)
      } catch (err) {
        console.error(`[After] Background audit error for call ${callId}:`, err)
      } finally {
        // Cleanup remote gemini file
        if (geminiFile && geminiFile.name) {
          await ai.files.delete({ name: geminiFile.name }).catch(console.error)
        }
      }
    })

    // Return success immediately with queued status
    return NextResponse.json({ 
      success: true, 
      status: 'queued', 
      call_id: callId 
    }, { status: 200 })

  } catch (error: any) {
    console.error('Transcription Process error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
