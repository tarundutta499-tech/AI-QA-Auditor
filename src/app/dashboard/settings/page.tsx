import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { ApiKeyManager } from '@/components/settings/api-key-manager'
import { SmtpManager } from '@/components/settings/smtp-manager'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: dbUser } = await supabase.from('users').select('*, companies(id, name, api_key)').eq('id', user.id).single()

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">Manage your account settings and preferences.</p>
      </div>

      <div className="grid gap-8">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Profile Details</CardTitle>
            <CardDescription>View your personal information.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label>Full Name</Label>
              <Input defaultValue={dbUser?.name} disabled />
            </div>
            <div className="grid gap-2">
              <Label>Email Address</Label>
              <Input defaultValue={dbUser?.email} disabled />
            </div>
            <div className="grid gap-2">
              <Label>Role</Label>
              <Input defaultValue={dbUser?.role} className="capitalize" disabled />
            </div>
            <p className="text-sm text-muted-foreground mt-2">Contact your administrator to change these details.</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Organization Information</CardTitle>
            <CardDescription>Your company workspace details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label>Company Name</Label>
              <Input defaultValue={dbUser?.companies?.name} disabled />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-2">
          <CardHeader className="bg-primary/5 border-b pb-4">
            <CardTitle className="text-xl">Developer API</CardTitle>
            <CardDescription>Integrate your phone systems automatically using your Universal API Key.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <ApiKeyManager 
              initialKey={dbUser?.companies?.api_key || ''} 
              companyId={dbUser?.companies?.id || ''}
              isAdmin={dbUser?.role === 'admin'} 
            />
          </CardContent>
        </Card>

        <SmtpManager 
          companyId={dbUser?.companies?.id || ''}
          isAdmin={dbUser?.role === 'admin'}
          initialData={{
            smtp_host: dbUser?.companies?.smtp_host,
            smtp_port: dbUser?.companies?.smtp_port,
            smtp_user: dbUser?.companies?.smtp_user,
            smtp_pass: dbUser?.companies?.smtp_pass,
            smtp_from_email: dbUser?.companies?.smtp_from_email,
            alert_threshold: dbUser?.companies?.alert_threshold,
            escalation_email: dbUser?.companies?.escalation_email
          }}
        />
      </div>
    </div>
  )
}
