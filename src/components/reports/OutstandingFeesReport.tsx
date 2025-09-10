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
import { Download, Printer, Search, AlertCircle, DollarSign, Users, TrendingDown } from 'lucide-react'
import { OutstandingFeesData } from '@/lib/actions/reports'
import { exportToPDF, exportToExcel } from '@/lib/utils/exports'


interface OutstandingFeesReportProps {
  data: OutstandingFeesData
}

export default function OutstandingFeesReport({ data }: OutstandingFeesReportProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedClass, setSelectedClass] = useState('all')
  const [printLoading, setPrintLoading] = useState(false)
  const [exportLoading, setExportLoading] = useState(false)

  const handlePrint = () => {
    setPrintLoading(true)
    setTimeout(() => {
      window.print()
      setPrintLoading(false)
    }, 500)
  }

  const handleDownload = async () => {
		setExportLoading(true)
		try {
			const result = await exportToExcel.outstandingFees(data.students)
			if (!result.success) {
				alert('Failed to export Excel: ' + result.error)
			}
		} finally {
			setExportLoading(false)
		}
	}

	const handlePDFDownload = async () => {
		setExportLoading(true)
		try {
			const result = await exportToPDF.outstandingReport(data.students)
			if (!result.success) {
				alert('Failed to export PDF: ' + result.error)
			}
		} finally {
			setExportLoading(false)
		}
	}

  // Filter students based on search and class
  const filteredStudents = data.students.filter(student => {
    const matchesSearch = searchTerm === '' || 
      `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.admissionNumber.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesClass = selectedClass === 'all' || student.currentClass.name === selectedClass
    
    return matchesSearch && matchesClass
  })

  // Filter class data based on selected class
  const filteredClassData = selectedClass === 'all' 
    ? data.byClass 
    : data.byClass.filter(classData => classData.className === selectedClass)

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
      {/* Header Actions */}
      <div className="flex justify-between items-center print:hidden">
        <div>
          <h2 className="text-2xl font-bold">Outstanding Fees Report</h2>
          <p className="text-gray-600">Students with unpaid fee balances</p>
        </div>
        <div className="flex gap-2">
					<Button variant="outline" onClick={handleDownload} disabled={exportLoading}>
						{exportLoading ? (
							<>
								<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
								Exporting...
							</>
						) : (
							<>
								<Download className="h-4 w-4 mr-2" />
								Export Excel
							</>
						)}
					</Button>
					
					<Button variant="outline" onClick={handlePDFDownload} disabled={exportLoading}>
						{exportLoading ? (
							<>
								<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
								Generating...
							</>
						) : (
							<>
								<Download className="h-4 w-4 mr-2" />
								Download PDF
							</>
						)}
					</Button>
					
					<Button variant="outline" onClick={handlePrint} disabled={printLoading}>
						{printLoading ? (
							<>
								<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
								Preparing...
							</>
						) : (
							<>
								<Printer className="h-4 w-4 mr-2" />
								Print Report
							</>
						)}
					</Button>
				</div>
      </div>

      {/* Report Header (for print) */}
      <Card className="hidden print:block">
        <CardHeader className="text-center border-b">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-school-primary-red">
              ST. JOSEPH'S CENTRAL ACADEMY - SIRONOI
            </h1>
            <p className="text-gray-600">Fee Management System</p>
            <h2 className="text-xl font-semibold">OUTSTANDING FEES REPORT</h2>
            <p className="text-sm text-gray-500">
              Generated on: {new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </CardHeader>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertCircle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Students with Outstanding Fees</p>
                <p className="text-2xl font-bold text-red-600">{data.summary.totalStudents}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Outstanding Amount</p>
                <p className="text-2xl font-bold text-orange-600">
                  KES {data.summary.totalOutstandingAmount.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingDown className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Average Outstanding</p>
                <p className="text-2xl font-bold text-purple-600">
                  KES {Math.round(data.summary.averageOutstanding).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Class Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Outstanding Fees by Class</CardTitle>
          <CardDescription>Summary of outstanding balances grouped by class</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Class</TableHead>
                <TableHead className="text-right">Students with Outstanding</TableHead>
                <TableHead className="text-right">Total Outstanding</TableHead>
                <TableHead className="text-right">Average per Student</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.byClass.map((classData) => (
                <TableRow key={classData.className}>
                  <TableCell className="font-medium">{classData.className}</TableCell>
                  <TableCell className="text-right">{classData.studentCount}</TableCell>
                  <TableCell className="text-right font-mono text-red-600 font-bold">
                    KES {classData.totalOutstanding.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    KES {Math.round(classData.totalOutstanding / classData.studentCount).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card className="print:hidden">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by student name or admission number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm min-w-[150px]"
            >
              <option value="all">All Classes</option>
              {data.byClass.map((classData) => (
                <option key={classData.className} value={classData.className}>
                  {classData.className}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Student List */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Outstanding Fees List</CardTitle>
          <CardDescription>
            Showing {filteredStudents.length} of {data.students.length} students with outstanding balances
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Fee Group</TableHead>
                <TableHead className="text-right">Outstanding Balance</TableHead>
                <TableHead>Recent Payment</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="text-gray-500">
                      <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p className="font-medium">No students found</p>
                      <p className="text-sm">
                        {searchTerm || selectedClass !== 'all' 
                          ? 'Try adjusting your search or filter criteria' 
                          : 'All students have paid their fees!'
                        }
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredStudents.map((student) => {
                  const totalOutstanding = student.feeAssignments.reduce((sum: number, assignment: any) => {
                    return sum + parseFloat(assignment.balance.toString())
                  }, 0)

                  return (
                    <TableRow key={student.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {student.firstName} {student.lastName}
                          </p>
                          <p className="text-sm text-gray-500">
                            {student.admissionNumber}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{student.currentClass.name}</Badge>
                      </TableCell>
                      <TableCell>
                        {student.feeGroup ? (
                          <Badge variant="secondary">{student.feeGroup.name}</Badge>
                        ) : (
                          <span className="text-gray-400 text-sm">No group</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-mono font-bold text-red-600">
                        KES {totalOutstanding.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {student.payments && student.payments.length > 0 ? (
                          <div className="text-sm">
                            <p className="font-mono text-green-600">
                              KES {parseFloat(student.payments[0].amount.toString()).toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-500">
                              {student.payments[0].paidAt ? new Date(student.payments[0].paidAt).toLocaleDateString() : 'No date'}
                            </p>
                            <p className="text-xs text-gray-400">
                              {student.payments[0].paymentMethod === 'MPESA' ? 'M-Pesa' : student.payments[0].paymentMethod}
                            </p>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">No payments</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(student.status)}
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Footer for print */}
      <div className="text-center text-sm text-gray-500 print:block hidden">
        <p>This is a computer-generated report. No signature required.</p>
        <p>For any queries, contact the school administration.</p>
      </div>
    </div>
  )
}