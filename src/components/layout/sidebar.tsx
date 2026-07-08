"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Users, BarChart3, Settings, LogOut, ListChecks, FileText, Activity, Upload, BookOpen, AlertTriangle, Scale, CreditCard } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { signout } from '@/app/login/actions'
import { cn } from '@/lib/utils'

export function Sidebar({ role = 'agent' }: { role?: string }) {
  const pathname = usePathname()
  
  let routes = [
    { label: 'Dashboard', href: '/dashboard', icon: Home },
    { label: 'Upload Audit', href: '/dashboard/audits/new', icon: Upload },
    { label: 'Audit History', href: '/dashboard/audits', icon: FileText },
    { label: 'Analytics & Reports', href: '/dashboard/reports', icon: BarChart3 },
    { label: 'Scorecards', href: '/dashboard/scorecards', icon: ListChecks },
    { label: 'Knowledge Base', href: '/dashboard/knowledge', icon: BookOpen },
    { label: 'Team Members', href: '/dashboard/agents', icon: Users },
    { label: 'Billing', href: '/dashboard/billing', icon: CreditCard },
    { label: 'Settings', href: '/dashboard/settings', icon: Settings },
  ]

  if (role === 'agent') {
    routes = [
      { label: 'My Dashboard', href: '/dashboard', icon: Home },
      { label: 'My Audits', href: '/dashboard/audits', icon: ListChecks },
      { label: 'My Scores', href: '/dashboard/reports', icon: BarChart3 },
      { label: 'Knowledge Base', href: '/dashboard/knowledge', icon: BookOpen },
    ]
  }

  return (
    <div className="hidden border-r bg-background/40 backdrop-blur-xl md:block min-w-[280px] shadow-2xl shadow-primary/5 border-border/50">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b border-border/50 px-4 lg:h-[60px] lg:px-6">
          <Link href="/" className="flex items-center gap-3 font-bold text-primary">
            <div className="bg-gradient-to-br from-primary to-blue-600 p-2 rounded-xl text-primary-foreground shadow-lg shadow-primary/30">
              <Activity className="h-5 w-5" />
            </div>
            <span className="text-xl tracking-tight">Nexaviq</span>
          </Link>
        </div>
        <div className="flex-1 overflow-auto py-6">
          <nav className="grid items-start px-4 text-sm font-medium space-y-1">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-300",
                  pathname === route.href
                    ? "bg-primary/15 text-primary font-semibold shadow-sm border border-primary/20"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground hover:translate-x-1"
                )}
              >
                <route.icon className="h-5 w-5" />
                {route.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="border-t border-border/50 p-4 flex items-center justify-between bg-transparent">
          <ThemeToggle />
          <form action={signout}>
            <button type="submit" className="flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-destructive/10 hover:text-destructive">
              <LogOut className="h-5 w-5" />
              Sign Out
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
