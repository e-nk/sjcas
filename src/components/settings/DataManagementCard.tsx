'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { exportData, backupDatabase } from '@/lib/actions/settings'
import { downloadData } from '@/lib/utils/exports'
import { Download, Database, Users, CreditCard, CheckCircle, AlertCircle, Upload } from 'lucide-react'

export default function DataManagement() {
  const [isExporting, setIsExporting] = useState<string | null>(null)
  const [isBackingUp, setIsBackingUp] = useState(false)
  const [message, setMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  const handleExport = async (dataType: 'students' | 'payments' | 'all') => {
    setIsExporting(dataType)
    setMessage('')
    
    try {
      const result = await exportData(dataType)
      
      if (result.success && result.data) {
        // Use client-side export utility
        if (dataType === 'students' && result.data.students) {
          const downloadResult = downloadData(result.data.students, `Students_Export_${new Date().toISOString().split('T')[0]}`)
          if (downloadResult.success) {
            setMessage('Student data exported successfully!')
            setIsSuccess(true)
          } else {
            setMessage('Failed to download student data: ' + downloadResult.error)
            setIsSuccess(false)
          }
        } else if (dataType === 'payments' && result.data.payments) {
          const downloadResult = downloadData(result.data.payments, `Payments_Export_${new Date().toISOString().split('T')[0]}`)
          if (downloadResult.success) {
            setMessage('Payment data exported successfully!')
            setIsSuccess(true)
          } else {
            setMessage('Failed to download payment data: ' + downloadResult.error)
            setIsSuccess(false)
          }
        }
      } else {
        setMessage(result.error || 'Export failed')
        setIsSuccess(false)
      }
    } catch (error) {
      console.error('Export failed:', error)
      setMessage('Export failed: ' + (error instanceof Error ? error.message : 'Unknown error'))
      setIsSuccess(false)
    } finally {
      setIsExporting(null)
    }
  }

  const handleBackup = async () => {
    setIsBackingUp(true)
    setMessage('')
    
    try {
      const result = await backupDatabase()
      setMessage(result.success ? result.message! : result.error!)
      setIsSuccess(result.success)
    } catch (error) {
      console.error('Backup failed:', error)
      setMessage('Backup failed: ' + (error instanceof Error ? error.message : 'Unknown error'))
      setIsSuccess(false)
    } finally {
      setIsBackingUp(false)
    }
  }

  return (
    <div className="space-y-6">
      {message && (
        <Alert className={isSuccess ? 'border-green-200 bg-green-50' : ''} variant={isSuccess ? 'default' : 'destructive'}>
          {isSuccess ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          <AlertDescription className={isSuccess ? 'text-green-800' : ''}>
            {message}
          </AlertDescription>
        </Alert>
      )}

      {/* Data Export */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Data Export
          </CardTitle>
          <CardDescription>
            Export your school data to Excel format for backup or external use
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                variant="outline"
                onClick={() => handleExport('students')}
                disabled={isExporting === 'students'}
                className="flex items-center gap-2"
              >
                {isExporting === 'students' ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                    Exporting...
                  </>
                ) : (
                  <>
                    <Users className="h-4 w-4" />
                    Export Students
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                onClick={() => handleExport('payments')}
                disabled={isExporting === 'payments'}
                className="flex items-center gap-2"
              >
                {isExporting === 'payments' ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                    Exporting...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4" />
                    Export Payments
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                onClick={() => handleExport('all')}
                disabled={isExporting === 'all'}
                className="flex items-center gap-2"
              >
                {isExporting === 'all' ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                    Exporting...
                  </>
                ) : (
                  <>
                    <Database className="h-4 w-4" />
                    Export All Data
                  </>
                )}
              </Button>
            </div>

            <div className="text-sm text-gray-600">
              <p>• Student export includes personal details, class information, and fee status</p>
              <p>• Payment export includes all confirmed payments with transaction details</p>
              <p>• All data export combines both students and payments in separate sheets</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Database Backup */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Backup
          </CardTitle>
          <CardDescription>
            Create a complete backup of your database for safety and recovery purposes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleBackup}
            disabled={isBackingUp}
            className="bg-school-primary-red hover:bg-school-primary-red/90"
          >
            {isBackingUp ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating Backup...
              </>
            ) : (
              <>
                <Database className="h-4 w-4 mr-2" />
                Create Database Backup
              </>
            )}
          </Button>
          
          <div className="mt-4 text-sm text-gray-600">
            <p>• Backup includes all tables and data relationships</p>
            <p>• Recommended to create backups before major updates</p>
            <p>• Store backups in a secure, separate location</p>
          </div>
        </CardContent>
				</Card>

     {/* Import Data */}
     <Card>
       <CardHeader>
         <CardTitle className="flex items-center gap-2">
           <Upload className="h-5 w-5" />
           Data Import
         </CardTitle>
         <CardDescription>
           Import data from Excel files (Feature coming soon)
         </CardDescription>
       </CardHeader>
       <CardContent>
         <div className="p-4 bg-gray-50 rounded-lg">
           <p className="text-sm text-gray-600">
             Bulk data import functionality will be available in the next update. 
             This will allow you to import student data, fee structures, and payment records from Excel files.
           </p>
         </div>
       </CardContent>
     </Card>
   </div>
 )
}