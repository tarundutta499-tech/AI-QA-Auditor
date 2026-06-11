'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const supabaseAdmin = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function createAgent(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: dbUser } = await supabase.from('users').select('company_id').eq('id', user.id).single()
  if (!dbUser) throw new Error("No company found")

  const email = formData.get('email') as string
  const role = formData.get('role') as string || 'agent'
  
  if (!email) throw new Error("Email is required")

  // Generate invite token and insert via admin to bypass RLS if policies are restrictive
  const token = crypto.randomUUID()

  const { error } = await supabaseAdmin.from('invites').insert({
    company_id: dbUser.company_id,
    email,
    role,
    token
  })

  if (error) {
    console.error("Error creating invite", error)
    throw new Error(error.message)
  }

  revalidatePath('/dashboard/agents')
  
  // Instead of redirecting blindly, return the token so the UI can display the link
  return { success: true, token }
}
