import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    // In a real application, you would send this to a CRM (HubSpot, Salesforce)
    // or send an email via Resend / SendGrid here.
    console.log("New demo request received:", data)

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    return NextResponse.json(
      { success: true, message: "Demo request received successfully." },
      { status: 200 }
    )
  } catch (error) {
    console.error("Contact form error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to process request." },
      { status: 500 }
    )
  }
}
