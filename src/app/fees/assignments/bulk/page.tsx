import DashboardLayout from '@/components/layouts/DashboardLayout'
import BulkFeeAssignmentForm from '@/components/forms/BulkFeeAssignmentForm'
import { getFeeStructures } from '@/lib/actions/fee-structures'
import { getFeeGroups } from '@/lib/actions/fee-groups'
import { getClasses, getStudents } from '@/lib/actions/students'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { Suspense } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

function FormLoading() {
  return (
    <Card>
      <CardHeader>
        <div className="space-y-2">
          <div className="h-6 bg-gray-200 rounded w-40 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-64 animate-pulse" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-32 animate-pulse" />
              <div className="h-10 bg-gray-100 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

async function BulkAssignmentFormContent() {
  const [feeStructures, feeGroups, classes, students] = await Promise.all([
    getFeeStructures(),
    getFeeGroups(),
    getClasses(),
    getStudents()
  ])
  
  // Filter only active fee structures
  const activeFeeStructures = feeStructures.filter(fs => fs.isActive)
  
  return (
    <BulkFeeAssignmentForm 
      feeStructures={activeFeeStructures} 
      feeGroups={feeGroups} 
      classes={classes} 
      students={students} 
    />
  )
}

export default async function BulkFeeAssignmentPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/fees/assignments">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Assignments
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Bulk Fee Assignment</h1>
            <p className="text-gray-600 mt-1">
              Assign fee structures to multiple students at once
            </p>
          </div>
        </div>

        {/* Form with Loading */}
        <Suspense fallback={<FormLoading />}>
          <BulkAssignmentFormContent />
        </Suspense>
      </div>
    </DashboardLayout>
  )
}