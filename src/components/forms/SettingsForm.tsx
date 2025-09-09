'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { updateSchoolSettings, SchoolSettings } from '@/lib/actions/settings'
import { Settings, Save, CheckCircle, AlertCircle } from 'lucide-react'

interface SettingsFormProps {
  settings: SchoolSettings
}

export default function SettingsForm({ settings }: SettingsFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true)
    setError('')
    setSuccess('')

    const result = await updateSchoolSettings(formData)
    
    if (result.success) {
      setSuccess(result.message || 'Settings updated successfully!')
    } else {
      setError(result.error || 'Failed to update settings')
    }
    
    setIsLoading(false)
  }

  const currentYear = new Date().getFullYear()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          School Settings
        </CardTitle>
        <CardDescription>
          Configure your school's basic information and system settings
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        <form action={handleSubmit} className="space-y-6">
          {/* School Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">School Information</h3>
            
            <div className="space-y-2">
              <Label htmlFor="schoolName">School Name *</Label>
              <Input
                id="schoolName"
                name="schoolName"
                required
                defaultValue={settings.schoolName}
                disabled={isLoading}
                placeholder="Enter school name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="schoolAddress">School Address *</Label>
              <Textarea
                id="schoolAddress"
                name="schoolAddress"
                required
                defaultValue={settings.schoolAddress}
                disabled={isLoading}
                placeholder="Enter school address"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="schoolPhone">School Phone *</Label>
                <Input
                  id="schoolPhone"
                  name="schoolPhone"
                  type="tel"
                  required
                  defaultValue={settings.schoolPhone}
                  disabled={isLoading}
                  placeholder="+254712345678"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="schoolEmail">School Email *</Label>
                <Input
                  id="schoolEmail"
                  name="schoolEmail"
                  type="email"
                  required
                  defaultValue={settings.schoolEmail}
                  disabled={isLoading}
                  placeholder="info@school.ac.ke"
                />
              </div>
            </div>
          </div>

          {/* Payment Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Payment Settings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="paybillNumber">M-Pesa Paybill Number</Label>
                <Input
                  id="paybillNumber"
                  name="paybillNumber"
                  defaultValue={settings.paybillNumber}
                  disabled={isLoading}
                  placeholder="123456"
                />
                <p className="text-xs text-gray-500">
                  Used for M-Pesa payments integration
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="defaultCurrency">Default Currency *</Label>
                <Select name="defaultCurrency" disabled={isLoading} defaultValue={settings.defaultCurrency}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="KES">KES - Kenyan Shilling</SelectItem>
                    <SelectItem value="USD">USD - US Dollar</SelectItem>
                    <SelectItem value="EUR">EUR - Euro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Academic Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Academic Settings</h3>
            
            <div className="space-y-2">
              <Label htmlFor="currentAcademicYear">Current Academic Year *</Label>
              <Select name="currentAcademicYear" disabled={isLoading} defaultValue={settings.currentAcademicYear.toString()}>
                <SelectTrigger>
                  <SelectValue placeholder="Select academic year" />
                </SelectTrigger>
                <SelectContent>
                  {[currentYear - 1, currentYear, currentYear + 1].map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                This affects default year settings for new fee structures
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-6 border-t">
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-school-primary-red hover:bg-school-primary-red/90"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving Settings...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}