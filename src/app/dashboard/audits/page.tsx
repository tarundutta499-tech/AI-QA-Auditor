import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Plus, Eye } from 'lucide-react'
import { AuditsFilter } from '@/components/AuditsFilter'
import { ExportCSV } from '@/components/ExportCSV'
import { DeleteAuditButton } from '@/components/audits/delete-audit-button'

export default async function AuditsPage(props: { searchParams?: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const searchParams = await props.searchParams;
  const agentFilter = searchParams?.agent as string | undefined
  const minScoreFilter = searchParams?.minScore as string | undefined

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: dbUser } = await supabase.from('users').select('id, company_id, role').eq('id', user.id).single()
  
  const { createClient: createSupabaseClient } = await import('@supabase/supabase-js')
  const getAdminClient = () => createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  let audits: any[] = []
  let agents: any[] = []

  if (dbUser) {
    const adminClient = getAdminClient()

    // Fetch unique agents for the dropdown (only if manager/admin)
    if (dbUser.role !== 'agent') {
      const { data: agentsData } = await adminClient
        .from('users')
        .select('id, name')
        .eq('company_id', dbUser.company_id)
        .eq('role', 'agent')
      if (agentsData) agents = agentsData
    }

    // Fetch Audits with filters
    let query = adminClient
      .from('audits')
      .select('*, calls!inner(*, users(id, name)), scorecards(name)')
      .order('created_at', { ascending: false })

    // RBAC: Agents can only see their own calls
    if (dbUser.role === 'agent') {
      query = query.eq('calls.agent_id', dbUser.id)
    } else {
      // CRITICAL: Managers/Admins must only see calls for their own company
      query = query.eq('calls.company_id', dbUser.company_id)
      if (agentFilter) {
        query = query.eq('calls.agent_id', agentFilter)
      }
    }
    if (minScoreFilter) {
      query = query.gte('compliance_percent', parseInt(minScoreFilter))
    }

    const { data } = await query
    if (data) audits = data
  }

  return (
    <div className="p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">QA Audits</h1>
          <p className="text-muted-foreground mt-2">View and manage AI-generated call audits.</p>
        </div>
        <div className="flex gap-2">
          <ExportCSV data={audits} />
          <Link href="/dashboard/audits/new">
            <Button><Plus className="mr-2 h-4 w-4" /> New Audit</Button>
          </Link>
        </div>
      </div>

      <AuditsFilter agents={agents} />

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
                    No audits found. Try adjusting your filters or upload a call.
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
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/dashboard/audits/${audit.id}`}>
                          <Button variant="ghost" size="sm" title="View Audit">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <DeleteAuditButton auditId={audit.id} />
                      </div>
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
