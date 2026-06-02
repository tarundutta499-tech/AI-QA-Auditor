"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { BookOpen, Plus, Trash2, Loader2, UploadCloud } from 'lucide-react'
import { addKnowledge, deleteKnowledge } from '@/app/dashboard/knowledge/actions'
import { useRef } from 'react'

export type KnowledgeEntry = {
  id: string
  title: string
  content: string
  created_at: string
}

export function KnowledgeManager({ entries }: { entries: KnowledgeEntry[] }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isExtracting, setIsExtracting] = useState(false)
  const [error, setError] = useState('')
  const [content, setContent] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsExtracting(true)
    setError('')
    
    try {
      const formData = new FormData()
      formData.append('document', file)
      
      const res = await fetch('/api/extract-text', {
        method: 'POST',
        body: formData
      })
      
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to extract text')
      
      setContent((prev) => prev ? `${prev}\n\n${data.text}` : data.text)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsExtracting(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')
    try {
      const formData = new FormData(e.currentTarget)
      // Override content with state in case it was modified
      formData.set('content', content)
      await addKnowledge(formData)
      ;(e.target as HTMLFormElement).reset()
      setContent('')
    } catch (err: any) {
      setError(err.message || 'Failed to save rule')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this rule? The AI will no longer evaluate calls against it.")) return
    try {
      await deleteKnowledge(id)
    } catch (err) {
      alert("Failed to delete.")
    }
  }

  return (
    <div className="grid md:grid-cols-12 gap-8">
      {/* Upload Form (Left Column) */}
      <div className="md:col-span-5">
        <Card className="shadow-sm border-2 sticky top-6">
          <CardHeader className="bg-primary/5 border-b pb-4">
            <CardTitle className="text-xl flex items-center gap-2">
              <Plus className="h-5 w-5 text-emerald-500" />
              Add New Rule / SOP
            </CardTitle>
            <CardDescription>Paste your process documentation here. The AI will read this before every audit.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Rule Title</label>
                <Input name="title" placeholder="e.g., Refund Policy, Verification Steps" required />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Process Content</label>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    className="h-8 gap-2 text-xs"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isExtracting}
                  >
                    {isExtracting ? <Loader2 className="h-3 w-3 animate-spin" /> : <UploadCloud className="h-3 w-3" />}
                    {isExtracting ? 'Extracting...' : 'Upload PDF/Doc'}
                  </Button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept=".pdf,.txt,.doc,.docx" 
                    onChange={handleFileChange}
                  />
                </div>
                <Textarea 
                  name="content" 
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Paste the exact rules here, or upload a PDF to extract the text automatically..." 
                  className="min-h-[250px]"
                  required 
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full gap-2" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <BookOpen className="h-4 w-4" />}
                Save to AI Brain
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Existing Knowledge (Right Column) */}
      <div className="md:col-span-7 space-y-4">
        <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
          <BookOpen className="h-5 w-5 text-indigo-500" />
          Active Knowledge Base
        </h3>
        
        {entries.length === 0 ? (
          <div className="p-8 border-2 border-dashed rounded-lg text-center text-muted-foreground bg-muted/20">
            <BookOpen className="h-8 w-8 mx-auto mb-3 opacity-20" />
            <p className="font-medium">The AI currently has no company rules.</p>
            <p className="text-sm mt-1">Add your SOPs to enable advanced process auditing.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {entries.map(entry => (
              <Card key={entry.id} className="shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="py-3 px-4 flex flex-row items-center justify-between border-b bg-muted/10">
                  <CardTitle className="text-base">{entry.title}</CardTitle>
                  <Button variant="ghost" size="icon" className="text-rose-500 hover:text-rose-600 hover:bg-rose-500/10" onClick={() => handleDelete(entry.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-3">
                    {entry.content}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
