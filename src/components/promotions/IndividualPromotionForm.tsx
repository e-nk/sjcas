'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { promoteStudents } from '@/lib/actions/promotions'
import { Search, User, GraduationCap, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react'

interface IndividualPromotionFormProps {
  classes: any[]
}

export default function IndividualPromotionForm({ classes }: IndividualPromotionFormProps) {
  const [fromClassId, setFromClassId] = useState('')
  const [toClassId, setToClassId] = useState('')
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])
  const [newAcademicYear, setNewAcademicYear] = useState(new Date().getFullYear() + 1)
  const [isGraduation, setIsGraduation] = useState(false)
  const [notes, setNotes] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')

  const fromClass = classes.find(c => c.id === fromClassId)
  const availableStudents = fromClass?.students || []
  
  // Filter students based on search
  const filteredStudents = availableStudents.filter((student: any) =>
    `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.admissionNumber.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Get target classes (exclude source class)
  const targetClasses = classes.filter(c => c.id !== fromClassId)

  // Use useCallback to prevent infinite rerenders
  const handleStudentToggle = useCallback((studentId: string) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    )
  }, [])

  const handleSelectAll = useCallback(() => {
    const currentFiltered = filteredStudents.map((s: any) => s.id)
    const allSelected = currentFiltered.every((id: string) => selectedStudents.includes(id))
    
    if (allSelected) {
      // Remove all filtered students from selection
      setSelectedStudents(prev => prev.filter(id => !currentFiltered.includes(id)))
    } else {
      // Add all filtered students to selection
      setSelectedStudents(prev => {
        const newSelection = [...prev]
        currentFiltered.forEach((id: string) => {
          if (!newSelection.includes(id)) {
            newSelection.push(id)
          }
        })
        return newSelection
      })
    }
  }, [filteredStudents, selectedStudents])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!fromClassId || selectedStudents.length === 0 || !newAcademicYear) {
      setError('Please select source class, students, and academic year')
      return
    }

    if (!isGraduation && !toClassId) {
      setError('Please select target class or mark as graduation')
      return
    }

    setIsLoading(true)
    setError('')
    setResult(null)

    const promotionResult = await promoteStudents({
      fromClassId,
      toClassId: isGraduation ? '' : toClassId,
      studentIds: selectedStudents,
      newAcademicYear,
      graduateStudents: isGraduation,
      notes
    })

    if (promotionResult.success) {
      setResult(promotionResult)
      // Reset form
      setSelectedStudents([])
      setNotes('')
      setSearchTerm('')
    } else {
      setError(promotionResult.error || 'Promotion failed')
    }

    setIsLoading(false)
  }

  // Reset selected students when class changes
  const handleFromClassChange = (classId: string) => {
    setFromClassId(classId)
    setSelectedStudents([])
    setSearchTerm('')
  }

  const handleIsGraduationChange = (checked: boolean) => {
    setIsGraduation(checked)
    if (checked) {
      setToClassId('')
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {result && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription className="text-green-800">
            <div className="space-y-2">
              <p className="font-medium">Promotion completed!</p>
              <p>
                Successfully promoted {result.summary.successful} of {result.summary.total} students
                {result.summary.failed > 0 && (
                  <span className="text-red-600 ml-2">
                    ({result.summary.failed} failed)
                  </span>
                )}
              </p>
              {result.results.filter((r: any) => r.success).map((r: any) => (
                <p key={r.studentId} className="text-sm">
                  ✓ {r.studentName} {isGraduation ? 'graduated' : 'promoted'}
                </p>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Source Class */}
          <div className="space-y-2">
            <Label>From Class *</Label>
            <Select value={fromClassId} onValueChange={handleFromClassChange} required>
              <SelectTrigger>
                <SelectValue placeholder="Select source class" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id}>
                    <div className="flex items-center gap-2">
                      <span>{cls.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {cls._count.students} students
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Graduation Toggle */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="graduation" 
                checked={isGraduation}
                onCheckedChange={handleIsGraduationChange}
              />
              <Label htmlFor="graduation" className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                Graduate students (no target class needed)
              </Label>
            </div>

            {!isGraduation && (
              <div className="space-y-2">
                <Label>To Class *</Label>
                <Select value={toClassId} onValueChange={setToClassId} required={!isGraduation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select target class" />
                  </SelectTrigger>
                  <SelectContent>
                    {targetClasses.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>

        {/* Academic Year */}
        <div className="space-y-2">
          <Label>New Academic Year *</Label>
          <Input
            type="number"
            value={newAcademicYear}
            onChange={(e) => setNewAcademicYear(parseInt(e.target.value))}
            min={new Date().getFullYear()}
            max={new Date().getFullYear() + 5}
            required
          />
        </div>

        {/* Student Selection */}
        {fromClassId && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>Select Students ({selectedStudents.length} selected)</Label>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={handleSelectAll}
              >
                Select All Visible
              </Button>
            </div>

            {/* Search Students */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Students List */}
            <Card>
              <CardContent className="p-4">
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {filteredStudents.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <User className="h-8 w-8 mx-auto mb-2" />
                      <p>No students found</p>
                    </div>
                  ) : (
                    filteredStudents.map((student: any) => (
                      <div 
                        key={student.id}
                        className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
                          selectedStudents.includes(student.id) 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200'
                        }`}
                      >
                        <Checkbox 
                          checked={selectedStudents.includes(student.id)}
                          onCheckedChange={() => handleStudentToggle(student.id)}
                        />
                        <User className="h-4 w-4 text-gray-400" />
                        <div className="flex-1">
                          <p className="font-medium">
                            {student.firstName} {student.lastName}
                          </p>
                          <p className="text-sm text-gray-500">
                            {student.admissionNumber}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Promotion Preview */}
        {selectedStudents.length > 0 && fromClassId && (toClassId || isGraduation) && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <Badge variant="outline">{fromClass?.name}</Badge>
                  <p className="text-xs text-gray-600 mt-1">Current Class</p>
                </div>
                
                <ArrowRight className="h-5 w-5 text-blue-600" />
                
                <div className="text-center">
                  {isGraduation ? (
                    <>
                      <Badge className="bg-green-600">
                        <GraduationCap className="h-3 w-3 mr-1" />
                        Graduated
                      </Badge>
                      <p className="text-xs text-gray-600 mt-1">Final Status</p>
                    </>
                  ) : (
                    <>
                      <Badge variant="outline">
                        {targetClasses.find(c => c.id === toClassId)?.name}
                      </Badge>
                      <p className="text-xs text-gray-600 mt-1">Target Class</p>
                    </>
                  )}
                </div>
                
                <div className="text-center ml-auto">
                  <Badge className="bg-purple-100 text-purple-800">{newAcademicYear}</Badge>
                  <p className="text-xs text-gray-600 mt-1">Academic Year</p>
                </div>
              </div>
              
              <div className="mt-4 text-sm text-blue-800">
                <p className="font-medium">
                  Ready to {isGraduation ? 'graduate' : 'promote'} {selectedStudents.length} student(s)
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Notes */}
        <div className="space-y-2">
          <Label>Notes (Optional)</Label>
          <Textarea
            placeholder="Add any notes about this promotion..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isLoading || selectedStudents.length === 0 || !fromClassId || (!toClassId && !isGraduation)}
            className="bg-school-primary-red hover:bg-school-primary-red/90"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing...
              </>
            ) : (
              <>
                {isGraduation ? (
                  <GraduationCap className="h-4 w-4 mr-2" />
                ) : (
                  <ArrowRight className="h-4 w-4 mr-2" />
                )}
                {isGraduation ? 'Graduate Students' : 'Promote Students'}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}