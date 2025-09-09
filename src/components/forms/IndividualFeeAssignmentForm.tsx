'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { createIndividualFeeAssignment } from '@/lib/actions/fee-assignments'
import { getStudentOutstandingFees } from '@/lib/actions/payments'
import { FeeStructure, FeeGroup, Class, Student } from '@prisma/client'
import { Search, User, DollarSign, FileText, AlertCircle, CheckCircle } from 'lucide-react'

type FeeStructureWithDetails = FeeStructure & {
  feeGroup: FeeGroup | null
  class: Class | null
}

type StudentWithDetails = Student & {
  currentClass: Class
  feeGroup: FeeGroup | null
}

interface IndividualFeeAssignmentFormProps {
  feeStructures: FeeStructureWithDetails[]
  students: StudentWithDetails[]
  preSelectedStudent?: string
}

export default function IndividualFeeAssignmentForm({ 
  feeStructures, 
  students, 
  preSelectedStudent 
}: IndividualFeeAssignmentFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [loadingStudent, setLoadingStudent] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [selectedStudent, setSelectedStudent] = useState(preSelectedStudent || '')
  const [selectedFeeStructure, setSelectedFeeStructure] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [outstandingFees, setOutstandingFees] = useState<{
    assignments: any[]
    totalOutstanding: number
  }>({ assignments: [], totalOutstanding: 0 })

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedStudent || !selectedFeeStructure) {
      setError('Please select both student and fee structure')
      return
    }

    setIsLoading(true)
    setError('')
    setSuccess('')

    const result = await createIndividualFeeAssignment(selectedStudent, selectedFeeStructure)
    
    if (result.success) {
      setSuccess('Fee successfully assigned to student!')
      setSelectedFeeStructure('')
      // Reload outstanding fees
      const fees = await getStudentOutstandingFees(selectedStudent)
      setOutstandingFees(fees)
    } else {
      setError(result.error || 'Failed to assign fee')
    }
    
    setIsLoading(false)
  }

  // Filter students based on search
  const filteredStudents = students.filter(student =>
    `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.admissionNumber.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 10)

  const selectedStudentData = students.find(s => s.id === selectedStudent)
  const selectedFeeStructureData = feeStructures.find(fs => fs.id === selectedFeeStructure)

  // Filter fee structures that are compatible with selected student
  const compatibleFeeStructures = selectedStudentData ? feeStructures.filter(structure => {
    // If fee structure has a specific fee group, check if student belongs to it
    if (structure.feeGroupId && structure.feeGroupId !== selectedStudentData.feeGroupId) {
      return false
    }
    
    // If fee structure has a specific class, check if student belongs to it
    if (!structure.applicableToAllClasses && structure.classId && structure.classId !== selectedStudentData.currentClassId) {
      return false
    }
    
    return true
  }) : feeStructures

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Individual Fee Assignment
        </CardTitle>
        <CardDescription>
          Assign a specific fee structure to an individual student
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
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

            {/* Student Selection */}
            <Select 
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
              <Label>Current Outstanding Fees</Label>
              {loadingStudent ? (
                <div className="text-center py-4 text-gray-500">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-600 mx-auto mb-2"></div>
                  Loading outstanding fees...
                </div>
              ) : outstandingFees.assignments.length === 0 ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center text-green-800">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2" />
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
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {outstandingFees.assignments.map((assignment, index) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                        <div>
                          <p className="font-medium text-sm">{assignment.feeStructure.name}</p>
                          <p className="text-xs text-gray-500">
                            {assignment.feeStructure.term && `Term ${assignment.feeStructure.term} • `}
                            {assignment.feeStructure.year}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-mono font-medium text-red-600 text-sm">
                            KES {parseFloat(assignment.balance.toString()).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Fee Structure Selection */}
          <div className="space-y-2">
            <Label>Fee Structure to Assign *</Label>
            <Select 
              value={selectedFeeStructure} 
              onValueChange={setSelectedFeeStructure}
              required 
              disabled={isLoading || !selectedStudent}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select fee structure" />
              </SelectTrigger>
              <SelectContent>
                {compatibleFeeStructures.map((structure) => (
                  <SelectItem key={structure.id} value={structure.id}>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      <div>
                        <span className="font-medium">{structure.name}</span>
                        <Badge className="ml-2 text-xs">
                          KES {parseFloat(structure.amount.toString()).toLocaleString()}
                        </Badge>
                        {structure.term && (
                          <Badge variant="outline" className="ml-1 text-xs">
                            Term {structure.term}
                          </Badge>
                        )}
                        <Badge variant="outline" className="ml-1 text-xs">
                          {structure.year}
                        </Badge>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {selectedStudent && compatibleFeeStructures.length === 0 && (
              <p className="text-sm text-red-600">
                No compatible fee structures found for this student's class and fee group.
              </p>
            )}

            {selectedFeeStructureData && (
              <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                <p><strong>Amount:</strong> KES {parseFloat(selectedFeeStructureData.amount.toString()).toLocaleString()}</p>
                {selectedFeeStructureData.term && <p><strong>Term:</strong> {selectedFeeStructureData.term}</p>}
                <p><strong>Year:</strong> {selectedFeeStructureData.year}</p>
                {selectedFeeStructureData.dueDate && (
                  <p><strong>Due Date:</strong> {new Date(selectedFeeStructureData.dueDate).toLocaleDateString()}</p>
                )}
                {selectedFeeStructureData.feeGroup && (
                  <p><strong>Fee Group:</strong> {selectedFeeStructureData.feeGroup.name}</p>
                )}
                {selectedFeeStructureData.class && (
                  <p><strong>Class:</strong> {selectedFeeStructureData.class.name}</p>
                )}
              </div>
            )}
          </div>

          {/* Assignment Preview */}
          {selectedStudent && selectedFeeStructure && selectedStudentData && selectedFeeStructureData && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Assignment Preview</h4>
              <div className="text-sm text-blue-800 space-y-1">
                <p><strong>Student:</strong> {selectedStudentData.firstName} {selectedStudentData.lastName} ({selectedStudentData.admissionNumber})</p>
                <p><strong>Fee Structure:</strong> {selectedFeeStructureData.name}</p>
                <p><strong>Amount:</strong> KES {parseFloat(selectedFeeStructureData.amount.toString()).toLocaleString()}</p>
                <p><strong>Term/Year:</strong> {selectedFeeStructureData.term ? `Term ${selectedFeeStructureData.term} ` : ''}{selectedFeeStructureData.year}</p>
                {selectedFeeStructureData.dueDate && (
                  <p><strong>Due Date:</strong> {new Date(selectedFeeStructureData.dueDate).toLocaleDateString()}</p>
                )}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isLoading || !selectedStudent || !selectedFeeStructure}
              className="bg-school-primary-red hover:bg-school-primary-red/90"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Assigning Fee...
                </>
              ) : (
                'Assign Fee to Student'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}