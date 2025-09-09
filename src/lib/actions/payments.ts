'use server'

import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { PaymentMethod, PaymentStatus } from '@prisma/client'

export type PaymentFormData = {
  studentId: string
  amount: number
  paymentMethod: PaymentMethod
  transactionId: string
  referenceNumber?: string
  academicYear?: number
  term?: string
  paidAt: string
}

export async function recordPayment(data: PaymentFormData) {
  try {
    // Validate amount
    if (isNaN(data.amount) || data.amount <= 0) {
      throw new Error('Payment amount must be a positive number')
    }

    // Get student with outstanding fee assignments
    const student = await db.student.findUnique({
      where: { id: data.studentId },
      include: {
        feeAssignments: {
          where: {
            balance: { gt: 0 }
          },
          include: {
            feeStructure: true
          },
          orderBy: {
            createdAt: 'asc' // Pay oldest fees first
          }
        },
        credits: {
          where: { isActive: true }
        }
      }
    })

    if (!student) {
      throw new Error('Student not found')
    }

    // Create the payment record
    const payment = await db.payment.create({
      data: {
        studentId: data.studentId,
        amount: data.amount,
        paymentMethod: data.paymentMethod,
        transactionId: data.transactionId,
        referenceNumber: data.referenceNumber,
        academicYear: data.academicYear,
        term: data.term,
        status: PaymentStatus.CONFIRMED,
        paidAt: new Date(data.paidAt),
        confirmedAt: new Date(),
      }
    })

    // Allocate payment to outstanding fee assignments
    let remainingAmount = data.amount
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
          balance: Math.max(newBalance, 0), // Ensure balance doesn't go negative
          status: newBalance <= 0 ? PaymentStatus.CONFIRMED : PaymentStatus.PENDING
        }
      })

      // Create ledger entry for payment allocation
      await db.studentLedger.create({
        data: {
          studentId: data.studentId,
          transactionType: 'PAYMENT',
          description: `Payment applied to: ${assignment.feeStructure.name}`,
          referenceId: payment.id,
          amount: allocationAmount, // Positive for payments
          runningBalance: 0, // Will calculate running balance later
          academicYear: assignment.feeStructure.year,
          term: assignment.feeStructure.term,
          transactionDate: new Date(data.paidAt)
        }
      })

      remainingAmount -= allocationAmount
    }

    // Handle overpayment (create credit)
    if (remainingAmount > 0) {
      await db.studentCredit.create({
        data: {
          studentId: data.studentId,
          amount: remainingAmount,
          source: `Overpayment from transaction ${data.transactionId}`,
          usedAmount: 0,
          remainingAmount: remainingAmount,
          isActive: true
        }
      })

      // Create ledger entry for credit
      await db.studentLedger.create({
        data: {
          studentId: data.studentId,
          transactionType: 'CREDIT_CREATED',
          description: `Credit created from overpayment`,
          referenceId: payment.id,
          amount: remainingAmount,
          runningBalance: 0, // Will calculate running balance later
          academicYear: data.academicYear,
          term: data.term,
          transactionDate: new Date(data.paidAt)
        }
      })
    }

    // Update running balances for student ledger
    await updateStudentLedgerBalances(data.studentId)

    revalidatePath('/payments')
    revalidatePath(`/students/${data.studentId}`)
    revalidatePath('/fees/assignments')

    return { 
      success: true, 
      payment,
      allocatedAmount: data.amount - remainingAmount,
      creditAmount: remainingAmount,
      message: remainingAmount > 0 
        ? `Payment recorded. KES ${(data.amount - remainingAmount).toLocaleString()} applied to fees, KES ${remainingAmount.toLocaleString()} added as credit.`
        : `Payment of KES ${data.amount.toLocaleString()} successfully applied to student fees.`
    }
  } catch (error) {
    console.error('Error recording payment:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to record payment' 
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

export async function getPayments() {
  try {
    const payments = await db.payment.findMany({
      include: {
        student: {
          include: {
            currentClass: true,
            feeGroup: true
          }
        },
        allocations: {
          include: {
            feeAssignment: {
              include: {
                feeStructure: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return payments
  } catch (error) {
    console.error('Error fetching payments:', error)
    return []
  }
}

export async function getPayment(id: string) {
  try {
    const payment = await db.payment.findUnique({
      where: { id },
      include: {
        student: {
          include: {
            currentClass: true,
            feeGroup: true
          }
        },
        allocations: {
          include: {
            feeAssignment: {
              include: {
                feeStructure: true
              }
            }
          }
        }
      }
    })

    return payment
  } catch (error) {
    console.error('Error fetching payment:', error)
    return null
  }
}

export async function getPaymentStats() {
  try {
    const [totalPayments, totalAmount, todayPayments, todayAmount] = await Promise.all([
      db.payment.count({
        where: { status: 'CONFIRMED' }
      }),
      db.payment.aggregate({
        where: { status: 'CONFIRMED' },
        _sum: { amount: true }
      }),
      db.payment.count({
        where: {
          status: 'CONFIRMED',
          paidAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      }),
      db.payment.aggregate({
        where: {
          status: 'CONFIRMED',
          paidAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        },
        _sum: { amount: true }
      })
    ])

    return {
      totalPayments,
      totalAmount: totalAmount._sum.amount ? parseFloat(totalAmount._sum.amount.toString()) : 0,
      todayPayments,
      todayAmount: todayAmount._sum.amount ? parseFloat(todayAmount._sum.amount.toString()) : 0
    }
  } catch (error) {
    console.error('Error fetching payment stats:', error)
    return {
      totalPayments: 0,
      totalAmount: 0,
      todayPayments: 0,
      todayAmount: 0
    }
  }
}

export async function getStudentOutstandingFees(studentId: string) {
  try {
    const assignments = await db.feeAssignment.findMany({
      where: {
        studentId,
        balance: { gt: 0 }
      },
      include: {
        feeStructure: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    const totalOutstanding = assignments.reduce((sum, assignment) => 
      sum + parseFloat(assignment.balance.toString()), 0
    )

    return {
      assignments,
      totalOutstanding
    }
  } catch (error) {
    console.error('Error fetching student outstanding fees:', error)
    return {
      assignments: [],
      totalOutstanding: 0
    }
  }
}