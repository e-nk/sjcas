import DashboardLayout from '@/components/layouts/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { FileText, Users, DollarSign, AlertCircle, BarChart3, TrendingUp } from 'lucide-react'

export default function ReportsPage() {
  const reports = [
    {
      title: 'Student Fee Statements',
      description: 'Generate detailed fee statements for individual students',
      icon: FileText,
      href: '/reports/student-statements',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Outstanding Fees Report',
      description: 'View all students with unpaid fee balances by class',
      icon: AlertCircle,
      href: '/reports/outstanding',
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    },
    {
      title: 'Fee Collection Report',
      description: 'Analyze payment collections by various criteria',
      icon: TrendingUp,
      href: '/reports/fee-collection',
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Class Summary Report',
      description: 'Summary of fees and payments by class',
      icon: Users,
      href: '/reports/class-summary',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Payment Analysis',
      description: 'Payment methods and trends analysis',
      icon: BarChart3,
      href: '/reports/payment-analysis',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    },
    {
      title: 'Financial Summary',
      description: 'Overall financial performance and statistics',
      icon: DollarSign,
      href: '/reports/financial-summary',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100'
    }
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-1">
            Generate comprehensive reports for fee management and analysis
          </p>
        </div>

        {/* Reports Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => (
            <Link key={report.href} href={report.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer group">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${report.bgColor}`}>
                      <report.icon className={`h-6 w-6 ${report.color}`} />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="group-hover:text-school-primary-red transition-colors">
                        {report.title}
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm">
                    {report.description}
                  </CardDescription>
                  
                  <div className="mt-4">
                    <Button variant="outline" size="sm" className="group-hover:bg-school-primary-red group-hover:text-white transition-colors">
                      Generate Report
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Available Reports</p>
                  <p className="text-2xl font-bold text-gray-900">6</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Report Categories</p>
                  <p className="text-2xl font-bold text-gray-900">3</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <BarChart3 className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Export Formats</p>
                  <p className="text-2xl font-bold text-gray-900">PDF, Excel</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Real-time Data</p>
                  <p className="text-2xl font-bold text-gray-900">Live</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}