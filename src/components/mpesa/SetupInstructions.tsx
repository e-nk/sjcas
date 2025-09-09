import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, AlertCircle, Settings, Smartphone, Globe } from 'lucide-react'

export default function MpesaSetupInstructions() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-green-600" />
            M-Pesa Integration Setup
          </CardTitle>
          <CardDescription>
            Follow these steps to enable automatic M-Pesa payment processing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Status */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <h4 className="font-medium text-yellow-800">Integration Status</h4>
            </div>
            <p className="text-sm text-yellow-700">
              M-Pesa integration is set up but requires configuration with your M-Pesa credentials.
            </p>
          </div>

          {/* Setup Steps */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Setup Steps
            </h4>
            
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                  1
                </div>
                <div>
                  <p className="font-medium">Get M-Pesa API Credentials</p>
                  <p className="text-sm text-gray-600">
                    Visit <strong>developer.safaricom.co.ke</strong> and create an app to get your Consumer Key and Consumer Secret.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                  2
                </div>
                <div>
                  <p className="font-medium">Configure Environment Variables</p>
                  <p className="text-sm text-gray-600">
                    Add your M-Pesa credentials to your <code className="bg-gray-100 px-1 rounded">.env</code> file.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                  3
                </div>
                <div>
                  <p className="font-medium">Setup Paybill Number</p>
                  <p className="text-sm text-gray-600">
                    Configure your school's paybill number in the M-Pesa developer portal.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                  4
                </div>
                <div>
                  <p className="font-medium">Configure Callback URLs</p>
                  <p className="text-sm text-gray-600">
                    Set up callback URLs in M-Pesa portal to point to your domain.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium">Test Integration</p>
                  <p className="text-sm text-gray-600">
                    Use M-Pesa sandbox to test payments before going live.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Environment Variables */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h5 className="font-medium mb-2">Required Environment Variables:</h5>
            <pre className="text-xs text-gray-600 bg-white p-2 rounded border">
{`MPESA_CONSUMER_KEY=your_consumer_key_here
MPESA_CONSUMER_SECRET=your_consumer_secret_here
MPESA_ENVIRONMENT=sandbox
MPESA_PAYBILL_NUMBER=174379
MPESA_PASSKEY=your_passkey_here
MPESA_CALLBACK_URL=https://yourdomain.com/api/mpesa`}
            </pre>
          </div>

          {/* How It Works */}
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <Globe className="h-4 w-4" />
              How It Works for Parents
            </h4>
            <div className="bg-green-50 p-4 rounded-lg">
              <ol className="list-decimal list-inside space-y-2 text-sm text-green-800">
                <li>Parent goes to M-Pesa menu on their phone</li>
                <li>Selects "Pay Bill" option</li>
                <li>Enters your school's paybill number</li>
                <li>Enters their child's <strong>admission number</strong> as account number</li>
                <li>Enters the amount to pay</li>
                <li>Confirms payment</li>
                <li>Payment automatically appears in student's account</li>
              </ol>
            </div>
          </div>

          {/* Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h5 className="font-medium text-green-600 mb-2">Benefits</h5>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Automatic payment processing</li>
                <li>• Real-time payment notifications</li>
                <li>• Reduced manual data entry</li>
                <li>• Instant fee allocation</li>
                <li>• Overpayment handling as credits</li>
              </ul>
            </div>
            
            <div>
              <h5 className="font-medium text-blue-600 mb-2">Features</h5>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Unmatched payment management</li>
                <li>• Student ledger auto-updates</li>
                <li>• Parent SMS confirmations</li>
                <li>• Admin payment notifications</li>
                <li>• Comprehensive audit trail</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}