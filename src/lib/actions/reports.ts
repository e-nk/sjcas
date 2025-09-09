'use server'

import { db } from '@/lib/db'

export async function getStudentStatement(studentId: string) {
  try {
    const student = await db.student.findUnique({
      where: { id: studentId },
      include: {
        currentClass: true,
        feeGroup: true,
        feeAssignments: {
          include: {
            feeStructure: true,
            allocations: {
              include: {
                payment: true
              }
            }
          },
          orderBy: {
            createdAt: 'asc'
          }
        },
        payments: {
          include: {
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
            paidAt: 'asc'
          }
        },
        credits: {
          where: { isActive: true },
          orderBy: { createdAt: 'desc' }
        },
        ledger: {
          orderBy: {
            transactionDate: 'asc'
          }
        }
      }
    })

    if (!student) {
      throw new Error('Student not found')
    }

    // Calculate totals
    const totalFeesCharged = student.feeAssignments.reduce(
      (sum, assignment) => sum + parseFloat(assignment.amountDue.toString()), 0
    )
    
    const totalPayments = student.payments.reduce(
      (sum, payment) => sum + parseFloat(payment.amount.toString()), 0
    )
    
    const totalOutstanding = student.feeAssignments.reduce(
      (sum, assignment) => sum + parseFloat(assignment.balance.toString()), 0
    )
    
    const totalCredits = student.credits.reduce(
      (sum, credit) => sum + parseFloat(credit.remainingAmount.toString()), 0
    )

    return {
      student,
      summary: {
        totalFeesCharged,
        totalPayments,
        totalOutstanding,
        totalCredits,
        netBalance: totalOutstanding - totalCredits
      }
    }
  } catch (error) {
    console.error('Error getting student statement:', error)
    return null
  }
}

export async function getOutstandingFeesReport() {
  try {
    const assignments = await db.feeAssignment.findMany({
      where: {
        balance: { gt: 0 }
      },
      include: {
        student: {
          include: {
            currentClass: true,
            feeGroup: true
          }
        },
        feeStructure: true
      },
      orderBy: [
        { student: { currentClass: { level: 'asc' } } },
        { student: { lastName: 'asc' } }
      ]
    })

    // Group by class
    const reportByClass = assignments.reduce((acc, assignment) => {
      const className = assignment.student.currentClass.name
      
      if (!acc[className]) {
        acc[className] = {
          className,
          students: [],
          totalOutstanding: 0,
          studentCount: 0
        }
      }
      
      // Check if student already exists in this class group
      let studentEntry = acc[className].students.find((s: any) => s.studentId === assignment.student.id)
      
      if (!studentEntry) {
        studentEntry = {
          studentId: assignment.student.id,
          studentName: `${assignment.student.firstName} ${assignment.student.lastName}`,
          admissionNumber: assignment.student.admissionNumber,
          parentName: assignment.student.parentName,
          parentPhone: assignment.student.parentPhone,
          feeGroup: assignment.student.feeGroup?.name || 'No Group',
          assignments: [],
          totalOutstanding: 0
        }
        acc[className].students.push(studentEntry)
        acc[className].studentCount++
      }
      
      const balance = parseFloat(assignment.balance.toString())
      studentEntry.assignments.push({
        feeStructureName: assignment.feeStructure.name,
        term: assignment.feeStructure.term,
        year: assignment.feeStructure.year,
        amountDue: parseFloat(assignment.amountDue.toString()),
        amountPaid: parseFloat(assignment.amountPaid.toString()),
        balance
      })
      
      studentEntry.totalOutstanding += balance
      acc[className].totalOutstanding += balance
      
      return acc
    }, {} as Record<string, any>)

    // Calculate overall totals
    const overallStats = {
      totalStudents: Object.values(reportByClass).reduce((sum: number, cls: any) => sum + cls.studentCount, 0),
      totalOutstanding: Object.values(reportByClass).reduce((sum: number, cls: any) => sum + cls.totalOutstanding, 0),
      totalClasses: Object.keys(reportByClass).length
    }

    return {
      reportByClass: Object.values(reportByClass),
      overallStats
    }
  } catch (error) {
    console.error('Error generating outstanding fees report:', error)
    return {
      reportByClass: [],
      overallStats: {
        totalStudents: 0,
        totalOutstanding: 0,
        totalClasses: 0
      }
    }
  }
}

export async function getFeeCollectionReport(filters?: {
  startDate?: string
  endDate?: string
  classId?: string
  feeStructureId?: string
  term?: string
  year?: number
}) {
  try {
    let whereClause: any = {
      status: 'CONFIRMED'
    }

    // Apply date filters
    if (filters?.startDate || filters?.endDate) {
      whereClause.paidAt = {}
      if (filters.startDate) {
        whereClause.paidAt.gte = new Date(filters.startDate)
      }
      if (filters.endDate) {
        whereClause.paidAt.lte = new Date(filters.endDate + 'T23:59:59')
      }
    }

    // Apply term/year filters
    if (filters?.term) {
      whereClause.term = filters.term
    }
    if (filters?.year) {
      whereClause.academicYear = filters.year
    }

    // Apply class filter through student relationship
    if (filters?.classId) {
      whereClause.student = {
        currentClassId: filters.classId
      }
    }

    const payments = await db.payment.findMany({
      where: whereClause,
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
        paidAt: 'desc'
      }
    })

    // Group by payment method
    const byMethod = payments.reduce((acc, payment) => {
      const method = payment.paymentMethod
      if (!acc[method]) {
        acc[method] = {
          method,
          count: 0,
          total: 0
        }
      }
      acc[method].count++
      acc[method].total += parseFloat(payment.amount.toString())
      return acc
    }, {} as Record<string, any>)

    // Group by class
    const byClass = payments.reduce((acc, payment) => {
      if (!payment.student) return acc
      
      const className = payment.student.currentClass.name
      if (!acc[className]) {
        acc[className] = {
          className,
          count: 0,
          total: 0
        }
      }
      acc[className].count++
      acc[className].total += parseFloat(payment.amount.toString())
      return acc
    }, {} as Record<string, any>)

    // Group by fee structure (through allocations)
    const byFeeStructure = {} as Record<string, any>
    payments.forEach(payment => {
      payment.allocations.forEach(allocation => {
        const structureName = allocation.feeAssignment.feeStructure.name
        if (!byFeeStructure[structureName]) {
          byFeeStructure[structureName] = {
            structureName,
            count: 0,
            total: 0
          }
        }
        byFeeStructure[structureName].count++
        byFeeStructure[structureName].total += parseFloat(allocation.allocatedAmount.toString())
      })
    })

    // Daily collection (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const dailyPayments = await db.payment.findMany({
      where: {
        status: 'CONFIRMED',
        paidAt: { gte: thirtyDaysAgo }
      },
      select: {
        amount: true,
        paidAt: true
      },
      orderBy: { paidAt: 'asc' }
    })

    const dailyCollection = dailyPayments.reduce((acc, payment) => {
      if (!payment.paidAt) return acc
      
      const date = payment.paidAt.toISOString().split('T')[0]
      if (!acc[date]) {
        acc[date] = 0
      }
      acc[date] += parseFloat(payment.amount.toString())
      return acc
    }, {} as Record<string, number>)

    const stats = {
      totalPayments: payments.length,
      totalAmount: payments.reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0),
      averagePayment: payments.length > 0 ? payments.reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0) / payments.length : 0
    }

    return {
      payments,
      stats,
      byMethod: Object.values(byMethod),
      byClass: Object.values(byClass),
      byFeeStructure: Object.values(byFeeStructure),
      dailyCollection
    }
  } catch (error) {
    console.error('Error generating fee collection report:', error)
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

export async function getDashboardStats() {
  try {
    const [
      totalStudents,
      activeStudents,
      totalFeeStructures,
      totalAssignments,
      totalOutstanding,
      totalPaid,
      todayPayments,
      pendingAssignments
    ] = await Promise.all([
      db.student.count(),
      db.student.count({ where: { status: 'ACTIVE' } }),
      db.feeStructure.count({ where: { isActive: true } }),
      db.feeAssignment.count(),
      db.feeAssignment.aggregate({ _sum: { balance: true } }),
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
      db.feeAssignment.count({ where: { status: 'PENDING' } })
    ])

    return {
      totalStudents,
      activeStudents,
      totalFeeStructures,
      totalAssignments,
      totalOutstanding: totalOutstanding._sum.balance ? parseFloat(totalOutstanding._sum.balance.toString()) : 0,
      totalPaid: totalPaid._sum.amount ? parseFloat(totalPaid._sum.amount.toString()) : 0,
      todayPayments,
      pendingAssignments
    }
  } catch (error) {
    console.error('Error getting dashboard stats:', error)
    return {
      totalStudents: 0,
      activeStudents: 0,
      totalFeeStructures: 0,
      totalAssignments: 0,
      totalOutstanding: 0,
      totalPaid: 0,
      todayPayments: 0,
      pendingAssignments: 0
    }
  }
}