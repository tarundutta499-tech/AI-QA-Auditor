import { Sidebar } from '@/components/layout/sidebar'
import { ReactNode } from 'react'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen w-full">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-transparent">
        {children}
      </main>
    </div>
  )
}
