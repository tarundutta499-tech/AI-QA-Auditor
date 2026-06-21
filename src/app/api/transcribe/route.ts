import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { GoogleGenAI } from '@google/genai'
import { writeFile, unlink } from 'fs/promises'
import os from 'os'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { processAudit } from '@/lib/audit-service'

export const maxDuration = 60; // Allow Vercel functions to run up to 60 seconds

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const auditType = formData.get('audit_type') as string || 'audio'
    const audioFile = formData.get('audio_file') as File | null
    const chatTranscript = formData.get('chat_transcript') as string | null
    const agentId = formData.get('agent_id') as string
    const scorecardId = formData.get('scorecard_id') as string
    const clientName = formData.get('client_name') as string
    const companyId = formData.get('company_id') as string

    if (!agentId || !scorecardId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    if (auditType === 'audio' && !audioFile) {
      return NextResponse.json({ error: 'Missing audio file' }, { status: 400 })
    }
    if (auditType === 'chat' && !chatTranscript) {
      return NextResponse.json({ error: 'Missing chat transcript' }, { status: 400 })
    }

    const supabase = await createClient()
    const getAdminClient = () => createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const adminSupabase = getAdminClient()

    // Freemium Limit Check
    const { data: company } = await adminSupabase
      .from('companies')
      .select('subscription_tier')
      .eq('id', companyId)
      .single()

    if (!company?.subscription_tier || company.subscription_tier === 'free') {
      const { count, error: countError } = await adminSupabase
        .from('calls')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', companyId)

      if (!countError && count !== null && count >= 5) {
        return NextResponse.json({ error: 'Free tier limit reached (5/5 audits). Please upgrade your plan in Billing.' }, { status: 403 })
      }
    }

    let audioUrl = ''
    let geminiFile: any = null
    let tempFilePath = ''
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

    if (auditType === 'audio' && audioFile) {
      const buffer = Buffer.from(await audioFile.arrayBuffer())
      const tempFileName = `${uuidv4()}-${audioFile.name}`
      tempFilePath = path.join(os.tmpdir(), tempFileName)
      await writeFile(tempFilePath, buffer)

      const storagePath = `${companyId}/${tempFileName}`
      const { error: storageError } = await adminSupabase.storage
        .from('audio_files')
        .upload(storagePath, audioFile)
        
      if (!storageError) {
        const { data } = adminSupabase.storage.from('audio_files').getPublicUrl(storagePath)
        audioUrl = data.publicUrl
      }

      geminiFile = await ai.files.upload({
        file: tempFilePath,
        config: { mimeType: audioFile.type || 'audio/mp3' },
      })
    }

    // 1. Create Call Record (Status: pending)
    const { data: call } = await adminSupabase.from('calls').insert({
      company_id: companyId,
      agent_id: agentId,
      client_name: clientName,
      audio_url: audioUrl,
      raw_chat: chatTranscript || null,
      status: 'pending' // Technically it will be instantly processed below
    }).select().single()

    if (!call) throw new Error("Failed to create call record")

    // 2. Process using the centralized AI Brain
    const result = await processAudit({
      supabase: adminSupabase,
      callId: call.id,
      scorecardId,
      agentId,
      auditType: auditType as 'audio' | 'chat',
      geminiFile,
      chatTranscript: chatTranscript || undefined
    })

    // Cleanup temp files
    if (geminiFile) {
      await unlink(tempFilePath).catch(console.error)
      await ai.files.delete({ name: geminiFile.name }).catch(console.error)
    }

    return NextResponse.json({ success: true, audit_id: result.audit_id })

  } catch (error: any) {
    console.error('Transcription error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
