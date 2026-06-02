import { createClient } from '@/utils/supabase/server'
import { KnowledgeManager } from '@/components/knowledge/knowledge-manager'

export default async function KnowledgePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: dbUser } = await supabase.from('users').select('company_id').eq('id', user.id).single()
  
  const { data: entries } = await supabase
    .from('company_knowledge')
    .select('*')
    .eq('company_id', dbUser?.company_id)
    .order('created_at', { ascending: false })

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Process & Knowledge Base</h1>
        <p className="text-muted-foreground mt-2">Upload your Standard Operating Procedures (SOPs). The AI will read these rules before every audit to catch process errors.</p>
      </div>

      <KnowledgeManager entries={entries || []} />
    </div>
  )
}
