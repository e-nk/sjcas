'use client'

import { useCallback, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { bulkPromoteClass } from '@/lib/actions/promotions'
import { Users, GraduationCap, ArrowRight, CheckCircle, AlertCircle, Search } from 'lucide-react'

interface BulkPromotionFormProps {
  classes: any[]
}

export default function BulkPromotionForm({ classes }: BulkPromotionFormProps) {
  const [fromClassId, setFromClassId] = useState('')
  const [toClassId, setToClassId] = useState('')
  const [newAcademicYear, setNewAcademicYear] = useState(new Date().getFullYear() + 1)
  const [isGraduation, setIsGraduation] = useState(false)
  const [promoteAll, setPromoteAll] = useState(true)
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])
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
			setSelectedStudents(prev => prev.filter(id => !currentFiltered.includes(id)))
		} else {
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

		const handlePromoteAllChange = (checked: boolean) => {
			setPromoteAll(checked)
			if (checked) {
				setSelectedStudents([])
			}
		}

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!fromClassId || !newAcademicYear) {
      setError('Please select source class and academic year')
      return
    }

    if (!isGraduation && !toClassId) {
      setError('Please select target class or mark as graduation')
      return
    }

    if (!promoteAll && selectedStudents.length === 0) {
      setError('Please select students to promote')
      return
    }

    setIsLoading(true)
    setError('')
    setResult(null)

    const promotionResult = await bulkPromoteClass({
      fromClassId,
      toClassId: isGraduation ? null : toClassId,
      newAcademicYear,
      promoteAll,
      selectedStudents: promoteAll ? undefined : selectedStudents,
      notes
    })

    if (promotionResult.success) {
      setResult(promotionResult)
      // Reset form
      setSelectedStudents([])
      setNotes('')
      setSearchTerm('')
    } else {
      setError(promotionResult.error || 'Bulk promotion failed')
    }

    setIsLoading(false)
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
              <p className="font-medium">Bulk promotion completed!</p>
              <p>
                Successfully processed {result.summary.successful} of {result.summary.total} students
                {result.summary.failed > 0 && (
                  <span className="text-red-600 ml-2">
                    ({result.summary.failed} failed)
                  </span>
                )}
              </p>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Source Class */}
          <div className="space-y-2">
            <Label>From Class *</Label>
            <Select value={fromClassId} onValueChange={setFromClassId} required>
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
                onCheckedChange={(checked) => setIsGraduation(checked === true)}
              />
              <Label htmlFor="graduation" className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                Graduate entire class
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

        {/* Promotion Options */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="promoteAll" 
              checked={promoteAll}
              onCheckedChange={(checked) => setPromoteAll(checked === true)}
            />
            <Label htmlFor="promoteAll" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Promote all students in the class
            </Label>
          </div>

          {!promoteAll && fromClassId && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>Select Specific Students ({selectedStudents.length} selected)</Label>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={handleSelectAll}
                >
                  {selectedStudents.length === filteredStudents.length ? 'Deselect All' : 'Select All'}
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
                        <Users className="h-8 w-8 mx-auto mb-2" />
                        <p>No students found in this class</p>
                      </div>
                    ) : (
                      filteredStudents.map((student: any) => (
                        <div 
                          key={student.id}
                          className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                            selectedStudents.includes(student.id) 
                              ? 'border-blue-500 bg-blue-50' 
                              : 'border-gray-200 hover:bg-gray-50'
                          }`}
                          onClick={() => handleStudentToggle(student.id)}
                        >
                          <Checkbox 
                            checked={selectedStudents.includes(student.id)}
                            onCheckedChange={() => handleStudentToggle(student.id)}
                          />
                          <Users className="h-4 w-4 text-gray-400" />
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
        </div>

        {/* Bulk Promotion Preview */}
        {fromClassId && (toClassId || isGraduation) && (
          <Card className="border-purple-200 bg-purple-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <Badge variant="outline">{fromClass?.name}</Badge>
                  <p className="text-xs text-gray-600 mt-1">Source Class</p>
                  <p className="text-xs font-medium text-purple-800">
                    {promoteAll ? fromClass?._count.students : selectedStudents.length} students
                  </p>
                </div>
                
                <ArrowRight className="h-5 w-5 text-purple-600" />
                
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
              
              <div className="mt-4 text-sm text-purple-800">
                <p className="font-medium">
                  Ready to {isGraduation ? 'graduate' : 'promote'} {
                    promoteAll ? `all ${fromClass?._count.students}` : selectedStudents.length
                  } student(s) from {fromClass?.name}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Notes */}
        <div className="space-y-2">
          <Label>Notes (Optional)</Label>
          <Textarea
            placeholder="Add any notes about this bulk promotion..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isLoading || !fromClassId || (!toClassId && !isGraduation) || (!promoteAll && selectedStudents.length === 0)}
            className="bg-school-primary-red hover:bg-school-primary-red/90"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing...
              </>
            ) : (
              <>
                <Users className="h-4 w-4 mr-2" />
                Bulk {isGraduation ? 'Graduate' : 'Promote'} Class
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}