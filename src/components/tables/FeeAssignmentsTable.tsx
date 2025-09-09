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
import { Eye, Search, MoreHorizontal, Trash2, DollarSign, Users, FileText, AlertCircle } from 'lucide-react'
import { FeeAssignment, Student, FeeStructure, Class, FeeGroup, PaymentStatus } from '@prisma/client'
import { removeFeeAssignment } from '@/lib/actions/fee-assignments'

type FeeAssignmentWithDetails = FeeAssignment & {
  student: Student & {
    currentClass: Class
    feeGroup: FeeGroup | null
  }
  feeStructure: FeeStructure & {
    feeGroup: FeeGroup | null
    class: Class | null
  }
}

interface FeeAssignmentsTableProps {
  assignments: FeeAssignmentWithDetails[]
  stats: {
    totalAssignments: number
    totalDue: number
    totalPaid: number
    totalOutstanding: number
    pendingCount: number
  }
}

export default function FeeAssignmentsTable({ assignments, stats }: FeeAssignmentsTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | PaymentStatus>('ALL')
  const [classFilter, setClassFilter] = useState('ALL')
  const [loadingRemove, setLoadingRemove] = useState<string | null>(null)

  // Get unique classes for filter
  const classes = [...new Set(assignments.map(a => a.student.currentClass.name))].sort()

  // Filter assignments
  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = 
      assignment.student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.student.admissionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.feeStructure.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'ALL' || assignment.status === statusFilter
    const matchesClass = classFilter === 'ALL' || assignment.student.currentClass.name === classFilter

    return matchesSearch && matchesStatus && matchesClass
  })

  const handleRemoveAssignment = async (assignmentId: string) => {
    setLoadingRemove(assignmentId)
    await removeFeeAssignment(assignmentId)
    setLoadingRemove(null)
  }

  const getStatusBadge = (status: PaymentStatus, balance: number) => {
    if (balance <= 0) {
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Paid</Badge>
    }
    
    switch (status) {
      case 'PENDING':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>
      case 'CONFIRMED':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Confirmed</Badge>
      case 'FAILED':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Failed</Badge>
      case 'CANCELLED':
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Cancelled</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getPaymentProgress = (paid: number, total: number) => {
    const percentage = total > 0 ? (paid / total) * 100 : 0
    return Math.min(percentage, 100)
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Assignments</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalAssignments}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Due</p>
                <p className="text-2xl font-bold text-gray-900">
                  KES {stats.totalDue.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-green-600 font-semibold">P</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Paid</p>
                <p className="text-2xl font-bold text-gray-900">
                  KES {stats.totalPaid.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertCircle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Outstanding</p>
                <p className="text-2xl font-bold text-gray-900">
                  KES {stats.totalOutstanding.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fee Assignments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Fee Assignments</CardTitle>
          <CardDescription>
            Manage individual fee assignments to students
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by student name, admission number, or fee structure..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="ALL">All Classes</option>
                {classes.map((className) => (
                  <option key={className} value={className}>
                    {className}
                  </option>
                ))}
              </select>
              {(['ALL', 'PENDING', 'CONFIRMED'] as const).map((status) => (
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
            Showing {filteredAssignments.length} of {assignments.length} assignments
          </p>

          {/* Assignments Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Fee Structure</TableHead>
                  <TableHead>Amount Due</TableHead>
                  <TableHead>Amount Paid</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssignments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      No fee assignments found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAssignments.map((assignment) => {
                    const amountDue = parseFloat(assignment.amountDue.toString())
                    const amountPaid = parseFloat(assignment.amountPaid.toString())
                    const balance = parseFloat(assignment.balance.toString())
                    const progress = getPaymentProgress(amountPaid, amountDue)

                    return (
                      <TableRow key={assignment.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium text-gray-900">
                              {assignment.student.firstName} {assignment.student.lastName}
                            </p>
                            <p className="text-sm text-gray-500">
                              {assignment.student.admissionNumber} • {assignment.student.currentClass.name}
                            </p>
                            {assignment.student.feeGroup && (
                              <Badge variant="outline" className="text-xs mt-1">
                                {assignment.student.feeGroup.name}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-gray-900">{assignment.feeStructure.name}</p>
                            <div className="flex gap-1 mt-1">
                              {assignment.feeStructure.term && (
                                <Badge variant="secondary" className="text-xs">
                                  Term {assignment.feeStructure.term}
                                </Badge>
                              )}
                              <Badge variant="outline" className="text-xs">
                                {assignment.feeStructure.year}
                              </Badge>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="font-mono font-medium">
                            KES {amountDue.toLocaleString()}
                          </p>
                        </TableCell>
                        <TableCell>
                          <p className="font-mono font-medium text-green-600">
                            KES {amountPaid.toLocaleString()}
                          </p>
                        </TableCell>
                        <TableCell>
                          <p className={`font-mono font-medium ${
                            balance > 0 ? 'text-red-600' : 'text-green-600'
                          }`}>
                            KES {balance.toLocaleString()}
                          </p>
                        </TableCell>
                        <TableCell>
                          <div className="w-20">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                              <span className="text-xs text-gray-500">
                                {Math.round(progress)}%
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(assignment.status, balance)}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <Link href={`/students/${assignment.student.id}`}>
                                <DropdownMenuItem>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Student
                                </DropdownMenuItem>
                              </Link>
                              <Link href={`/payments/record?student=${assignment.student.id}&assignment=${assignment.id}`}>
                                <DropdownMenuItem>
                                  <DollarSign className="mr-2 h-4 w-4" />
                                  Record Payment
                                </DropdownMenuItem>
                              </Link>
                              {amountPaid === 0 && (
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <DropdownMenuItem
                                      onSelect={(e) => e.preventDefault()}
                                      className="text-red-600 focus:text-red-600"
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Remove Assignment
                                    </DropdownMenuItem>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Remove Fee Assignment</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to remove this fee assignment for{' '}
                                        <strong>{assignment.student.firstName} {assignment.student.lastName}</strong>?
                                        This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleRemoveAssignment(assignment.id)}
                                        disabled={loadingRemove === assignment.id}
                                        className="bg-red-600 hover:bg-red-700"
                                      >
                                        {loadingRemove === assignment.id ? 'Removing...' : 'Remove Assignment'}
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}