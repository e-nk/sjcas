'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import { createFeeStructure, updateFeeStructure } from '@/lib/actions/fee-structures'
import { FeeStructure, FeeGroup, Class } from '@prisma/client'

type FeeStructureWithDetails = FeeStructure & {
  feeGroup: FeeGroup | null
  class: Class | null
}

interface FeeStructureFormProps {
  feeStructure?: FeeStructureWithDetails
  feeGroups: FeeGroup[]
  classes: Class[]
  mode?: 'create' | 'edit'
}

export default function FeeStructureForm({ 
  feeStructure, 
  feeGroups, 
  classes, 
  mode = 'create' 
}: FeeStructureFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [applicableToAll, setApplicableToAll] = useState(feeStructure?.applicableToAllClasses || false)

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true)
    setError('')
    setSuccess(false)

    // Add the checkbox state to form data
    if (applicableToAll) {
      formData.set('applicableToAllClasses', 'on')
    }

    const result = mode === 'edit' && feeStructure
      ? await updateFeeStructure(feeStructure.id, formData)
      : await createFeeStructure(formData)
    
    if (result.success) {
      setSuccess(true)
      if (mode === 'create') {
        // Reset form for create mode
        const form = document.getElementById('fee-structure-form') as HTMLFormElement
        form?.reset()
        setApplicableToAll(false)
      }
    } else {
      setError(result.error || `Failed to ${mode} fee structure`)
    }
    
    setIsLoading(false)
  }

  const currentYear = new Date().getFullYear()

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {mode === 'edit' ? 'Edit Fee Structure' : 'Create Fee Structure'}
        </CardTitle>
        <CardDescription>
          {mode === 'edit' 
            ? 'Update the fee structure details' 
            : 'Create a new fee structure for students'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">
              Fee structure {mode === 'edit' ? 'updated' : 'created'} successfully!
            </AlertDescription>
          </Alert>
        )}

        <form id="fee-structure-form" action={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Fee Structure Name *</Label>
              <Input
                id="name"
                name="name"
                required
                placeholder="e.g., Term 1 2024 - Day Scholar"
                disabled={isLoading}
                defaultValue={feeStructure?.name}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount (KES) *</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                min="0"
                required
                placeholder="25000.00"
                disabled={isLoading}
                defaultValue={feeStructure?.amount.toString()}
              />
            </div>
          </div>

          {/* Term and Year */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="term">Term</Label>
              <Select name="term" disabled={isLoading} defaultValue={feeStructure?.term || undefined}>
                <SelectTrigger>
                  <SelectValue placeholder="Select term (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Term 1</SelectItem>
                  <SelectItem value="2">Term 2</SelectItem>
                  <SelectItem value="3">Term 3</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="year">Year *</Label>
              <Select name="year" required disabled={isLoading} defaultValue={feeStructure?.year.toString() || currentYear.toString()}>
                <SelectTrigger>
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {[currentYear - 1, currentYear, currentYear + 1].map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                name="dueDate"
                type="date"
                disabled={isLoading}
                defaultValue={
                  feeStructure?.dueDate 
                    ? new Date(feeStructure.dueDate).toISOString().split('T')[0]
                    : undefined
                }
              />
            </div>
          </div>

          {/* Fee Group */}
          <div className="space-y-2">
            <Label htmlFor="feeGroupId">Fee Group</Label>
            <Select 
              name="feeGroupId" 
              disabled={isLoading} 
              defaultValue={feeStructure?.feeGroupId || undefined}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select fee group (optional)" />
              </SelectTrigger>
              <SelectContent>
                {feeGroups.map((group) => (
                  <SelectItem key={group.id} value={group.id}>
                    {group.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-500">
              Leave empty to apply to all students regardless of group
            </p>
          </div>

          {/* Class Assignment */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="applicableToAllClasses"
                checked={applicableToAll}
                onCheckedChange={(checked) => setApplicableToAll(checked as boolean)}
                disabled={isLoading}
              />
              <Label htmlFor="applicableToAllClasses" className="text-sm font-medium">
                Apply to all classes
              </Label>
            </div>

            {!applicableToAll && (
              <div className="space-y-2">
                <Label htmlFor="classId">Specific Class</Label>
                <Select 
                  name="classId" 
                  disabled={isLoading}
                  defaultValue={feeStructure?.classId || undefined}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select specific class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500">
                  Select a specific class or check "Apply to all classes" above
                </p>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-school-primary-red hover:bg-school-primary-red/90"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {mode === 'edit' ? 'Updating' : 'Creating'}...
                </>
              ) : (
                `${mode === 'edit' ? 'Update' : 'Create'} Fee Structure`
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}