import { NextRequest, NextResponse } from 'next/server'
import { processMpesaCallback } from '@/lib/actions/mpesa'

// M-Pesa confirmation endpoint
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    console.log('M-Pesa Confirmation received:', JSON.stringify(body, null, 2))
    
    // Process the confirmation (same as callback for C2B)
    const result = await processMpesaCallback(body)
    
    if (result.success) {
      console.log('M-Pesa confirmation processed successfully')
    } else {
      console.error('Failed to process M-Pesa confirmation:', result.error)
    }
    
    // Always return success to M-Pesa
    return NextResponse.json({
      ResultCode: 0,
      ResultDesc: 'Accepted'
    })
  } catch (error) {
    console.error('Error in M-Pesa confirmation:', error)
    
    return NextResponse.json({
      ResultCode: 0,
      ResultDesc: 'Accepted'
    })
  }
}