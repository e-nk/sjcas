'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import SendNotificationForm from './SendNotificationForm'
import FeeReminderForm from './FeeReminderForm'
import NotificationHistory from './NotificationHistory'
import NotificationStats from './NotificationStats'

interface NotificationTabsProps {
  notifications: any[]
  students: any[]
  classes: any[]
}

export default function NotificationTabs({ notifications, students, classes }: NotificationTabsProps) {
  return (
    <Tabs defaultValue="send" className="space-y-6">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="send">Send Message</TabsTrigger>
        <TabsTrigger value="reminders">Fee Reminders</TabsTrigger>
        <TabsTrigger value="history">History</TabsTrigger>
        <TabsTrigger value="stats">Statistics</TabsTrigger>
      </TabsList>

      <TabsContent value="send">
        <Card>
          <CardHeader>
            <CardTitle>Send Custom Notification</CardTitle>
            <CardDescription>
              Send SMS and email notifications to parents of selected students or classes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SendNotificationForm students={students} classes={classes} />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="reminders">
        <Card>
          <CardHeader>
            <CardTitle>Fee Payment Reminders</CardTitle>
            <CardDescription>
              Send automated fee reminders to parents with outstanding balances
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FeeReminderForm students={students} />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="history">
        <NotificationHistory notifications={notifications} />
      </TabsContent>

      <TabsContent value="stats">
        <NotificationStats notifications={notifications} />
      </TabsContent>
    </Tabs>
  )
}