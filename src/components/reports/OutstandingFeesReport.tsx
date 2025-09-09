'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Download, Printer, Search, AlertCircle, Users, DollarSign } from 'lucide-react'

interface OutstandingFeesReportProps {
  data: {
    reportByClass: Array<{
      className: string
      students: Array<{
        studentId: string
        studentName: string
        admissionNumber: string
        parentName: string
        parentPhone: string
        feeGroup: string
        assignments: Array<{
          feeStructureName: string
          term: string | null
          year: number
          amountDue: number
          amountPaid: number
          balance: number
        }>
        totalOutstanding: number
      }>
      totalOutstanding: number
      studentCount: number
    }>
    overallStats: {
      totalStudents: number
      totalOutstanding: number
      totalClasses: number
    }
  }
}

export default function OutstandingFeesReport({ data }: OutstandingFeesReportProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedClass, setSelectedClass] = useState('ALL')
  const [minAmount, setMinAmount] = useState('')
	const [exportLoading, setExportLoading] = useState(false)
	const [printLoading, setPrintLoading] = useState(false)

  const { reportByClass, overallStats } = data

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
			await new Promise(resolve => setTimeout(resolve, 2000))
			alert('Excel export functionality will be implemented soon')
		} finally {
			setExportLoading(false)
		}
	}

  // Filter classes based on search
  const filteredReport = reportByClass.filter(classData => {
    if (selectedClass !== 'ALL' && classData.className !== selectedClass) {
      return false
    }

    // Filter students within class
    classData.students = classData.students.filter(student => {
      const matchesSearch = searchTerm === '' || 
        student.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.admissionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.parentName.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesAmount = minAmount === '' || 
        student.totalOutstanding >= parseFloat(minAmount)

      return matchesSearch && matchesAmount
    })

    // Recalculate class totals after filtering
    classData.totalOutstanding = classData.students.reduce((sum, student) => sum + student.totalOutstanding, 0)
    classData.studentCount = classData.students.length

    return classData.students.length > 0
  })

  // Recalculate overall stats after filtering
  const filteredStats = {
    totalStudents: filteredReport.reduce((sum, cls) => sum + cls.studentCount, 0),
    totalOutstanding: filteredReport.reduce((sum, cls) => sum + cls.totalOutstanding, 0),
    totalClasses: filteredReport.length
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

      {/* Filters */}
      <Card className="print:hidden">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="ALL">All Classes</option>
              {reportByClass.map((cls) => (
                <option key={cls.className} value={cls.className}>
                  {cls.className}
                </option>
              ))}
            </select>

            <Input
              placeholder="Min amount (KES)"
              value={minAmount}
              onChange={(e) => setMinAmount(e.target.value)}
              type="number"
              min="0"
            />

            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('')
                setSelectedClass('ALL')
                setMinAmount('')
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Overall Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Students with Outstanding Fees</p>
                <p className="text-2xl font-bold text-gray-900">
                  {filteredStats.totalStudents}
                </p>
                <p className="text-xs text-gray-500">
                  Across {filteredStats.totalClasses} classes
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Outstanding Amount</p>
                <p className="text-2xl font-bold text-red-600">
                  KES {filteredStats.totalOutstanding.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">
                  Average: KES {filteredStats.totalStudents > 0 ? Math.round(filteredStats.totalOutstanding / filteredStats.totalStudents).toLocaleString() : 0} per student
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertCircle className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">High Outstanding ({'>'}50K)</p>
                <p className="text-2xl font-bold text-orange-600">
                  {filteredReport.reduce((count, cls) => 
                    count + cls.students.filter(s => s.totalOutstanding > 50000).length, 0
                  )}
                </p>
                <p className="text-xs text-gray-500">Requiring urgent attention</p>
              </div>
            </div>
          </CardContent>
        </Card>
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

      {/* Class-wise Report */}
      {filteredReport.map((classData) => (
        <Card key={classData.className}>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">
                {classData.className}
              </CardTitle>
              <div className="text-right">
                <Badge variant="outline" className="mr-2">
                  {classData.studentCount} students
                </Badge>
                <Badge className="bg-red-100 text-red-800">
                  KES {classData.totalOutstanding.toLocaleString()}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Parent/Guardian</TableHead>
                  <TableHead>Fee Group</TableHead>
                  <TableHead>Outstanding Fees</TableHead>
                  <TableHead className="text-right">Total Outstanding</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classData.students.map((student) => (
                  <TableRow key={student.studentId}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{student.studentName}</p>
                        <p className="text-sm text-gray-500 font-mono">
                          {student.admissionNumber}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">{student.parentName}</p>
                        <p className="text-xs text-gray-500">{student.parentPhone}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {student.feeGroup}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {student.assignments.map((assignment, idx) => (
                          <div key={idx} className="text-xs">
                            <span className="font-medium">{assignment.feeStructureName}</span>
                            <span className="text-gray-500 ml-1">
                              ({assignment.term ? `Term ${assignment.term} ` : ''}{assignment.year})
                            </span>
                            <span className="text-red-600 ml-1">
                              - KES {assignment.balance.toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <p className="font-bold text-red-600 text-lg">
                        KES {student.totalOutstanding.toLocaleString()}
                      </p>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {/* Class Summary */}
            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="font-medium">Class Total:</span>
                <span className="font-bold text-red-600 text-lg">
                  KES {classData.totalOutstanding.toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {filteredReport.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Outstanding Fees Found</h3>
            <p className="text-gray-500">
              {searchTerm || selectedClass !== 'ALL' || minAmount
                ? 'Try adjusting your filters to see more results.'
                : 'All students have paid their fees in full!'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Grand Total */}
      {filteredReport.length > 0 && (
        <Card className="border-red-200">
          <CardContent className="p-6">
            <div className="flex justify-between items-center text-lg">
              <span className="font-medium">
                Grand Total Outstanding ({filteredStats.totalStudents} students):
              </span>
              <span className="font-bold text-red-600 text-2xl">
                KES {filteredStats.totalOutstanding.toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Footer for print */}
      <div className="text-center text-sm text-gray-500 print:block hidden">
        <p>This is a computer-generated report. No signature required.</p>
        <p>For any queries, contact the school administration.</p>
      </div>
    </div>
  )
}