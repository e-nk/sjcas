'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Search, CheckCircle, X, AlertCircle, User, Phone, Calendar, DollarSign } from 'lucide-react'
import { UnmatchedPayment, Student, Class, FeeGroup } from '@prisma/client'
import { resolveUnmatchedPayment, rejectUnmatchedPayment } from '@/lib/actions/mpesa'

type StudentWithDetails = Student & {
  currentClass: Class
  feeGroup: FeeGroup | null
}

interface UnmatchedPaymentsTableProps {
  payments: UnmatchedPayment[]
  students: StudentWithDetails[]
}

export default function UnmatchedPaymentsTable({ payments, students }: UnmatchedPaymentsTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPayment, setSelectedPayment] = useState<UnmatchedPayment | null>(null)
  const [selectedStudent, setSelectedStudent] = useState('')
  const [isResolving, setIsResolving] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false)

  // Filter payments based on search
  const filteredPayments = payments.filter(payment =>
    payment.accountReference.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (payment.payerName && payment.payerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (payment.phoneNumber && payment.phoneNumber.includes(searchTerm))
  )

  // Filter students for selection
  const filteredStudents = students.filter(student =>
    `${student.firstName} ${student.lastName}`.toLowerCase().includes(selectedStudent.toLowerCase()) ||
    student.admissionNumber.toLowerCase().includes(selectedStudent.toLowerCase())
  ).slice(0, 10)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending Review</Badge>
      case 'RESOLVED':
        return <Badge className="bg-green-100 text-green-800">Resolved</Badge>
      case 'REJECTED':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const handleResolve = async (paymentId: string, studentId: string) => {
    setIsResolving(true)
    
    const result = await resolveUnmatchedPayment(paymentId, studentId)
    
    if (result.success) {
      setResolveDialogOpen(false)
      setSelectedPayment(null)
      setSelectedStudent('')
      // Show success message
      alert('Payment successfully matched to student!')
    } else {
      alert(`Failed to resolve payment: ${result.error}`)
    }
    
    setIsResolving(false)
  }

  const handleReject = async (paymentId: string, reason: string) => {
    setIsRejecting(true)
    
    const result = await rejectUnmatchedPayment(paymentId, reason)
    
    if (result.success) {
      setRejectReason('')
      // Show success message
      alert('Payment marked as rejected')
    } else {
      alert(`Failed to reject payment: ${result.error}`)
    }
    
    setIsRejecting(false)
  }

  const pendingPayments = payments.filter(p => p.status === 'PENDING')
  const totalPendingAmount = pendingPayments.reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0)

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertCircle className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Payments</p>
                <p className="text-2xl font-bold text-orange-600">{pendingPayments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Pending Amount</p>
                <p className="text-2xl font-bold text-red-600">
                  KES {totalPendingAmount.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Resolved Today</p>
                <p className="text-2xl font-bold text-green-600">
                  {payments.filter(p => 
                    p.status === 'RESOLVED' && 
                    p.resolvedAt && 
                    new Date(p.resolvedAt).toDateString() === new Date().toDateString()
                  ).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Unmatched Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-600" />
            Unmatched M-Pesa Payments
          </CardTitle>
          <CardDescription>
            M-Pesa payments that couldn't be automatically matched to students
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by admission number, transaction ID, or payer name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Results count */}
          <p className="text-sm text-gray-600 mb-4">
            Showing {filteredPayments.length} of {payments.length} unmatched payments
          </p>

          {/* Payments Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Payment Details</TableHead>
                  <TableHead>Payer Information</TableHead>
                  <TableHead>Account Reference</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      {payments.length === 0 ? (
                        <div className="text-gray-500">
                          <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-300" />
                          <p className="font-medium">Great! No unmatched payments</p>
                          <p className="text-sm">All M-Pesa payments have been successfully matched to students</p>
                        </div>
                      ) : (
                        <div className="text-gray-500">
                          <p>No payments found matching your search</p>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        <div>
                          <p className="font-mono text-sm font-medium">
                            {payment.transactionId}
                          </p>
                          <p className="text-xs text-gray-500">
                            M-Pesa Transaction
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {payment.payerName || 'Unknown'}
                          </p>
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {payment.phoneNumber || 'No phone'}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-mono text-sm bg-red-50 text-red-800 px-2 py-1 rounded">
                          {payment.accountReference}
                        </div>
                        <p className="text-xs text-red-600 mt-1">
                          Invalid admission number
                        </p>
                      </TableCell>
                      <TableCell>
                        <p className="font-mono font-bold text-green-600">
                          KES {parseFloat(payment.amount.toString()).toLocaleString()}
                        </p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-gray-400" />
                          <span className="text-sm">
                            {new Date(payment.transactionDate).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">
                          {new Date(payment.transactionDate).toLocaleTimeString()}
                        </p>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(payment.status)}
                      </TableCell>
                      <TableCell>
                        {payment.status === 'PENDING' && (
                          <div className="flex gap-1">
                            {/* Resolve Payment Dialog */}
                            <Dialog open={resolveDialogOpen && selectedPayment?.id === payment.id} onOpenChange={setResolveDialogOpen}>
                              <DialogTrigger asChild>
                                <Button
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700"
                                  onClick={() => {
                                    setSelectedPayment(payment)
                                    setResolveDialogOpen(true)
                                  }}
                                >
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Resolve
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-md">
                                <DialogHeader>
                                  <DialogTitle>Match Payment to Student</DialogTitle>
                                  <DialogDescription>
                                    Find the correct student for this M-Pesa payment
                                  </DialogDescription>
                                </DialogHeader>
                                
                                <div className="space-y-4">
                                  {/* Payment Details */}
                                  <div className="bg-gray-50 p-3 rounded">
                                    <p className="text-sm font-medium">Payment Details:</p>
                                    <p className="text-xs">Amount: KES {parseFloat(payment.amount.toString()).toLocaleString()}</p>
                                    <p className="text-xs">From: {payment.payerName}</p>
                                    <p className="text-xs">Reference Used: {payment.accountReference}</p>
                                  </div>

                                  {/* Student Search */}
                                  <div className="space-y-2">
                                    <Label>Search for Student</Label>
                                    <Input
                                      placeholder="Type student name or admission number..."
                                      value={selectedStudent}
                                      onChange={(e) => setSelectedStudent(e.target.value)}
                                    />
                                  </div>

                                  {/* Student Selection */}
                                  {selectedStudent && (
                                    <div className="max-h-40 overflow-y-auto space-y-2">
                                      {filteredStudents.map((student) => (
                                        <div
                                          key={student.id}
                                          className="p-2 border rounded cursor-pointer hover:bg-gray-50"
                                          onClick={() => {
                                            handleResolve(payment.id, student.id)
                                          }}
                                        >
                                          <div className="flex items-center gap-2">
                                            <User className="h-4 w-4" />
                                            <div>
                                              <p className="font-medium text-sm">
                                                {student.firstName} {student.lastName}
                                              </p>
                                              <p className="text-xs text-gray-500">
                                                {student.admissionNumber} • {student.currentClass.name}
                                              </p>
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>

                                <DialogFooter>
                                  <Button variant="outline" onClick={() => setResolveDialogOpen(false)}>
                                    Cancel
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>

                            {/* Reject Payment Dialog */}
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                                  <X className="h-3 w-3 mr-1" />
                                  Reject
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Reject Payment</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Mark this payment as rejected. This action can be used for refunds or invalid payments.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                
                                <div className="space-y-2">
                                  <Label>Reason for rejection</Label>
                                  <Textarea
                                    placeholder="Enter reason for rejecting this payment..."
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                  />
                                </div>

                                <AlertDialogFooter>
                                  <AlertDialogCancel onClick={() => setRejectReason('')}>
                                    Cancel
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    className="bg-red-600 hover:bg-red-700"
                                    onClick={() => {
                                      if (rejectReason.trim()) {
                                        handleReject(payment.id, rejectReason)
                                      }
                                    }}
                                    disabled={!rejectReason.trim() || isRejecting}
                                  >
                                    {isRejecting ? 'Rejecting...' : 'Reject Payment'}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        )}
                        
                        {payment.status === 'RESOLVED' && payment.resolvedAt && (
                          <p className="text-xs text-green-600">
                            Resolved on {new Date(payment.resolvedAt).toLocaleDateString()}
                          </p>
                        )}
                        
                        {payment.status === 'REJECTED' && (
                          <div className="text-xs text-red-600">
                            <p>Rejected</p>
                            {payment.adminNotes && (
                              <p className="text-gray-500">Reason: {payment.adminNotes}</p>
                            )}
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Instructions Card */}
      {pendingPayments.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-900">How to Resolve Unmatched Payments</CardTitle>
          </CardHeader>
          <CardContent className="text-blue-800">
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Click "Resolve" next to an unmatched payment</li>
              <li>Search for the correct student by name or admission number</li>
              <li>Click on the student to match the payment to them</li>
              <li>The payment will be automatically allocated to their outstanding fees</li>
              <li>Any overpayment will be added as credit to their account</li>
            </ol>
            <p className="text-xs mt-4 text-blue-600">
              <strong>Tip:</strong> Common reasons for unmatched payments include typos in admission numbers or students not yet added to the system.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}