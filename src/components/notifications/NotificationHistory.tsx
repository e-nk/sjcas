'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Search, MessageCircle, Mail, History, CheckCircle, XCircle, Clock } from 'lucide-react'

interface NotificationHistoryProps {
  notifications: any[]
}

export default function NotificationHistory({ notifications }: NotificationHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = searchTerm === '' || 
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (notification.student && 
        `${notification.student.firstName} ${notification.student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
      )
    
    const matchesType = selectedType === 'all' || notification.type === selectedType
    const matchesStatus = selectedStatus === 'all' || notification.status === selectedStatus
    
    return matchesSearch && matchesType && matchesStatus
  })

  // Get unique types and statuses
  const notificationTypes = [...new Set(notifications.map(n => n.type))]
  const notificationStatuses = [...new Set(notifications.map(n => n.status))]

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'PAYMENT_CONFIRMATION':
        return <Badge className="bg-green-100 text-green-800">Payment Confirmation</Badge>
      case 'FEE_REMINDER':
        return <Badge className="bg-yellow-100 text-yellow-800">Fee Reminder</Badge>
      case 'ASSIGNMENT_NOTIFICATION':
        return <Badge className="bg-blue-100 text-blue-800">Fee Assignment</Badge>
      case 'CUSTOM':
        return <Badge className="bg-purple-100 text-purple-800">Custom Message</Badge>
      default:
        return <Badge variant="secondary">{type}</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SENT':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'DELIVERED':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'FAILED':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'PENDING':
        return <Clock className="h-4 w-4 text-yellow-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Notification History
        </CardTitle>
        <CardDescription>
          Complete record of all SMS and email notifications sent
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm min-w-[150px]"
          >
            <option value="all">All Types</option>
            {notificationTypes.map((type) => (
              <option key={type} value={type}>
                {type.replace('_', ' ')}
              </option>
            ))}
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm min-w-[120px]"
          >
            <option value="all">All Status</option>
            {notificationStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        {/* Results count */}
        <p className="text-sm text-gray-600 mb-4">
          Showing {filteredNotifications.length} of {notifications.length} notifications
        </p>

        {/* Notifications Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredNotifications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="text-gray-500">
                      <History className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p className="font-medium">No notifications found</p>
                      <p className="text-sm">
                        {searchTerm || selectedType !== 'all' || selectedStatus !== 'all'
                          ? 'Try adjusting your search or filter criteria' 
                          : 'Start sending notifications to see history here'
                        }
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredNotifications.map((notification) => (
                  <TableRow key={notification.id}>
                    <TableCell>
                      <div className="text-sm">
                        <p>{new Date(notification.createdAt).toLocaleDateString()}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(notification.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {notification.student ? (
                        <div>
                          <p className="font-medium text-sm">
                            {notification.student.firstName} {notification.student.lastName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {notification.student.admissionNumber}
                          </p>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">Bulk notification</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {getTypeBadge(notification.type)}
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-sm">{notification.title}</p>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        <p className="text-sm text-gray-600 truncate" title={notification.message}>
                          {notification.message}
                        </p>
                        {notification.smsId && (
                          <div className="flex items-center gap-1 mt-1">
                            <MessageCircle className="h-3 w-3 text-blue-600" />
                            <span className="text-xs text-blue-600">SMS</span>
                          </div>
                        )}
                        {notification.emailId && (
                          <div className="flex items-center gap-1 mt-1">
                            <Mail className="h-3 w-3 text-green-600" />
                            <span className="text-xs text-green-600">Email</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(notification.status)}
                        <span className="text-sm">{notification.status}</span>
                      </div>
                      {notification.sentAt && (
                        <p className="text-xs text-gray-500 mt-1">
                          Sent: {new Date(notification.sentAt).toLocaleTimeString()}
                        </p>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}