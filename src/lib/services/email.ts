'use server'

import { Resend } from 'resend'
import { isValidEmail } from '@/lib/utils/validation'

const resend = new Resend(process.env.RESEND_API_KEY)

const EMAIL_CONFIG = {
  fromEmail: process.env.RESEND_FROM_EMAIL || 'noreply@yourdomain.com',
  fromName: process.env.RESEND_FROM_NAME || "St. Joseph's Central Academy",
  enabled: process.env.ENABLE_EMAIL_NOTIFICATIONS === 'true'
}

export type EmailMessage = {
  to: string | string[]
  subject: string
  html?: string
  text?: string
  replyTo?: string
}

export type EmailResponse = {
  success: boolean
  messageId?: string
  error?: string
}

// Send single email
export async function sendEmail(emailData: EmailMessage): Promise<EmailResponse> {
  if (!EMAIL_CONFIG.enabled) {
    console.log('Email notifications disabled')
    return { success: false, error: 'Email notifications disabled' }
  }

  if (!process.env.RESEND_API_KEY) {
    console.error('Resend API key not configured')
    return { success: false, error: 'Email service not configured' }
  }

  try {
    const response = await resend.emails.send({
      from: `${EMAIL_CONFIG.fromName} <${EMAIL_CONFIG.fromEmail}>`,
      to: Array.isArray(emailData.to) ? emailData.to : [emailData.to],
      subject: emailData.subject,
      html: emailData.html,
      text: emailData.text || emailData.html?.replace(/<[^>]*>/g, '') || 'No content provided',
      replyTo: emailData.replyTo
    })

    if (response.data) {
      return {
        success: true,
        messageId: response.data.id
      }
    } else {
      return {
        success: false,
        error: response.error?.message || 'Email sending failed'
      }
    }
  } catch (error) {
    console.error('Error sending email via Resend:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Email sending failed'
    }
  }
}

// Send bulk emails
export async function sendBulkEmails(emails: EmailMessage[]): Promise<EmailResponse[]> {
  const results: EmailResponse[] = []
  
  for (const email of emails) {
    const result = await sendEmail(email)
    results.push(result)
    
    // Small delay between emails
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  
  return results
}