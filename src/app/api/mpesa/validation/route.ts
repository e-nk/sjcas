import { NextRequest, NextResponse } from 'next/server'

// M-Pesa validation endpoint
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    console.log('M-Pesa Validation received:', JSON.stringify(body, null, 2))
    
    // You can add validation logic here
    // For now, we'll accept all payments
    
    return NextResponse.json({
      ResultCode: 0,
      ResultDesc: 'Accepted'
    })
  } catch (error) {
    console.error('Error in M-Pesa validation:', error)
    
    return NextResponse.json({
      ResultCode: 1,
      ResultDesc: 'Validation failed'
    }, { status: 500 })
  }
}