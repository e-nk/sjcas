import DashboardLayout from '@/components/layouts/DashboardLayout'
import NotificationTabs from '@/components/notifications/NotificationTabs'
import { getNotificationHistory } from '@/lib/actions/notifications'
import { getStudents } from '@/lib/actions/students'
import { getClasses } from '@/lib/actions/classes'
import { Suspense } from 'react'
import { Card, CardContent } from '@/components/ui/card'

function NotificationLoading() {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="h-6 bg-gray-200 rounded w-48 animate-pulse" />
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

async function NotificationContent() {
  const [notifications, students, classes] = await Promise.all([
    getNotificationHistory(),
    getStudents(),
    getClasses()
  ])
  
  return (
    <NotificationTabs 
      notifications={notifications}
      students={students}
      classes={classes}
    />
  )
}

export default async function NotificationsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600 mt-1">
            Send SMS and email notifications to parents and manage communication
          </p>
        </div>

        {/* Content */}
        <Suspense fallback={<NotificationLoading />}>
          <NotificationContent />
        </Suspense>
      </div>
    </DashboardLayout>
  )
}