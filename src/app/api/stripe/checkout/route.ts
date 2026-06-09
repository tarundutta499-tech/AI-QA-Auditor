import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/utils/supabase/server'

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2024-04-10' as any, // Using type assertion to avoid strict TS errors on older/newer versions
})

export async function POST(req: Request) {
  try {
    const { tier } = await req.json()
    
    // Authenticate user
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get company ID
    const { data: dbUser } = await supabase
      .from('users')
      .select('company_id, companies(stripe_customer_id)')
      .eq('id', user.id)
      .single()

    if (!dbUser?.company_id) {
      return NextResponse.json({ error: "No company found" }, { status: 400 })
    }

    // Determine the Price ID based on the tier requested
    let priceId = ''
    if (tier === 'Starter') {
      priceId = process.env.STRIPE_PRICE_STARTER || 'price_placeholder_starter'
    } else if (tier === 'Growth') {
      priceId = process.env.STRIPE_PRICE_GROWTH || 'price_placeholder_growth'
    } else {
      return NextResponse.json({ error: "Invalid tier" }, { status: 400 })
    }

    const companyData = dbUser.companies as any
    let customerId = companyData?.stripe_customer_id

    // If no Stripe customer exists, create one
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          company_id: dbUser.company_id
        }
      })
      customerId = customer.id
      
      // Save it back to DB
      await supabase
        .from('companies')
        .update({ stripe_customer_id: customerId })
        .eq('id', dbUser.company_id)
    }

    // Create the Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard/billing?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard/billing?canceled=true`,
      metadata: {
        company_id: dbUser.company_id,
        tier: tier
      }
    })

    return NextResponse.json({ sessionId: session.id, url: session.url })

  } catch (error: any) {
    console.error('Stripe Checkout Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
