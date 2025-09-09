import DashboardLayout from '@/components/layouts/DashboardLayout'
import FeeStructuresTable from '@/components/tables/FeeStructuresTable'
import { getFeeStructures } from '@/lib/actions/fee-structures'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { Suspense } from 'react'
import { Card, CardContent } from '@/components/ui/card'

function FeeStructuresLoading() {
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
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

async function FeeStructuresContent() {
  const feeStructures = await getFeeStructures()
  return <FeeStructuresTable feeStructures={feeStructures} />
}

export default async function FeeStructuresPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Fee Structures</h1>
            <p className="text-gray-600 mt-1">
              Manage fee structures for different terms and student categories
            </p>
          </div>
          <Link href="/fees/structures/add">
            <Button className="bg-school-primary-red hover:bg-school-primary-red/90">
              <Plus className="h-4 w-4 mr-2" />
              Add Fee Structure
            </Button>
          </Link>
        </div>

        {/* Fee Structures Table with Loading */}
        <Suspense fallback={<FeeStructuresLoading />}>
          <FeeStructuresContent />
        </Suspense>
      </div>
    </DashboardLayout>
  )
}