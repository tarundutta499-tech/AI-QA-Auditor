import { Sidebar } from '@/components/layout/sidebar'
import { ReactNode } from 'react'
import { AutoLogout } from '@/components/AutoLogout'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  let role = 'agent' // Default fallback
  if (user) {
    const { data: dbUser } = await supabase.from('users').select('role').eq('id', user.id).single()
    if (dbUser) {
      role = dbUser.role
    }
  }

  return (
    <div className="flex h-screen w-full">
      <AutoLogout />
      <Sidebar role={role} />
      <main className="flex-1 overflow-y-auto bg-transparent">
        {children}
      </main>
    </div>
  )
}
