import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Database, Users, FileText, CreditCard, Server, Clock, HardDrive } from 'lucide-react'

interface SystemStatsCardProps {
  stats: {
    totalUsers: number
    totalStudents: number
    totalFeeStructures: number
    totalPayments: number
    databaseSize: string
    systemVersion: string
    lastBackup: string
    uptime: string
  }
}

export default function SystemStatsCard({ stats }: SystemStatsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Server className="h-5 w-5" />
          System Statistics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Users</p>
              <p className="font-semibold">{stats.totalUsers}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Students</p>
              <p className="font-semibold">{stats.totalStudents}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-purple-600" />
            <div>
              <p className="text-sm text-gray-600">Fee Structures</p>
              <p className="font-semibold">{stats.totalFeeStructures}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-orange-600" />
            <div>
              <p className="text-sm text-gray-600">Payments</p>
              <p className="font-semibold">{stats.totalPayments}</p>
            </div>
          </div>
        </div>

        <div className="border-t pt-4 space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-gray-600" />
              <span className="text-sm text-gray-600">Database Size</span>
            </div>
            <Badge variant="outline">{stats.databaseSize}</Badge>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <HardDrive className="h-4 w-4 text-gray-600" />
              <span className="text-sm text-gray-600">System Version</span>
            </div>
            <Badge variant="outline">v{stats.systemVersion}</Badge>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Server className="h-4 w-4 text-gray-600" />
              <span className="text-sm text-gray-600">Uptime</span>
            </div>
            <Badge className="bg-green-100 text-green-800">{stats.uptime}</Badge>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-600" />
              <span className="text-sm text-gray-600">Last Backup</span>
            </div>
            <span className="text-xs text-gray-500">
              {new Date(stats.lastBackup).toLocaleDateString()}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}