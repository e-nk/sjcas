import DashboardLayout from '@/components/layouts/DashboardLayout'
import { getFeeGroup } from '@/lib/actions/fee-groups'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Edit, Users, FileText } from 'lucide-react'
import { notFound } from 'next/navigation'

interface FeeGroupDetailPageProps {
  params: { id: string }
}

export default async function FeeGroupDetailPage({ params }: FeeGroupDetailPageProps) {
  const feeGroup = await getFeeGroup(params.id)

  if (!feeGroup) {
    notFound()
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/fees/groups">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Fee Groups
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{feeGroup.name}</h1>
              <p className="text-gray-600 mt-1">Fee group details and assignments</p>
            </div>
          </div>
          <Link href={`/fees/groups/${feeGroup.id}/edit`}>
            <Button className="bg-school-primary-red hover:bg-school-primary-red/90">
              <Edit className="h-4 w-4 mr-2" />
              Edit Group
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Fee Group Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Group Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Name</label>
                  <p className="text-lg font-medium">{feeGroup.name}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Description</label>
                  <p className="text-gray-700">
                    {feeGroup.description || 'No description provided'}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <div className="mt-1">
                    {feeGroup.isActive ? (
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-800">Inactive</Badge>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Created</label>
                  <p className="text-gray-700">
                    {new Date(feeGroup.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Students in this group */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Students ({feeGroup._count.students})
                </CardTitle>
                <CardDescription>
                  Students assigned to this fee group
                </CardDescription>
              </CardHeader>
              <CardContent>
                {feeGroup.students.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No students assigned to this fee group yet
                  </p>
                ) : (
                  <div className="space-y-3">
                    {feeGroup.students.slice(0, 10).map((student) => (
                      <div key={student.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">
                            {student.firstName} {student.lastName}
                          </p>
                          <p className="text-sm text-gray-500">
                            {student.admissionNumber} • {student.currentClass.name}
                          </p>
                        </div>
                        <Link href={`/students/${student.id}`}>
                          <Button variant="outline" size="sm">View</Button>
                        </Link>
                      </div>
                    ))}
                    {feeGroup.students.length > 10 && (
                      <p className="text-sm text-gray-500 text-center">
                        And {feeGroup.students.length - 10} more students...
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Stats Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">Students</span>
                  </div>
                  <span className="font-medium">{feeGroup._count.students}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Fee Structures</span>
                  </div>
                  <span className="font-medium">{feeGroup._count.feeStructures}</span>
                </div>
              </CardContent>
            </Card>

            {/* Fee Structures */}
            <Card>
              <CardHeader>
                <CardTitle>Fee Structures</CardTitle>
                <CardDescription>
                  Fee structures using this group
                </CardDescription>
              </CardHeader>
              <CardContent>
                {feeGroup.feeStructures.length === 0 ? (
                  <p className="text-gray-500 text-sm">
                    No fee structures created yet
                  </p>
                ) : (
                  <div className="space-y-2">
                    {feeGroup.feeStructures.map((structure) => (
                      <div key={structure.id} className="p-2 bg-gray-50 rounded">
                        <p className="font-medium text-sm">{structure.name}</p>
                        <p className="text-xs text-gray-500">
                          KES {structure.amount.toLocaleString()} • Term {structure.term} {structure.year}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}