'use server'

import { db } from '@/lib/db'

export async function getClasses() {
  try {
    const classes = await db.class.findMany({
      include: {
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
    console.error('Error getting classes:', error)
    return []
  }
}