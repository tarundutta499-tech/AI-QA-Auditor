import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Phone, Activity, ShieldCheck, AlertTriangle } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  let dbUser = (await supabase.from('users').select('*').eq('id', user.id).single()).data

  if (!dbUser) {
    const { data: company } = await supabase.from('companies').insert({ name: 'My Company' }).select().single()
    if (company) {
       const { data: newUser } = await supabase.from('users').insert({
         id: user.id,
         company_id: company.id,
         role: 'admin',
         name: user.email?.split('@')[0] || 'Admin',
         email: user.email
       }).select().single()
       dbUser = newUser
    }
  }

  if (!dbUser) return <div className="p-8">Failed to initialize user. Please try refreshing.</div>

  const { count: totalCalls } = await supabase.from('calls').select('*', { count: 'exact', head: true }).eq('company_id', dbUser.company_id)
  
  const { data: companyAudits } = await supabase
    .from('audits')
    .select('overall_score, compliance_percent, calls!inner(company_id)')
    .eq('calls.company_id', dbUser.company_id)

  let avgScore = 0
  let avgCompliance = 0
  if (companyAudits && companyAudits.length > 0) {
    avgScore = Math.round(companyAudits.reduce((acc, a) => acc + (a.overall_score || 0), 0) / companyAudits.length)
    avgCompliance = Math.round(companyAudits.reduce((acc, a) => acc + (a.compliance_percent || 0), 0) / companyAudits.length)
  }

  const coachingOpportunities = companyAudits ? companyAudits.filter(a => (a.overall_score || 0) < 80).length : 0

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
            Welcome back, <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">{dbUser.name}</span>
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">Here is your daily quality assurance overview.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="group relative rounded-2xl border border-border/50 bg-background/50 backdrop-blur-sm p-6 overflow-hidden transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-500/10 hover:border-indigo-500/30">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative flex flex-row items-center justify-between space-y-0 pb-4">
            <h3 className="tracking-tight text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">Total Audits</h3>
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-indigo-500/5 border border-indigo-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
              <Phone className="h-5 w-5 text-indigo-500 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
            </div>
          </div>
          <div className="relative pt-0">
            <div className="text-3xl font-bold">{totalCalls || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">+12% from last week</p>
          </div>
        </div>
        
        <div className="group relative rounded-2xl border border-border/50 bg-background/50 backdrop-blur-sm p-6 overflow-hidden transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-500/10 hover:border-emerald-500/30">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative flex flex-row items-center justify-between space-y-0 pb-4">
            <h3 className="tracking-tight text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">Average QA Score</h3>
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
              <Activity className="h-5 w-5 text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            </div>
          </div>
          <div className="relative pt-0">
            <div className="text-3xl font-bold">{avgScore}</div>
            <p className="text-xs text-muted-foreground mt-1">Across all scorecards</p>
          </div>
        </div>
        
        <div className="group relative rounded-2xl border border-border/50 bg-background/50 backdrop-blur-sm p-6 overflow-hidden transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/10 hover:border-blue-500/30">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative flex flex-row items-center justify-between space-y-0 pb-4">
            <h3 className="tracking-tight text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">Compliance %</h3>
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-500/5 border border-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
              <ShieldCheck className="h-5 w-5 text-blue-500 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
            </div>
          </div>
          <div className="relative pt-0">
            <div className="text-3xl font-bold">{avgCompliance}%</div>
            <p className="text-xs text-muted-foreground mt-1">Regulatory compliance</p>
          </div>
        </div>
        
        <div className="group relative rounded-2xl border border-border/50 bg-background/50 backdrop-blur-sm p-6 overflow-hidden transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-rose-500/10 hover:border-rose-500/30">
          <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative flex flex-row items-center justify-between space-y-0 pb-4">
            <h3 className="tracking-tight text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">Coaching Needed</h3>
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-rose-500/20 to-rose-500/5 border border-rose-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
              <AlertTriangle className="h-5 w-5 text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.5)]" />
            </div>
          </div>
          <div className="relative pt-0">
            <div className="text-3xl font-bold">{coachingOpportunities}</div>
            <p className="text-xs text-muted-foreground mt-1">Calls scoring &lt; 80</p>
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-border/50 bg-background/50 backdrop-blur-md shadow-lg overflow-hidden transition-all hover:shadow-xl">
        <div className="p-6 border-b border-border/50 bg-gradient-to-r from-primary/5 to-transparent">
          <h3 className="font-semibold text-lg">Recent Audits</h3>
          <p className="text-sm text-muted-foreground">Your most recently completed AI audits.</p>
        </div>
        <div className="p-6 text-center text-muted-foreground text-sm">
          {totalCalls === 0 ? "No audits performed yet. Upload a call to see it here." : "View the Audits tab to see detailed reports."}
        </div>
      </div>
    </div>
  )
}
