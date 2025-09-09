'use client'

import { useState } from 'react'
import Link from 'next/link'
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Eye, Search, MoreHorizontal, Receipt, DollarSign, CreditCard, Calendar, TrendingUp } from 'lucide-react'
import { Payment, Student, Class, FeeGroup, PaymentMethod, PaymentStatus } from '@prisma/client'

type PaymentWithDetails = Payment & {
  student: (Student & {
    currentClass: Class
    feeGroup: FeeGroup | null
  }) | null
  allocations: {
    id: string
    allocatedAmount: any
    feeAssignment: {
      feeStructure: {
        name: string
        term: string | null
        year: number
      }
    }
  }[]
}

interface PaymentsTableProps {
  payments: PaymentWithDetails[]
  stats: {
    totalPayments: number
    totalAmount: number
    todayPayments: number
    todayAmount: number
  }
}

export default function PaymentsTable({ payments, stats }: PaymentsTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [methodFilter, setMethodFilter] = useState<'ALL' | PaymentMethod>('ALL')
  const [statusFilter, setStatusFilter] = useState<'ALL' | PaymentStatus>('ALL')
  const [dateFilter, setDateFilter] = useState('ALL')

  // Filter payments
  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.student?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.student?.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.student?.admissionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.transactionId.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesMethod = methodFilter === 'ALL' || payment.paymentMethod === methodFilter
    const matchesStatus = statusFilter === 'ALL' || payment.status === statusFilter
    
    let matchesDate = true
    if (dateFilter === 'TODAY') {
      const today = new Date().toDateString()
      const paymentDate = payment.paidAt ? new Date(payment.paidAt).toDateString() : ''
      matchesDate = paymentDate === today
    } else if (dateFilter === 'WEEK') {
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      matchesDate = payment.paidAt ? new Date(payment.paidAt) >= weekAgo : false
    } else if (dateFilter === 'MONTH') {
      const monthAgo = new Date()
      monthAgo.setMonth(monthAgo.getMonth() - 1)
      matchesDate = payment.paidAt ? new Date(payment.paidAt) >= monthAgo : false
    }

    return matchesSearch && matchesMethod && matchesStatus && matchesDate
  })

  const getMethodBadge = (method: PaymentMethod) => {
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
      <Badge className={`${colors[method]} hover:${colors[method]}`}>
        {labels[method]}
      </Badge>
    )
  }

  const getStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case 'CONFIRMED':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Confirmed</Badge>
      case 'PENDING':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>
      case 'FAILED':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Failed</Badge>
      case 'CANCELLED':
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Cancelled</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Receipt className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Payments</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalPayments}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Amount</p>
                <p className="text-2xl font-bold text-gray-900">
                  KES {stats.totalAmount.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Today's Payments</p>
                <p className="text-2xl font-bold text-gray-900">{stats.todayPayments}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Today's Amount</p>
                <p className="text-2xl font-bold text-gray-900">
                  KES {stats.todayAmount.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Records</CardTitle>
          <CardDescription>
            View and manage all payment transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by student name, admission number, or transaction ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              {/* Date Filter */}
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="ALL">All Time</option>
                <option value="TODAY">Today</option>
                <option value="WEEK">Last Week</option>
                <option value="MONTH">Last Month</option>
              </select>

              {/* Method Filter */}
              <select
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="ALL">All Methods</option>
                <option value="MPESA">M-PESA</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="CASH">Cash</option>
              </select>

              {/* Status Filter */}
              {(['ALL', 'CONFIRMED', 'PENDING'] as const).map((status) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter(status)}
                  className={statusFilter === status ? 'bg-school-primary-red hover:bg-school-primary-red/90' : ''}
                >
                  {status === 'ALL' ? 'All' : status.charAt(0) + status.slice(1).toLowerCase()}
                </Button>
              ))}
            </div>
          </div>

          {/* Results count */}
          <p className="text-sm text-gray-600 mb-4">
            Showing {filteredPayments.length} of {payments.length} payments
          </p>

          {/* Payments Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Payment Date</TableHead>
                  <TableHead>Applied To</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      No payments found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        {payment.student ? (
                          <div>
                            <p className="font-medium text-gray-900">
                              {payment.student.firstName} {payment.student.lastName}
                            </p>
                            <p className="text-sm text-gray-500">
                              {payment.student.admissionNumber} • {payment.student.currentClass.name}
                            </p>
                            {payment.student.feeGroup && (
                              <Badge variant="outline" className="text-xs mt-1">
                                {payment.student.feeGroup.name}
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">Student not found</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <p className="font-mono font-bold text-green-600">
                          KES {parseFloat(payment.amount.toString()).toLocaleString()}
                        </p>
                      </TableCell>
                      <TableCell>
                        {getMethodBadge(payment.paymentMethod)}
                      </TableCell>
                      <TableCell>
                        <p className="font-mono text-sm">{payment.transactionId}</p>
                        {payment.referenceNumber && (
                          <p className="text-xs text-gray-500">
                            Ref: {payment.referenceNumber}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">
                            {payment.paidAt ? new Date(payment.paidAt).toLocaleDateString() : 'Not set'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {payment.paidAt ? new Date(payment.paidAt).toLocaleTimeString() : ''}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 max-w-xs">
                          {payment.allocations.length === 0 ? (
                            <span className="text-xs text-gray-400">No allocations</span>
                          ) : (
                            payment.allocations.slice(0, 2).map((allocation, idx) => (
                              <div key={allocation.id} className="text-xs">
                                <span className="font-medium">
                                  {allocation.feeAssignment.feeStructure.name}
                                </span>
                                <span className="text-gray-500 ml-1">
                                  (KES {parseFloat(allocation.allocatedAmount.toString()).toLocaleString()})
                                </span>
                              </div>
                            ))
                          )}
                          {payment.allocations.length > 2 && (
                            <p className="text-xs text-gray-500">
                              +{payment.allocations.length - 2} more
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(payment.status)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <Link href={`/payments/${payment.id}`}>
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                            </Link>
                            {payment.student && (
                              <Link href={`/students/${payment.student.id}`}>
                                <DropdownMenuItem>
                                  <CreditCard className="mr-2 h-4 w-4" />
                                  View Student
                                </DropdownMenuItem>
                              </Link>
                            )}
                            <DropdownMenuItem>
                              <Receipt className="mr-2 h-4 w-4" />
                              Generate Receipt
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}