import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Plus } from 'lucide-react'

export default async function AuditsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: dbUser } = await supabase.from('users').select('company_id').eq('id', user.id).single()
  
  let audits: any[] = []
  if (dbUser) {
    const { data } = await supabase
      .from('audits')
      .select('*, calls(*, users(name)), scorecards(name)')
      .order('created_at', { ascending: false })
    if (data) audits = data
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">QA Audits</h1>
          <p className="text-muted-foreground mt-2">View and manage AI-generated call audits.</p>
        </div>
        <Link href="/dashboard/audits/new">
          <Button><Plus className="mr-2 h-4 w-4" /> New Audit</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Audits</CardTitle>
          <CardDescription>A history of all QA audits performed.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Agent</TableHead>
                <TableHead>Scorecard</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {audits.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                    No audits found. Upload a call to get started.
                  </TableCell>
                </TableRow>
              ) : (
                audits.map((audit) => (
                  <TableRow key={audit.id}>
                    <TableCell>{new Date(audit.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="font-medium">{audit.calls?.client_name}</TableCell>
                    <TableCell>{audit.calls?.users?.name}</TableCell>
                    <TableCell>{audit.scorecards?.name}</TableCell>
                    <TableCell className="font-bold">{audit.compliance_percent}%</TableCell>
                    <TableCell>
                      <Badge variant={audit.status === 'completed' ? 'default' : 'secondary'}>
                        {audit.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/dashboard/audits/${audit.id}`}>
                        <Button variant="ghost" size="sm">View</Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
