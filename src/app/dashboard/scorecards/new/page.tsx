import { ScorecardForm } from '@/components/scorecards/scorecard-form'

export default function NewScorecardPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Create Scorecard</h1>
        <p className="text-muted-foreground mt-2">Design a new rubric for AI call audits.</p>
      </div>
      
      <ScorecardForm />
    </div>
  )
}
