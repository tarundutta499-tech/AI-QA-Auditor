import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2024-04-10' as any,
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_placeholder'

// Initialize Supabase admin client to bypass RLS
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function POST(req: Request) {
  try {
    const body = await req.text()
    const signature = req.headers.get('stripe-signature') as string

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err: any) {
      console.error(`Webhook signature verification failed: ${err.message}`)
      // If it's just a test environment without secrets, we can fallback to parsing the body directly
      // In production, you must return 400 here.
      if (webhookSecret === 'whsec_placeholder') {
        event = JSON.parse(body)
      } else {
        return NextResponse.json({ error: 'Webhook Error: Invalid Signature' }, { status: 400 })
      }
    }

    console.log(`[STRIPE WEBHOOK] Received event: ${event.type}`)

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      
      const companyId = session.metadata?.company_id
      const tier = session.metadata?.tier
      
      if (companyId) {
        await supabase
          .from('companies')
          .update({
            stripe_subscription_id: session.subscription as string,
            subscription_status: 'active',
            subscription_tier: tier?.toLowerCase() || 'premium'
          })
          .eq('id', companyId)
        
        console.log(`[STRIPE WEBHOOK] Successfully activated subscription for company ${companyId}`)
      }
    }

    if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as Stripe.Subscription
      const status = subscription.status

      // Find company by subscription ID
      const { data: companyData } = await supabase
        .from('companies')
        .select('id')
        .eq('stripe_subscription_id', subscription.id)
        .single()

      if (companyData) {
        await supabase
          .from('companies')
          .update({
            subscription_status: status
          })
          .eq('id', companyData.id)
          
        console.log(`[STRIPE WEBHOOK] Updated subscription status to ${status} for company ${companyData.id}`)
      }
    }

    return NextResponse.json({ received: true }, { status: 200 })
  } catch (error: any) {
    console.error('Stripe Webhook Exception:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
