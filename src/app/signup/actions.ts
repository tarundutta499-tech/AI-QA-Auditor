'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const getAdminClient = () => createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function registerCompany(formData: FormData) {
  const companyName = formData.get('companyName') as string
  const fullName = formData.get('fullName') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!companyName || !fullName || !email || !password) {
    throw new Error('All fields are required')
  }

  const supabase = await createClient()

  // 1. Create the Auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  })

  if (authError || !authData.user) {
    throw new Error(authError?.message || 'Failed to sign up')
  }

  const userId = authData.user.id

  // 2. Create the Company via Admin to bypass RLS
  const { data: company, error: companyError } = await getAdminClient()
    .from('companies')
    .insert({
      name: companyName,
      subscription_status: 'active', // For beta/testing
      subscription_tier: 'free'
    })
    .select()
    .single()

  if (companyError || !company) {
    // Attempt to rollback user if company fails (best effort)
    await getAdminClient().auth.admin.deleteUser(userId)
    throw new Error('Failed to create company workspace: ' + companyError?.message)
  }

  // 3. Create the User Profile
  const { error: userError } = await getAdminClient()
    .from('users')
    .insert({
      id: userId,
      company_id: company.id,
      role: 'admin',
      name: fullName,
      email: email
    })

  if (userError) {
    throw new Error('Failed to create user profile: ' + userError.message)
  }

  // 4. Create an API Key for the new company
  await getAdminClient()
    .from('api_keys')
    .insert({
      company_id: company.id,
      key_value: 'pk_' + crypto.randomUUID().replace(/-/g, ''),
      description: 'Default API Key'
    })

  revalidatePath('/dashboard')
  redirect('/dashboard')
}
