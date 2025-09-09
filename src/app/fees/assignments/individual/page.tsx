import DashboardLayout from '@/components/layouts/DashboardLayout'
import IndividualFeeAssignmentForm from '@/components/forms/IndividualFeeAssignmentForm'
import { getFeeStructures } from '@/lib/actions/fee-structures'
import { getStudents } from '@/lib/actions/students'
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
          {[1, 2, 3].map((i) => (
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

async function IndividualAssignmentFormContent({ preSelectedStudent }: { preSelectedStudent?: string }) {
  const [feeStructures, students] = await Promise.all([
    getFeeStructures(),
    getStudents()
  ])
  
  // Filter only active fee structures
  const activeFeeStructures = feeStructures.filter(fs => fs.isActive)
  
  return (
    <IndividualFeeAssignmentForm 
      feeStructures={activeFeeStructures} 
      students={students}
      preSelectedStudent={preSelectedStudent}
    />
  )
}

interface IndividualAssignmentPageProps {
  searchParams: { student?: string }
}

export default async function IndividualAssignmentPage({ searchParams }: IndividualAssignmentPageProps) {
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
            <h1 className="text-3xl font-bold text-gray-900">Individual Fee Assignment</h1>
            <p className="text-gray-600 mt-1">
              Assign fee structures to individual students
            </p>
          </div>
        </div>

        {/* Form with Loading */}
        <Suspense fallback={<FormLoading />}>
          <IndividualAssignmentFormContent preSelectedStudent={searchParams.student} />
        </Suspense>
      </div>
    </DashboardLayout>
  )
}