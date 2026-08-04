import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { ShieldCheck, ArrowLeft } from "lucide-react"

const getAdminClient = () => createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

import { JoinForm } from './JoinForm'

export default async function JoinPage(props: {
  searchParams: Promise<{ token?: string }>
}) {
  const searchParams = await props.searchParams
  const token = searchParams.token

  if (!token) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col justify-center items-center text-white">
        <h1 className="text-2xl font-bold text-red-400 mb-4">Invalid Invite Link</h1>
        <p className="text-gray-400 mb-6">No invitation token was provided.</p>
        <Link href="/">
          <Button variant="outline">Return Home</Button>
        </Link>
      </div>
    )
  }

  // Fetch the invite securely on the server
  const { data: invite, error } = await getAdminClient()
    .from('invites')
    .select('email, role, companies(name)')
    .eq('token', token)
    .single()

  if (error || !invite) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col justify-center items-center text-white">
        <h1 className="text-2xl font-bold text-red-400 mb-4">Invite Expired or Invalid</h1>
        <p className="text-gray-400 mb-6">This invitation link is no longer valid or has already been used.</p>
        <Link href="/">
          <Button variant="outline">Return Home</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-blue-500/30 selection:text-white relative overflow-hidden">
      
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="absolute top-8 left-8 z-20">
        <Link href="/">
          <Button variant="ghost" className="text-gray-400 hover:text-white hover:bg-white/10 flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center text-blue-500 mb-6">
          <ShieldCheck className="w-16 h-16" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white tracking-tight">
          Join {(invite.companies as any)?.name || 'your Team'}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-400">
          You've been invited to join as an {invite.role === 'qa' ? 'QA Analyst' : invite.role === 'admin' ? 'Admin' : 'Agent'}.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-[#0B1120] py-8 px-4 shadow-2xl border border-gray-800/60 sm:rounded-2xl sm:px-10">
          <JoinForm token={token} email={invite.email} />
        </div>
      </div>
    </div>
  )
}
