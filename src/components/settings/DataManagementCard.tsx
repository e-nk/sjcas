'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { exportData, backupDatabase } from '@/lib/actions/settings'
import { Download, Database, Users, CreditCard, FileText, CheckCircle, AlertCircle } from 'lucide-react'

export default function DataManagementCard() {
  const [isExporting, setIsExporting] = useState(false)
  const [isBackingUp, setIsBackingUp] = useState(false)
  const [exportType, setExportType] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  const handleExport = async (dataType: 'students' | 'payments' | 'all') => {
    setIsExporting(true)
    setExportType(dataType)
    setMessage('')

    const result = await exportData(dataType)
    
    if (result.success) {
      setMessage(result.message || 'Data exported successfully!')
      setIsSuccess(true)
    } else {
      setMessage(result.error || 'Failed to export data')
      setIsSuccess(false)
    }
    
    setIsExporting(false)
    setExportType(null)
  }

  const handleBackup = async () => {
    setIsBackingUp(true)
    setMessage('')

    const result = await backupDatabase()
    
    if (result.success) {
      setMessage(result.message || 'Database backup created successfully!')
      setIsSuccess(true)
    } else {
      setMessage(result.error || 'Failed to create backup')
      setIsSuccess(false)
    }
    
    setIsBackingUp(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Data Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {message && (
          <Alert className={isSuccess ? 'border-green-200 bg-green-50' : ''} variant={isSuccess ? 'default' : 'destructive'}>
            {isSuccess ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            <AlertDescription className={isSuccess ? 'text-green-800' : ''}>
              {message}
            </AlertDescription>
          </Alert>
        )}

        {/* Export Data */}
        <div className="space-y-4">
          <h4 className="font-medium flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Data
          </h4>
          
          <div className="space-y-2">
            <Button
              variant="outline"
              onClick={() => handleExport('students')}
              disabled={isExporting || isBackingUp}
              className="w-full justify-start"
            >
              {isExporting && exportType === 'students' ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                  Exporting Students...
                </>
              ) : (
                <>
                  <Users className="h-4 w-4 mr-2" />
                  Export Students Data
                </>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={() => handleExport('payments')}
              disabled={isExporting || isBackingUp}
              className="w-full justify-start"
            >
              {isExporting && exportType === 'payments' ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                  Exporting Payments...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Export Payments Data
                </>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={() => handleExport('all')}
              disabled={isExporting || isBackingUp}
              className="w-full justify-start"
            >
              {isExporting && exportType === 'all' ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                  Exporting All Data...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Export All Data
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Database Backup */}
        <div className="space-y-4">
          <h4 className="font-medium flex items-center gap-2">
            <Database className="h-4 w-4" />
            Database Backup
          </h4>
          
          <Button
            variant="outline"
            onClick={handleBackup}
            disabled={isExporting || isBackingUp}
            className="w-full justify-start"
          >
            {isBackingUp ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                Creating Backup...
              </>
            ) : (
              <>
                <Database className="h-4 w-4 mr-2" />
                Create Database Backup
              </>
            )}
          </Button>

          <p className="text-xs text-gray-500">
            Creates a full backup of your database including all students, payments, and settings.
          </p>
        </div>

        {/* Warning */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-xs text-yellow-800">
            <strong>Note:</strong> Export and backup features are currently in development. 
            In production, these would generate downloadable files.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}