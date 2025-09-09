import DashboardLayout from '@/components/layouts/DashboardLayout'
import PaymentForm from '@/components/forms/PaymentForm'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

interface RecordPaymentPageProps {
  searchParams: { student?: string; assignment?: string }
}

export default function RecordPaymentPage({ searchParams }: RecordPaymentPageProps) {
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
            <h1 className="text-3xl font-bold text-gray-900">Record Payment</h1>
            <p className="text-gray-600 mt-1">
              Record a payment from a student and allocate to outstanding fees
            </p>
          </div>
        </div>

        {/* Payment Form */}
        <PaymentForm 
          preSelectedStudent={searchParams.student}
          preSelectedAssignment={searchParams.assignment}
        />
      </div>
    </DashboardLayout>
  )
}