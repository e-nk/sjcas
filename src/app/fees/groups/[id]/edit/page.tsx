import DashboardLayout from '@/components/layouts/DashboardLayout'
import FeeGroupForm from '@/components/forms/FeeGroupForm'
import { getFeeGroup } from '@/lib/actions/fee-groups'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { notFound } from 'next/navigation'

interface EditFeeGroupPageProps {
  params: { id: string }
}

export default async function EditFeeGroupPage({ params }: EditFeeGroupPageProps) {
  const feeGroup = await getFeeGroup(params.id)

  if (!feeGroup) {
    notFound()
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href={`/fees/groups/${feeGroup.id}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to {feeGroup.name}
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Fee Group</h1>
            <p className="text-gray-600 mt-1">
              Update the details for "{feeGroup.name}"
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="max-w-2xl">
          <FeeGroupForm feeGroup={feeGroup} mode="edit" />
        </div>
      </div>
    </DashboardLayout>
  )
}