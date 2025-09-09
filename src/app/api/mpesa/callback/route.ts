import { NextRequest, NextResponse } from 'next/server'
import { processMpesaCallback } from '@/lib/actions/mpesa'

// M-Pesa callback endpoint
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    console.log('M-Pesa Callback received:', JSON.stringify(body, null, 2))
    
    // Process the callback
    const result = await processMpesaCallback(body)
    
    if (result.success) {
      console.log('M-Pesa callback processed successfully')
      
      return NextResponse.json({
        ResultCode: 0,
        ResultDesc: 'Accepted'
      })
    } else {
      console.error('Failed to process M-Pesa callback:', result.error)
      
      return NextResponse.json({
        ResultCode: 1,
        ResultDesc: 'Failed to process payment'
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Error in M-Pesa callback:', error)
    
    return NextResponse.json({
      ResultCode: 1,
      ResultDesc: 'Internal server error'
    }, { status: 500 })
  }
}