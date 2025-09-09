import { Suspense } from 'react'
import LoginForm from '@/components/auth/LoginForm'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-school-primary-blue/10 to-school-primary-red/5">
      <div className="w-full max-w-md p-6">
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center space-y-4 pb-8">
            {/* School Logo */}
            <div className="mx-auto w-16 h-16 bg-school-primary-red rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">SJ</span>
            </div>
            
            <div>
              <CardTitle className="text-2xl font-bold text-school-primary-red mb-2">
                ST. JOSEPH'S CENTRAL ACADEMY
              </CardTitle>
              <CardDescription className="text-base text-gray-600">
                Fee Management System
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="px-8 pb-8">
            <Suspense fallback={
              <div className="text-center py-4 text-gray-500">Loading...</div>
            }>
              <LoginForm />
            </Suspense>
          </CardContent>
        </Card>
        
        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Authorized personnel only
        </p>
      </div>
    </div>
  )
}