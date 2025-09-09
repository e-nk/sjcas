import DashboardLayout from '@/components/layouts/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getDashboardStats } from '@/lib/actions/reports'
import Link from 'next/link'
import { Users, DollarSign, CreditCard, AlertCircle, TrendingUp, FileText, Plus, Eye } from 'lucide-react'
import { Suspense } from 'react'

function DashboardLoading() {
  return (
    <div className="space-y-6">
      {/* Stats Loading */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
              <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-16 animate-pulse mb-2" />
              <div className="h-3 bg-gray-200 rounded w-32 animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions Loading */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="h-6 bg-gray-200 rounded w-32 animate-pulse" />
              <div className="space-y-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-4 bg-gray-200 rounded animate-pulse" />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="h-6 bg-gray-200 rounded w-32 animate-pulse" />
              <div className="h-20 bg-gray-200 rounded animate-pulse" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

async function DashboardContent() {
  const stats = await getDashboardStats()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Welcome back! Here's an overview of your fee management system.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Students
            </CardTitle>
            <div className="p-2 rounded-lg bg-blue-100">
              <Users className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.totalStudents}</div>
            <p className="text-xs text-gray-500 mt-1">
              {stats.activeStudents} active students
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Outstanding Fees
            </CardTitle>
            <div className="p-2 rounded-lg bg-red-100">
              <AlertCircle className="h-4 w-4 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              KES {stats.totalOutstanding.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {stats.pendingAssignments} pending assignments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Collected
            </CardTitle>
            <div className="p-2 rounded-lg bg-green-100">
              <DollarSign className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              KES {stats.totalPaid.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              All time collections
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Today's Payments
            </CardTitle>
            <div className="p-2 rounded-lg bg-purple-100">
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.todayPayments}</div>
            <p className="text-xs text-gray-500 mt-1">
              Payments received today
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Collection Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Collected:</span>
                <span className="font-medium text-green-600">
                  KES {stats.totalPaid.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Outstanding:</span>
                <span className="font-medium text-red-600">
                  KES {stats.totalOutstanding.toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${stats.totalPaid + stats.totalOutstanding > 0 
                      ? (stats.totalPaid / (stats.totalPaid + stats.totalOutstanding)) * 100 
                      : 0}%` 
                  }}
                />
              </div>
              <p className="text-xs text-gray-500 text-center mt-2">
                {stats.totalPaid + stats.totalOutstanding > 0 
                  ? Math.round((stats.totalPaid / (stats.totalPaid + stats.totalOutstanding)) * 100)
                  : 0}% collected
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Fee Structures</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Active Structures:</span>
                <Badge variant="outline">{stats.totalFeeStructures}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Assignments:</span>
                <Badge variant="outline">{stats.totalAssignments}</Badge>
              </div>
              <Link href="/fees/structures/add">
                <Button size="sm" className="w-full mt-3 bg-school-primary-red hover:bg-school-primary-red/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Fee Structure
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-sm">System Online</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-sm">Database Connected</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                <span className="text-sm">PDF Export: Coming Soon</span>
              </div>
              <div className="text-xs text-gray-500 mt-4">
                Last updated: {new Date().toLocaleTimeString()}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks to manage your school fees
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link href="/students/add">
                <Button variant="outline" className="w-full justify-start">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Student
                </Button>
              </Link>
              
              <Link href="/payments/record">
                <Button variant="outline" className="w-full justify-start">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Record Payment
                </Button>
              </Link>
              
              <Link href="/fees/assignments/bulk">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Assign Fees
                </Button>
              </Link>
              
              <Link href="/reports/outstanding">
                <Button variant="outline" className="w-full justify-start">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Outstanding Fees
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest system activity and alerts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.pendingAssignments > 0 && (
                <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-yellow-800">
                      {stats.pendingAssignments} pending fee assignments
                    </p>
                    <p className="text-xs text-yellow-600">
                      Students with outstanding balances
                    </p>
                  </div>
                  <Link href="/fees/assignments">
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </Link>
                </div>
              )}

              {stats.todayPayments > 0 && (
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-800">
                      {stats.todayPayments} payments received today
                    </p>
                    <p className="text-xs text-green-600">
                      Great job on collections!
                    </p>
                  </div>
                  <Link href="/payments">
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </Link>
                </div>
              )}

              {stats.totalFeeStructures === 0 && (
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-800">
                      Setup fee structures
                    </p>
                    <p className="text-xs text-blue-600">
                      Start by creating your first fee structure
                    </p>
                  </div>
                  <Link href="/fees/structures/add">
                    <Button size="sm" variant="outline">
                      <Plus className="h-4 w-4 mr-1" />
                      Create
                    </Button>
                  </Link>
                </div>
              )}

              {stats.totalStudents === 0 && (
                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                  <Users className="h-5 w-5 text-purple-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-purple-800">
                      Add your first students
                    </p>
                    <p className="text-xs text-purple-600">
                      Start by adding students to the system
                    </p>
                  </div>
                  <Link href="/students/add">
                    <Button size="sm" variant="outline">
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </Link>
                </div>
              )}

              {stats.totalStudents > 0 && stats.pendingAssignments === 0 && stats.todayPayments === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-sm">All caught up!</p>
                  <p className="text-xs">No pending actions at the moment.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <Suspense fallback={<DashboardLoading />}>
        <DashboardContent />
      </Suspense>
    </DashboardLayout>
  )
}