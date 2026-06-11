import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const supabaseAdmin = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function acceptInvite(formData: FormData) {
  const token = formData.get('token') as string
  const fullName = formData.get('fullName') as string
  const password = formData.get('password') as string

  if (!token || !fullName || !password) {
    throw new Error('All fields are required')
  }

  // 1. Verify Token
  const { data: invite, error: inviteError } = await supabaseAdmin
    .from('invites')
    .select('*')
    .eq('token', token)
    .single()

  if (inviteError || !invite) {
    throw new Error('Invalid or expired invite link.')
  }

  const supabase = await createClient()

  // 2. Create Auth User
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: invite.email,
    password,
  })

  if (authError || !authData.user) {
    throw new Error(authError?.message || 'Failed to sign up')
  }

  // 3. Create User Profile mapped to the company
  const { error: userError } = await supabaseAdmin
    .from('users')
    .insert({
      id: authData.user.id,
      company_id: invite.company_id,
      role: invite.role,
      name: fullName,
      email: invite.email
    })

  if (userError) {
    throw new Error('Failed to create user profile: ' + userError.message)
  }

  // 4. Delete the invite so it can't be reused
  await supabaseAdmin.from('invites').delete().eq('id', invite.id)

  revalidatePath('/dashboard')
  redirect('/dashboard')
}
