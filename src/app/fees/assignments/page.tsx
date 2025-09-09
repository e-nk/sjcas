import DashboardLayout from '@/components/layouts/DashboardLayout'
import FeeAssignmentsTable from '@/components/tables/FeeAssignmentsTable'
import { getFeeAssignments, getAssignmentStats } from '@/lib/actions/fee-assignments'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus, Users } from 'lucide-react'
import { Suspense } from 'react'
import { Card, CardContent } from '@/components/ui/card'

function FeeAssignmentsLoading() {
  return (
    <div className="space-y-6">
      {/* Summary Cards Loading */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
                <div className="ml-4">
                  <div className="h-4 bg-gray-200 rounded w-20 animate-pulse mb-2" />
                  <div className="h-6 bg-gray-200 rounded w-16 animate-pulse" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table Loading */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="h-6 bg-gray-200 rounded w-48 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-32 animate-pulse" />
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

async function FeeAssignmentsContent() {
  const [assignments, stats] = await Promise.all([
    getFeeAssignments(),
    getAssignmentStats()
  ])
  
  return <FeeAssignmentsTable assignments={assignments} stats={stats} />
}

export default async function FeeAssignmentsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Fee Assignments</h1>
            <p className="text-gray-600 mt-1">
              Manage fee assignments to students and track payment progress
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/fees/assignments/bulk">
              <Button variant="outline">
                <Users className="h-4 w-4 mr-2" />
                Bulk Assign
              </Button>
            </Link>
            <Link href="/fees/assignments/individual">
              <Button className="bg-school-primary-red hover:bg-school-primary-red/90">
                <Plus className="h-4 w-4 mr-2" />
                Individual Assign
              </Button>
            </Link>
          </div>
        </div>

        {/* Fee Assignments Table with Loading */}
        <Suspense fallback={<FeeAssignmentsLoading />}>
          <FeeAssignmentsContent />
        </Suspense>
      </div>
    </DashboardLayout>
  )
}