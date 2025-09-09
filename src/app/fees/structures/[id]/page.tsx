import DashboardLayout from '@/components/layouts/DashboardLayout'
import { getFeeStructure } from '@/lib/actions/fee-structures'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Edit, Users, DollarSign, Calendar, Building } from 'lucide-react'
import { notFound } from 'next/navigation'

interface FeeStructureDetailPageProps {
  params: { id: string }
}

export default async function FeeStructureDetailPage({ params }: FeeStructureDetailPageProps) {
  const feeStructure = await getFeeStructure(params.id)

  if (!feeStructure) {
    notFound()
  }

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge className="bg-green-100 text-green-800">Active</Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800">Inactive</Badge>
    )
  }

  const getTermBadge = (term: string | null) => {
    if (!term) return <Badge variant="outline">Annual Fee</Badge>
    return <Badge variant="secondary">Term {term}</Badge>
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/fees/structures">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Fee Structures
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{feeStructure.name}</h1>
              <p className="text-gray-600 mt-1">Fee structure details and assignments</p>
            </div>
          </div>
          <Link href={`/fees/structures/${feeStructure.id}/edit`}>
            <Button className="bg-school-primary-red hover:bg-school-primary-red/90">
              <Edit className="h-4 w-4 mr-2" />
              Edit Structure
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Fee Structure Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Structure Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Name</label>
                    <p className="text-lg font-medium mt-1">{feeStructure.name}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Amount</label>
                    <p className="text-lg font-medium mt-1 text-green-600">
                      KES {parseFloat(feeStructure.amount.toString()).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Term and Year */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Term</label>
                    <div className="mt-1">
                      {getTermBadge(feeStructure.term)}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Year</label>
                    <p className="text-lg font-medium mt-1">{feeStructure.year}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Status</label>
                    <div className="mt-1">
                      {getStatusBadge(feeStructure.isActive)}
                    </div>
                  </div>
                </div>

                {/* Due Date */}
                {feeStructure.dueDate && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Due Date</label>
                    <p className="text-lg font-medium mt-1">
                      {new Date(feeStructure.dueDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                )}

                {/* Applicability */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Fee Group</label>
                    <div className="mt-1">
                      {feeStructure.feeGroup ? (
                        <Badge variant="secondary">{feeStructure.feeGroup.name}</Badge>
                      ) : (
                        <span className="text-gray-400">All fee groups</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Class</label>
                    <div className="mt-1">
                      {feeStructure.applicableToAllClasses ? (
                        <Badge variant="outline">All Classes</Badge>
                      ) : feeStructure.class ? (
                        <Badge variant="outline">{feeStructure.class.name}</Badge>
                      ) : (
                        <span className="text-gray-400">No class specified</span>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Created</label>
                  <p className="text-gray-700 mt-1">
                    {new Date(feeStructure.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Assigned Students */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Assigned Students ({feeStructure._count.feeAssignments})
                </CardTitle>
                <CardDescription>
                  Students who have been assigned this fee structure
                </CardDescription>
              </CardHeader>
              <CardContent>
                {feeStructure.feeAssignments.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No students assigned to this fee structure yet
                  </p>
                ) : (
                  <div className="space-y-3">
                    {feeStructure.feeAssignments.slice(0, 10).map((assignment) => (
                      <div key={assignment.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">
                            {assignment.student.firstName} {assignment.student.lastName}
                          </p>
                          <p className="text-sm text-gray-500">
                            {assignment.student.admissionNumber} • {assignment.student.currentClass.name}
                          </p>
                          <div className="flex gap-2 mt-1">
                            <span className="text-xs text-gray-500">
                              Due: KES {parseFloat(assignment.amountDue.toString()).toLocaleString()}
                            </span>
                            <span className="text-xs text-gray-500">
                              Paid: KES {parseFloat(assignment.amountPaid.toString()).toLocaleString()}
                            </span>
                            <span className="text-xs text-gray-500">
                              Balance: KES {parseFloat(assignment.balance.toString()).toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <Link href={`/students/${assignment.student.id}`}>
                          <Button variant="outline" size="sm">View</Button>
                        </Link>
                      </div>
                    ))}
                    {feeStructure.feeAssignments.length > 10 && (
                      <p className="text-sm text-gray-500 text-center">
                        And {feeStructure.feeAssignments.length - 10} more assignments...
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
                    <DollarSign className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Amount</span>
                  </div>
                  <span className="font-medium">
                    KES {parseFloat(feeStructure.amount.toString()).toLocaleString()}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">Assignments</span>
                  </div>
                  <span className="font-medium">{feeStructure._count.feeAssignments}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-purple-500" />
                    <span className="text-sm">Year</span>
                  </div>
                  <span className="font-medium">{feeStructure.year}</span>
                </div>

                {feeStructure.term && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-orange-500" />
                      <span className="text-sm">Term</span>
                    </div>
                    <span className="font-medium">Term {feeStructure.term}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href={`/fees/assignments?structure=${feeStructure.id}`}>
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="h-4 w-4 mr-2" />
                    Assign to Students
                  </Button>
                </Link>
                
                <Link href={`/reports/fee-collection?structure=${feeStructure.id}`}>
                  <Button variant="outline" className="w-full justify-start">
                    <DollarSign className="h-4 w-4 mr-2" />
                    View Collection Report
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}