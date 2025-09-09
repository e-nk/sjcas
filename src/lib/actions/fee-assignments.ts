'use server'

import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export type BulkAssignmentData = {
  feeStructureId: string
  assignmentType: 'ALL_STUDENTS' | 'BY_CLASS' | 'BY_FEE_GROUP' | 'INDIVIDUAL'
  classId?: string
  feeGroupId?: string
  studentIds?: string[]
}

export async function createBulkFeeAssignments(data: BulkAssignmentData) {
  try {
    // Get the fee structure
    const feeStructure = await db.feeStructure.findUnique({
      where: { id: data.feeStructureId }
    })

    if (!feeStructure) {
      throw new Error('Fee structure not found')
    }

    // Get students based on assignment type
    let students = []
    
    switch (data.assignmentType) {
      case 'ALL_STUDENTS':
        students = await db.student.findMany({
          where: { status: 'ACTIVE' }
        })
        break
        
      case 'BY_CLASS':
        if (!data.classId) throw new Error('Class ID is required')
        students = await db.student.findMany({
          where: { 
            currentClassId: data.classId,
            status: 'ACTIVE'
          }
        })
        break
        
      case 'BY_FEE_GROUP':
        if (!data.feeGroupId) throw new Error('Fee group ID is required')
        students = await db.student.findMany({
          where: { 
            feeGroupId: data.feeGroupId,
            status: 'ACTIVE'
          }
        })
        break
        
      case 'INDIVIDUAL':
        if (!data.studentIds || data.studentIds.length === 0) {
          throw new Error('Student IDs are required')
        }
        students = await db.student.findMany({
          where: { 
            id: { in: data.studentIds },
            status: 'ACTIVE'
          }
        })
        break
    }

    if (students.length === 0) {
      throw new Error('No active students found for the selected criteria')
    }

    // Check for existing assignments
    const existingAssignments = await db.feeAssignment.findMany({
      where: {
        feeStructureId: data.feeStructureId,
        studentId: { in: students.map(s => s.id) }
      }
    })

    const existingStudentIds = new Set(existingAssignments.map(a => a.studentId))
    const newStudents = students.filter(s => !existingStudentIds.has(s.id))

    if (newStudents.length === 0) {
      throw new Error('All selected students already have this fee structure assigned')
    }

    // Create fee assignments
    const assignments = await db.feeAssignment.createMany({
      data: newStudents.map(student => ({
        studentId: student.id,
        feeStructureId: data.feeStructureId,
        amountDue: feeStructure.amount,
        amountPaid: 0,
        balance: feeStructure.amount,
        status: 'PENDING'
      }))
    })

    // Create ledger entries for each assignment
    for (const student of newStudents) {
      await db.studentLedger.create({
        data: {
          studentId: student.id,
          transactionType: 'FEE_CHARGE',
          description: `Fee assigned: ${feeStructure.name}`,
          referenceId: data.feeStructureId,
          amount: -parseFloat(feeStructure.amount.toString()), // Negative for charges
          runningBalance: -parseFloat(feeStructure.amount.toString()), // Will need to calculate actual running balance
          academicYear: feeStructure.year,
          term: feeStructure.term,
        }
      })
    }

    revalidatePath('/fees/assignments')
    return { 
      success: true, 
      message: `Successfully assigned fees to ${assignments.count} students`,
      assignedCount: assignments.count,
      skippedCount: existingStudentIds.size
    }
  } catch (error) {
    console.error('Error creating bulk fee assignments:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create fee assignments' 
    }
  }
}

export async function createIndividualFeeAssignment(studentId: string, feeStructureId: string) {
  try {
    // Check if assignment already exists
    const existingAssignment = await db.feeAssignment.findUnique({
      where: {
        studentId_feeStructureId: {
          studentId,
          feeStructureId
        }
      }
    })

    if (existingAssignment) {
      throw new Error('This student already has this fee structure assigned')
    }

    const feeStructure = await db.feeStructure.findUnique({
      where: { id: feeStructureId }
    })

    if (!feeStructure) {
      throw new Error('Fee structure not found')
    }

    // Create fee assignment
    const assignment = await db.feeAssignment.create({
      data: {
        studentId,
        feeStructureId,
        amountDue: feeStructure.amount,
        amountPaid: 0,
        balance: feeStructure.amount,
        status: 'PENDING'
      },
      include: {
        student: true,
        feeStructure: true
      }
    })

    // Create ledger entry
    await db.studentLedger.create({
      data: {
        studentId,
        transactionType: 'FEE_CHARGE',
        description: `Fee assigned: ${feeStructure.name}`,
        referenceId: feeStructureId,
        amount: -parseFloat(feeStructure.amount.toString()),
        runningBalance: -parseFloat(feeStructure.amount.toString()),
        academicYear: feeStructure.year,
        term: feeStructure.term,
      }
    })

    revalidatePath('/fees/assignments')
    revalidatePath(`/students/${studentId}`)
    return { success: true, assignment }
  } catch (error) {
    console.error('Error creating fee assignment:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create fee assignment' 
    }
  }
}

export async function removeFeeAssignment(assignmentId: string) {
  try {
    const assignment = await db.feeAssignment.findUnique({
      where: { id: assignmentId },
      include: {
        feeStructure: true
      }
    })

    if (!assignment) {
      throw new Error('Fee assignment not found')
    }

    // Fix: Convert Decimal to number for comparison
    if (parseFloat(assignment.amountPaid.toString()) > 0) {
      throw new Error('Cannot remove fee assignment with payments. Please contact administrator.')
    }

    // Remove the assignment
    await db.feeAssignment.delete({
      where: { id: assignmentId }
    })

    // Create ledger entry for removal
    await db.studentLedger.create({
      data: {
        studentId: assignment.studentId,
        transactionType: 'ADJUSTMENT',
        description: `Fee removed: ${assignment.feeStructure.name}`,
        referenceId: assignmentId,
        amount: parseFloat(assignment.amountDue.toString()), // Positive to reverse the charge
        runningBalance: 0, // Will need to calculate
        academicYear: assignment.feeStructure.year,
        term: assignment.feeStructure.term,
      }
    })

    revalidatePath('/fees/assignments')
    revalidatePath(`/students/${assignment.studentId}`)
    return { success: true }
  } catch (error) {
    console.error('Error removing fee assignment:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to remove fee assignment' 
    }
  }
}

export async function getFeeAssignments() {
  try {
    const assignments = await db.feeAssignment.findMany({
      include: {
        student: {
          include: {
            currentClass: true,
            feeGroup: true
          }
        },
        feeStructure: {
          include: {
            feeGroup: true,
            class: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return assignments
  } catch (error) {
    console.error('Error fetching fee assignments:', error)
    return []
  }
}

export async function getAssignmentStats() {
  try {
    const [totalAssignments, totalDue, totalPaid, pendingCount] = await Promise.all([
      db.feeAssignment.count(),
      db.feeAssignment.aggregate({
        _sum: { amountDue: true }
      }),
      db.feeAssignment.aggregate({
        _sum: { amountPaid: true }
      }),
      db.feeAssignment.count({
        where: { status: 'PENDING' }
      })
    ])

    // Fix: Convert Decimal to number for arithmetic operations
    const totalDueAmount = totalDue._sum.amountDue ? parseFloat(totalDue._sum.amountDue.toString()) : 0
    const totalPaidAmount = totalPaid._sum.amountPaid ? parseFloat(totalPaid._sum.amountPaid.toString()) : 0

    return {
      totalAssignments,
      totalDue: totalDueAmount,
      totalPaid: totalPaidAmount,
      totalOutstanding: totalDueAmount - totalPaidAmount,
      pendingCount
    }
  } catch (error) {
    console.error('Error fetching assignment stats:', error)
    return {
      totalAssignments: 0,
      totalDue: 0,
      totalPaid: 0,
      totalOutstanding: 0,
      pendingCount: 0
    }
  }
}