"use server"

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { v4 as uuidv4 } from 'uuid'

export async function regenerateApiKey(companyId: string) {
  const supabase = await createClient()
  
  // Verify user is part of the company and is admin (basic check)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")
    
  const { data: dbUser } = await supabase.from('users').select('role, company_id').eq('id', user.id).single()
  if (!dbUser || dbUser.company_id !== companyId || dbUser.role !== 'admin') {
    throw new Error("Only Administrators can regenerate the API Key.")
  }

  // Generate new UUID for API key
  const newKey = uuidv4()
  
  const { error } = await supabase
    .from('companies')
    .update({ api_key: newKey })
    .eq('id', companyId)

  if (error) {
    console.error("Failed to regenerate API Key:", error)
    throw new Error("Failed to regenerate API Key.")
  }

  revalidatePath('/dashboard/settings')
  return { success: true, newKey }
}
