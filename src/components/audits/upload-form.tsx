"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MessageSquare, Mic } from 'lucide-react'

export function UploadForm({ scorecards, agents, companyId }: { scorecards: any[], agents: any[], companyId: string }) {
  const router = useRouter()
  const [isUploading, setIsUploading] = useState(false)
  const [progressText, setProgressText] = useState('')
  const [auditType, setAuditType] = useState('audio')

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsUploading(true)
    setProgressText(auditType === 'audio' ? 'Uploading audio and initializing AI audit...' : 'Analyzing chat transcript...')

    const formData = new FormData(e.currentTarget)
    formData.append('company_id', companyId)
    formData.append('audit_type', auditType)

    try {
      if (auditType === 'audio') {
        const audioFile = formData.get('audio_file') as File
        if (audioFile && audioFile.size > 0) {
          const supabase = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
          )
          
          const fileExt = audioFile.name.split('.').pop()
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
          const storagePath = `${companyId}/${fileName}`
          
          setProgressText('Preparing secure upload tunnel...')
          // Get Signed URL from our backend
          const urlRes = await fetch('/api/upload-url', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fileName, companyId })
          })
          
          if (!urlRes.ok) throw new Error('Failed to prepare upload')
          const { path, token } = await urlRes.json()

          setProgressText('Uploading audio file to secure storage...')
          // Upload directly to Supabase using the signed token to bypass RLS!
          const { error: uploadError } = await supabase.storage
            .from('audio_files')
            .uploadToSignedUrl(path, token, audioFile)

          if (uploadError) {
            throw new Error('Failed to upload audio file: ' + uploadError.message)
          }

          const { data: urlData } = supabase.storage.from('audio_files').getPublicUrl(storagePath)
          
          formData.delete('audio_file') // remove from payload so it doesn't hit Vercel limit
          formData.append('audio_url', urlData.publicUrl)
        }
      }

      setProgressText('Transferring secure audio to AI Core...')
      const initRes = await fetch('/api/transcribe/init', {
        method: 'POST',
        body: formData,
      })

      if (!initRes.ok) {
        const errorData = await initRes.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to initialize AI process')
      }

      const initData = await initRes.json()

      setProgressText('AI is listening and grading the call...')
      const processForm = new FormData()
      processForm.append('call_id', initData.call_id)
      processForm.append('scorecard_id', formData.get('scorecard_id') as string)
      processForm.append('agent_id', formData.get('agent_id') as string)
      processForm.append('audit_type', auditType)
      
      if (initData.gemini_file) {
        processForm.append('gemini_file', JSON.stringify(initData.gemini_file))
      }
      if (auditType === 'chat') {
        processForm.append('chat_transcript', formData.get('chat_transcript') as string)
      }

      const processRes = await fetch('/api/transcribe/process', {
        method: 'POST',
        body: processForm,
      })

      if (!processRes.ok) {
        const errorData = await processRes.json().catch(() => ({}))
        throw new Error(errorData.error || 'AI grading timed out or failed.')
      }

      const result = await processRes.json()
      if (result.status === 'queued') {
        router.push('/dashboard/audits')
        alert('Call recording successfully uploaded and queued! The AI will analyze the call in the background. The audit results will appear in your Audit History table in 10-15 seconds.')
      } else {
        router.push(`/dashboard/audits/${result.audit_id}`)
      }
    } catch (error: any) {
      console.error(error)
      alert(error.message || 'An error occurred during the audit process.')
      setIsUploading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Call Details</CardTitle>
          <CardDescription>Provide information about the call recording.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="client_name">Client Name</Label>
            <Input id="client_name" name="client_name" required placeholder="e.g. Acme Corp Support" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="agent_id">Agent</Label>
            <select
              id="agent_id"
              name="agent_id"
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Select an agent</option>
              {agents.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="scorecard_id">QA Scorecard</Label>
            <select
              id="scorecard_id"
              name="scorecard_id"
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Select a scorecard</option>
              {scorecards.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2 pt-4">
            <Label htmlFor="audio_file">Audio Recording (MP3, WAV, M4A)</Label>
            <Input id="audio_file" name="audio_file" type="file" accept="audio/*" required className="cursor-pointer" />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button variant="outline" type="button" onClick={() => router.back()} disabled={isUploading}>Cancel</Button>
        <Button type="submit" disabled={isUploading}>
          {isUploading ? progressText : 'Upload & Audit Call'}
        </Button>
      </div>
    </form>
  )
}
