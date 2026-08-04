import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createClient as createAdminClient } from '@supabase/supabase-js'

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options)
              })
            } catch (error) {}
          },
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    // Use admin client to fetch user profile and team
    const adminClient = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: dbUser } = await adminClient.from('users').select('company_id').eq('id', user.id).single()
    if (!dbUser) return NextResponse.json({ agents: [] })

    const { data: teamData } = await adminClient.from('users').select('*').eq('company_id', dbUser.company_id)
    return NextResponse.json({ agents: teamData || [] })

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options)
              })
            } catch (error) {}
          },
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const adminClient = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: dbUser } = await adminClient.from('users').select('role, company_id').eq('id', user.id).single()
    if (!dbUser || dbUser.role === 'agent') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { targetUserId } = await req.json()
    if (!targetUserId) {
      return NextResponse.json({ error: "Missing targetUserId" }, { status: 400 })
    }

    // Verify target user is in the same company
    const { data: targetUser } = await adminClient.from('users').select('company_id').eq('id', targetUserId).single()
    if (!targetUser || targetUser.company_id !== dbUser.company_id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Prevent self-deletion
    if (user.id === targetUserId) {
      return NextResponse.json({ error: "You cannot delete your own account" }, { status: 400 })
    }

    // Delete user from Supabase Auth (which cascades to public.users)
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(targetUserId)
    if (deleteError) {
      // Fallback: delete from public.users table directly
      await adminClient.from('users').delete().eq('id', targetUserId)
    }

    return NextResponse.json({ success: true })

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
