'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createAgent(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: dbUser } = await supabase.from('users').select('company_id').eq('id', user.id).single()
  if (!dbUser) redirect('/dashboard')

  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const role = formData.get('role') as string || 'agent'

  const { error } = await supabase.from('users').insert({
    id: crypto.randomUUID(),
    company_id: dbUser.company_id,
    name,
    email,
    role
  })

  if (error) {
    console.error("Error creating member", error)
    throw new Error(error.message)
  }

  revalidatePath('/dashboard/agents')
  redirect('/dashboard/agents')
}
