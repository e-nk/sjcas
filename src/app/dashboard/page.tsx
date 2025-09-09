import DashboardLayout from '@/components/layouts/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, DollarSign, CreditCard, AlertCircle } from 'lucide-react'

// Mock data - we'll replace with real data later
const stats = [
  {
    title: 'Total Students',
    value: '0',
    description: 'Active students enrolled',
    icon: Users,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  {
    title: 'Total Fees Due',
    value: 'KES 0',
    description: 'Outstanding fee balance',
    icon: DollarSign,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  {
    title: 'Payments Today',
    value: 'KES 0',
    description: 'Received today',
    icon: CreditCard,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
  },
  {
    title: 'Pending Issues',
    value: '0',
    description: 'Unmatched payments',
    icon: AlertCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
  },
]

export default function DashboardPage() {
  return (
    <DashboardLayout>
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
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common tasks to get you started
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium">Getting Started</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Set up fee groups (Day Scholar, Boarder)</li>
                  <li>• Create fee structures for current term</li>
                  <li>• Add students to the system</li>
                  <li>• Assign fees to students</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest system activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <p>No activity yet</p>
                <p className="text-sm">Start by adding students and fee structures</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}