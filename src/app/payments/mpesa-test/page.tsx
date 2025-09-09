import DashboardLayout from '@/components/layouts/DashboardLayout'
import StkPushForm from '@/components/payments/StkPushForm'
import MpesaTestInstructions from '@/components/payments/MpesaTestInstructions'
import { getStudents } from '@/lib/actions/students'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { Suspense } from 'react'
import { Card, CardContent } from '@/components/ui/card'

function TestPageLoading() {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="h-6 bg-gray-200 rounded w-48 animate-pulse" />
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
                  <div className="h-10 bg-gray-100 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

async function MpesaTestContent() {
  const students = await getStudents()
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div>
        <StkPushForm students={students} />
      </div>
      <div>
        <MpesaTestInstructions />
      </div>
    </div>
  )
}

export default async function MpesaTestPage() {
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
            <h1 className="text-3xl font-bold text-gray-900">M-Pesa Testing</h1>
            <p className="text-gray-600 mt-1">
              Test M-Pesa integration and send payment requests to parents
            </p>
          </div>
        </div>

        {/* Content */}
        <Suspense fallback={<TestPageLoading />}>
          <MpesaTestContent />
        </Suspense>
      </div>
    </DashboardLayout>
  )
}