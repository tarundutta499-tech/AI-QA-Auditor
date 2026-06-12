'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const getAdminClient = () => createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function acceptInvite(formData: FormData) {
  const token = formData.get('token') as string
  const fullName = formData.get('fullName') as string
  const password = formData.get('password') as string

  if (!token || !fullName || !password) {
    return { error: 'All fields are required' }
  }

  try {
    // 1. Verify Token
    const { data: invite, error: inviteError } = await getAdminClient()
      .from('invites')
      .select('*')
      .eq('token', token)
      .single()

    if (inviteError || !invite) {
      return { error: 'Invalid or expired invite link.' }
    }

    const supabase = await createClient()

    // 2. Create Auth User
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: invite.email,
      password,
    })

    if (authError || !authData.user) {
      return { error: authError?.message || 'Failed to sign up' }
    }

    // 3. Create User Profile mapped to the company
    const { error: userError } = await getAdminClient()
      .from('users')
      .insert({
        id: authData.user.id,
        company_id: invite.company_id,
        role: invite.role,
        name: fullName,
        email: invite.email
      })

    if (userError) {
      return { error: 'Failed to create user profile: ' + userError.message }
    }

    // 4. Delete the invite so it can't be reused
    await getAdminClient().from('invites').delete().eq('id', invite.id)

    revalidatePath('/dashboard')
    return { success: true }
  } catch (err: any) {
    console.error("Join exception:", err)
    return { error: err.message || "An unexpected error occurred during join." }
  }
}
