import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Smartphone, TestTube, AlertCircle, CheckCircle, Phone, DollarSign } from 'lucide-react'

export default function MpesaTestInstructions() {
  return (
    <div className="space-y-6">
      {/* Test Status */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <TestTube className="h-5 w-5" />
            Sandbox Testing Mode
          </CardTitle>
          <CardDescription className="text-green-700">
            You're using M-Pesa sandbox environment for safe testing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-green-800">
            <p><strong>Environment:</strong> Sandbox</p>
            <p><strong>Paybill Number:</strong> 174379</p>
            <p><strong>Status:</strong> <Badge className="bg-green-600 text-white">Active</Badge></p>
          </div>
        </CardContent>
      </Card>

      {/* Test Phone Numbers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Test Phone Numbers
          </CardTitle>
          <CardDescription>
            Use these sandbox phone numbers to test STK Push
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="bg-gray-50 p-3 rounded">
              <p className="font-medium text-sm">Successful Payment:</p>
              <p className="text-lg font-mono">254708374149</p>
              <p className="text-xs text-gray-600">Use this number to simulate successful payments</p>
            </div>
            
            <div className="bg-red-50 p-3 rounded">
              <p className="font-medium text-sm">Failed Payment:</p>
              <p className="text-lg font-mono">254720231235</p>
              <p className="text-xs text-gray-600">Use this number to simulate failed payments</p>
            </div>
            
            <div className="bg-yellow-50 p-3 rounded">
              <p className="font-medium text-sm">Cancelled Payment:</p>
              <p className="text-lg font-mono">254712345678</p>
              <p className="text-xs text-gray-600">Use this number to simulate cancelled payments</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Testing Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Testing Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-3 text-sm">
            <li>
              <strong>Add a test student</strong> with the admission number you'll use
            </li>
            <li>
              <strong>Use STK Push form</strong> to send payment request
            </li>
            <li>
              <strong>Check the logs</strong> in your browser console for responses
            </li>
            <li>
              <strong>Verify payment processing</strong> in the payments section
            </li>
            <li>
              <strong>Check student account</strong> to see if fees were allocated
            </li>
          </ol>
        </CardContent>
      </Card>

      {/* Manual C2B Testing */}
      <Card>
        <CardHeader>
          <CardTitle>Manual Payment Testing</CardTitle>
          <CardDescription>
            You can also test C2B payments manually
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <p className="font-medium">To simulate a parent payment:</p>
            <ol className="list-decimal list-inside space-y-1 ml-4">
              <li>Use Safaricom's C2B simulator API</li>
              <li>Set paybill as <code className="bg-gray-100 px-1 rounded">174379</code></li>
              <li>Use a student's admission number as account reference</li>
              <li>Check if payment appears in your system</li>
            </ol>
            
            <Alert className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                In sandbox mode, you won't receive actual SMS notifications. 
                Monitor the browser console and database for transaction results.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>

      {/* Debugging Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Debugging Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
              <p>Check browser console for callback responses</p>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
              <p>Verify your callback URL is accessible from internet</p>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
              <p>Check server logs for M-Pesa webhook calls</p>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
              <p>Ensure students have outstanding fee assignments</p>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
              <p>Check unmatched payments if automatic matching fails</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}