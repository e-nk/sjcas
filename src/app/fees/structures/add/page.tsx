import DashboardLayout from '@/components/layouts/DashboardLayout'
import FeeStructureForm from '@/components/forms/FeeStructureForm'
import { getFeeGroups } from '@/lib/actions/fee-groups'
import { getClasses } from '@/lib/actions/students'
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
            <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
                <div className="h-10 bg-gray-100 rounded animate-pulse" />
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
                <div className="h-10 bg-gray-100 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

async function FeeStructureFormContent() {
  const [feeGroups, classes] = await Promise.all([
    getFeeGroups(),
    getClasses()
  ])
  
  return <FeeStructureForm feeGroups={feeGroups} classes={classes} />
}

export default async function AddFeeStructurePage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/fees/structures">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Fee Structures
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Add Fee Structure</h1>
            <p className="text-gray-600 mt-1">
              Create a new fee structure for students
            </p>
          </div>
        </div>

        {/* Form with Loading */}
        <Suspense fallback={<FormLoading />}>
          <FeeStructureFormContent />
        </Suspense>
      </div>
    </DashboardLayout>
  )
}