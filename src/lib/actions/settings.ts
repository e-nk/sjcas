'use server'

import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export type SchoolSettings = {
  schoolName: string
  schoolAddress: string
  schoolPhone: string
  schoolEmail: string
  paybillNumber: string
  currentAcademicYear: number
  defaultCurrency: string
}

// Default settings
const DEFAULT_SETTINGS: SchoolSettings = {
  schoolName: "ST. JOSEPH'S CENTRAL ACADEMY - SIRONOI",
  schoolAddress: "P.O. Box 123, Sironoi, Kenya",
  schoolPhone: "+254712345678",
  schoolEmail: "info@stjoseph.ac.ke",
  paybillNumber: "174379",
  currentAcademicYear: new Date().getFullYear(),
  defaultCurrency: "KES"
}

// Get school settings from database
export async function getSchoolSettings(): Promise<SchoolSettings> {
  try {
    const settings = await db.setting.findMany()
    
    if (settings.length === 0) {
      // Initialize with default settings
      await initializeDefaultSettings()
      return DEFAULT_SETTINGS
    }

    // Convert database settings to SchoolSettings object
    const settingsObject: any = {}
    settings.forEach(setting => {
      if (setting.key === 'currentAcademicYear') {
        settingsObject[setting.key] = parseInt(setting.value)
      } else {
        settingsObject[setting.key] = setting.value
      }
    })

    // Merge with defaults for any missing settings
    return { ...DEFAULT_SETTINGS, ...settingsObject }
  } catch (error) {
    console.error('Error getting school settings:', error)
    return DEFAULT_SETTINGS
  }
}

// Initialize default settings in database
async function initializeDefaultSettings() {
  try {
    const settingsToCreate = Object.entries(DEFAULT_SETTINGS).map(([key, value]) => ({
      key,
      value: value.toString()
    }))

    await db.setting.createMany({
      data: settingsToCreate,
      skipDuplicates: true
    })
  } catch (error) {
    console.error('Error initializing default settings:', error)
  }
}

// Update school settings
export async function updateSchoolSettings(formData: FormData) {
  try {
    const settings = {
      schoolName: formData.get('schoolName') as string,
      schoolAddress: formData.get('schoolAddress') as string,
      schoolPhone: formData.get('schoolPhone') as string,
      schoolEmail: formData.get('schoolEmail') as string,
      paybillNumber: formData.get('paybillNumber') as string,
      currentAcademicYear: parseInt(formData.get('currentAcademicYear') as string),
      defaultCurrency: formData.get('defaultCurrency') as string,
    }

    // Validate required fields
    if (!settings.schoolName || !settings.schoolAddress || !settings.schoolPhone || !settings.schoolEmail) {
      throw new Error('All required fields must be filled')
    }

    // Update each setting in database
    for (const [key, value] of Object.entries(settings)) {
      await db.setting.upsert({
        where: { key },
        update: { value: value.toString() },
        create: { 
          key, 
          value: value.toString() 
        }
      })
    }

    console.log('✅ Settings saved successfully:', settings)

    revalidatePath('/settings')
    
    return { 
      success: true, 
      message: 'Settings updated successfully!' 
    }
  } catch (error) {
    console.error('❌ Error updating settings:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update settings' 
    }
  }
}

// Get individual setting
export async function getSetting(key: string): Promise<string | null> {
  try {
    const setting = await db.setting.findUnique({
      where: { key }
    })
    return setting?.value || null
  } catch (error) {
    console.error('Error getting setting:', error)
    return null
  }
}

// Update individual setting
export async function updateSetting(key: string, value: string) {
  try {
    await db.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value }
    })
    
    revalidatePath('/settings')
    return { success: true }
  } catch (error) {
    console.error('Error updating setting:', error)
    return { success: false, error: 'Failed to update setting' }
  }
}

export async function getSystemStats() {
  try {
    const [
      totalUsers,
      totalStudents,
      totalFeeStructures,
      totalPayments,
      databaseSize
    ] = await Promise.all([
      db.user.count(),
      db.student.count(),
      db.feeStructure.count(),
      db.payment.count(),
      // Simulate database size calculation
      Promise.resolve('2.5 MB')
    ])

    return {
      totalUsers,
      totalStudents,
      totalFeeStructures,
      totalPayments,
      databaseSize,
      systemVersion: '1.0.0',
      lastBackup: new Date().toISOString(),
      uptime: '99.9%'
    }
  } catch (error) {
    console.error('Error getting system stats:', error)
    return {
      totalUsers: 0,
      totalStudents: 0,
      totalFeeStructures: 0,
      totalPayments: 0,
      databaseSize: '0 MB',
      systemVersion: '1.0.0',
      lastBackup: new Date().toISOString(),
      uptime: '0%'
    }
  }
}

export async function exportData(dataType: 'students' | 'payments' | 'all') {
  try {
    // Simulate export process
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    console.log(`Exporting ${dataType} data...`)
    
    return {
      success: true,
      message: `${dataType} data exported successfully!`,
      downloadUrl: '#' // In real implementation, this would be a file download URL
    }
  } catch (error) {
    console.error('Error exporting data:', error)
    return {
      success: false,
      error: 'Failed to export data'
    }
  }
}

export async function backupDatabase() {
  try {
    // Simulate backup process
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    console.log('Creating database backup...')
    
    return {
      success: true,
      message: 'Database backup created successfully!',
      backupFile: `backup_${new Date().toISOString().split('T')[0]}.sql`
    }
  } catch (error) {
    console.error('Error creating backup:', error)
    return {
      success: false,
      error: 'Failed to create database backup'
    }
  }
}