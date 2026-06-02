import { createClient } from '@/utils/supabase/server'
import { UploadForm } from '@/components/audits/upload-form'

export default async function NewAuditPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: dbUser } = await supabase.from('users').select('company_id').eq('id', user.id).single()
  
  let scorecards: any[] = []
  let agents: any[] = []

  if (dbUser) {
    const { data: scData } = await supabase.from('scorecards').select('id, name').eq('company_id', dbUser.company_id)
    if (scData) scorecards = scData

    const { data: agData } = await supabase.from('users').select('id, name').eq('company_id', dbUser.company_id)
    if (agData) agents = agData
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Upload Call for Audit</h1>
        <p className="text-muted-foreground mt-2">Upload a customer support call recording to generate an AI QA audit.</p>
      </div>
      
      <UploadForm scorecards={scorecards} agents={agents} companyId={dbUser?.company_id} />
    </div>
  )
}
