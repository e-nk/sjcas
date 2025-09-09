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
  callbackUrl: process.env.MPESA_CALLBACK_URL || 'https://yourdomain.com/api/mpesa/callback',
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
export function generateMpesaPassword(businessShortCode: string, passkey: string, timestamp: string) {
  // Use Buffer instead of crypto package for base64 encoding
  const password = Buffer.from(`${businessShortCode}${passkey}${timestamp}`).toString('base64')
  return password
}

// Generate timestamp for M-Pesa
export function generateTimestamp() {
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

// STK Push (Optional - for initiating payments from your system)
export async function initiateStkPush(phoneNumber: string, amount: number, accountReference: string) {
  try {
    const tokenResult = await getMpesaAccessToken()
    if (!tokenResult.success) {
      throw new Error('Failed to get access token')
    }

    const timestamp = generateTimestamp()
    const password = generateMpesaPassword(MPESA_CONFIG.paybill, MPESA_CONFIG.passkey, timestamp)

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
        AccountReference: accountReference,
        TransactionDesc: `School fees payment for ${accountReference}`,
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
    console.error('Error initiating STK push:', error)
    return {
      success: false,
      error: 'Failed to initiate STK push'
    }
  }
}

// Process M-Pesa payment callback (keep this function as is - it doesn't use crypto)
export async function processMpesaCallback(callbackData: any) {
  try {
    console.log('Processing M-Pesa callback:', callbackData)

    // Extract payment details from callback
    const {
      TransAmount: amount,
      TransID: transactionId,
      BillRefNumber: accountReference,
      MSISDN: phoneNumber,
      FirstName: firstName,
      LastName: lastName,
      TransTime: transactionTime
    } = callbackData.Body.stkCallback?.CallbackMetadata?.Item?.reduce((acc: any, item: any) => {
      acc[item.Name] = item.Value
      return acc
    }, {}) || {}

    // Alternative format for C2B payments
    const paymentData = callbackData.TransAmount ? {
      amount: parseFloat(callbackData.TransAmount),
      transactionId: callbackData.TransID,
      accountReference: callbackData.BillRefNumber || callbackData.AccountReference,
      phoneNumber: callbackData.MSISDN,
      firstName: callbackData.FirstName,
      lastName: callbackData.LastName,
      transactionTime: callbackData.TransTime
    } : {
      amount: parseFloat(amount),
      transactionId,
      accountReference,
      phoneNumber,
      firstName,
      lastName,
      transactionTime
    }

    if (!paymentData.amount || !paymentData.transactionId || !paymentData.accountReference) {
      throw new Error('Invalid payment data received')
    }

    // Try to find student by admission number (account reference)
    const student = await db.student.findFirst({
      where: {
        admissionNumber: paymentData.accountReference.toUpperCase(),
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
      // Create unmatched payment record
      const unmatchedPayment = await db.unmatchedPayment.create({
        data: {
          amount: paymentData.amount,
          paymentMethod: 'MPESA',
          transactionId: paymentData.transactionId,
          accountReference: paymentData.accountReference,
          phoneNumber: paymentData.phoneNumber,
          payerName: `${paymentData.firstName} ${paymentData.lastName}`.trim(),
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

    // Allocate payment to outstanding fees (same logic as manual payment)
    let remainingAmount = paymentData.amount
    const allocations = []

    for (const assignment of student.feeAssignments) {
      if (remainingAmount <= 0) break

      const outstandingBalance = parseFloat(assignment.balance.toString())
      const allocationAmount = Math.min(remainingAmount, outstandingBalance)

      // Create payment allocation
      const allocation = await db.paymentAllocation.create({
        data: {
          paymentId: payment.id,
          feeAssignmentId: assignment.id,
          allocatedAmount: allocationAmount
        }
      })

      allocations.push(allocation)

      // Update fee assignment
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

      // Create ledger entry
      await db.studentLedger.create({
        data: {
          studentId: student.id,
          transactionType: 'PAYMENT',
          description: `M-Pesa payment applied to: ${assignment.feeStructure.name}`,
          referenceId: payment.id,
          amount: allocationAmount,
          runningBalance: 0, // Will update running balances separately
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

      // Create ledger entry for credit
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

    // Update running balances for student ledger
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
  } catch (error) {
    console.error('Error processing M-Pesa callback:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process M-Pesa payment'
    }
  }
}

// Helper function to update running balances (keep as is)
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