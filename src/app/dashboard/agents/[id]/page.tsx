import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { PhoneCall, ShieldAlert, Award } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function AgentProfilePage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const id = params.id
  
  const supabase = await createClient()
  
  const { data: agent } = await supabase.from('users').select('*').eq('id', id).single()
  if (!agent) return <div className="p-8">Agent not found</div>

  const { data: audits } = await supabase
    .from('audits')
    .select('*, calls!inner(*), scorecards(name)')
    .eq('calls.agent_id', id)
    .order('created_at', { ascending: false })

  const totalAudits = audits?.length || 0
  const avgScore = totalAudits > 0 
    ? Math.round(audits!.reduce((acc, a) => acc + (a.overall_score || 0), 0) / totalAudits) 
    : 0
    
  const avgCompliance = totalAudits > 0 
    ? Math.round(audits!.reduce((acc, a) => acc + (a.compliance_percent || 0), 0) / totalAudits) 
    : 0

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{agent.name || 'Unknown Agent'}</h1>
          <p className="text-muted-foreground mt-2 capitalize">{agent.role} • Joined {new Date(agent.created_at).toLocaleDateString()}</p>
        </div>
        <Link href="/dashboard/agents">
          <Button variant="outline">Back to Directory</Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="shadow-sm border-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Average QA Score</CardTitle>
            <Award className="h-5 w-5 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{avgScore}</div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Compliance %</CardTitle>
            <ShieldAlert className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{avgCompliance}%</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Audits</CardTitle>
            <PhoneCall className="h-5 w-5 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalAudits}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm border-2">
        <CardHeader>
          <CardTitle>Recent Audit History</CardTitle>
          <CardDescription>All QA evaluations completed for this agent.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Scorecard</TableHead>
                <TableHead>Quality Score</TableHead>
                <TableHead>Compliance</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {totalAudits === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                    No audits found for this agent.
                  </TableCell>
                </TableRow>
              ) : (
                audits?.map((audit) => (
                  <TableRow key={audit.id}>
                    <TableCell>{new Date(audit.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="font-medium">{audit.calls?.client_name}</TableCell>
                    <TableCell>{audit.scorecards?.name}</TableCell>
                    <TableCell className="font-bold">{audit.overall_score}</TableCell>
                    <TableCell>
                      <Badge variant={audit.compliance_percent === 100 ? 'default' : 'destructive'}>
                        {audit.compliance_percent}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/dashboard/audits/${audit.id}`}>
                        <Button variant="ghost" size="sm">View Audit</Button>
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
