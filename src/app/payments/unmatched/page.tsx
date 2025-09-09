import DashboardLayout from '@/components/layouts/DashboardLayout'
import UnmatchedPaymentsTable from '@/components/tables/UnmatchedPaymentsTable'
import { getUnmatchedPayments } from '@/lib/actions/mpesa'
import { getStudents } from '@/lib/actions/students'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, AlertCircle } from 'lucide-react'
import { Suspense } from 'react'
import { Card, CardContent } from '@/components/ui/card'

function UnmatchedPaymentsLoading() {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="h-6 bg-gray-200 rounded w-48 animate-pulse" />
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

async function UnmatchedPaymentsContent() {
  const [unmatchedPayments, students] = await Promise.all([
    getUnmatchedPayments(),
    getStudents()
  ])
  
  return <UnmatchedPaymentsTable payments={unmatchedPayments} students={students} />
}

export default async function UnmatchedPaymentsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/payments">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Payments
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <AlertCircle className="h-8 w-8 text-orange-600" />
              Unmatched M-Pesa Payments
            </h1>
            <p className="text-gray-600 mt-1">
              Review and resolve M-Pesa payments that couldn't be automatically matched to students
            </p>
          </div>
        </div>

        {/* Content */}
        <Suspense fallback={<UnmatchedPaymentsLoading />}>
          <UnmatchedPaymentsContent />
        </Suspense>
      </div>
    </DashboardLayout>
  )
}