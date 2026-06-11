import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ShieldCheck, ArrowLeft, User, Key } from "lucide-react"
import { acceptInvite } from './actions'

const supabaseAdmin = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function JoinPage({
  searchParams,
}: {
  searchParams: { token?: string }
}) {
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
  const { data: invite, error } = await supabaseAdmin
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
          Join {invite.companies?.name || 'your Team'}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-400">
          You've been invited to join as an {invite.role === 'qa' ? 'QA Analyst' : invite.role === 'admin' ? 'Admin' : 'Agent'}.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-[#0B1120] py-8 px-4 shadow-2xl border border-gray-800/60 sm:rounded-2xl sm:px-10">
          
          <form action={acceptInvite} className="space-y-6">
            <input type="hidden" name="token" value={token} />

            <div>
              <label className="block text-sm font-medium text-gray-300">
                Email Address
              </label>
              <div className="mt-1">
                <Input
                  type="email"
                  value={invite.email}
                  disabled
                  className="bg-[#020617] border-gray-800 text-gray-500 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300">
                Your Full Name
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-gray-500" />
                </div>
                <Input
                  type="text"
                  name="fullName"
                  required
                  className="bg-[#020617] border-gray-800 text-white pl-10 focus:border-blue-500 focus:ring-blue-500/20"
                  placeholder="Jane Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300">
                Set a Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Key className="h-4 w-4 text-gray-500" />
                </div>
                <Input
                  type="password"
                  name="password"
                  required
                  minLength={6}
                  className="bg-[#020617] border-gray-800 text-white pl-10 focus:border-blue-500 focus:ring-blue-500/20"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <Button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-[#0B1120] transition-colors"
              >
                Accept Invite & Join
              </Button>
            </div>

          </form>
          
        </div>
      </div>
    </div>
  )
}
