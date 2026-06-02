import { createClient } from '@/utils/supabase/server'
import { ScorecardForm } from '@/components/scorecards/scorecard-form'
import { notFound } from 'next/navigation'

export default async function EditScorecardPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const supabase = await createClient()
  
  const { data: scorecard } = await supabase
    .from('scorecards')
    .select('*, parameters:scorecard_parameters(*)')
    .eq('id', resolvedParams.id)
    .single()

  if (!scorecard) return notFound()

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Edit Scorecard</h1>
        <p className="text-muted-foreground mt-2">Update the criteria for this QA scorecard.</p>
      </div>
      
      <ScorecardForm initialData={scorecard} />
    </div>
  )
}
