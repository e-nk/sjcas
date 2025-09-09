'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { sendFeeReminders } from '@/lib/actions/notifications'
import { Search, AlertTriangle, Send, DollarSign, CheckCircle, AlertCircle } from 'lucide-react'

interface FeeReminderFormProps {
  students: any[]
}

export default function FeeReminderForm({ students }: FeeReminderFormProps) {
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')

  // Filter students with outstanding fees
  const studentsWithOutstanding = students.filter(student => {
    const hasOutstanding = student.feeAssignments?.some((assignment: any) => 
      parseFloat(assignment.balance?.toString() || '0') > 0
    )
    const matchesSearch = searchTerm === '' || 
      `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.admissionNumber.toLowerCase().includes(searchTerm.toLowerCase())
    
    return hasOutstanding && matchesSearch
  })

  const handleStudentToggle = (studentId: string) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    )
  }

  const handleSelectAll = () => {
    if (selectedStudents.length === studentsWithOutstanding.length) {
      setSelectedStudents([])
    } else {
      setSelectedStudents(studentsWithOutstanding.map(s => s.id))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (selectedStudents.length === 0) {
      setError('Select at least one student to send reminders to')
      return
    }

    setIsLoading(true)
    setError('')
    setResult(null)

    const reminderResult = await sendFeeReminders(selectedStudents)

    if (reminderResult.success) {
      setResult(reminderResult)
      setSelectedStudents([])
    } else {
      setError(reminderResult.error || 'Failed to send fee reminders')
    }

    setIsLoading(false)
  }

  const calculateOutstanding = (student: any) => {
    return student.feeAssignments?.reduce((sum: number, assignment: any) => {
      return sum + parseFloat(assignment.balance?.toString() || '0')
    }, 0) || 0
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
              <p className="font-medium">Fee reminders sent successfully!</p>
              <p>Reminders sent to {result.results?.length || 0} parents</p>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Summary */}
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-orange-600" />
              <div>
                <p className="font-medium text-orange-900">
                  {studentsWithOutstanding.length} students have outstanding fees
                </p>
                <p className="text-sm text-orange-700">
                  Select students to send payment reminders to their parents
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search and Select All */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search students with outstanding fees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button 
            type="button" 
            variant="outline"
            onClick={handleSelectAll}
          >
            {selectedStudents.length === studentsWithOutstanding.length ? 'Deselect All' : 'Select All'}
            ({selectedStudents.length} selected)
          </Button>
        </div>

        {/* Students with Outstanding Fees Table */}
        <Card>
          <CardContent className="p-0">
            <div className="max-h-96 overflow-y-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-white">
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox 
                        checked={selectedStudents.length === studentsWithOutstanding.length && studentsWithOutstanding.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead className="text-right">Outstanding Amount</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Last Payment</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {studentsWithOutstanding.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="text-gray-500">
                          <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-300" />
                          <p className="font-medium">Great! No outstanding fees found</p>
                          <p className="text-sm">All students have paid their fees</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    studentsWithOutstanding.map((student) => {
                      const outstandingAmount = calculateOutstanding(student)
                      const lastPayment = student.payments?.[0]
                      
                      return (
                        <TableRow 
                          key={student.id}
                          className={selectedStudents.includes(student.id) ? 'bg-blue-50' : ''}
                        >
                          <TableCell>
                            <Checkbox 
                              checked={selectedStudents.includes(student.id)}
                              onCheckedChange={() => handleStudentToggle(student.id)}
                            />
                          </TableCell>
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
                            <Badge variant="outline">
                              {student.currentClass?.name || 'No Class'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <p className="font-mono font-bold text-red-600">
                              KES {outstandingAmount.toLocaleString()}
                            </p>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {student.parentPhone && (
                                <div className="flex items-center gap-1">
                                  <Badge variant="outline" className="text-xs">SMS</Badge>
                                  <span className="text-xs text-gray-500">{student.parentPhone}</span>
                                </div>
                              )}
                              {student.parentEmail && (
                                <div className="flex items-center gap-1">
                                  <Badge variant="outline" className="text-xs">Email</Badge>
                                  <span className="text-xs text-gray-500">{student.parentEmail}</span>
                                </div>
                              )}
                              {!student.parentPhone && !student.parentEmail && (
                                <span className="text-xs text-red-500">No contact info</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {lastPayment ? (
                              <div>
                                <p className="text-sm font-mono text-green-600">
                                  KES {parseFloat(lastPayment.amount.toString()).toLocaleString()}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {lastPayment.paidAt ? new Date(lastPayment.paidAt).toLocaleDateString() : 'No date'}
                                </p>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-400">No payments</span>
                            )}
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

        {/* Preview */}
        {selectedStudents.length > 0 && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="space-y-3">
                <p className="font-medium text-blue-900">Reminder Preview</p>
                <p className="text-sm text-blue-800">
                  Will send fee payment reminders to {selectedStudents.length} parent(s)
                </p>
                
                <div className="bg-white p-3 rounded border">
                  <p className="text-sm font-medium mb-2">SMS Message:</p>
                  <p className="text-xs text-gray-600">
                   "Fee Reminder: [Student Name] has outstanding fees of KES [Amount]. Pay via M-Pesa Paybill 174379, Account: [Admission Number]. - SJCAS"
                 </p>
               </div>
               
               <div className="bg-white p-3 rounded border">
                 <p className="text-sm font-medium mb-2">Email Subject:</p>
                 <p className="text-xs text-gray-600">
                   "Fee Payment Reminder - [Student Name]"
                 </p>
               </div>
             </div>
           </CardContent>
         </Card>
       )}

       {/* Submit Button */}
       <div className="flex justify-end">
         <Button
           type="submit"
           disabled={isLoading || selectedStudents.length === 0}
           className="bg-school-primary-red hover:bg-school-primary-red/90"
         >
           {isLoading ? (
             <>
               <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
               Sending Reminders...
             </>
           ) : (
             <>
               <Send className="h-4 w-4 mr-2" />
               Send Reminders to {selectedStudents.length} Parents
             </>
           )}
         </Button>
       </div>
     </form>
   </div>
 )
}