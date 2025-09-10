'use server'

import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { StudentStatus } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'


export type StudentFormData = {
  admissionNumber: string
  firstName: string
  lastName: string
  middleName?: string
  currentClassId: string
  parentName: string
  parentPhone: string
  parentEmail?: string
  dateOfBirth?: string
  feeGroupId?: string
  notes?: string
}

export async function createStudent(formData: FormData) {
  try {
    const data: StudentFormData = {
      admissionNumber: formData.get('admissionNumber') as string,
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      middleName: formData.get('middleName') as string || undefined,
      currentClassId: formData.get('currentClassId') as string,
      parentName: formData.get('parentName') as string,
      parentPhone: formData.get('parentPhone') as string,
      parentEmail: formData.get('parentEmail') as string || undefined,
      dateOfBirth: formData.get('dateOfBirth') as string || undefined,
      feeGroupId: formData.get('feeGroupId') as string || undefined,
      notes: formData.get('notes') as string || undefined,
    }

    // Check if admission number already exists
    const existingStudent = await db.student.findUnique({
      where: { admissionNumber: data.admissionNumber }
    })

    if (existingStudent) {
      throw new Error('Admission number already exists')
    }

    // Create student
    const student = await db.student.create({
      data: {
        admissionNumber: data.admissionNumber,
        firstName: data.firstName,
        lastName: data.lastName,
        middleName: data.middleName,
        currentClassId: data.currentClassId,
        parentName: data.parentName,
        parentPhone: data.parentPhone,
        parentEmail: data.parentEmail,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
        feeGroupId: data.feeGroupId,
        notes: data.notes,
        status: StudentStatus.ACTIVE,
        currentAcademicYear: 2024,
      },
      include: {
        currentClass: true,
        feeGroup: true,
      }
    })

    // Create ledger entry for student creation
    await db.studentLedger.create({
      data: {
        studentId: student.id,
        transactionType: 'ADJUSTMENT',
        description: 'Student account created',
        amount: 0,
        runningBalance: 0,
        academicYear: 2024,
      }
    })

    revalidatePath('/students')
    return { success: true, student }
  } catch (error) {
    console.error('Error creating student:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create student' 
    }
  }
}

export async function getStudents() {
  try {
    const students = await db.student.findMany({
      include: {
        currentClass: true,
        feeGroup: true,
        _count: {
          select: {
            feeAssignments: true,
            payments: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return students
  } catch (error) {
    console.error('Error fetching students:', error)
    return []
  }
}

export async function getStudent(id: string) {
  try {
    const student = await db.student.findUnique({
      where: { id },
      include: {
        currentClass: true,
        feeGroup: true,
        feeAssignments: {
          include: {
            feeStructure: true,
          }
        },
        payments: {
          orderBy: { createdAt: 'desc' }
        },
        ledger: {
          orderBy: { transactionDate: 'desc' },
          take: 20, // Last 20 transactions
        },
        credits: {
          where: { isActive: true }
        }
      }
    })

    return student
  } catch (error) {
    console.error('Error fetching student:', error)
    return null
  }
}

export async function getClasses() {
  try {
    const classes = await db.class.findMany({
      where: { isActive: true },
      orderBy: { level: 'asc' }
    })
    return classes
  } catch (error) {
    console.error('Error fetching classes:', error)
    return []
  }
}

export async function getFeeGroups() {
  try {
    const feeGroups = await db.feeGroup.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    })
    return feeGroups
  } catch (error) {
    console.error('Error fetching fee groups:', error)
    return []
  }
}

export async function bulkUploadStudents(studentsData: any[]) {
  try {
    if (!studentsData || studentsData.length === 0) {
      throw new Error('No student data provided')
    }

    const results = []
    let successful = 0
    let failed = 0

    for (const studentData of studentsData) {
      try {
        // Validate required fields
        if (!studentData.firstName || !studentData.lastName || !studentData.admissionNumber) {
          results.push({
            studentData,
            success: false,
            error: 'Missing required fields'
          })
          failed++
          continue
        }

        // Check if admission number already exists
        const existingStudent = await db.student.findUnique({
          where: { admissionNumber: studentData.admissionNumber }
        })

        if (existingStudent) {
          results.push({
            studentData,
            success: false,
            error: `Admission number ${studentData.admissionNumber} already exists`
          })
          failed++
          continue
        }

        // Create the student (using only existing schema fields)
        const newStudent = await db.student.create({
          data: {
            firstName: studentData.firstName,
            middleName: studentData.middleName || null,
            lastName: studentData.lastName,
            admissionNumber: studentData.admissionNumber,
            dateOfBirth: studentData.dateOfBirth || null,
            // Remove gender field since it doesn't exist
            parentName: studentData.parentName,
            parentPhone: studentData.parentPhone,
            parentEmail: studentData.parentEmail || null,
            currentClassId: studentData.classId, // This must exist, make required in validation
            feeGroupId: studentData.feeGroupId,
            currentAcademicYear: studentData.academicYear || new Date().getFullYear(),
            status: 'ACTIVE'
          }
        })

        // Auto-assign fees if fee group exists
        if (studentData.feeGroupId) {
          const feeStructures = await db.feeStructure.findMany({
            where: { 
              feeGroupId: studentData.feeGroupId,
              isActive: true 
            }
          })

          // Get current running balance for ledger
          const lastLedgerEntry = await db.studentLedger.findFirst({
            where: { studentId: newStudent.id },
            orderBy: { transactionDate: 'desc' }
          })
          
          let runningBalance = lastLedgerEntry?.runningBalance || new Decimal(0)

          for (const feeStructure of feeStructures) {
            await db.feeAssignment.create({
              data: {
                studentId: newStudent.id,
                feeStructureId: feeStructure.id,
                amountDue: feeStructure.amount,
                balance: feeStructure.amount,
                // Remove dueDate since it's not in schema
                status: 'PENDING'
              }
            })

            // Update running balance (fees are negative)
            runningBalance = runningBalance.minus(feeStructure.amount)

            // Create ledger entry
            await db.studentLedger.create({
              data: {
                studentId: newStudent.id,
                transactionType: 'FEE_CHARGE',
                amount: feeStructure.amount.negated(), // Negative for fees
                runningBalance: runningBalance, // Use existing field
                description: `Fee charged: ${feeStructure.name}`,
                referenceId: feeStructure.id,
                transactionDate: new Date(),
                academicYear: studentData.academicYear || new Date().getFullYear()
              }
            })
          }
        }

        results.push({
          studentData,
          success: true,
          studentId: newStudent.id
        })
        successful++

      } catch (error) {
        console.error(`Error creating student ${studentData.admissionNumber}:`, error)
        results.push({
          studentData,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        failed++
      }
    }

    revalidatePath('/students')

    return {
      success: true,
      summary: {
        total: studentsData.length,
        successful,
        failed
      },
      results
    }
  } catch (error) {
    console.error('Bulk upload error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload students'
    }
  }
}