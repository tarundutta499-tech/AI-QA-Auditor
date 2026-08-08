"use server"

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addKnowledge(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: dbUser } = await supabase.from('users').select('company_id').eq('id', user.id).single()
  if (!dbUser?.company_id) throw new Error("No company found")

  const title = formData.get('title') as string
  const content = formData.get('content') as string

  if (!title || !content) {
    throw new Error("Title and content are required.")
  }

  const { error } = await supabase.from('company_knowledge').insert({
    company_id: dbUser.company_id,
    title,
    content
  })

  if (error) {
    console.error("Failed to add knowledge:", error)
    throw new Error("Database error occurred.")
  }

  revalidatePath('/dashboard/knowledge')
  return { success: true }
}

export async function deleteKnowledge(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: dbUser } = await supabase.from('users').select('company_id').eq('id', user.id).single()
  
  // Note: RLS ensures they can only delete their own company's knowledge
  const { error } = await supabase.from('company_knowledge').delete().eq('id', id).eq('company_id', dbUser?.company_id)

  if (error) {
    console.error("Failed to delete knowledge:", error)
    throw new Error("Database error occurred.")
  }

  revalidatePath('/dashboard/knowledge')
  return { success: true }
}
