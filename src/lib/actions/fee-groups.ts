'use server'

import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export type FeeGroupFormData = {
  name: string
  description?: string
}

export async function createFeeGroup(formData: FormData) {
  try {
    const data: FeeGroupFormData = {
      name: formData.get('name') as string,
      description: formData.get('description') as string || undefined,
    }

    // Check if name already exists
    const existingGroup = await db.feeGroup.findUnique({
      where: { name: data.name }
    })

    if (existingGroup) {
      throw new Error('Fee group with this name already exists')
    }

    // Create fee group
    const feeGroup = await db.feeGroup.create({
      data: {
        name: data.name,
        description: data.description,
        isActive: true,
      }
    })

    revalidatePath('/fees/groups')
    return { success: true, feeGroup }
  } catch (error) {
    console.error('Error creating fee group:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create fee group' 
    }
  }
}

export async function updateFeeGroup(id: string, formData: FormData) {
  try {
    const data: FeeGroupFormData = {
      name: formData.get('name') as string,
      description: formData.get('description') as string || undefined,
    }

    // Check if another group has the same name
    const existingGroup = await db.feeGroup.findFirst({
      where: { 
        name: data.name,
        id: { not: id }
      }
    })

    if (existingGroup) {
      throw new Error('Another fee group with this name already exists')
    }

    // Update fee group
    const feeGroup = await db.feeGroup.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
      }
    })

    revalidatePath('/fees/groups')
    return { success: true, feeGroup }
  } catch (error) {
    console.error('Error updating fee group:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update fee group' 
    }
  }
}

export async function toggleFeeGroupStatus(id: string) {
  try {
    const feeGroup = await db.feeGroup.findUnique({
      where: { id }
    })

    if (!feeGroup) {
      throw new Error('Fee group not found')
    }

    const updatedGroup = await db.feeGroup.update({
      where: { id },
      data: {
        isActive: !feeGroup.isActive
      }
    })

    revalidatePath('/fees/groups')
    return { success: true, feeGroup: updatedGroup }
  } catch (error) {
    console.error('Error toggling fee group status:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update fee group status' 
    }
  }
}

export async function getFeeGroups() {
  try {
    const feeGroups = await db.feeGroup.findMany({
      include: {
        _count: {
          select: {
            students: true,
            feeStructures: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return feeGroups
  } catch (error) {
    console.error('Error fetching fee groups:', error)
    return []
  }
}

export async function getFeeGroup(id: string) {
  try {
    const feeGroup = await db.feeGroup.findUnique({
      where: { id },
      include: {
        students: {
          include: {
            currentClass: true
          }
        },
        feeStructures: {
          include: {
            class: true
          }
        },
        _count: {
          select: {
            students: true,
            feeStructures: true,
          }
        }
      }
    })

    return feeGroup
  } catch (error) {
    console.error('Error fetching fee group:', error)
    return null
  }
}