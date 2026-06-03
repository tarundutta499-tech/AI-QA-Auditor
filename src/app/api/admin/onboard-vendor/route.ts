import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  try {
    const { companyName, adminName, adminEmail, adminPassword } = await req.json()

    if (!companyName || !adminEmail || !adminPassword) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Initialize Supabase admin client with SERVICE ROLE key
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // 1. Create the Company
    const { data: company, error: companyError } = await supabaseAdmin
      .from('companies')
      .insert({ name: companyName })
      .select('id')
      .single()

    if (companyError) throw companyError

    // 2. Create the User in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: { name: adminName }
    })

    if (authError) {
      // Rollback company creation if auth fails
      await supabaseAdmin.from('companies').delete().eq('id', company.id)
      throw authError
    }

    // 3. Insert the User into public.users to link them to the company
    const { error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        id: authData.user.id,
        company_id: company.id,
        role: 'admin',
        name: adminName,
        email: adminEmail
      })

    if (userError) {
      // Rollback auth user and company if public user fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      await supabaseAdmin.from('companies').delete().eq('id', company.id)
      throw userError
    }

    return NextResponse.json({ 
      success: true, 
      message: `Vendor ${companyName} and admin account ${adminEmail} created successfully.` 
    })

  } catch (error: any) {
    console.error("Vendor Onboarding Error:", error)
    return NextResponse.json({ error: error.message || "Failed to onboard vendor" }, { status: 500 })
  }
}
