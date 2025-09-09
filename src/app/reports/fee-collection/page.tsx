import DashboardLayout from '@/components/layouts/DashboardLayout'
import FeeCollectionReport from '@/components/reports/FeeCollectionReport'
import { getFeeCollectionReport } from '@/lib/actions/reports'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { Suspense } from 'react'
import { Card, CardContent } from '@/components/ui/card'

function ReportLoading() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
                <div className="ml-4">
                  <div className="h-4 bg-gray-200 rounded w-32 animate-pulse mb-2" />
                  <div className="h-6 bg-gray-200 rounded w-16 animate-pulse" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="h-6 bg-gray-200 rounded w-48 animate-pulse" />
            <div className="h-64 bg-gray-100 rounded animate-pulse" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

async function FeeCollectionContent() {
  const data = await getFeeCollectionReport()
  return <FeeCollectionReport data={data} />
}

export default async function FeeCollectionReportPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 print:hidden">
          <Link href="/reports">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Reports
            </Button>
          </Link>
        </div>

        {/* Report Content */}
        <Suspense fallback={<ReportLoading />}>
          <FeeCollectionContent />
        </Suspense>
      </div>
    </DashboardLayout>
  )
}