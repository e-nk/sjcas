'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Download, Printer, Mail } from 'lucide-react'
import Image from 'next/image'
import { exportToPDF } from '@/lib/utils/exports'


interface StudentStatementProps {
  data: {
    student: any
    summary: {
      totalFeesCharged: number
      totalPayments: number
      totalOutstanding: number
      totalCredits: number
      netBalance: number
    }
  }
}

export default function StudentStatement({ data }: StudentStatementProps) {
  const { student, summary } = data
  const [isLoading, setIsLoading] = useState(false)
  const [emailLoading, setEmailLoading] = useState(false)

  const handlePrint = () => {
    setIsLoading(true)
    // Small delay to show loading state
    setTimeout(() => {
      window.print()
      setIsLoading(false)
    }, 500)
  }

	const handleDownload = async () => {
		setIsLoading(true)
		try {
			const result = await exportToPDF.studentStatement(
				'student-statement-content',
				`${student.firstName}_${student.lastName}`
			)
			
			if (result.success) {
				console.log('PDF downloaded successfully')
			} else {
				alert('Failed to download PDF: ' + result.error)
			}
		} catch (error) {
			console.error('Download failed:', error)
			alert('Failed to download PDF')
		} finally {
			setIsLoading(false)
		}
	}

  const handleEmail = async () => {
    setEmailLoading(true)
    try {
      // TODO: Implement email sending
      await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate API call
      console.log('Email sending would happen here')
      alert('Email functionality will be implemented soon')
    } catch (error) {
      console.error('Email failed:', error)
    } finally {
      setEmailLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex justify-end gap-2 print:hidden">
				<Button variant="outline" onClick={handleEmail} disabled={emailLoading}>
					{emailLoading ? (
						<>
							<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
							Sending...
						</>
					) : (
						<>
							<Mail className="h-4 w-4 mr-2" />
							Email Statement
						</>
					)}
				</Button>
				<Button variant="outline" onClick={handleDownload} disabled={isLoading}>
					{isLoading ? (
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
				<Button variant="outline" onClick={handlePrint} disabled={isLoading}>
					{isLoading ? (
						<>
							<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
							Preparing...
						</>
					) : (
						<>
							<Printer className="h-4 w-4 mr-2" />
							Print
						</>
					)}
				</Button>
			</div>

      {/* Statement Header */}
      <Card>
        <CardHeader className="text-center border-b">
          <div id="student-statement-content" className="space-y-4">
            {/* School Logo */}
            <div className="flex justify-center">
              <Image
                src="/logo.png"
                alt="St. Joseph's Central Academy Logo"
                width={80}
                height={80}
                className="rounded-lg"
                priority
              />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-school-primary-red">
                ST. JOSEPH'S CENTRAL ACADEMY - SIRONOI
              </h1>
              <p className="text-gray-600">Fee Management System</p>
              <h2 className="text-xl font-semibold">STUDENT FEE STATEMENT</h2>
            </div>
          </div>
        </CardHeader>
        {/* Rest of the component remains the same... */}
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Student Information */}
            <div>
              <h3 className="font-semibold text-lg mb-4">Student Information</h3>
              <div className="space-y-2 text-sm">
                <div className="grid grid-cols-3 gap-2">
                  <span className="font-medium">Name:</span>
                  <span className="col-span-2">
                    {student.firstName} {student.middleName} {student.lastName}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="font-medium">Admission No:</span>
                  <span className="col-span-2 font-mono">{student.admissionNumber}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="font-medium">Class:</span>
                  <span className="col-span-2">{student.currentClass.name}</span>
                </div>
                {student.feeGroup && (
                  <div className="grid grid-cols-3 gap-2">
                    <span className="font-medium">Fee Group:</span>
                    <span className="col-span-2">{student.feeGroup.name}</span>
                  </div>
                )}
                <div className="grid grid-cols-3 gap-2">
                  <span className="font-medium">Academic Year:</span>
                  <span className="col-span-2">{student.currentAcademicYear}</span>
                </div>
              </div>
            </div>

            {/* Parent Information */}
            <div>
              <h3 className="font-semibold text-lg mb-4">Parent/Guardian Information</h3>
              <div className="space-y-2 text-sm">
                <div className="grid grid-cols-3 gap-2">
                  <span className="font-medium">Name:</span>
                  <span className="col-span-2">{student.parentName}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="font-medium">Phone:</span>
                  <span className="col-span-2">{student.parentPhone}</span>
                </div>
                {student.parentEmail && (
                  <div className="grid grid-cols-3 gap-2">
                    <span className="font-medium">Email:</span>
                    <span className="col-span-2">{student.parentEmail}</span>
                  </div>
                )}
                <div className="grid grid-cols-3 gap-2">
                  <span className="font-medium">Statement Date:</span>
                  <span className="col-span-2">
                    {new Date().toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rest of the component remains exactly the same... */}
      {/* Account Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Account Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">Total Fees Charged</p>
              <p className="text-xl font-bold text-blue-600">
                KES {summary.totalFeesCharged.toLocaleString()}
              </p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600">Total Payments</p>
              <p className="text-xl font-bold text-green-600">
                KES {summary.totalPayments.toLocaleString()}
              </p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-gray-600">Outstanding Balance</p>
              <p className="text-xl font-bold text-red-600">
                KES {summary.totalOutstanding.toLocaleString()}
              </p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-gray-600">Available Credits</p>
              <p className="text-xl font-bold text-purple-600">
                KES {summary.totalCredits.toLocaleString()}
              </p>
            </div>
            <div className={`text-center p-4 rounded-lg ${
              summary.netBalance > 0 ? 'bg-red-50' : summary.netBalance < 0 ? 'bg-green-50' : 'bg-gray-50'
            }`}>
              <p className="text-sm text-gray-600">Net Balance</p>
              <p className={`text-xl font-bold ${
                summary.netBalance > 0 ? 'text-red-600' : summary.netBalance < 0 ? 'text-green-600' : 'text-gray-600'
              }`}>
                KES {Math.abs(summary.netBalance).toLocaleString()}
                {summary.netBalance < 0 ? ' CR' : ''}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fee Assignments */}
      <Card>
        <CardHeader>
          <CardTitle>Fee Assignments</CardTitle>
          <CardDescription>All fee structures assigned to this student</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fee Structure</TableHead>
                <TableHead>Term/Year</TableHead>
                <TableHead className="text-right">Amount Due</TableHead>
                <TableHead className="text-right">Amount Paid</TableHead>
                <TableHead className="text-right">Balance</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {student.feeAssignments.map((assignment: any) => {
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
                      KES {balance.toLocaleString()}
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
        </CardContent>
      </Card>

      {/* Student Ledger */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History (Student Ledger)</CardTitle>
          <CardDescription>Complete transaction history in chronological order</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Debit (Charges)</TableHead>
                <TableHead className="text-right">Credit (Payments)</TableHead>
                <TableHead className="text-right">Balance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {student.ledger.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    No transactions found
                  </TableCell>
                </TableRow>
              ) : (
                student.ledger.map((entry: any) => {
                  const amount = parseFloat(entry.amount.toString())
                  const runningBalance = parseFloat(entry.runningBalance.toString())
                  
                  return (
                    <TableRow key={entry.id}>
                      <TableCell>
                        {new Date(entry.transactionDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{entry.description}</TableCell>
                      <TableCell className="text-right font-mono">
                        {amount < 0 ? `KES ${Math.abs(amount).toLocaleString()}` : '-'}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {amount > 0 ? `KES ${amount.toLocaleString()}` : '-'}
                      </TableCell>
                      <TableCell className={`text-right font-mono font-bold ${
                        runningBalance < 0 ? 'text-red-600' : runningBalance > 0 ? 'text-green-600' : 'text-gray-600'
                      }`}>
                        KES {Math.abs(runningBalance).toLocaleString()}
                        {runningBalance < 0 ? ' (Owe)' : runningBalance > 0 ? ' (Credit)' : ''}
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Credits */}
      {student.credits.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Available Credits</CardTitle>
            <CardDescription>Credit balances available for future fee payments</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Source</TableHead>
                  <TableHead>Date Created</TableHead>
                  <TableHead className="text-right">Original Amount</TableHead>
                  <TableHead className="text-right">Used Amount</TableHead>
                  <TableHead className="text-right">Remaining</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {student.credits.map((credit: any) => (
                  <TableRow key={credit.id}>
                    <TableCell>{credit.source}</TableCell>
                    <TableCell>
                      {new Date(credit.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      KES {parseFloat(credit.amount.toString()).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      KES {parseFloat(credit.usedAmount.toString()).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold text-green-600">
                      KES {parseFloat(credit.remainingAmount.toString()).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Footer */}
      <div className="text-center text-sm text-gray-500 print:block hidden">
        <p>This is a computer-generated statement. No signature required.</p>
        <p>For any queries, contact the school administration.</p>
      </div>
    </div>
  )
}