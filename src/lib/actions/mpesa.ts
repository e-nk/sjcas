'use server'

import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import axios from 'axios'

// M-Pesa Configuration - these should be in environment variables
const MPESA_CONFIG = {
  consumerKey: process.env.MPESA_CONSUMER_KEY || '',
  consumerSecret: process.env.MPESA_CONSUMER_SECRET || '',
  environment: process.env.MPESA_ENVIRONMENT || 'sandbox', // 'sandbox' or 'production'
  paybill: process.env.MPESA_PAYBILL_NUMBER || '174379', // Your paybill number
  passkey: process.env.MPESA_PASSKEY || '',
  callbackUrl: process.env.MPESA_CALLBACK_URL || 'https://sjcas.vercel.app/api/mpesa/callback',
}

// Get M-Pesa access token
export async function getMpesaAccessToken() {
  try {
    // Use Buffer (Node.js built-in) instead of crypto package
    const auth = Buffer.from(`${MPESA_CONFIG.consumerKey}:${MPESA_CONFIG.consumerSecret}`).toString('base64')
    
    const response = await axios.get(
      `https://${MPESA_CONFIG.environment === 'production' ? 'api' : 'sandbox'}.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials`,
      {
        headers: {
          Authorization: `Basic ${auth}`,
        },
      }
    )

    return {
      success: true,
      accessToken: response.data.access_token,
      expiresIn: response.data.expires_in
    }
  } catch (error) {
    console.error('Error getting M-Pesa access token:', error)
    return {
      success: false,
      error: 'Failed to get M-Pesa access token'
    }
  }
}

// Generate M-Pesa password (if needed for STK Push)
export async function generateMpesaPassword(businessShortCode: string, passkey: string, timestamp: string) {
  // Use Buffer instead of crypto package for base64 encoding
  const password = Buffer.from(`${businessShortCode}${passkey}${timestamp}`).toString('base64')
  return password
}

// Generate timestamp for M-Pesa
export  async function generateTimestamp() {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
  const second = String(date.getSeconds()).padStart(2, '0')
  
  return `${year}${month}${day}${hour}${minute}${second}`
}

// Register C2B URLs (do this once during setup)
export async function registerC2BUrls() {
  try {
    const tokenResult = await getMpesaAccessToken()
    if (!tokenResult.success) {
      throw new Error('Failed to get access token')
    }

    const response = await axios.post(
      `https://${MPESA_CONFIG.environment === 'production' ? 'api' : 'sandbox'}.safaricom.co.ke/mpesa/c2b/v1/registerurl`,
      {
        ShortCode: MPESA_CONFIG.paybill,
        ResponseType: 'Completed',
        ConfirmationURL: `${MPESA_CONFIG.callbackUrl}/confirmation`,
        ValidationURL: `${MPESA_CONFIG.callbackUrl}/validation`,
      },
      {
        headers: {
          Authorization: `Bearer ${tokenResult.accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    )

    return {
      success: true,
      data: response.data
    }
  } catch (error) {
    console.error('Error registering C2B URLs:', error)
    return {
      success: false,
      error: 'Failed to register C2B URLs'
    }
  }
}

// Helper function to update running balances
async function updateStudentLedgerBalances(studentId: string) {
  const ledgerEntries = await db.studentLedger.findMany({
    where: { studentId },
    orderBy: { transactionDate: 'asc' }
  })

  let runningBalance = 0
  
  for (const entry of ledgerEntries) {
    runningBalance += parseFloat(entry.amount.toString())
    
    await db.studentLedger.update({
      where: { id: entry.id },
      data: { runningBalance }
    })
  }
}

// Extract payment processing logic into separate function
async function processSuccessfulPayment(student: any, paymentData: any) {
  // Create payment record
  const payment = await db.payment.create({
    data: {
      studentId: student.id,
      amount: paymentData.amount,
      paymentMethod: 'MPESA',
      transactionId: paymentData.transactionId,
      referenceNumber: paymentData.accountReference,
      status: 'CONFIRMED',
      paidAt: new Date(paymentData.transactionTime || new Date()),
      confirmedAt: new Date(),
    }
  })

  // Allocate payment to outstanding fees
  let remainingAmount = paymentData.amount
  const allocations = []

  for (const assignment of student.feeAssignments) {
    if (remainingAmount <= 0) break

    const outstandingBalance = parseFloat(assignment.balance.toString())
    const allocationAmount = Math.min(remainingAmount, outstandingBalance)

    const allocation = await db.paymentAllocation.create({
      data: {
        paymentId: payment.id,
        feeAssignmentId: assignment.id,
        allocatedAmount: allocationAmount
      }
    })

    allocations.push(allocation)

    const newAmountPaid = parseFloat(assignment.amountPaid.toString()) + allocationAmount
    const newBalance = parseFloat(assignment.amountDue.toString()) - newAmountPaid

    await db.feeAssignment.update({
      where: { id: assignment.id },
      data: {
        amountPaid: newAmountPaid,
        balance: Math.max(newBalance, 0),
        status: newBalance <= 0 ? 'CONFIRMED' : 'PENDING'
      }
    })

    await db.studentLedger.create({
      data: {
        studentId: student.id,
        transactionType: 'PAYMENT',
        description: `M-Pesa payment applied to: ${assignment.feeStructure.name}`,
        referenceId: payment.id,
        amount: allocationAmount,
        runningBalance: 0,
        academicYear: assignment.feeStructure.year,
        term: assignment.feeStructure.term,
        transactionDate: new Date(paymentData.transactionTime || new Date())
      }
    })

    remainingAmount -= allocationAmount
  }

  // Handle overpayment as credit
  if (remainingAmount > 0) {
    await db.studentCredit.create({
      data: {
        studentId: student.id,
        amount: remainingAmount,
        source: `M-Pesa overpayment from transaction ${paymentData.transactionId}`,
        usedAmount: 0,
        remainingAmount: remainingAmount,
        isActive: true
      }
    })

    await db.studentLedger.create({
      data: {
        studentId: student.id,
        transactionType: 'CREDIT_CREATED',
        description: `Credit from M-Pesa overpayment`,
        referenceId: payment.id,
        amount: remainingAmount,
        runningBalance: 0,
        transactionDate: new Date(paymentData.transactionTime || new Date())
      }
    })
  }

  await updateStudentLedgerBalances(student.id)

  console.log(`M-Pesa payment processed successfully for ${student.firstName} ${student.lastName}`)

  revalidatePath('/payments')
  revalidatePath(`/students/${student.id}`)
  revalidatePath('/fees/assignments')

  return {
    success: true,
    type: 'matched',
    payment,
    student,
    allocatedAmount: paymentData.amount - remainingAmount,
    creditAmount: remainingAmount
  }
}

// Helper function to find student from STK request
async function findStudentFromStkRequest(checkoutRequestId: string) {
  try {
    const stkRequest = await db.stkPushRequest.findUnique({
      where: { checkoutRequestId },
      include: {
        student: {
          include: {
            currentClass: true,
            feeGroup: true,
            feeAssignments: {
              where: { balance: { gt: 0 } },
              include: { feeStructure: true },
              orderBy: { createdAt: 'asc' }
            }
          }
        }
      }
    })

    return stkRequest?.student || null
  } catch (error) {
    console.error('Error finding student from STK request:', error)
    return null
  }
}

// Process STK Push callback
export async function processStkPushCallback(callbackData: any) {
  try {
    console.log('Processing STK Push callback:', JSON.stringify(callbackData, null, 2))

    const stkCallback = callbackData.Body?.stkCallback
    
    if (!stkCallback) {
      throw new Error('Invalid STK callback data')
    }

    // Check if payment was successful
    if (stkCallback.ResultCode !== 0) {
      console.log('STK Push payment failed or cancelled:', stkCallback.ResultDesc)
      
      // Update STK request status to failed
      if (stkCallback.CheckoutRequestID) {
        await db.stkPushRequest.updateMany({
          where: { checkoutRequestId: stkCallback.CheckoutRequestID },
          data: { status: 'FAILED' }
        })
      }
      
      return {
        success: false,
        error: stkCallback.ResultDesc || 'Payment failed',
        resultCode: stkCallback.ResultCode
      }
    }

    // Extract payment details from successful callback
    const callbackMetadata = stkCallback.CallbackMetadata?.Item || []
    const paymentData = callbackMetadata.reduce((acc: any, item: any) => {
      acc[item.Name] = item.Value
      return acc
    }, {})

    const {
      Amount: amount,
      MpesaReceiptNumber: transactionId,
      TransactionDate: transactionTime,
      PhoneNumber: phoneNumber
    } = paymentData

    if (!amount || !transactionId) {
      throw new Error('Missing payment details in callback')
    }

    // Find student from STK request
    const student = await findStudentFromStkRequest(stkCallback.CheckoutRequestID)

    if (!student) {
      // Create unmatched payment with STK Push details
      const unmatchedPayment = await db.unmatchedPayment.create({
        data: {
          amount: parseFloat(amount),
          paymentMethod: 'MPESA_STK',
          transactionId: transactionId,
          accountReference: stkCallback.CheckoutRequestID,
          phoneNumber: phoneNumber,
          payerName: 'STK Push Payment',
          transactionDate: new Date(transactionTime || new Date()),
          status: 'PENDING',
          adminNotes: `STK Push - CheckoutRequestID: ${stkCallback.CheckoutRequestID}`
        }
      })

      return {
        success: true,
        type: 'unmatched',
        unmatchedPayment
      }
    }

    // Process the payment
    const result = await processSuccessfulPayment(student, {
      amount: parseFloat(amount),
      transactionId,
      accountReference: student.admissionNumber,
      phoneNumber,
      firstName: student.firstName,
      lastName: student.lastName,
      transactionTime
    })

    // Update STK request status
    await db.stkPushRequest.updateMany({
      where: { checkoutRequestId: stkCallback.CheckoutRequestID },
      data: { status: 'COMPLETED' }
    })

    return result

  } catch (error) {
    console.error('Error processing STK Push callback:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process STK Push callback'
    }
  }
}

// Process M-Pesa payment callback (for direct paybill payments - C2B)
export async function processMpesaCallback(callbackData: any) {
  try {
    console.log('Processing M-Pesa C2B callback:', callbackData)

    // Handle different callback formats
    let paymentData

    // Format 1: Direct C2B payment
    if (callbackData.TransAmount) {
      paymentData = {
        amount: parseFloat(callbackData.TransAmount),
        transactionId: callbackData.TransID,
        accountReference: callbackData.BillRefNumber || callbackData.AccountReference,
        phoneNumber: callbackData.MSISDN,
        firstName: callbackData.FirstName || '',
        lastName: callbackData.LastName || '',
        transactionTime: callbackData.TransTime
      }
    }
    // Format 2: STK Push callback (redirect to STK handler)
    else if (callbackData.Body?.stkCallback) {
      return await processStkPushCallback(callbackData)
    }
    // Format 3: Alternative C2B format
    else {
      const {
        TransAmount: amount,
        TransID: transactionId,
        BillRefNumber: accountReference,
        MSISDN: phoneNumber,
        FirstName: firstName,
        LastName: lastName,
        TransTime: transactionTime
      } = callbackData

      paymentData = {
        amount: parseFloat(amount),
        transactionId,
        accountReference,
        phoneNumber,
        firstName: firstName || '',
        lastName: lastName || '',
        transactionTime
      }
    }

    if (!paymentData.amount || !paymentData.transactionId || !paymentData.accountReference) {
      throw new Error('Invalid payment data received')
    }

    console.log('Extracted payment data:', paymentData)

    // Try to find student by admission number (account reference)
    const student = await db.student.findFirst({
      where: {
        admissionNumber: paymentData.accountReference.toString().toUpperCase(),
        status: 'ACTIVE'
      },
      include: {
        feeAssignments: {
          where: { balance: { gt: 0 } },
          include: { feeStructure: true },
          orderBy: { createdAt: 'asc' }
        },
        credits: { where: { isActive: true } }
      }
    })

    if (!student) {
      console.log('Student not found for admission number:', paymentData.accountReference)
      
      // Create unmatched payment record
      const unmatchedPayment = await db.unmatchedPayment.create({
        data: {
          amount: paymentData.amount,
          paymentMethod: 'MPESA',
          transactionId: paymentData.transactionId,
          accountReference: paymentData.accountReference.toString(),
          phoneNumber: paymentData.phoneNumber,
          payerName: `${paymentData.firstName} ${paymentData.lastName}`.trim() || 'Unknown',
          transactionDate: new Date(paymentData.transactionTime || new Date()),
          status: 'PENDING'
        }
      })

      console.log('Created unmatched payment:', unmatchedPayment.id)
      
      return {
        success: true,
        type: 'unmatched',
        unmatchedPayment
      }
    }

    // Process successful payment
    return await processSuccessfulPayment(student, paymentData)

  } catch (error) {
    console.error('Error processing M-Pesa callback:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process M-Pesa payment'
    }
  }
}

// STK Push initiation
export async function initiateStkPush(phoneNumber: string, amount: number, studentId: string) {
  try {
    const tokenResult = await getMpesaAccessToken()
    if (!tokenResult.success) {
      throw new Error('Failed to get access token')
    }

    const student = await db.student.findUnique({
      where: { id: studentId }
    })

    if (!student) {
      throw new Error('Student not found')
    }

    const timestamp = await generateTimestamp()
    const password = await generateMpesaPassword(MPESA_CONFIG.paybill, MPESA_CONFIG.passkey, timestamp)

    const response = await axios.post(
      `https://${MPESA_CONFIG.environment === 'production' ? 'api' : 'sandbox'}.safaricom.co.ke/mpesa/stkpush/v1/processrequest`,
      {
        BusinessShortCode: MPESA_CONFIG.paybill,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: amount,
        PartyA: phoneNumber,
        PartyB: MPESA_CONFIG.paybill,
        PhoneNumber: phoneNumber,
        CallBackURL: `${MPESA_CONFIG.callbackUrl}/stkpush`,
        AccountReference: student.admissionNumber,
        TransactionDesc: `School fees payment for ${student.admissionNumber}`,
      },
      {
        headers: {
          Authorization: `Bearer ${tokenResult.accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    )

    const { CheckoutRequestID, MerchantRequestID, ResponseCode, ResponseDescription } = response.data

    if (ResponseCode === '0') {
      // Store STK request for later matching
      await db.stkPushRequest.create({
        data: {
          checkoutRequestId: CheckoutRequestID,
          merchantRequestId: MerchantRequestID,
          studentId: studentId,
          phoneNumber: phoneNumber,
          amount: amount,
          status: 'PENDING',
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes expiry
        }
      })
    }

    return {
      success: ResponseCode === '0',
      data: response.data,
      checkoutRequestId: CheckoutRequestID,
      error: ResponseCode !== '0' ? ResponseDescription : undefined
    }
  } catch (error) {
    console.error('Error initiating STK push:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to initiate STK push'
    }
  }
}

// Check STK Push status
export async function checkStkPushStatus(checkoutRequestId: string) {
  try {
    const stkRequest = await db.stkPushRequest.findUnique({
      where: { checkoutRequestId },
      include: {
        student: true
      }
    })

    if (!stkRequest) {
      return {
        success: false,
        error: 'STK request not found'
      }
    }

    // Check if payment was completed
    const payment = await db.payment.findFirst({
      where: {
        studentId: stkRequest.studentId,
        createdAt: {
          gte: stkRequest.createdAt
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    if (payment) {
      // Update STK request status
      await db.stkPushRequest.update({
        where: { checkoutRequestId },
        data: { status: 'COMPLETED' }
      })

      return {
        success: true,
        status: 'COMPLETED',
        payment,
        student: stkRequest.student
      }
    }

    // Check if expired
    if (new Date() > stkRequest.expiresAt) {
      await db.stkPushRequest.update({
        where: { checkoutRequestId },
        data: { status: 'EXPIRED' }
      })

      return {
        success: true,
        status: 'EXPIRED'
      }
    }

    return {
      success: true,
      status: 'PENDING'
    }
  } catch (error) {
    console.error('Error checking STK push status:', error)
    return {
      success: false,
      error: 'Failed to check STK push status'
    }
  }
}

// Get unmatched payments for admin review
export async function getUnmatchedPayments() {
  try {
    const unmatchedPayments = await db.unmatchedPayment.findMany({
      where: {
        status: 'PENDING'
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return unmatchedPayments
  } catch (error) {
    console.error('Error fetching unmatched payments:', error)
    return []
  }
}

// Resolve unmatched payment by matching to a student
export async function resolveUnmatchedPayment(unmatchedPaymentId: string, studentId: string) {
  try {
    const unmatchedPayment = await db.unmatchedPayment.findUnique({
      where: { id: unmatchedPaymentId }
    })

    if (!unmatchedPayment) {
      throw new Error('Unmatched payment not found')
    }

    // Create the actual payment record
    const payment = await db.payment.create({
      data: {
        studentId,
        amount: unmatchedPayment.amount,
        paymentMethod: unmatchedPayment.paymentMethod,
        transactionId: unmatchedPayment.transactionId,
        referenceNumber: unmatchedPayment.accountReference,
        status: 'CONFIRMED',
        paidAt: unmatchedPayment.transactionDate,
        confirmedAt: new Date(),
      }
    })

    // Update unmatched payment status
    await db.unmatchedPayment.update({
      where: { id: unmatchedPaymentId },
      data: {
        status: 'RESOLVED',
        createdPaymentId: payment.id,
        resolvedAt: new Date()
      }
    })

    // Process payment allocation (same as normal payment processing)
    const student = await db.student.findUnique({
      where: { id: studentId },
      include: {
        feeAssignments: {
          where: { balance: { gt: 0 } },
          include: { feeStructure: true },
          orderBy: { createdAt: 'asc' }
        }
      }
    })

    if (student) {
      // Allocate payment to outstanding fees
      let remainingAmount = parseFloat(unmatchedPayment.amount.toString())

      for (const assignment of student.feeAssignments) {
        if (remainingAmount <= 0) break

        const outstandingBalance = parseFloat(assignment.balance.toString())
        const allocationAmount = Math.min(remainingAmount, outstandingBalance)

        await db.paymentAllocation.create({
          data: {
            paymentId: payment.id,
            feeAssignmentId: assignment.id,
            allocatedAmount: allocationAmount
          }
        })

        const newAmountPaid = parseFloat(assignment.amountPaid.toString()) + allocationAmount
        const newBalance = parseFloat(assignment.amountDue.toString()) - newAmountPaid

        await db.feeAssignment.update({
          where: { id: assignment.id },
          data: {
            amountPaid: newAmountPaid,
            balance: Math.max(newBalance, 0),
            status: newBalance <= 0 ? 'CONFIRMED' : 'PENDING'
          }
        })

        await db.studentLedger.create({
          data: {
            studentId: student.id,
            transactionType: 'PAYMENT',
            description: `Resolved M-Pesa payment applied to: ${assignment.feeStructure.name}`,
            referenceId: payment.id,
            amount: allocationAmount,
            runningBalance: 0,
            academicYear: assignment.feeStructure.year,
            term: assignment.feeStructure.term,
            transactionDate: unmatchedPayment.transactionDate
          }
        })

        remainingAmount -= allocationAmount
      }

      // Handle overpayment
      if (remainingAmount > 0) {
        await db.studentCredit.create({
          data: {
            studentId: student.id,
            amount: remainingAmount,
            source: `Resolved M-Pesa overpayment from transaction ${unmatchedPayment.transactionId}`,
            usedAmount: 0,
            remainingAmount: remainingAmount,
            isActive: true
          }
        })
      }

      await updateStudentLedgerBalances(student.id)
    }

    revalidatePath('/payments/unmatched')
    revalidatePath('/payments')
    revalidatePath(`/students/${studentId}`)

    return {
      success: true,
      payment
    }
  } catch (error) {
    console.error('Error resolving unmatched payment:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to resolve unmatched payment'
    }
  }
}

// Reject unmatched payment
export async function rejectUnmatchedPayment(unmatchedPaymentId: string, reason: string) {
  try {
    await db.unmatchedPayment.update({
      where: { id: unmatchedPaymentId },
      data: {
        status: 'REJECTED',
        adminNotes: reason,
        resolvedAt: new Date()
      }
    })

    revalidatePath('/payments/unmatched')

    return {
      success: true,
      message: 'Payment marked as rejected'
    }
  } catch (error) {
    console.error('Error rejecting unmatched payment:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to reject payment'
    }
  }
}