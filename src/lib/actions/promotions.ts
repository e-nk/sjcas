'use server'

import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export type PromotionData = {
  fromClassId: string
  toClassId: string
  studentIds: string[]
  newAcademicYear: number
  graduateStudents?: boolean
  notes?: string
}

export type BulkPromotionData = {
  fromClassId: string
  toClassId: string | null // null for graduation
  newAcademicYear: number
  promoteAll: boolean
  selectedStudents?: string[]
  notes?: string
}

// Get classes for promotion dropdown
export async function getClassesForPromotion() {
  try {
    const classes = await db.class.findMany({
      include: {
        students: {
          where: { status: 'ACTIVE' },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            admissionNumber: true
          }
        },
        _count: {
          select: {
            students: {
              where: { status: 'ACTIVE' }
            }
          }
        }
      },
      orderBy: { name: 'asc' }
    })

    return classes
  } catch (error) {
    console.error('Error getting classes for promotion:', error)
    return []
  }
}

// Get promotion history
export async function getPromotionHistory() {
  try {
    const promotions = await db.studentPromotion.findMany({
      include: {
        student: {
          select: {
            firstName: true,
            lastName: true,
            admissionNumber: true
          }
        },
        fromClass: true,
        toClass: true
      },
      orderBy: { promotionDate: 'desc' },
      take: 50
    })

    return promotions
  } catch (error) {
    console.error('Error getting promotion history:', error)
    return []
  }
}

// Promote individual students
export async function promoteStudents(data: PromotionData) {
  try {
    const { fromClassId, toClassId, studentIds, newAcademicYear, graduateStudents, notes } = data

    // Validate inputs
    if (!fromClassId || studentIds.length === 0 || !newAcademicYear) {
      throw new Error('Missing required promotion data')
    }

    if (!graduateStudents && !toClassId) {
      throw new Error('Target class required for non-graduating students')
    }

    const results = []

    for (const studentId of studentIds) {
      // Get student details
      const student = await db.student.findUnique({
        where: { id: studentId },
        include: { currentClass: true }
      })

      if (!student) {
        results.push({ studentId, success: false, error: 'Student not found' })
        continue
      }

      if (student.currentClassId !== fromClassId) {
        results.push({ 
          studentId, 
          success: false, 
          error: 'Student not in source class' 
        })
        continue
      }

      try {
        // Update student status and class
        const updatedStudent = await db.student.update({
          where: { id: studentId },
          data: {
            currentClassId: graduateStudents ? null : toClassId,
            currentAcademicYear: newAcademicYear,
            status: graduateStudents ? 'GRADUATED' : 'ACTIVE'
          }
        })

        // Create promotion record
        await db.studentPromotion.create({
          data: {
            studentId: studentId,
            fromClassId: fromClassId,
            toClassId: graduateStudents ? null : toClassId,
            academicYear: newAcademicYear,
            promotionDate: new Date(),
            notes: notes || `${graduateStudents ? 'Graduated from' : 'Promoted from'} ${student.currentClass.name}`,
            promotionType: graduateStudents ? 'GRADUATION' : 'PROMOTION'
          }
        })

        results.push({ 
          studentId, 
          success: true, 
          studentName: `${student.firstName} ${student.lastName}` 
        })
      } catch (error) {
        results.push({ 
          studentId, 
          success: false, 
          error: error instanceof Error ? error.message : 'Promotion failed' 
        })
      }
    }

    revalidatePath('/students')
    revalidatePath('/promotions')

    const successCount = results.filter(r => r.success).length
    const failureCount = results.filter(r => !r.success).length

    return {
      success: true,
      results,
      summary: {
        total: studentIds.length,
        successful: successCount,
        failed: failureCount
      }
    }
  } catch (error) {
    console.error('Error promoting students:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Promotion failed'
    }
  }
}

// Bulk promote entire class
export async function bulkPromoteClass(data: BulkPromotionData) {
  try {
    const { fromClassId, toClassId, newAcademicYear, promoteAll, selectedStudents, notes } = data

    // Get students to promote
    const studentsQuery = {
      where: {
        currentClassId: fromClassId,
        status: 'ACTIVE',
        ...(promoteAll ? {} : { id: { in: selectedStudents || [] } })
      }
    }

    const students = await db.student.findMany(studentsQuery)

    if (students.length === 0) {
      throw new Error('No students found to promote')
    }

    const studentIds = students.map((s: { id: string }) => s.id)
    const isGraduation = toClassId === null

    // Use individual promotion function for consistency
    const result = await promoteStudents({
      fromClassId,
      toClassId: toClassId || '',
      studentIds,
      newAcademicYear,
      graduateStudents: isGraduation,
      notes: notes || `Bulk ${isGraduation ? 'graduation' : 'promotion'} - Academic Year ${newAcademicYear}`
    })

    return result
  } catch (error) {
    console.error('Error in bulk promotion:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Bulk promotion failed'
    }
  }
}

// Reverse promotion (move student back)
export async function reversePromotion(promotionId: string) {
  try {
    const promotion = await db.studentPromotion.findUnique({
      where: { id: promotionId },
      include: { student: true, fromClass: true, toClass: true }
    })

    if (!promotion) {
      throw new Error('Promotion record not found')
    }

    // Revert student to previous class and status
    await db.student.update({
      where: { id: promotion.studentId },
      data: {
        currentClassId: promotion.fromClassId,
        currentAcademicYear: promotion.academicYear - 1,
        status: 'ACTIVE'
      }
    })

    // Mark promotion as reversed
    await db.studentPromotion.update({
      where: { id: promotionId },
      data: {
        notes: `${promotion.notes} - REVERSED on ${new Date().toLocaleDateString()}`
      }
    })

    // Create reverse promotion record
    await db.studentPromotion.create({
      data: {
        studentId: promotion.studentId,
        fromClassId: promotion.toClassId,
        toClassId: promotion.fromClassId,
        academicYear: promotion.academicYear - 1,
        promotionDate: new Date(),
        notes: `Reversed promotion from ${promotion.toClass?.name || 'Graduation'} back to ${promotion.fromClass.name}`,
        promotionType: 'REVERSAL'
      }
    })

    revalidatePath('/students')
    revalidatePath('/promotions')

    return {
      success: true,
      message: `${promotion.student.firstName} ${promotion.student.lastName} moved back to ${promotion.fromClass.name}`
    }
  } catch (error) {
    console.error('Error reversing promotion:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to reverse promotion'
    }
  }
}

// Get promotion statistics
export async function getPromotionStats(academicYear?: number) {
  try {
    const currentYear = academicYear || new Date().getFullYear()
    
    const [totalPromotions, totalGraduations, recentPromotions] = await Promise.all([
      db.studentPromotion.count({
        where: {
          academicYear: currentYear,
          promotionType: 'PROMOTION'
        }
      }),
      
      db.studentPromotion.count({
        where: {
          academicYear: currentYear,
          promotionType: 'GRADUATION'
        }
      }),

      db.studentPromotion.findMany({
        where: {
          academicYear: currentYear
        },
        include: {
          student: {
            select: {
              firstName: true,
              lastName: true,
              admissionNumber: true
            }
          },
          fromClass: true,
          toClass: true
        },
        orderBy: { promotionDate: 'desc' },
        take: 10
      })
    ])

    return {
      totalPromotions,
      totalGraduations,
      totalProcessed: totalPromotions + totalGraduations,
      recentPromotions,
      academicYear: currentYear
    }
  } catch (error) {
    console.error('Error getting promotion stats:', error)
    return {
      totalPromotions: 0,
      totalGraduations: 0,
      totalProcessed: 0,
      recentPromotions: [],
      academicYear: new Date().getFullYear()
    }
  }
}