import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MessageCircle, Mail, TrendingUp, Users, CheckCircle, AlertTriangle } from 'lucide-react'

interface NotificationStatsProps {
  notifications: any[]
}

export default function NotificationStats({ notifications }: NotificationStatsProps) {
  // Calculate statistics
  const totalNotifications = notifications.length
  const sentNotifications = notifications.filter(n => n.status === 'SENT' || n.status === 'DELIVERED').length
  const failedNotifications = notifications.filter(n => n.status === 'FAILED').length
  const pendingNotifications = notifications.filter(n => n.status === 'PENDING').length

  // Calculate by type
  const byType = notifications.reduce((acc, notification) => {
    acc[notification.type] = (acc[notification.type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Calculate success rate
  const successRate = totalNotifications > 0 ? Math.round((sentNotifications / totalNotifications) * 100) : 0

  // Recent activity (last 7 days)
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const recentNotifications = notifications.filter(n => new Date(n.createdAt) >= sevenDaysAgo)

  // Daily activity (last 7 days)
  const dailyActivity = notifications
    .filter(n => new Date(n.createdAt) >= sevenDaysAgo)
    .reduce((acc, notification) => {
      const date = new Date(notification.createdAt).toLocaleDateString()
      acc[date] = (acc[date] || 0) + 1
      return acc
    }, {} as Record<string, number>)

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'PAYMENT_CONFIRMATION':
        return 'Payment Confirmations'
      case 'FEE_REMINDER':
        return 'Fee Reminders'
      case 'ASSIGNMENT_NOTIFICATION':
        return 'Assignment Notifications'
      case 'CUSTOM':
        return 'Custom Messages'
      default:
        return type
    }
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <MessageCircle className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Notifications</p>
                <p className="text-2xl font-bold text-blue-600">{totalNotifications}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Successfully Sent</p>
                <p className="text-2xl font-bold text-green-600">{sentNotifications}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Failed</p>
                <p className="text-2xl font-bold text-red-600">{failedNotifications}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-purple-600">{successRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notifications by Type */}
      <Card>
        <CardHeader>
          <CardTitle>Notifications by Type</CardTitle>
          <CardDescription>Breakdown of notification types sent</CardDescription>
        </CardHeader>
        <CardContent>
          {Object.keys(byType).length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No notifications sent yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(byType).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">{getTypeLabel(type)}</p>
                    <p className="text-sm text-gray-600">{String(count)} notifications</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="text-lg px-3 py-1">
                      {String(count)}
                    </Badge>
                    <p className="text-xs text-gray-500 mt-1">
                      {totalNotifications > 0 ? Math.round((count / totalNotifications) * 100) : 0}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity (Last 7 Days)</CardTitle>
          <CardDescription>
            {recentNotifications.length} notifications sent in the past week
          </CardDescription>
        </CardHeader>
        <CardContent>
          {Object.keys(dailyActivity).length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No recent activity</p>
            </div>
          ) : (
            <div className="space-y-3">
              {Object.entries(dailyActivity)
                .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
                .map(([date, count]) => (
                  <div key={date} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                    <span className="font-medium">{date}</span>
                    <Badge variant="outline">
                      {count} notification{count !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notification Methods */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              SMS Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Total SMS Sent:</span>
                <Badge variant="outline">
                  {notifications.filter(n => n.smsId).length}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Success Rate:</span>
                <Badge className="bg-green-100 text-green-800">
                  {notifications.filter(n => n.smsId).length > 0 
                    ? Math.round((notifications.filter(n => n.smsId && (n.status === 'SENT' || n.status === 'DELIVERED')).length / notifications.filter(n => n.smsId).length) * 100)
                    : 0}%
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Total Emails Sent:</span>
                <Badge variant="outline">
                  {notifications.filter(n => n.emailId).length}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Success Rate:</span>
                <Badge className="bg-green-100 text-green-800">
                  {notifications.filter(n => n.emailId).length > 0 
                    ? Math.round((notifications.filter(n => n.emailId && (n.status === 'SENT' || n.status === 'DELIVERED')).length / notifications.filter(n => n.emailId).length) * 100)
                    : 0}%
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Service Status */}
      <Card>
        <CardHeader>
          <CardTitle>Service Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium">SMS Service (Tiara Connect)</h4>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Service Active</span>
              </div>
              <p className="text-xs text-gray-600">
                Connected to Tiara Connect SMS gateway
              </p>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium">Email Service (Resend)</h4>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Service Active</span>
              </div>
              <p className="text-xs text-gray-600">
                Connected to Resend email service
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}