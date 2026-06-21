import { createClient } from '@/utils/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export default async function ScorecardsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: dbUser } = await supabase.from('users').select('company_id').eq('id', user.id).single()
  
  const getAdminClient = () => createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  let scorecards: any[] = []
  if (dbUser) {
    const adminSupabase = getAdminClient()
    const { data } = await adminSupabase.from('scorecards').select('*, scorecard_parameters(max_score, weightage)').eq('company_id', dbUser.company_id).order('created_at', { ascending: false })
    if (data) scorecards = data
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">QA Scorecards</h1>
        <Link href="/dashboard/scorecards/new">
          <Button>Create Scorecard</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Scorecards</CardTitle>
          <CardDescription>Manage the custom scorecards used for AI audits.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Total Max Score</TableHead>
                <TableHead>Total Weighting</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scorecards.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground h-24">
                    No scorecards found. Create one to get started.
                  </TableCell>
                </TableRow>
              ) : (
                scorecards.map((s) => {
                  const totalScore = s.scorecard_parameters?.reduce((sum: number, p: any) => sum + (Number(p.max_score) || 0), 0) || 0
                  const totalWeightage = s.scorecard_parameters?.reduce((sum: number, p: any) => sum + (Number(p.weightage) || 0), 0) || 0
                  
                  return (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{s.name}</TableCell>
                      <TableCell>{s.description}</TableCell>
                      <TableCell>{totalScore.toFixed(1)}</TableCell>
                      <TableCell>{totalWeightage.toFixed(1)}</TableCell>
                      <TableCell>{new Date(s.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <Link href={`/dashboard/scorecards/${s.id}/edit`}>
                          <Button variant="outline" size="sm">Edit</Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
