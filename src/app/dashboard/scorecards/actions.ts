'use server'

import { createClient } from '@/utils/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

const supabaseAdmin = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function createScorecard(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: dbUser } = await supabase.from('users').select('company_id').eq('id', user.id).single()
  if (!dbUser) redirect('/dashboard')

  const name = formData.get('name') as string
  const description = formData.get('description') as string

  // We need to parse dynamic parameters
  const paramsStr = formData.get('parameters') as string
  const parameters = paramsStr ? JSON.parse(paramsStr) : []

  // Use Admin client to bypass RLS in case policies are missing
  const { data: scorecard, error: scorecardError } = await supabaseAdmin
    .from('scorecards')
    .insert({
      company_id: dbUser.company_id,
      name,
      description
    })
    .select()
    .single()

  if (scorecardError || !scorecard) {
    console.error('Error creating scorecard', scorecardError)
    throw new Error('Failed to create scorecard: ' + (scorecardError?.message || 'Unknown error'))
  }

  if (parameters.length > 0) {
    const paramsToInsert = parameters.map((p: any) => ({
      scorecard_id: scorecard.id,
      name: p.name,
      max_score: parseFloat(p.max_score),
      is_mandatory: p.is_mandatory,
      weightage: parseFloat(p.weightage)
    }))

    const { error: paramsError } = await supabaseAdmin.from('scorecard_parameters').insert(paramsToInsert)
    if (paramsError) {
      console.error('Error creating parameters', paramsError)
    }
  }

  revalidatePath('/dashboard/scorecards')
  redirect('/dashboard/scorecards')
}

export async function updateScorecard(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const id = formData.get('id') as string
  const name = formData.get('name') as string
  const description = formData.get('description') as string

  const paramsStr = formData.get('parameters') as string
  const parameters = paramsStr ? JSON.parse(paramsStr) : []

  // Use Admin client to bypass RLS in case policies are missing
  const { error: updateError } = await supabaseAdmin.from('scorecards').update({ name, description }).eq('id', id)
  if (updateError) {
    console.error('Error updating scorecard', updateError)
    throw new Error('Failed to update scorecard: ' + updateError.message)
  }

  await supabaseAdmin.from('scorecard_parameters').delete().eq('scorecard_id', id)

  if (parameters.length > 0) {
    const paramsToInsert = parameters.map((p: any) => ({
      scorecard_id: id,
      name: p.name,
      max_score: parseFloat(p.max_score),
      is_mandatory: p.is_mandatory,
      weightage: parseFloat(p.weightage)
    }))

    const { error: paramsError } = await supabaseAdmin.from('scorecard_parameters').insert(paramsToInsert)
    
    if (paramsError) {
      console.error("Error inserting parameters:", paramsError)
      throw new Error("Failed to save parameters: " + paramsError.message)
    }
  }

  revalidatePath('/dashboard/scorecards')
  redirect('/dashboard/scorecards')
}
