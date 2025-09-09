'use server'

import axios from 'axios'
import { formatPhoneNumber, isValidPhoneNumber } from '@/lib/utils/validation'

const TIARA_CONFIG = {
  apiUrl: process.env.TIARA_CONNECT_API_URL || 'https://api.tiaraconnect.io/api',
  apiKey: process.env.TIARA_CONNECT_API_KEY || '',
  senderId: process.env.TIARA_CONNECT_SENDER_ID || 'SJCAS',
  enabled: process.env.ENABLE_SMS_NOTIFICATIONS === 'true'
}

export type SMSMessage = {
  to: string | string[]
  message: string
  senderId?: string
}

export type SMSResponse = {
  success: boolean
  messageId?: string
  cost?: number
  error?: string
}

// Send single SMS
export async function sendSMS(smsData: SMSMessage): Promise<SMSResponse> {
  if (!TIARA_CONFIG.enabled) {
    console.log('SMS notifications disabled')
    return { success: false, error: 'SMS notifications disabled' }
  }

  if (!TIARA_CONFIG.apiKey) {
    console.error('Tiara Connect API key not configured')
    return { success: false, error: 'SMS service not configured' }
  }

  try {
    const recipients = Array.isArray(smsData.to) ? smsData.to : [smsData.to]
    
    // Format phone numbers (ensure they start with 254)
    const formattedRecipients = recipients.map(phone => {
      let cleaned = phone.replace(/\D/g, '')
      if (cleaned.startsWith('0')) {
        cleaned = '254' + cleaned.slice(1)
      } else if (cleaned.startsWith('+254')) {
        cleaned = cleaned.slice(1)
      } else if (!cleaned.startsWith('254')) {
        cleaned = '254' + cleaned
      }
      return cleaned
    })

    const response = await axios.post(
      `${TIARA_CONFIG.apiUrl}/v1/sms/send`,
      {
        apikey: TIARA_CONFIG.apiKey,
        partnerID: TIARA_CONFIG.senderId,
        message: smsData.message,
        shortcode: smsData.senderId || TIARA_CONFIG.senderId,
        mobile: formattedRecipients.join(',')
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 30000
      }
    )

    console.log('Tiara Connect SMS Response:', response.data)

    if (response.data.success || response.data.status === 'success') {
      return {
        success: true,
        messageId: response.data.messageId || response.data.id,
        cost: response.data.cost || 0
      }
    } else {
      return {
        success: false,
        error: response.data.message || response.data.error || 'SMS sending failed'
      }
    }
  } catch (error) {
    console.error('Error sending SMS via Tiara Connect:', error)
    
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        error: error.response?.data?.message || error.message
      }
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'SMS sending failed'
    }
  }
}

// Send bulk SMS
export async function sendBulkSMS(messages: SMSMessage[]): Promise<SMSResponse[]> {
  const results: SMSResponse[] = []
  
  for (const message of messages) {
    const result = await sendSMS(message)
    results.push(result)
    
    // Small delay between messages to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  
  return results
}

// Get SMS delivery status (if supported by Tiara Connect)
export async function getSMSStatus(messageId: string): Promise<{ status: string; delivered: boolean }> {
  if (!TIARA_CONFIG.enabled || !TIARA_CONFIG.apiKey) {
    return { status: 'unknown', delivered: false }
  }

  try {
    const response = await axios.get(
      `${TIARA_CONFIG.apiUrl}/v1/sms/status/${messageId}`,
      {
        headers: {
          'Authorization': `Bearer ${TIARA_CONFIG.apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    )

    return {
      status: response.data.status || 'unknown',
      delivered: response.data.status === 'delivered' || response.data.delivered === true
    }
  } catch (error) {
    console.error('Error getting SMS status:', error)
    return { status: 'unknown', delivered: false }
  }
}