import DashboardLayout from '@/components/layouts/DashboardLayout'
import FeeGroupForm from '@/components/forms/FeeGroupForm'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default function AddFeeGroupPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/fees/groups">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Fee Groups
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Add Fee Group</h1>
            <p className="text-gray-600 mt-1">
              Create a new fee group to categorize students
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="max-w-2xl">
          <FeeGroupForm />
        </div>
      </div>
    </DashboardLayout>
  )
}