'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { recordPayment, getStudentOutstandingFees } from '@/lib/actions/payments'
import { getStudents } from '@/lib/actions/students'
import { Student, Class, FeeGroup, FeeAssignment, FeeStructure, PaymentMethod } from '@prisma/client'
import { Search, DollarSign, User, CreditCard } from 'lucide-react'

type StudentWithDetails = Student & {
  currentClass: Class
  feeGroup: FeeGroup | null
}

type FeeAssignmentWithStructure = FeeAssignment & {
  feeStructure: FeeStructure
}

interface PaymentFormProps {
  preSelectedStudent?: string
  preSelectedAssignment?: string
}

export default function PaymentForm({ preSelectedStudent, preSelectedAssignment }: PaymentFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [loadingStudent, setLoadingStudent] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [students, setStudents] = useState<StudentWithDetails[]>([])
  const [selectedStudent, setSelectedStudent] = useState(preSelectedStudent || '')
  const [searchTerm, setSearchTerm] = useState('')
  const [outstandingFees, setOutstandingFees] = useState<{
    assignments: FeeAssignmentWithStructure[]
    totalOutstanding: number
  }>({ assignments: [], totalOutstanding: 0 })

  // Load students on component mount
  useEffect(() => {
    const loadStudents = async () => {
      const studentsData = await getStudents()
      setStudents(studentsData)
    }
    loadStudents()
  }, [])

  // Load student's outstanding fees when student is selected
  useEffect(() => {
    const loadOutstandingFees = async () => {
      if (selectedStudent) {
        setLoadingStudent(true)
        const fees = await getStudentOutstandingFees(selectedStudent)
        setOutstandingFees(fees)
        setLoadingStudent(false)
      } else {
        setOutstandingFees({ assignments: [], totalOutstanding: 0 })
      }
    }
    loadOutstandingFees()
  }, [selectedStudent])

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true)
    setError('')
    setSuccess('')

    const data = {
      studentId: formData.get('studentId') as string,
      amount: parseFloat(formData.get('amount') as string),
      paymentMethod: formData.get('paymentMethod') as PaymentMethod,
      transactionId: formData.get('transactionId') as string,
      referenceNumber: formData.get('referenceNumber') as string || undefined,
      academicYear: parseInt(formData.get('academicYear') as string) || undefined,
      term: formData.get('term') as string || undefined,
      paidAt: formData.get('paidAt') as string,
    }

    const result = await recordPayment(data)
    
    if (result.success) {
      setSuccess(result.message || 'Payment recorded successfully!')
      // Reset form
      const form = document.getElementById('payment-form') as HTMLFormElement
      form?.reset()
      setSelectedStudent('')
      setOutstandingFees({ assignments: [], totalOutstanding: 0 })
    } else {
      setError(result.error || 'Failed to record payment')
    }
    
    setIsLoading(false)
  }

  // Filter students based on search
  const filteredStudents = students.filter(student =>
    `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.admissionNumber.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 10) // Limit to 10 results

  const selectedStudentData = students.find(s => s.id === selectedStudent)
  const currentYear = new Date().getFullYear()
  const today = new Date().toISOString().split('T')[0]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Record Payment
        </CardTitle>
        <CardDescription>
          Record a payment from a student and allocate it to outstanding fees
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        <form id="payment-form" action={handleSubmit} className="space-y-6">
          {/* Student Selection */}
          <div className="space-y-4">
            <Label>Select Student *</Label>
            
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name or admission number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                disabled={isLoading}
              />
            </div>

            {/* Student Selection Dropdown */}
            <Select 
              name="studentId" 
              value={selectedStudent} 
              onValueChange={setSelectedStudent}
              required 
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a student" />
              </SelectTrigger>
              <SelectContent>
                {filteredStudents.map((student) => (
                  <SelectItem key={student.id} value={student.id}>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <div>
                        <span className="font-medium">
                          {student.firstName} {student.lastName}
                        </span>
                        <span className="text-sm text-gray-500 ml-2">
                          {student.admissionNumber} • {student.currentClass.name}
                        </span>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Selected Student Info */}
            {selectedStudentData && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Selected Student</h4>
                <div className="text-sm text-blue-800 space-y-1">
                  <p><strong>Name:</strong> {selectedStudentData.firstName} {selectedStudentData.lastName}</p>
                  <p><strong>Admission Number:</strong> {selectedStudentData.admissionNumber}</p>
                  <p><strong>Class:</strong> {selectedStudentData.currentClass.name}</p>
                  {selectedStudentData.feeGroup && (
                    <p><strong>Fee Group:</strong> {selectedStudentData.feeGroup.name}</p>
                  )}
                  <p><strong>Parent:</strong> {selectedStudentData.parentName} ({selectedStudentData.parentPhone})</p>
                </div>
              </div>
            )}
          </div>

          {/* Outstanding Fees Display */}
          {selectedStudent && (
            <div className="space-y-2">
              <Label>Outstanding Fees</Label>
              {loadingStudent ? (
                <div className="text-center py-4 text-gray-500">Loading outstanding fees...</div>
              ) : outstandingFees.assignments.length === 0 ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center text-green-800">
                  No outstanding fees found for this student
                </div>
              ) : (
                <div className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total Outstanding:</span>
                    <Badge className="bg-red-100 text-red-800 text-base px-3 py-1">
                      KES {outstandingFees.totalOutstanding.toLocaleString()}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    {outstandingFees.assignments.map((assignment) => (
                      <div key={assignment.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                        <div>
                          <p className="font-medium">{assignment.feeStructure.name}</p>
                          <p className="text-sm text-gray-500">
                            {assignment.feeStructure.term && `Term ${assignment.feeStructure.term} • `}
                            {assignment.feeStructure.year}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-mono font-medium text-red-600">
                            KES {parseFloat(assignment.balance.toString()).toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500">
                            Paid: KES {parseFloat(assignment.amountPaid.toString()).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Payment Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Payment Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="amount">Payment Amount (KES) *</Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  placeholder="5000.00"
                  disabled={isLoading}
                />
                {outstandingFees.totalOutstanding > 0 && (
                  <p className="text-sm text-gray-600">
                    Outstanding: KES {outstandingFees.totalOutstanding.toLocaleString()}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Payment Method *</Label>
                <Select name="paymentMethod" required disabled={isLoading}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MPESA">M-PESA</SelectItem>
                    <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                    <SelectItem value="CASH">Cash</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="transactionId">Transaction ID *</Label>
                <Input
                  id="transactionId"
                  name="transactionId"
                  required
                  placeholder="e.g., QG85KL9XYZ"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="referenceNumber">Reference Number</Label>
                <Input
                  id="referenceNumber"
                  name="referenceNumber"
                  placeholder="Optional reference"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="paidAt">Payment Date *</Label>
                <Input
                  id="paidAt"
                  name="paidAt"
                  type="date"
                  required
                  defaultValue={today}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="academicYear">Academic Year</Label>
                <Select name="academicYear" disabled={isLoading} defaultValue={currentYear.toString()}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {[currentYear - 1, currentYear, currentYear + 1].map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="term">Term</Label>
                <Select name="term" disabled={isLoading}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select term" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Term 1</SelectItem>
                    <SelectItem value="2">Term 2</SelectItem>
                    <SelectItem value="3">Term 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isLoading || !selectedStudent}
              className="bg-school-primary-red hover:bg-school-primary-red/90"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Recording Payment...
                </>
              ) : (
                'Record Payment'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}