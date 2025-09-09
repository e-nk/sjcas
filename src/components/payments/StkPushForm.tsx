'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { initiateStkPush, checkStkPushStatus } from '@/lib/actions/mpesa'
import { Student, Class, FeeGroup, StkPushRequest, UnmatchedPayment } from '@prisma/client'
import { Smartphone, User, DollarSign, CheckCircle, AlertCircle, Send, Clock, Loader2 } from 'lucide-react'

type StudentWithDetails = Student & {
  currentClass: Class
  feeGroup: FeeGroup | null
}

interface StkPushFormProps {
  students: StudentWithDetails[]
}

export default function StkPushForm({ students }: StkPushFormProps) {
  const [selectedStudent, setSelectedStudent] = useState('')
  const [amount, setAmount] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  
  // Payment tracking state
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'pending' | 'completed' | 'failed' | 'expired'>('idle')
  const [checkoutRequestId, setCheckoutRequestId] = useState('')
  const [paymentDetails, setPaymentDetails] = useState<any>(null)

  // Filter students based on search
  const filteredStudents = students.filter(student =>
    `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.admissionNumber.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 10)

  const selectedStudentData = students.find(s => s.id === selectedStudent)

  // Poll for payment status
  useEffect(() => {
    if (paymentStatus === 'pending' && checkoutRequestId) {
      const pollInterval = setInterval(async () => {
        const result = await checkStkPushStatus(checkoutRequestId)
        
        if (result.success) {
          if (result.status === 'COMPLETED') {
            setPaymentStatus('completed')
            setPaymentDetails(result.payment)
            setSuccess(`Payment successful! KES ${result.payment?.amount.toLocaleString()} received from ${selectedStudentData?.firstName} ${selectedStudentData?.lastName}`)
            clearInterval(pollInterval)
          } else if (result.status === 'EXPIRED') {
            setPaymentStatus('expired')
            setError('Payment request expired. The user did not complete the payment within the time limit.')
            clearInterval(pollInterval)
          }
          // Continue polling if still pending
        }
      }, 2000) // Poll every 2 seconds

      // Clear interval after 5 minutes (maximum wait time)
      const timeoutId = setTimeout(() => {
        clearInterval(pollInterval)
        if (paymentStatus === 'pending') {
          setPaymentStatus('expired')
          setError('Payment request timed out. Please try again.')
        }
      }, 5 * 60 * 1000)

      return () => {
        clearInterval(pollInterval)
        clearTimeout(timeoutId)
      }
    }
  }, [paymentStatus, checkoutRequestId, selectedStudentData])

  const formatPhoneNumber = (phone: string) => {
    let cleaned = phone.replace(/\D/g, '')
    
    if (cleaned.startsWith('0')) {
      cleaned = '254' + cleaned.slice(1)
    } else if (cleaned.startsWith('+254')) {
      cleaned = cleaned.slice(1)
    } else if (cleaned.startsWith('254')) {
      // Already in correct format
    } else if (cleaned.length === 9) {
      cleaned = '254' + cleaned
    }
    
    return cleaned
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedStudent || !amount || !phoneNumber) {
      setError('Please fill in all required fields')
      return
    }

    const amountNum = parseFloat(amount)
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Please enter a valid amount')
      return
    }

    const formattedPhone = formatPhoneNumber(phoneNumber)
    if (formattedPhone.length !== 12) {
      setError('Please enter a valid phone number (e.g., 0712345678)')
      return
    }

    setIsLoading(true)
    setError('')
    setSuccess('')
    setPaymentStatus('idle')

    const result = await initiateStkPush(formattedPhone, amountNum, selectedStudent)
    
    if (result.success) {
      setSuccess('Payment request sent! Please check your phone and enter your M-Pesa PIN.')
      setPaymentStatus('pending')
      setCheckoutRequestId(result.checkoutRequestId || '')
    } else {
      setError(result.error || 'Failed to send STK Push')
      setPaymentStatus('failed')
    }
    
    setIsLoading(false)
  }

  const resetForm = () => {
    setAmount('')
    setPhoneNumber('')
    setSelectedStudent('')
    setSearchTerm('')
    setPaymentStatus('idle')
    setCheckoutRequestId('')
    setPaymentDetails(null)
    setError('')
    setSuccess('')
  }

  const getStatusIcon = () => {
    switch (paymentStatus) {
      case 'pending':
        return <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'failed':
      case 'expired':
        return <AlertCircle className="h-5 w-5 text-red-600" />
      default:
        return <Smartphone className="h-5 w-5 text-green-600" />
    }
  }

  const getStatusMessage = () => {
    switch (paymentStatus) {
      case 'pending':
        return 'Waiting for payment completion...'
      case 'completed':
        return 'Payment completed successfully!'
      case 'failed':
        return 'Payment request failed'
      case 'expired':
        return 'Payment request expired'
      default:
        return 'Send Payment Request (STK Push)'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getStatusIcon()}
          {getStatusMessage()}
        </CardTitle>
        <CardDescription>
          {paymentStatus === 'pending' 
            ? 'The parent should see a payment prompt on their phone'
            : 'Send an M-Pesa payment request directly to a parent\'s phone'
          }
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

        {/* Payment Status Display */}
        {paymentStatus === 'pending' && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-3">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              <div>
                <p className="font-medium text-blue-900">Payment in progress...</p>
                <p className="text-sm text-blue-700">
                  Waiting for {selectedStudentData?.firstName} {selectedStudentData?.lastName} to complete payment on their phone
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  This may take up to 5 minutes. Please wait...
                </p>
              </div>
            </div>
          </div>
        )}

        {paymentStatus === 'completed' && paymentDetails && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <div>
                <p className="font-medium text-green-900">Payment Successful!</p>
                <p className="text-sm text-green-700">
                  KES {parseFloat(paymentDetails.amount.toString()).toLocaleString()} received from {selectedStudentData?.firstName} {selectedStudentData?.lastName}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  Transaction ID: {paymentDetails.transactionId}
                </p>
                <Button 
                  size="sm" 
                  onClick={resetForm}
                  className="mt-2 bg-green-600 hover:bg-green-700"
                >
                  Send Another Payment Request
                </Button>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Student Selection */}
          <div className="space-y-2">
            <Label>Select Student *</Label>
            <Input
              placeholder="Search by name or admission number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mb-2"
              disabled={paymentStatus === 'pending'}
            />
            <Select 
              value={selectedStudent} 
              onValueChange={setSelectedStudent} 
              required
              disabled={paymentStatus === 'pending'}
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

            {selectedStudentData && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-2">
                <h4 className="font-medium text-blue-900 mb-2">Selected Student</h4>
                <div className="text-sm text-blue-800 space-y-1">
                  <p><strong>Name:</strong> {selectedStudentData.firstName} {selectedStudentData.lastName}</p>
                  <p><strong>Admission Number:</strong> {selectedStudentData.admissionNumber}</p>
                  <p><strong>Class:</strong> {selectedStudentData.currentClass.name}</p>
                  <p><strong>Parent:</strong> {selectedStudentData.parentName}</p>
                  <p><strong>Parent Phone:</strong> {selectedStudentData.parentPhone}</p>
                </div>
              </div>
            )}
          </div>

          {/* Phone Number */}
          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Parent's Phone Number *</Label>
            <Input
              id="phoneNumber"
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="0712345678 or +254712345678"
              required
              disabled={isLoading || paymentStatus === 'pending'}
            />
            {selectedStudentData && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPhoneNumber(selectedStudentData.parentPhone)}
                className="text-xs"
                disabled={paymentStatus === 'pending'}
              >
                Use registered phone: {selectedStudentData.parentPhone}
              </Button>
            )}
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (KES) *</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="amount"
                type="number"
                min="1"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                required
                disabled={isLoading || paymentStatus === 'pending'}
                className="pl-10"
              />
            </div>
          </div>

          {/* Preview */}
          {selectedStudent && phoneNumber && amount && paymentStatus !== 'pending' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-900 mb-2">Payment Request Preview</h4>
              <div className="text-sm text-green-800 space-y-1">
                <p><strong>Student:</strong> {selectedStudentData?.firstName} {selectedStudentData?.lastName}</p>
                <p><strong>Admission Number:</strong> {selectedStudentData?.admissionNumber}</p>
                <p><strong>Amount:</strong> KES {parseFloat(amount || '0').toLocaleString()}</p>
                <p><strong>Phone Number:</strong> {formatPhoneNumber(phoneNumber)}</p>
                <p className="text-xs text-green-600 mt-2">
                  The parent will receive a payment request on their phone. They need to enter their M-Pesa PIN to complete the payment.
                </p>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end">
            {paymentStatus === 'pending' ? (
              <Button disabled className="bg-blue-600">
                <Clock className="h-4 w-4 mr-2" />
                Waiting for Payment...
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isLoading || !selectedStudent || !amount || !phoneNumber}
                className="bg-green-600 hover:bg-green-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending STK Push...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Payment Request
                  </>
                )}
              </Button>
            )}
          </div>
        </form>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">How STK Push Works:</h4>
          <ol className="list-decimal list-inside text-sm text-blue-800 space-y-1">
            <li>You send a payment request to the parent's phone</li>
            <li>Parent receives an M-Pesa popup on their phone</li>
            <li>Parent enters their M-Pesa PIN to confirm payment</li>
            <li>Payment is automatically processed and allocated to student fees</li>
            <li>This page will automatically update when payment is complete</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  )
}