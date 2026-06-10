import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, XCircle } from 'lucide-react'
import { CalibrationButton } from '@/components/CalibrationButton'
import { PrintWrapper } from '@/components/PrintWrapper'

export default async function AuditResultPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const id = params.id
  
  const supabase = await createClient()
  
  const { data: audit } = await supabase.from('audits').select('*, calls(*, users(name)), scorecards(name)').eq('id', id).single()
  if (!audit) return <div className="p-8">Audit not found</div>

  const { data: results } = await supabase.from('audit_results').select('*, scorecard_parameters(name, max_score)').eq('audit_id', id)
  
  const { data: coaching } = await supabase.from('coaching').select('*').eq('audit_id', id).single()

  const { data: transcript } = await supabase.from('transcripts').select('*').eq('call_id', audit.call_id).single()

  let utterances: any[] = []
  try {
    const paragraphs = transcript?.content?.results?.channels?.[0]?.alternatives?.[0]?.paragraphs?.paragraphs
    if (paragraphs && Array.isArray(paragraphs)) {
      utterances = paragraphs
    }
  } catch (e) {}

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <PrintWrapper>
        <div className="space-y-8">
          <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Audit Result: {audit.calls?.client_name}</h1>
          <p className="text-muted-foreground mt-2">
            Agent: {audit.calls?.users?.name} | Scorecard: {audit.scorecards?.name}
          </p>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-4xl font-bold text-primary">{audit.compliance_percent}%</div>
            <div className="text-sm text-muted-foreground">Raw Score: {audit.overall_score}</div>
          </div>
          <CalibrationButton auditId={id} aiScore={audit.compliance_percent} />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Parameter Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {results?.map((res) => (
                <div key={res.id} className="border-b pb-4 last:border-0 last:pb-0">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      {res.is_passed ? <CheckCircle2 className="text-green-500 w-5 h-5" /> : <XCircle className="text-red-500 w-5 h-5" />}
                      <span className="font-semibold text-lg">{res.scorecard_parameters?.name}</span>
                    </div>
                    <Badge variant={res.is_passed ? 'default' : 'destructive'}>
                      {res.obtained_score} / {res.scorecard_parameters?.max_score}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground mb-2">
                    <strong>Evidence:</strong> {res.evidence}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <strong>Reasoning:</strong> {res.reasoning}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Call Transcript</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 max-h-[500px] overflow-y-auto bg-[#020617] p-4 rounded-b-xl border-t border-gray-800">
              {utterances.length > 0 ? utterances.map((para: any, idx: number) => (
                <div key={idx} className={`flex flex-col gap-1 ${para.speaker === 0 ? 'items-end' : 'items-start'}`}>
                  <span className="text-xs text-muted-foreground px-1">
                    {para.speaker === 0 ? 'Agent' : 'Customer'} • {Math.round(para.start)}s
                  </span>
                  <div className={`p-3 text-sm rounded-2xl max-w-[80%] ${
                    para.speaker === 0 
                      ? 'bg-blue-600 text-white rounded-tr-sm' 
                      : 'bg-gray-800 text-gray-100 rounded-tl-sm border border-gray-700'
                  }`}>
                    {para.sentences?.map((s: any) => s.text).join(' ')}
                  </div>
                </div>
              )) : (
                <div className="flex flex-col items-center justify-center py-12 text-center h-full">
                  <p className="text-muted-foreground mb-2">Transcript is generating or unavailable.</p>
                  <p className="text-xs text-gray-500">Audio files under 10 seconds may not generate a full transcript.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="bg-primary/5 border-primary/20 shadow-sm">
            <CardHeader>
              <CardTitle>Coaching Assistant</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm mb-1 text-green-700 dark:text-green-400">Top Strengths</h4>
                <p className="text-sm">{coaching?.strengths || 'N/A'}</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-1 text-red-700 dark:text-red-400">Improvement Areas</h4>
                <p className="text-sm">{coaching?.improvement_areas || 'N/A'}</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-1 text-blue-700 dark:text-blue-400">Recommended Actions</h4>
                <p className="text-sm">{coaching?.recommended_actions || 'N/A'}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dead Air Detection</CardTitle>
            </CardHeader>
            <CardContent>
              {transcript?.dead_air_events?.length > 0 ? (
                <ul className="space-y-2">
                  {transcript.dead_air_events.map((event: any, idx: number) => (
                    <li key={idx} className="text-sm border-l-2 border-orange-500 pl-3">
                      <strong>{event.duration_seconds}s</strong> silence at {event.start_time}
                      <span className="block text-xs text-muted-foreground">Impact: {event.impact}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No significant dead air detected.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
        </div>
      </PrintWrapper>
    </div>
  )
}
