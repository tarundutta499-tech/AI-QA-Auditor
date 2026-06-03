import { NextResponse } from 'next/server'
import { Resend } from 'resend'

// Initialize Resend with the API Key from environment variables
const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    const { fullName, email, company, teamSize, callVolume, message } = data

    // Determine the recipient email
    // Note: On Resend's free tier, you can only send emails to the address you verified your account with.
    const recipientEmail = process.env.CONTACT_EMAIL || 'delivered@resend.dev'

    // Construct the HTML Email Template
    const emailHtml = `
      <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #0F172A; border-bottom: 2px solid #3B82F6; padding-bottom: 10px;">New Demo Request 🚀</h2>
        
        <div style="margin-top: 20px;">
          <p><strong>Name:</strong> ${fullName}</p>
          <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
          <p><strong>Company:</strong> ${company}</p>
        </div>

        <div style="margin-top: 20px; background-color: #F8FAFC; padding: 15px; border-radius: 8px;">
          <h3 style="margin-top: 0; color: #1E293B;">BPO Details</h3>
          <p style="margin: 5px 0;"><strong>Team Size:</strong> ${teamSize}</p>
          <p style="margin: 5px 0;"><strong>Monthly Call Volume:</strong> ${callVolume}</p>
        </div>

        <div style="margin-top: 20px;">
          <h3 style="color: #1E293B;">Additional Message:</h3>
          <p style="background-color: #F1F5F9; padding: 15px; border-left: 4px solid #3B82F6; border-radius: 4px;">
            ${message ? message.replace(/\n/g, '<br/>') : '<em>No message provided.</em>'}
          </p>
        </div>
        
        <p style="margin-top: 30px; font-size: 12px; color: #64748B; text-align: center;">
          Sent automatically from your QA Copilot website via Resend.
        </p>
      </div>
    `

    // Send the email using Resend
    const { data: resendData, error } = await resend.emails.send({
      from: 'QA Copilot <onboarding@resend.dev>', // Resend's default free-tier sender
      to: recipientEmail,
      subject: `New Demo Request: ${company}`,
      html: emailHtml,
      replyTo: email // Allows you to hit 'Reply' and email the customer directly
    })

    if (error) {
      console.error("Resend API Error:", error)
      return NextResponse.json({ success: false, error: error.message }, { status: 400 })
    }

    return NextResponse.json(
      { success: true, message: "Demo request sent via email successfully.", data: resendData },
      { status: 200 }
    )
  } catch (error) {
    console.error("Contact form route error:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error." },
      { status: 500 }
    )
  }
}
