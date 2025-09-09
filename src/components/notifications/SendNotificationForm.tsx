'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { sendCustomNotifications } from '@/lib/actions/notifications'
import { Search, Send, MessageCircle, Mail, Users, CheckCircle, AlertCircle } from 'lucide-react'

interface SendNotificationFormProps {
  students: any[]
  classes: any[]
}

export default function SendNotificationForm({ students, classes }: SendNotificationFormProps) {
  const [recipientType, setRecipientType] = useState<'students' | 'classes'>('students')
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])
  const [selectedClasses, setSelectedClasses] = useState<string[]>([])
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [sendSMS, setSendSMS] = useState(true)
  const [sendEmail, setSendEmail] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')

  // Filter students based on search
  const filteredStudents = students.filter(student =>
    `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.admissionNumber.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleStudentToggle = (studentId: string) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    )
  }

  const handleClassToggle = (classId: string) => {
    setSelectedClasses(prev => 
      prev.includes(classId) 
        ? prev.filter(id => id !== classId)
        : [...prev, classId]
    )
  }

  const handleSelectAllStudents = () => {
    if (selectedStudents.length === filteredStudents.length) {
      setSelectedStudents([])
    } else {
      setSelectedStudents(filteredStudents.map(s => s.id))
    }
  }

  const handleSelectAllClasses = () => {
    if (selectedClasses.length === classes.length) {
      setSelectedClasses([])
    } else {
      setSelectedClasses(classes.map(c => c.id))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!message.trim()) {
      setError('Message is required')
      return
    }

    if (!sendSMS && !sendEmail) {
      setError('Select at least one notification method (SMS or Email)')
      return
    }

    if (recipientType === 'students' && selectedStudents.length === 0) {
      setError('Select at least one student')
      return
    }

    if (recipientType === 'classes' && selectedClasses.length === 0) {
      setError('Select at least one class')
      return
    }

    setIsLoading(true)
    setError('')
    setResult(null)

    const notificationResult = await sendCustomNotifications({
      type: 'CUSTOM',
      studentIds: recipientType === 'students' ? selectedStudents : undefined,
      classIds: recipientType === 'classes' ? selectedClasses : undefined,
      message: message.trim(),
      subject: subject.trim() || 'Message from School',
      sendSMS,
      sendEmail
    })

    if (notificationResult.success) {
      setResult(notificationResult)
      // Reset form
      setMessage('')
      setSubject('')
      setSelectedStudents([])
      setSelectedClasses([])
    } else {
      setError(notificationResult.error || 'Failed to send notifications')
    }

    setIsLoading(false)
  }

  const getRecipientCount = () => {
    if (recipientType === 'students') {
      return selectedStudents.length
    } else {
      return selectedClasses.reduce((count, classId) => {
        const classData = classes.find(c => c.id === classId)
        return count + (classData?._count?.students || 0)
      }, 0)
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
              <p className="font-medium">Notifications sent successfully!</p>
              <p>Total notifications sent: {result.totalSent}</p>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Recipient Type */}
        <div className="space-y-4">
          <Label>Send to</Label>
          <div className="flex gap-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                value="students"
                checked={recipientType === 'students'}
                onChange={(e) => setRecipientType(e.target.value as 'students')}
                className="text-school-primary-red"
              />
              <span>Specific Students</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                value="classes"
                checked={recipientType === 'classes'}
                onChange={(e) => setRecipientType(e.target.value as 'classes')}
                className="text-school-primary-red"
              />
              <span>Entire Classes</span>
            </label>
          </div>
        </div>

        {/* Student Selection */}
        {recipientType === 'students' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>Select Students ({selectedStudents.length} selected)</Label>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={handleSelectAllStudents}
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
                      <p>No students found</p>
                    </div>
                  ) : (
                    filteredStudents.map((student) => (
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
                        <div className="flex-1">
                          <p className="font-medium">
                            {student.firstName} {student.lastName}
                          </p>
                          <p className="text-sm text-gray-500">
                            {student.admissionNumber} • {student.currentClass.name}
                          </p>
                          <div className="flex gap-2 mt-1">
                            {student.parentPhone && (
                              <Badge variant="outline" className="text-xs">SMS</Badge>
                            )}
                            {student.parentEmail && (
                              <Badge variant="outline" className="text-xs">Email</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Class Selection */}
        {recipientType === 'classes' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>Select Classes ({selectedClasses.length} selected)</Label>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={handleSelectAllClasses}
              >
                {selectedClasses.length === classes.length ? 'Deselect All' : 'Select All'}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {classes.map((cls) => (
                <div 
                  key={cls.id}
                  className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedClasses.includes(cls.id) 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                  onClick={() => handleClassToggle(cls.id)}
                >
                  <Checkbox 
                    checked={selectedClasses.includes(cls.id)}
                    onCheckedChange={() => handleClassToggle(cls.id)}
                  />
                  <div className="flex-1">
                    <p className="font-medium">{cls.name}</p>
                    <p className="text-sm text-gray-500">
                      {cls._count?.students || 0} students
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notification Methods */}
        <div className="space-y-4">
          <Label>Notification Methods</Label>
          <div className="flex gap-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <Checkbox 
                checked={sendSMS}
                onCheckedChange={(checked) => setSendSMS(checked === true)}
              />
              <MessageCircle className="h-4 w-4" />
              <span>Send SMS</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <Checkbox 
                checked={sendEmail}
                onCheckedChange={(checked) => setSendEmail(checked === true)}
              />
              <Mail className="h-4 w-4" />
              <span>Send Email</span>
            </label>
          </div>
        </div>

        {/* Subject (for email) */}
        {sendEmail && (
          <div className="space-y-2">
            <Label>Email Subject</Label>
            <Input
              placeholder="Enter email subject (optional)"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>
        )}

        {/* Message */}
        <div className="space-y-2">
          <Label>Message *</Label>
          <Textarea
            placeholder="Enter your message here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={6}
            required
          />
          <p className="text-xs text-gray-500">
            {sendSMS && `SMS: ${message.length}/160 characters`}
          </p>
        </div>

        {/* Preview */}
        {getRecipientCount() > 0 && message && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="space-y-2">
                <p className="font-medium text-blue-900">Preview</p>
                <p className="text-sm text-blue-800">
                  Recipients: {getRecipientCount()} parent(s)
                </p>
                <p className="text-sm text-blue-800">
                  Methods: {sendSMS ? 'SMS' : ''} {sendSMS && sendEmail ? '+ ' : ''} {sendEmail ? 'Email' : ''}
                </p>
                {sendEmail && subject && (
                  <p className="text-sm text-blue-800">
                    Subject: {subject}
                  </p>
                )}
                <div className="bg-white p-3 rounded border text-sm">
                  {message}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isLoading || !message.trim() || getRecipientCount() === 0 || (!sendSMS && !sendEmail)}
            className="bg-school-primary-red hover:bg-school-primary-red/90"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send to {getRecipientCount()} Recipients
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}