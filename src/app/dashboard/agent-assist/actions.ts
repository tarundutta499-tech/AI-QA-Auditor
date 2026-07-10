"use server"

import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/utils/supabase/server'

function getAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function getLiveScorecards() {
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    const { data: dbUser } = await supabase
      .from('users')
      .select('company_id')
      .eq('id', user.id)
      .single()

    if (!dbUser?.company_id) throw new Error("Company not found")

    const adminClient = getAdminClient()
    const { data, error } = await adminClient
      .from('scorecards')
      .select('*')
      .eq('company_id', dbUser.company_id)
      .order('name', { ascending: true })

    if (error) throw error
    return { success: true, scorecards: data || [] }
  } catch (error: any) {
    console.error("Failed to load scorecards:", error)
    return { success: false, error: error.message, scorecards: [] }
  }
}

export async function getLiveScorecardParameters(scorecardId: string) {
  try {
    const adminClient = getAdminClient()
    const { data, error } = await adminClient
      .from('scorecard_parameters')
      .select('*')
      .eq('scorecard_id', scorecardId)
      .order('id', { ascending: true })

    if (error) throw error
    return { success: true, parameters: data || [] }
  } catch (error: any) {
    console.error("Failed to load parameters:", error)
    return { success: false, error: error.message, parameters: [] }
  }
}
