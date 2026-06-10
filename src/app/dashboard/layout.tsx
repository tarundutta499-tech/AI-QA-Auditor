import { Sidebar } from '@/components/layout/sidebar'
import { ReactNode } from 'react'
import { AutoLogout } from '@/components/AutoLogout'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen w-full">
      <AutoLogout />
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-transparent">
        {children}
      </main>
    </div>
  )
}
