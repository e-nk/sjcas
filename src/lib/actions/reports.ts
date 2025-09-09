'use server'

import { db } from '@/lib/db'

// Type definitions
export type DashboardStats = {
  totalStudents: number
  activeStudents: number
  totalFeeStructures: number
  totalAssignments: number
  pendingAssignments: number
  totalPaid: number
  totalPaymentsCount: number
  totalOutstanding: number
  todayPayments: number
}

export type OutstandingFeesData = {
  students: any[]
  summary: {
    totalStudents: number
    totalOutstandingAmount: number
    averageOutstanding: number
  }
  byClass: Array<{
    className: string
    studentCount: number
    totalOutstanding: number
  }>
}

export type FeeCollectionData = {
  payments: any[]
  stats: {
    totalPayments: number
    totalAmount: number
    averagePayment: number
  }
  byMethod: Array<{
    method: string
    count: number
    total: number
  }>
  byClass: Array<{
    className: string
    count: number
    total: number
  }>
  byFeeStructure: Array<{
    structureName: string
    count: number
    total: number
  }>
  dailyCollection: Record<string, number>
}

export type StudentStatementData = {
  student: any
  summary: {
    totalFeesCharged: number
    totalPayments: number
    totalOutstanding: number
    totalCredits: number
    netBalance: number
  }
} | null

// Get dashboard statistics
export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    const [
      totalStudents,
      activeStudents,
      totalFeeStructures,
      totalAssignments,
      pendingAssignments,
      paymentStats,
      todayPayments,
      outstandingStats
    ] = await Promise.all([
      db.student.count(),
      db.student.count({ where: { status: 'ACTIVE' } }),
      db.feeStructure.count({ where: { isActive: true } }),
      db.feeAssignment.count(),
      db.feeAssignment.count({
        where: { 
          balance: { gt: 0 },
          student: { status: 'ACTIVE' }
        }
      }),
      db.payment.aggregate({
        _sum: { amount: true },
        _count: { id: true },
        where: { status: 'CONFIRMED' }
      }),
      db.payment.count({
        where: {
          status: 'CONFIRMED',
          paidAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lt: new Date(new Date().setHours(23, 59, 59, 999))
          }
        }
      }),
      db.feeAssignment.aggregate({
        _sum: { balance: true },
        where: {
          balance: { gt: 0 },
          student: { status: 'ACTIVE' }
        }
      })
    ])

    return {
      totalStudents,
      activeStudents,
      totalFeeStructures,
      totalAssignments,
      pendingAssignments,
      totalPaid: paymentStats._sum.amount ? parseFloat(paymentStats._sum.amount.toString()) : 0,
      totalPaymentsCount: paymentStats._count.id,
      totalOutstanding: outstandingStats._sum.balance ? parseFloat(outstandingStats._sum.balance.toString()) : 0,
      todayPayments
    }
  } catch (error) {
    console.error('Error getting dashboard stats:', error)
    return {
      totalStudents: 0,
      activeStudents: 0,
      totalFeeStructures: 0,
      totalAssignments: 0,
      pendingAssignments: 0,
      totalPaid: 0,
      totalPaymentsCount: 0,
      totalOutstanding: 0,
      todayPayments: 0
    }
  }
}

// Get outstanding fees report
export async function getOutstandingFeesReport(): Promise<OutstandingFeesData> {
  try {
    const studentsWithOutstandingFees = await db.student.findMany({
      where: {
        status: 'ACTIVE',
        feeAssignments: {
          some: { balance: { gt: 0 } }
        }
      },
      include: {
        currentClass: true,
        feeGroup: true,
        feeAssignments: {
          where: { balance: { gt: 0 } },
          include: { feeStructure: true }
        },
        payments: {
          where: { status: 'CONFIRMED' },
          orderBy: { paidAt: 'desc' },
          take: 3
        }
      },
      orderBy: { firstName: 'asc' }
    })

    const totalOutstandingAmount = studentsWithOutstandingFees.reduce((sum, student) => {
      const studentOutstanding = student.feeAssignments.reduce((studentSum, assignment) => {
        return studentSum + parseFloat(assignment.balance.toString())
      }, 0)
      return sum + studentOutstanding
    }, 0)

    const outstandingByClass = studentsWithOutstandingFees.reduce((acc, student) => {
      const className = student.currentClass.name
      if (!acc[className]) {
        acc[className] = {
          className,
          studentCount: 0,
          totalOutstanding: 0
        }
      }
      
      acc[className].studentCount++
      const studentOutstanding = student.feeAssignments.reduce((sum, assignment) => {
        return sum + parseFloat(assignment.balance.toString())
      }, 0)
      acc[className].totalOutstanding += studentOutstanding
      
      return acc
    }, {} as Record<string, any>)

    return {
      students: studentsWithOutstandingFees,
      summary: {
        totalStudents: studentsWithOutstandingFees.length,
        totalOutstandingAmount,
        averageOutstanding: studentsWithOutstandingFees.length > 0 
          ? totalOutstandingAmount / studentsWithOutstandingFees.length 
          : 0
      },
      byClass: Object.values(outstandingByClass)
    }
  } catch (error) {
    console.error('Error getting outstanding fees report:', error)
    return {
      students: [],
      summary: {
        totalStudents: 0,
        totalOutstandingAmount: 0,
        averageOutstanding: 0
      },
      byClass: []
    }
  }
}

// Get fee collection report
export async function getFeeCollectionReport(): Promise<FeeCollectionData> {
  try {
    const payments = await db.payment.findMany({
      where: { status: 'CONFIRMED' },
      include: {
        student: {
          include: { currentClass: true }
        }
      },
      orderBy: { paidAt: 'desc' }
    })

    const allocations = await db.paymentAllocation.findMany({
      where: {
        payment: { status: 'CONFIRMED' }
      },
      include: {
        payment: true,
        feeAssignment: {
          include: { feeStructure: true }
        }
      }
    })

    const totalAmount = payments.reduce((sum, payment) => {
      return sum + parseFloat(payment.amount.toString())
    }, 0)

    const averagePayment = payments.length > 0 ? totalAmount / payments.length : 0

    const byMethod = payments.reduce((acc, payment) => {
      const method = payment.paymentMethod
      if (!acc[method]) {
        acc[method] = { method, count: 0, total: 0 }
      }
      acc[method].count++
      acc[method].total += parseFloat(payment.amount.toString())
      return acc
    }, {} as Record<string, any>)

    const byClass = payments.reduce((acc, payment) => {
      if (!payment.student) return acc
      
      const className = payment.student.currentClass.name
      if (!acc[className]) {
        acc[className] = { className, count: 0, total: 0 }
      }
      acc[className].count++
      acc[className].total += parseFloat(payment.amount.toString())
      return acc
    }, {} as Record<string, any>)

    const byFeeStructure = allocations.reduce((acc, allocation) => {
      const structureName = allocation.feeAssignment.feeStructure.name
      if (!acc[structureName]) {
        acc[structureName] = { structureName, count: 0, total: 0 }
      }
      acc[structureName].count++
      acc[structureName].total += parseFloat(allocation.allocatedAmount.toString())
      return acc
    }, {} as Record<string, any>)

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const dailyCollection = payments
      .filter(payment => payment.paidAt && payment.paidAt >= thirtyDaysAgo)
      .reduce((acc, payment) => {
        const date = payment.paidAt?.toISOString().split('T')[0] || ''
        if (!acc[date]) acc[date] = 0
        acc[date] += parseFloat(payment.amount.toString())
        return acc
      }, {} as Record<string, number>)

    return {
      payments,
      stats: {
        totalPayments: payments.length,
        totalAmount,
        averagePayment
      },
      byMethod: Object.values(byMethod),
      byClass: Object.values(byClass),
      byFeeStructure: Object.values(byFeeStructure),
      dailyCollection
    }
  } catch (error) {
    console.error('Error getting fee collection report:', error)
    return {
      payments: [],
      stats: { totalPayments: 0, totalAmount: 0, averagePayment: 0 },
      byMethod: [],
      byClass: [],
      byFeeStructure: [],
      dailyCollection: {}
    }
  }
}

// Get student statement
export async function getStudentStatement(studentId: string): Promise<StudentStatementData> {
  try {
    const student = await db.student.findUnique({
      where: { id: studentId },
      include: {
        currentClass: true,
        feeGroup: true,
        feeAssignments: {
          include: { feeStructure: true },
          orderBy: { createdAt: 'asc' }
        },
        payments: {
          where: { status: 'CONFIRMED' },
          orderBy: { paidAt: 'desc' }
        },
        credits: {
          where: { isActive: true }
        },
        ledger: { // Use 'ledger' instead of 'ledgerEntries'
          orderBy: { transactionDate: 'asc' }
        }
      }
    })

    if (!student) return null

    // Get payment allocations with transaction details
    const paymentAllocations = await db.paymentAllocation.findMany({
      where: {
        feeAssignment: { studentId: studentId }
      },
      include: {
        payment: {
          select: {
            id: true,
            transactionId: true,
            paymentMethod: true,
            amount: true,
            paidAt: true
          }
        },
        feeAssignment: {
          include: { feeStructure: true }
        }
      }
    })

    // Calculate summary
    const totalFeesCharged = student.feeAssignments.reduce((sum, assignment) => {
      return sum + parseFloat(assignment.amountDue.toString())
    }, 0)

    const totalPayments = student.payments.reduce((sum, payment) => {
      return sum + parseFloat(payment.amount.toString())
    }, 0)

    const totalOutstanding = student.feeAssignments.reduce((sum, assignment) => {
      return sum + parseFloat(assignment.balance.toString())
    }, 0)

    const totalCredits = student.credits.reduce((sum, credit) => {
      return sum + parseFloat(credit.remainingAmount.toString())
    }, 0)

    const netBalance = totalOutstanding - totalCredits

    // Add transaction IDs to ledger descriptions
    const enhancedLedger = student.ledger.map(entry => {
      if (entry.transactionType === 'PAYMENT') {
        const allocation = paymentAllocations.find(alloc => 
          alloc.payment && alloc.payment.id === entry.referenceId
        )
        
        if (allocation?.payment) {
          const originalDesc = entry.description
          const transactionId = allocation.payment.transactionId
          const paymentMethod = allocation.payment.paymentMethod
          
          // Add transaction ID to description
          const enhancedDesc = `${originalDesc} | ${paymentMethod === 'MPESA' ? 'M-Pesa' : paymentMethod} ID: ${transactionId}`
          
          return {
            ...entry,
            description: enhancedDesc,
            payment: allocation.payment
          }
        }
      }
      return entry
    })

    return {
      student: {
        ...student,
        ledgerEntries: enhancedLedger, // Rename for consistency
        paymentAllocations
      },
      summary: {
        totalFeesCharged,
        totalPayments,
        totalOutstanding,
        totalCredits,
        netBalance
      }
    }
  } catch (error) {
    console.error('Error getting student statement:', error)
    return null
  }
}