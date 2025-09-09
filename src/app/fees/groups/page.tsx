import DashboardLayout from '@/components/layouts/DashboardLayout'
import FeeGroupsTable from '@/components/tables/FeeGroupsTable'
import { getFeeGroups } from '@/lib/actions/fee-groups'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { Suspense } from 'react'
import { Card, CardContent } from '@/components/ui/card'

function FeeGroupsLoading() {
  return (
    <div className="space-y-6">
      {/* Summary Cards Loading */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
                <div className="ml-4">
                  <div className="h-4 bg-gray-200 rounded w-20 animate-pulse mb-2" />
                  <div className="h-6 bg-gray-200 rounded w-8 animate-pulse" />
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
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

async function FeeGroupsContent() {
  const feeGroups = await getFeeGroups()
  return <FeeGroupsTable feeGroups={feeGroups} />
}

export default async function FeeGroupsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Fee Groups</h1>
            <p className="text-gray-600 mt-1">
              Manage fee groups to categorize students by payment type
            </p>
          </div>
          <Link href="/fees/groups/add">
            <Button className="bg-school-primary-red hover:bg-school-primary-red/90">
              <Plus className="h-4 w-4 mr-2" />
              Add Fee Group
            </Button>
          </Link>
        </div>

        {/* Fee Groups Table with Loading */}
        <Suspense fallback={<FeeGroupsLoading />}>
          <FeeGroupsContent />
        </Suspense>
      </div>
    </DashboardLayout>
  )
}