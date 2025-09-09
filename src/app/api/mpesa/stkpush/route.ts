import { NextRequest, NextResponse } from 'next/server'
import { processStkPushCallback } from '@/lib/actions/mpesa'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    console.log('STK Push Callback received:', JSON.stringify(body, null, 2))
    
    const result = await processStkPushCallback(body)
    
    if (result.success) {
      console.log('STK Push callback processed successfully')
    } else {
      console.error('STK Push callback processing failed:', result.error)
    }
    
    return NextResponse.json({
      ResultCode: 0,
      ResultDesc: 'Accepted'
    })
  } catch (error) {
    console.error('Error in STK Push callback:', error)
    
    return NextResponse.json({
      ResultCode: 0,
      ResultDesc: 'Accepted'
    })
  }
}