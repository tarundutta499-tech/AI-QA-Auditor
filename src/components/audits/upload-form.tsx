"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to process call')
      }

      const result = await response.json()
      router.push(`/dashboard/audits/${result.audit_id}`)
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
            <Select name="agent_id" required>
              <SelectTrigger>
                <SelectValue placeholder="Select an agent" />
              </SelectTrigger>
              <SelectContent>
                {agents.map(a => (
                  <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="scorecard_id">QA Scorecard</Label>
            <Select name="scorecard_id" required>
              <SelectTrigger>
                <SelectValue placeholder="Select a scorecard" />
              </SelectTrigger>
              <SelectContent>
                {scorecards.map(s => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4 pt-4">
            <Label>Audit Source</Label>
            <Tabs defaultValue="audio" onValueChange={setAuditType} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="audio" className="flex items-center gap-2"><Mic className="w-4 h-4"/> Audio Call</TabsTrigger>
                <TabsTrigger value="chat" className="flex items-center gap-2"><MessageSquare className="w-4 h-4"/> Text Chat</TabsTrigger>
              </TabsList>
              <TabsContent value="audio" className="pt-4">
                <div className="space-y-2">
                  <Label htmlFor="audio_file">Audio Recording (MP3, WAV, M4A)</Label>
                  <Input id="audio_file" name="audio_file" type="file" accept="audio/*" required={auditType === 'audio'} className="cursor-pointer" />
                </div>
              </TabsContent>
              <TabsContent value="chat" className="pt-4">
                <div className="space-y-2">
                  <Label htmlFor="chat_transcript">Chat Transcript</Label>
                  <Textarea 
                    id="chat_transcript" 
                    name="chat_transcript" 
                    placeholder="Paste the raw text of the chat or email thread here..." 
                    required={auditType === 'chat'} 
                    className="min-h-[200px]"
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button variant="outline" type="button" onClick={() => router.back()} disabled={isUploading}>Cancel</Button>
        <Button type="submit" disabled={isUploading}>
          {isUploading ? progressText : (auditType === 'audio' ? 'Upload & Audit Call' : 'Audit Chat Transcript')}
        </Button>
      </div>
    </form>
  )
}
