import nodemailer from 'nodemailer'

interface SendEscalationEmailOptions {
  supabase: any
  companyId: string
  agentName: string
  callId: string
  violationDetails: string
}

export async function sendEscalationEmail({
  supabase,
  companyId,
  agentName,
  callId,
  violationDetails
}: SendEscalationEmailOptions) {
  try {
    // 1. Fetch SMTP and Escalation Email details for the company
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('smtp_host, smtp_port, smtp_user, smtp_pass, smtp_from_email, escalation_email, name')
      .eq('id', companyId)
      .single()

    if (companyError || !company) {
      console.error("Failed to fetch company SMTP config for escalation:", companyError)
      return
    }

    const recipient = company.escalation_email
    if (!recipient) {
      console.log(`[ESCALATION] No escalation email configured for company ${company.name} (${companyId}). Skipping send.`)
      return
    }

    // 2. Set up SMTP transporter (fallback to environment variables if company config is incomplete)
    const host = company.smtp_host || process.env.SMTP_HOST || 'smtp.resend.com'
    const port = company.smtp_port || parseInt(process.env.SMTP_PORT || '587')
    const user = company.smtp_user || process.env.SMTP_USER || 'resend'
    const pass = company.smtp_pass || process.env.SMTP_PASS
    const from = company.smtp_from_email || process.env.SMTP_FROM_EMAIL || 'Nexaviq Alerts <alerts@resend.dev>'

    if (!pass) {
      console.error("[ESCALATION] SMTP password is not configured. Skipping email dispatch.")
      return
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass
      }
    })

    // 3. Construct HTML email body
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; color: #1a202c;">
        <div style="text-align: center; border-bottom: 2px solid #e53e3e; padding-bottom: 15px; margin-bottom: 20px;">
          <h2 style="color: #e53e3e; margin: 0; font-size: 24px;">⚠️ Nexaviq Escalation Alert</h2>
          <p style="color: #4a5568; margin: 5px 0 0 0; font-size: 14px;">Inappropriate Agent Behavior Detected</p>
        </div>
        
        <p>Dear QA Manager,</p>
        
        <p>An automated Nexaviq QA call audit has flagged critical behavioral violations during a recent customer interaction. Please review the details below immediately:</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #edf2f7; font-weight: bold; width: 30%;">Agent Name:</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #edf2f7; color: #2d3748;">${agentName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #edf2f7; font-weight: bold;">Company Campaign:</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #edf2f7; color: #2d3748;">${company.name}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #edf2f7; font-weight: bold;">Call Record:</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #edf2f7; color: #2d3748; font-family: monospace; font-size: 13px;">${callId}</td>
          </tr>
        </table>
        
        <div style="background-color: #fffaf0; border-left: 4px solid #dd6b20; padding: 15px; border-radius: 4px; margin: 20px 0;">
          <h3 style="color: #dd6b20; margin: 0 0 8px 0; font-size: 16px;">AI Audit Observation</h3>
          <p style="margin: 0; color: #4a5568; font-style: italic; line-height: 1.5; font-size: 14px;">
            ${violationDetails}
          </p>
        </div>
        
        <div style="text-align: center; margin: 30px 0 10px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/audits" 
             style="background-color: #3182ce; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 9999px; font-weight: bold; display: inline-block;">
             View Audit Scorecard
          </a>
        </div>
        
        <hr style="border: 0; border-top: 1px solid #edf2f7; margin: 30px 0 20px 0;" />
        
        <p style="font-size: 11px; color: #a0aec0; text-align: center; margin: 0;">
          This is an automated notification from your Nexaviq compliance monitor. Do not reply to this email.
        </p>
      </div>
    `

    // 4. Send email
    await transporter.sendMail({
      from,
      to: recipient,
      subject: `🚨 Escalation Warning: Inappropriate Behavior by Agent ${agentName}`,
      html: emailHtml
    })

    console.log(`[ESCALATION] Alert email successfully sent to ${recipient} for agent ${agentName}`)

  } catch (error) {
    console.error("[ESCALATION] Error sending email alert:", error)
  }
}
