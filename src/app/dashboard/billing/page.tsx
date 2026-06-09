import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, CreditCard, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

export default async function BillingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: dbUser } = await supabase
    .from('users')
    .select('role, companies(subscription_status, subscription_tier, stripe_customer_id)')
    .eq('id', user.id)
    .single()

  const company = dbUser?.companies as any
  const isAdmin = dbUser?.role === 'admin'
  const isSubscribed = company?.subscription_status === 'active'

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
          <CreditCard className="text-purple-500 w-8 h-8" />
          Billing & Subscription
        </h1>
        <p className="text-muted-foreground mt-2">Manage your QA Copilot plan and billing details.</p>
      </div>

      <Card className="bg-[#0B1120] border-gray-800 shadow-xl">
        <CardHeader className="border-b border-gray-800 pb-6">
          <CardTitle className="text-xl">Current Plan</CardTitle>
          <CardDescription>You are currently on the {company?.subscription_tier ? company.subscription_tier.toUpperCase() : 'FREE'} plan.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl font-bold text-white capitalize">{company?.subscription_tier || 'Free'} Tier</span>
                {isSubscribed ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-500 border border-green-500/20">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Active
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-800 text-gray-400 border border-gray-700">
                    Inactive
                  </span>
                )}
              </div>
              <p className="text-muted-foreground text-sm">
                {isSubscribed 
                  ? "Your automated AI Webhook is active and fully operational." 
                  : "Your AI Webhook is paused. Upgrade to resume automated auditing."}
              </p>
            </div>
          </div>

          {!isSubscribed && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
              <div className="flex gap-3">
                <AlertTriangle className="w-5 h-5 text-blue-500 shrink-0" />
                <div>
                  <h4 className="text-sm font-semibold text-blue-400 mb-1">Upgrade Required</h4>
                  <p className="text-sm text-gray-300 mb-4">
                    To use the Developer API and automate audits directly from Genesys/Zendesk, you need an active subscription.
                  </p>
                  <Link href="/pricing">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">View Plans & Upgrade</Button>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {isSubscribed && isAdmin && (
            <div className="border-t border-gray-800 pt-6">
              <p className="text-sm text-gray-400 mb-4">
                Need to update your credit card or download past invoices? Access the secure Stripe billing portal below.
              </p>
              {/* In a real app, this would trigger a server action to create a Stripe billing portal session */}
              <Button variant="outline" className="border-gray-700 text-gray-300 hover:text-white" disabled>
                Manage Billing via Stripe (Demo)
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
