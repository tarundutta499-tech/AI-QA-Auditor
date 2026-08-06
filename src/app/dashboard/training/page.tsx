import { createClient } from '@/utils/supabase/server'
import { CoachingRefresher } from '@/components/knowledge/coaching-refresher'

export default async function TrainingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Fetch current user details & role
  const { data: dbUser } = await supabase
    .from('users')
    .select('id, name, role, company_id')
    .eq('id', user.id)
    .single()

  if (!dbUser) return null

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">AI Training & Refreshers</h1>
        <p className="text-muted-foreground mt-2">
          {dbUser.role === 'agent' 
            ? "Your personalized AI study syllabus and compliance refresher quizzes based on your recent call audit observations."
            : "Generate custom training paths and review quizzes for agents mapping directly to their recent audit failures."}
        </p>
      </div>

      <CoachingRefresher 
        currentUser={{ id: dbUser.id, name: dbUser.name || 'Agent', role: dbUser.role }} 
      />
    </div>
  )
}
