import DashboardLayout from '@/components/layouts/DashboardLayout'
import { getPayment } from '@/lib/actions/payments'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Receipt, User, CreditCard, Calendar, FileText } from 'lucide-react'
import { notFound } from 'next/navigation'

interface PaymentDetailPageProps {
  params: { id: string }
}

export default async function PaymentDetailPage({ params }: PaymentDetailPageProps) {
  const payment = await getPayment(params.id)

  if (!payment) {
    notFound()
  }

  const getMethodBadge = (method: string) => {
    const colors = {
      MPESA: 'bg-green-100 text-green-800',
      BANK_TRANSFER: 'bg-blue-100 text-blue-800',
      CASH: 'bg-yellow-100 text-yellow-800'
    }
    
    const labels = {
      MPESA: 'M-PESA',
      BANK_TRANSFER: 'Bank Transfer',
      CASH: 'Cash'
    }

    return (
      <Badge className={colors[method as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {labels[method as keyof typeof labels] || method}
      </Badge>
    )
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return <Badge className="bg-green-100 text-green-800">Confirmed</Badge>
      case 'PENDING':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case 'FAILED':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>
      case 'CANCELLED':
        return <Badge className="bg-gray-100 text-gray-800">Cancelled</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/payments">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Payments
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Payment Details</h1>
              <p className="text-gray-600 mt-1">Transaction ID: {payment.transactionId}</p>
            </div>
          </div>
          <Button className="bg-school-primary-red hover:bg-school-primary-red/90">
            <Receipt className="h-4 w-4 mr-2" />
            Generate Receipt
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Payment Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Amount</label>
                    <p className="text-2xl font-bold text-green-600 mt-1">
                      KES {parseFloat(payment.amount.toString()).toLocaleString()}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Status</label>
                    <div className="mt-1">
                      {getStatusBadge(payment.status)}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Payment Method</label>
                    <div className="mt-1">
                      {getMethodBadge(payment.paymentMethod)}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Transaction ID</label>
                    <p className="text-lg font-mono mt-1">{payment.transactionId}</p>
                  </div>
                </div>

                {payment.referenceNumber && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Reference Number</label>
                    <p className="text-lg font-mono mt-1">{payment.referenceNumber}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Payment Date</label>
                    <p className="text-lg mt-1">
                      {payment.paidAt 
                        ? new Date(payment.paidAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : 'Not specified'
                      }
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Recorded Date</label>
                    <p className="text-lg mt-1">
                      {new Date(payment.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>

                {(payment.academicYear || payment.term) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {payment.academicYear && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Academic Year</label>
                        <p className="text-lg mt-1">{payment.academicYear}</p>
                      </div>
                    )}
                    
                    {payment.term && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Term</label>
                        <p className="text-lg mt-1">Term {payment.term}</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment Allocations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Payment Allocations
                </CardTitle>
                <CardDescription>
                  How this payment was applied to outstanding fees
                </CardDescription>
              </CardHeader>
              <CardContent>
                {payment.allocations.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No allocations found for this payment
                  </p>
                ) : (
                  <div className="space-y-4">
                    {payment.allocations.map((allocation) => (
                      <div key={allocation.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">
                            {allocation.feeAssignment.feeStructure.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {allocation.feeAssignment.feeStructure.term && 
                              `Term ${allocation.feeAssignment.feeStructure.term} • `
                            }
                            {allocation.feeAssignment.feeStructure.year}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">
                            KES {parseFloat(allocation.allocatedAmount.toString()).toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500">Applied amount</p>
                        </div>
                      </div>
                    ))}
                    
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center font-medium">
                        <span>Total Allocated:</span>
                        <span className="text-green-600">
                          KES {payment.allocations
                            .reduce((sum, alloc) => sum + parseFloat(alloc.allocatedAmount.toString()), 0)
                            .toLocaleString()
                          }
                        </span>
                      </div>
                      {payment.allocations.reduce((sum, alloc) => sum + parseFloat(alloc.allocatedAmount.toString()), 0) < parseFloat(payment.amount.toString()) && (
                        <div className="flex justify-between items-center text-sm text-gray-600 mt-2">
                          <span>Remaining as Credit:</span>
                          <span>
                            KES {(parseFloat(payment.amount.toString()) - 
                              payment.allocations.reduce((sum, alloc) => sum + parseFloat(alloc.allocatedAmount.toString()), 0)
                            ).toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Student Information Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Student Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {payment.student ? (
                  <>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Name</label>
                      <p className="text-lg font-medium mt-1">
                        {payment.student.firstName} {payment.student.lastName}
											</p>
										</div>
										<div>
                  <label className="text-sm font-medium text-gray-500">Admission Number</label>
                  <p className="text-lg font-mono mt-1">{payment.student.admissionNumber}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Class</label>
                  <p className="text-lg mt-1">{payment.student.currentClass.name}</p>
                </div>

                {payment.student.feeGroup && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Fee Group</label>
                    <div className="mt-1">
                      <Badge variant="outline">{payment.student.feeGroup.name}</Badge>
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-gray-500">Parent/Guardian</label>
                  <p className="text-lg mt-1">{payment.student.parentName}</p>
                  <p className="text-sm text-gray-500">{payment.student.parentPhone}</p>
                  {payment.student.parentEmail && (
                    <p className="text-sm text-gray-500">{payment.student.parentEmail}</p>
                  )}
                </div>

                <Link href={`/students/${payment.student.id}`}>
                  <Button variant="outline" className="w-full">
                    <User className="h-4 w-4 mr-2" />
                    View Student Profile
                  </Button>
                </Link>
              </>
            ) : (
              <p className="text-gray-500">Student information not available</p>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <Receipt className="h-4 w-4 mr-2" />
              Download Receipt
            </Button>
            
            <Button variant="outline" className="w-full justify-start">
              <Calendar className="h-4 w-4 mr-2" />
              Send Receipt Email
            </Button>

            {payment.student && (
              <Link href={`/payments/record?student=${payment.student.id}`}>
                <Button variant="outline" className="w-full justify-start">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Record Another Payment
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>

        {/* Payment Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Payment Amount</span>
              <span className="font-medium">
                KES {parseFloat(payment.amount.toString()).toLocaleString()}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Applied to Fees</span>
              <span className="font-medium text-green-600">
                KES {payment.allocations
                  .reduce((sum, alloc) => sum + parseFloat(alloc.allocatedAmount.toString()), 0)
                  .toLocaleString()
                }
              </span>
            </div>

            {payment.allocations.reduce((sum, alloc) => sum + parseFloat(alloc.allocatedAmount.toString()), 0) < parseFloat(payment.amount.toString()) && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Credit Balance</span>
                <span className="font-medium text-blue-600">
                  KES {(parseFloat(payment.amount.toString()) - 
                    payment.allocations.reduce((sum, alloc) => sum + parseFloat(alloc.allocatedAmount.toString()), 0)
                  ).toLocaleString()}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Method</span>
              <div>{getMethodBadge(payment.paymentMethod)}</div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Status</span>
              <div>{getStatusBadge(payment.status)}</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
		</DashboardLayout>
  )
}
