'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { createFeeGroup, updateFeeGroup } from '@/lib/actions/fee-groups'
import { FeeGroup } from '@prisma/client'

interface FeeGroupFormProps {
  feeGroup?: FeeGroup
  mode?: 'create' | 'edit'
}

export default function FeeGroupForm({ feeGroup, mode = 'create' }: FeeGroupFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true)
    setError('')
    setSuccess(false)

    const result = mode === 'edit' && feeGroup
      ? await updateFeeGroup(feeGroup.id, formData)
      : await createFeeGroup(formData)
    
    if (result.success) {
      setSuccess(true)
      if (mode === 'create') {
        // Reset form for create mode
        const form = document.getElementById('fee-group-form') as HTMLFormElement
        form?.reset()
      }
    } else {
      setError(result.error || `Failed to ${mode} fee group`)
    }
    
    setIsLoading(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {mode === 'edit' ? 'Edit Fee Group' : 'Create Fee Group'}
        </CardTitle>
        <CardDescription>
          {mode === 'edit' 
            ? 'Update the fee group details' 
            : 'Create a new fee group to categorize students by payment type'
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
              Fee group {mode === 'edit' ? 'updated' : 'created'} successfully!
            </AlertDescription>
          </Alert>
        )}

        <form id="fee-group-form" action={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Group Name *</Label>
            <Input
              id="name"
              name="name"
              required
              placeholder="e.g., Day Scholar, Boarder, New Student"
              disabled={isLoading}
              defaultValue={feeGroup?.name}
            />
            <p className="text-sm text-gray-500">
              Choose a clear name that describes this group of students
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe what type of students belong to this group..."
              disabled={isLoading}
              defaultValue={feeGroup?.description || ''}
              rows={3}
            />
            <p className="text-sm text-gray-500">
              Optional: Provide more details about this fee group
            </p>
          </div>

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
								`${mode === 'edit' ? 'Update' : 'Create'} Fee Group`
							)}
						</Button>
					</div>
        </form>
      </CardContent>
    </Card>
  )
}