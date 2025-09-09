'use server'

import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export type FeeStructureFormData = {
  name: string
  amount: number
  term?: string
  year: number
  dueDate?: string
  feeGroupId?: string
  classId?: string
  applicableToAllClasses: boolean
}

export async function createFeeStructure(formData: FormData) {
  try {
    const data: FeeStructureFormData = {
      name: formData.get('name') as string,
      amount: parseFloat(formData.get('amount') as string),
      term: formData.get('term') as string || undefined,
      year: parseInt(formData.get('year') as string),
      dueDate: formData.get('dueDate') as string || undefined,
      feeGroupId: formData.get('feeGroupId') as string || undefined,
      classId: formData.get('classId') as string || undefined,
      applicableToAllClasses: formData.get('applicableToAllClasses') === 'on',
    }

    // Validate amount
    if (isNaN(data.amount) || data.amount <= 0) {
      throw new Error('Amount must be a positive number')
    }

    // Validate year
    if (isNaN(data.year) || data.year < 2020 || data.year > 2030) {
      throw new Error('Please enter a valid year')
    }

    // Create fee structure
    const feeStructure = await db.feeStructure.create({
      data: {
        name: data.name,
        amount: data.amount,
        term: data.term,
        year: data.year,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        feeGroupId: data.feeGroupId,
        classId: data.applicableToAllClasses ? null : data.classId,
        applicableToAllClasses: data.applicableToAllClasses,
        isActive: true,
      },
      include: {
        feeGroup: true,
        class: true,
      }
    })

    revalidatePath('/fees/structures')
    return { success: true, feeStructure }
  } catch (error) {
    console.error('Error creating fee structure:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create fee structure' 
    }
  }
}

export async function updateFeeStructure(id: string, formData: FormData) {
  try {
    const data: FeeStructureFormData = {
      name: formData.get('name') as string,
      amount: parseFloat(formData.get('amount') as string),
      term: formData.get('term') as string || undefined,
      year: parseInt(formData.get('year') as string),
      dueDate: formData.get('dueDate') as string || undefined,
      feeGroupId: formData.get('feeGroupId') as string || undefined,
      classId: formData.get('classId') as string || undefined,
      applicableToAllClasses: formData.get('applicableToAllClasses') === 'on',
    }

    // Validate amount
    if (isNaN(data.amount) || data.amount <= 0) {
      throw new Error('Amount must be a positive number')
    }

    // Validate year
    if (isNaN(data.year) || data.year < 2020 || data.year > 2030) {
      throw new Error('Please enter a valid year')
    }

    // Update fee structure
    const feeStructure = await db.feeStructure.update({
      where: { id },
      data: {
        name: data.name,
        amount: data.amount,
        term: data.term,
        year: data.year,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        feeGroupId: data.feeGroupId,
        classId: data.applicableToAllClasses ? null : data.classId,
        applicableToAllClasses: data.applicableToAllClasses,
      },
      include: {
        feeGroup: true,
        class: true,
      }
    })

    revalidatePath('/fees/structures')
    return { success: true, feeStructure }
  } catch (error) {
    console.error('Error updating fee structure:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update fee structure' 
    }
  }
}

export async function toggleFeeStructureStatus(id: string) {
  try {
    const feeStructure = await db.feeStructure.findUnique({
      where: { id }
    })

    if (!feeStructure) {
      throw new Error('Fee structure not found')
    }

    const updatedStructure = await db.feeStructure.update({
      where: { id },
      data: {
        isActive: !feeStructure.isActive
      }
    })

    revalidatePath('/fees/structures')
    return { success: true, feeStructure: updatedStructure }
  } catch (error) {
    console.error('Error toggling fee structure status:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update fee structure status' 
    }
  }
}

export async function getFeeStructures() {
  try {
    const feeStructures = await db.feeStructure.findMany({
      include: {
        feeGroup: true,
        class: true,
        _count: {
          select: {
            feeAssignments: true,
          }
        }
      },
      orderBy: [
        { year: 'desc' },
        { term: 'asc' },
        { createdAt: 'desc' }
      ]
    })

    return feeStructures
  } catch (error) {
    console.error('Error fetching fee structures:', error)
    return []
  }
}

export async function getFeeStructure(id: string) {
  try {
    const feeStructure = await db.feeStructure.findUnique({
      where: { id },
      include: {
        feeGroup: true,
        class: true,
        feeAssignments: {
          include: {
            student: {
              include: {
                currentClass: true
              }
            }
          }
        },
        _count: {
          select: {
            feeAssignments: true,
          }
        }
      }
    })

    return feeStructure
  } catch (error) {
    console.error('Error fetching fee structure:', error)
    return null
  }
}