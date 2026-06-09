"use client"

import { useState } from "react"
import { createBrowserClient } from '@supabase/ssr'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Mail, CheckCircle2, AlertCircle } from 'lucide-react'

interface SmtpManagerProps {
  companyId: string
  isAdmin: boolean
  initialData: {
    smtp_host: string | null
    smtp_port: number | null
    smtp_user: string | null
    smtp_pass: string | null
    smtp_from_email: string | null
    alert_threshold: number | null
    escalation_email: string | null
  }
}

export function SmtpManager({ companyId, isAdmin, initialData }: SmtpManagerProps) {
  const [formData, setFormData] = useState({
    smtp_host: initialData.smtp_host || '',
    smtp_port: initialData.smtp_port?.toString() || '587',
    smtp_user: initialData.smtp_user || '',
    smtp_pass: initialData.smtp_pass || '',
    smtp_from_email: initialData.smtp_from_email || '',
    alert_threshold: initialData.alert_threshold?.toString() || '80',
    escalation_email: initialData.escalation_email || ''
  })
  
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setStatus('idle')
  }

  const handleSave = async () => {
    if (!isAdmin) return
    
    setSaving(true)
    setStatus('idle')
    
    try {
      const { error } = await supabase
        .from('companies')
        .update({
          smtp_host: formData.smtp_host,
          smtp_port: parseInt(formData.smtp_port) || null,
          smtp_user: formData.smtp_user,
          smtp_pass: formData.smtp_pass,
          smtp_from_email: formData.smtp_from_email,
          alert_threshold: parseInt(formData.alert_threshold) || 80,
          escalation_email: formData.escalation_email
        })
        .eq('id', companyId)

      if (error) throw error
      
      setStatus('success')
      setMessage('Email configuration saved successfully.')
    } catch (err: any) {
      setStatus('error')
      setMessage(err.message || 'Failed to save configuration.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className="shadow-sm border-2">
      <CardHeader className="bg-primary/5 border-b pb-4">
        <CardTitle className="text-xl flex items-center gap-2">
          <Mail className="w-5 h-5 text-blue-500" />
          Email Alert Configuration (SMTP)
        </CardTitle>
        <CardDescription>
          Configure your custom SMTP settings to send coaching alerts directly from your company's domain.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {!isAdmin && (
          <div className="bg-orange-500/10 border border-orange-500/20 text-orange-500 p-3 rounded-md text-sm">
            Only administrators can modify email settings.
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="smtp_host">SMTP Host</Label>
            <Input 
              id="smtp_host" name="smtp_host" 
              placeholder="smtp.sendgrid.net or smtp.office365.com" 
              value={formData.smtp_host} onChange={handleChange}
              disabled={!isAdmin || saving}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="smtp_port">SMTP Port</Label>
            <Input 
              id="smtp_port" name="smtp_port" type="number"
              placeholder="587" 
              value={formData.smtp_port} onChange={handleChange}
              disabled={!isAdmin || saving}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="smtp_user">SMTP Username</Label>
            <Input 
              id="smtp_user" name="smtp_user" 
              placeholder="apikey or user@company.com" 
              value={formData.smtp_user} onChange={handleChange}
              disabled={!isAdmin || saving}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="smtp_pass">SMTP Password</Label>
            <Input 
              id="smtp_pass" name="smtp_pass" type="password"
              placeholder="••••••••••••••••" 
              value={formData.smtp_pass} onChange={handleChange}
              disabled={!isAdmin || saving}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="smtp_from_email">Sender Email Address (From)</Label>
            <Input 
              id="smtp_from_email" name="smtp_from_email" 
              placeholder="qa-alerts@yourcompany.com" 
              value={formData.smtp_from_email} onChange={handleChange}
              disabled={!isAdmin || saving}
            />
          </div>
        </div>

        <div className="border-t border-border pt-6 mt-6">
          <h3 className="font-semibold mb-4 text-lg">Alert Thresholds & Escalation</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="alert_threshold">Critical Alert Threshold (%)</Label>
              <Input 
                id="alert_threshold" name="alert_threshold" type="number" min="0" max="100"
                placeholder="80" 
                value={formData.alert_threshold} onChange={handleChange}
                disabled={!isAdmin || saving}
              />
              <p className="text-xs text-muted-foreground">Emails are ONLY sent if an audit scores below this percentage.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="escalation_email">Manager Escalation Email (Optional)</Label>
              <Input 
                id="escalation_email" name="escalation_email" 
                placeholder="manager@yourcompany.com" 
                value={formData.escalation_email} onChange={handleChange}
                disabled={!isAdmin || saving}
              />
              <p className="text-xs text-muted-foreground">If provided, this manager gets copied on all critical alerts.</p>
            </div>
          </div>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-4 pt-4">
            <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white">
              {saving ? 'Saving...' : 'Save Configuration'}
            </Button>
            
            {status === 'success' && (
              <span className="flex items-center text-green-500 text-sm gap-1 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4" /> {message}
              </span>
            )}
            
            {status === 'error' && (
              <span className="flex items-center text-red-500 text-sm gap-1 animate-in fade-in">
                <AlertCircle className="w-4 h-4" /> {message}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
