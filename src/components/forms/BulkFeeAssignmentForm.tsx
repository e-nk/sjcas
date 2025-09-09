'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { createBulkFeeAssignments } from '@/lib/actions/fee-assignments'
import { FeeStructure, FeeGroup, Class, Student } from '@prisma/client'
import { Users, School, Tag, User } from 'lucide-react'

type FeeStructureWithDetails = FeeStructure & {
  feeGroup: FeeGroup | null
  class: Class | null
}

type StudentWithDetails = Student & {
  currentClass: Class
  feeGroup: FeeGroup | null
}

interface BulkFeeAssignmentFormProps {
  feeStructures: FeeStructureWithDetails[]
  feeGroups: FeeGroup[]
  classes: Class[]
  students: StudentWithDetails[]
}

export default function BulkFeeAssignmentForm({ 
  feeStructures, 
  feeGroups, 
  classes, 
  students 
}: BulkFeeAssignmentFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [selectedStructure, setSelectedStructure] = useState('')
  const [assignmentType, setAssignmentType] = useState<'ALL_STUDENTS' | 'BY_CLASS' | 'BY_FEE_GROUP' | 'INDIVIDUAL'>('ALL_STUDENTS')
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedFeeGroup, setSelectedFeeGroup] = useState('')
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])

  // Filter students based on current selection
  const getFilteredStudents = () => {
    if (assignmentType === 'BY_CLASS' && selectedClass) {
      return students.filter(s => s.currentClassId === selectedClass)
    }
    if (assignmentType === 'BY_FEE_GROUP' && selectedFeeGroup) {
      return students.filter(s => s.feeGroupId === selectedFeeGroup)
    }
    return students
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedStructure) {
      setError('Please select a fee structure')
      return
    }

    setIsLoading(true)
    setError('')
    setSuccess('')

    const result = await createBulkFeeAssignments({
      feeStructureId: selectedStructure,
      assignmentType,
      classId: assignmentType === 'BY_CLASS' ? selectedClass : undefined,
      feeGroupId: assignmentType === 'BY_FEE_GROUP' ? selectedFeeGroup : undefined,
      studentIds: assignmentType === 'INDIVIDUAL' ? selectedStudents : undefined,
    })
    
    if (result.success) {
      setSuccess(result.message || 'Fee assignments created successfully!')
      // Reset form
      setSelectedStructure('')
      setAssignmentType('ALL_STUDENTS')
      setSelectedClass('')
      setSelectedFeeGroup('')
      setSelectedStudents([])
    } else {
      setError(result.error || 'Failed to create fee assignments')
    }
    
    setIsLoading(false)
  }

  const filteredStudents = getFilteredStudents()
  const selectedFeeStructure = feeStructures.find(fs => fs.id === selectedStructure)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bulk Fee Assignment</CardTitle>
        <CardDescription>
          Assign fee structures to multiple students at once
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

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Fee Structure Selection */}
          <div className="space-y-2">
            <Label>Fee Structure *</Label>
            <Select 
              value={selectedStructure} 
              onValueChange={setSelectedStructure}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select fee structure to assign" />
              </SelectTrigger>
              <SelectContent>
                {feeStructures.map((structure) => (
                  <SelectItem key={structure.id} value={structure.id}>
                    <div className="flex items-center gap-2">
                      <span>{structure.name}</span>
                      <Badge variant="secondary">
                        KES {parseFloat(structure.amount.toString()).toLocaleString()}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedFeeStructure && (
              <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                <p><strong>Amount:</strong> KES {parseFloat(selectedFeeStructure.amount.toString()).toLocaleString()}</p>
                {selectedFeeStructure.term && <p><strong>Term:</strong> {selectedFeeStructure.term}</p>}
                <p><strong>Year:</strong> {selectedFeeStructure.year}</p>
              </div>
            )}
          </div>

          {/* Assignment Type */}
          <div className="space-y-4">
            <Label>Assignment Type *</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { value: 'ALL_STUDENTS', label: 'All Active Students', icon: Users, description: 'Assign to all active students' },
                { value: 'BY_CLASS', label: 'By Class', icon: School, description: 'Assign to all students in a class' },
                { value: 'BY_FEE_GROUP', label: 'By Fee Group', icon: Tag, description: 'Assign to all students in a fee group' },
                { value: 'INDIVIDUAL', label: 'Individual Students', icon: User, description: 'Select specific students' },
              ].map((type) => (
                <Card 
                  key={type.value}
                  className={`cursor-pointer transition-all ${
                    assignmentType === type.value 
                      ? 'ring-2 ring-school-primary-red bg-school-primary-red/5' 
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setAssignmentType(type.value as any)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <type.icon className="h-5 w-5 text-gray-600" />
                      <div>
                        <p className="font-medium text-sm">{type.label}</p>
                        <p className="text-xs text-gray-500">{type.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Class Selection */}
          {assignmentType === 'BY_CLASS' && (
            <div className="space-y-2">
              <Label>Select Class *</Label>
              <Select 
                value={selectedClass} 
                onValueChange={setSelectedClass}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedClass && (
                <p className="text-sm text-gray-600">
                  {students.filter(s => s.currentClassId === selectedClass).length} students in this class
                </p>
              )}
            </div>
          )}

          {/* Fee Group Selection */}
          {assignmentType === 'BY_FEE_GROUP' && (
            <div className="space-y-2">
              <Label>Select Fee Group *</Label>
              <Select 
                value={selectedFeeGroup} 
                onValueChange={setSelectedFeeGroup}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a fee group" />
                </SelectTrigger>
                <SelectContent>
                  {feeGroups.map((group) => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedFeeGroup && (
                <p className="text-sm text-gray-600">
                  {students.filter(s => s.feeGroupId === selectedFeeGroup).length} students in this group
                </p>
              )}
            </div>
          )}

          {/* Individual Student Selection */}
          {assignmentType === 'INDIVIDUAL' && (
            <div className="space-y-2">
              <Label>Select Students *</Label>
              <div className="max-h-60 overflow-y-auto border rounded-lg p-4">
                <div className="space-y-3">
                  {filteredStudents.map((student) => (
                    <div key={student.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={student.id}
                        checked={selectedStudents.includes(student.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedStudents([...selectedStudents, student.id])
                          } else {
                            setSelectedStudents(selectedStudents.filter(id => id !== student.id))
                          }
                        }}
                        disabled={isLoading}
                      />
                      <Label htmlFor={student.id} className="flex-1 cursor-pointer">
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="font-medium">
                              {student.firstName} {student.lastName}
                            </span>
                            <span className="text-sm text-gray-500 ml-2">
                              {student.admissionNumber}
                            </span>
                          </div>
                          <div className="text-sm text-gray-500">
                            {student.currentClass.name}
                            {student.feeGroup && ` • ${student.feeGroup.name}`}
                          </div>
                        </div>
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-sm text-gray-600">
                {selectedStudents.length} students selected
              </p>
            </div>
          )}

          {/* Preview */}
          {selectedStructure && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Assignment Preview</h4>
              <div className="text-sm text-blue-800 space-y-1">
                <p><strong>Fee Structure:</strong> {selectedFeeStructure?.name}</p>
                <p><strong>Amount per student:</strong> KES {selectedFeeStructure ? parseFloat(selectedFeeStructure.amount.toString()).toLocaleString() : 0}</p>
                <p><strong>Target students:</strong> 
                  {assignmentType === 'ALL_STUDENTS' && ` All ${students.length} active students`}
                  {assignmentType === 'BY_CLASS' && selectedClass && ` ${students.filter(s => s.currentClassId === selectedClass).length} students in selected class`}
                  {assignmentType === 'BY_FEE_GROUP' && selectedFeeGroup && ` ${students.filter(s => s.feeGroupId === selectedFeeGroup).length} students in selected fee group`}
                  {assignmentType === 'INDIVIDUAL' && ` ${selectedStudents.length} selected students`}
                </p>
                <p><strong>Total amount:</strong> KES {selectedFeeStructure ? (
                  parseFloat(selectedFeeStructure.amount.toString()) * 
                  (assignmentType === 'ALL_STUDENTS' ? students.length :
                   assignmentType === 'BY_CLASS' && selectedClass ? students.filter(s => s.currentClassId === selectedClass).length :
                   assignmentType === 'BY_FEE_GROUP' && selectedFeeGroup ? students.filter(s => s.feeGroupId === selectedFeeGroup).length :
                   selectedStudents.length)
                ).toLocaleString() : 0}</p>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isLoading || !selectedStructure}
              className="bg-school-primary-red hover:bg-school-primary-red/90"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Assigning Fees...
                </>
              ) : (
                'Assign Fees to Students'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}