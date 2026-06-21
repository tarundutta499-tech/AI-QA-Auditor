'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function deleteAudit(auditId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: dbUser } = await supabase.from('users').select('company_id, role').eq('id', user.id).single()
  
  const { createClient: createSupabaseClient } = await import('@supabase/supabase-js')
  const adminClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Verify the audit belongs to the user's company
  const { data: audit } = await adminClient.from('audits').select('call_id, calls(company_id)').eq('id', auditId).single()
  
  if (!audit) throw new Error("Audit not found")
  if (dbUser?.role !== 'super_admin' && audit.calls?.company_id !== dbUser?.company_id) {
    throw new Error("Unauthorized to delete this audit")
  }

  // Deleting the call will delete the audit, transcripts, results, and coaching via cascade
  const { error } = await adminClient.from('calls').delete().eq('id', audit.call_id)
  
  if (error) {
    throw new Error(error.message)
  }
  
  revalidatePath('/dashboard/audits')
  return { success: true }
}
