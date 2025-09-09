import DashboardLayout from '@/components/layouts/DashboardLayout'
import PaymentsTable from '@/components/tables/PaymentsTable'
import { getPayments, getPaymentStats } from '@/lib/actions/payments'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { Suspense } from 'react'
import { Card, CardContent } from '@/components/ui/card'

function PaymentsLoading() {
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

async function PaymentsContent() {
  const [payments, stats] = await Promise.all([
    getPayments(),
    getPaymentStats()
  ])
  
  return <PaymentsTable payments={payments} stats={stats} />
}

export default async function PaymentsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
            <p className="text-gray-600 mt-1">
              View and manage all student payment transactions
            </p>
          </div>
          <Link href="/payments/record">
            <Button className="bg-school-primary-red hover:bg-school-primary-red/90">
              <Plus className="h-4 w-4 mr-2" />
              Record Payment
            </Button>
          </Link>
        </div>

        {/* Payments Table with Loading */}
        <Suspense fallback={<PaymentsLoading />}>
          <PaymentsContent />
        </Suspense>
      </div>
    </DashboardLayout>
  )
}