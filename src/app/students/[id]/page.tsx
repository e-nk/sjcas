import DashboardLayout from '@/components/layouts/DashboardLayout'
import { getStudent } from '@/lib/actions/students'
import { getStudentStatement } from '@/lib/actions/reports'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ArrowLeft, Edit, CreditCard, FileText, User, Phone, Mail, Calendar, School, Tag, DollarSign, TrendingUp, AlertCircle } from 'lucide-react'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'

function StudentDetailLoading() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="h-6 bg-gray-200 rounded w-48 animate-pulse" />
                  <div className="space-y-3">
                    {[1, 2, 3, 4].map((j) => (
                      <div key={j} className="h-4 bg-gray-200 rounded animate-pulse" />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="space-y-6">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="h-5 bg-gray-200 rounded w-32 animate-pulse" />
                  <div className="space-y-2">
                    {[1, 2, 3].map((j) => (
                      <div key={j} className="h-3 bg-gray-200 rounded animate-pulse" />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

async function StudentDetailContent({ studentId }: { studentId: string }) {
  const [student, statement] = await Promise.all([
    getStudent(studentId),
    getStudentStatement(studentId)
  ])

  if (!student || !statement) {
    notFound()
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case 'GRADUATED':
        return <Badge className="bg-blue-100 text-blue-800">Graduated</Badge>
      case 'TRANSFERRED':
        return <Badge className="bg-yellow-100 text-yellow-800">Transferred</Badge>
      case 'WITHDRAWN':
        return <Badge className="bg-red-100 text-red-800">Withdrawn</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/students">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Students
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {student.firstName} {student.middleName} {student.lastName}
            </h1>
            <p className="text-gray-600 mt-1">
              {student.admissionNumber} • {student.currentClass.name} • {getStatusBadge(student.status)}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/payments/record?student=${student.id}`}>
            <Button className="bg-school-primary-red hover:bg-school-primary-red/90">
              <CreditCard className="h-4 w-4 mr-2" />
              Record Payment
            </Button>
          </Link>
          <Link href={`/reports/student-statements/${student.id}`}>
            <Button variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              View Statement
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Account Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Account Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">Total Fees</p>
                  <p className="text-xl font-bold text-blue-600">
                    KES {statement.summary.totalFeesCharged.toLocaleString()}
                  </p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">Total Paid</p>
                  <p className="text-xl font-bold text-green-600">
                    KES {statement.summary.totalPayments.toLocaleString()}
                  </p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <p className="text-sm text-gray-600">Outstanding</p>
                  <p className="text-xl font-bold text-red-600">
                    KES {statement.summary.totalOutstanding.toLocaleString()}
                  </p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-gray-600">Credits</p>
                  <p className="text-xl font-bold text-purple-600">
                    KES {statement.summary.totalCredits.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Fee Assignments */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Fee Assignments</CardTitle>
                <Link href={`/fees/assignments/individual?student=${student.id}`}>
                  <Button size="sm" variant="outline">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Assign Fee
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {student.feeAssignments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No fee assignments yet</p>
                  <Link href={`/fees/assignments/individual?student=${student.id}`}>
                    <Button size="sm" className="mt-4">Assign First Fee</Button>
                  </Link>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fee Structure</TableHead>
                      <TableHead>Term/Year</TableHead>
                      <TableHead className="text-right">Amount Due</TableHead>
                      <TableHead className="text-right">Paid</TableHead>
                      <TableHead className="text-right">Balance</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {student.feeAssignments.map((assignment) => {
                      const balance = parseFloat(assignment.balance.toString())
                      return (
                        <TableRow key={assignment.id}>
                          <TableCell className="font-medium">
                            {assignment.feeStructure.name}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              {assignment.feeStructure.term && (
                                <Badge variant="secondary" className="text-xs">
                                  Term {assignment.feeStructure.term}
                                </Badge>
                              )}
                              <Badge variant="outline" className="text-xs">
                                {assignment.feeStructure.year}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            KES {parseFloat(assignment.amountDue.toString()).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right font-mono text-green-600">
                            KES {parseFloat(assignment.amountPaid.toString()).toLocaleString()}
                          </TableCell>
                          <TableCell className={`text-right font-mono font-bold ${
                            balance > 0 ? 'text-red-600' : 'text-green-600'
                          }`}>
                            KES {Math.abs(balance).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge className={
                              balance <= 0 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }>
                              {balance <= 0 ? 'Paid' : 'Pending'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Recent Payments */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Payments</CardTitle>
            </CardHeader>
            <CardContent>
              {student.payments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No payments recorded yet</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Transaction ID</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {student.payments.slice(0, 5).map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>
                          {payment.paidAt ? new Date(payment.paidAt).toLocaleDateString() : 'Not set'}
                        </TableCell>
                        <TableCell className="font-mono font-bold text-green-600">
                          KES {parseFloat(payment.amount.toString()).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{payment.paymentMethod}</Badge>
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {payment.transactionId}
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-green-100 text-green-800">
                            {payment.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
              {student.payments.length > 5 && (
                <div className="mt-4 text-center">
                  <Link href={`/payments?student=${student.id}`}>
                    <Button variant="outline" size="sm">
                      View All Payments ({student.payments.length})
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Student Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Student Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Full Name</label>
                <p className="text-lg font-medium mt-1">
                  {student.firstName} {student.middleName} {student.lastName}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Admission Number</label>
                <p className="text-lg font-mono mt-1">{student.admissionNumber}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Class</label>
                <div className="mt-1">
                  <Badge variant="outline">{student.currentClass.name}</Badge>
                </div>
              </div>

              {student.feeGroup && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Fee Group</label>
                  <div className="mt-1">
                    <Badge variant="outline">{student.feeGroup.name}</Badge>
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-500">Academic Year</label>
                <p className="text-lg mt-1">{student.currentAcademicYear}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <div className="mt-1">{getStatusBadge(student.status)}</div>
              </div>

              {student.dateOfBirth && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Date of Birth</label>
                  <p className="text-lg mt-1">
                    {new Date(student.dateOfBirth).toLocaleDateString()}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Parent Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Parent/Guardian
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Name</label>
                <p className="text-lg font-medium mt-1">{student.parentName}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Phone</label>
                <p className="text-lg font-mono mt-1">{student.parentPhone}</p>
              </div>

              {student.parentEmail && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-lg mt-1">{student.parentEmail}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href={`/payments/record?student=${student.id}`}>
                <Button variant="outline" className="w-full justify-start">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Record Payment
                </Button>
              </Link>

              <Link href={`/fees/assignments/individual?student=${student.id}`}>
                <Button variant="outline" className="w-full justify-start">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Assign Fee
                </Button>
              </Link>

              <Link href={`/reports/student-statements/${student.id}`}>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Statement
                </Button>
              </Link>

              <Button variant="outline" className="w-full justify-start">
                <Edit className="h-4 w-4 mr-2" />
                Edit Student Info
              </Button>
            </CardContent>
          </Card>

          {/* Account Alerts */}
          {statement.summary.totalOutstanding > 0 && (
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-red-600 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Account Alert
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-red-800">
                    Outstanding balance of KES {statement.summary.totalOutstanding.toLocaleString()}
                  </p>
                  <p className="text-xs text-red-600">
                    Please follow up with parent for payment
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {statement.summary.totalCredits > 0 && (
            <Card className="border-green-200">
              <CardHeader>
                <CardTitle className="text-green-600 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Credit Balance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-green-800">
                    Available credits: KES {statement.summary.totalCredits.toLocaleString()}
                  </p>
                  <p className="text-xs text-green-600">
                    Will be applied to future fees automatically
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

interface StudentDetailPageProps {
  params: { id: string }
}

export default async function StudentDetailPage({ params }: StudentDetailPageProps) {
  return (
    <DashboardLayout>
      <Suspense fallback={<StudentDetailLoading />}>
        <StudentDetailContent studentId={params.id} />
      </Suspense>
    </DashboardLayout>
  )
}