import DashboardLayout from '@/components/layouts/DashboardLayout'
import SettingsForm from '@/components/forms/SettingsForm'
import SystemStatsCard from '@/components/settings/SystemStatsCard'
import DataManagementCard from '@/components/settings/DataManagementCard'
import { getSchoolSettings, getSystemStats } from '@/lib/actions/settings'
import { Suspense } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import MpesaSetupInstructions from '@/components/mpesa/SetupInstructions'

function SettingsLoading() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="h-6 bg-gray-200 rounded w-32 animate-pulse" />
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
                    <div className="h-10 bg-gray-100 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="space-y-6">
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
        </div>
      </div>
    </div>
  )
}

async function SettingsContent() {
  const [settings, systemStats] = await Promise.all([
    getSchoolSettings(),
    getSystemStats()
  ])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Settings Form */}
      <div>
        <SettingsForm settings={settings} />
      </div>

      {/* System Stats and Data Management */}
      <div className="space-y-6">
        <SystemStatsCard stats={systemStats} />
        <DataManagementCard />
      </div>
    </div>
  )
}

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">
            Manage system settings and configuration
          </p>
        </div>

        {/* Settings Content */}
        <Suspense fallback={<SettingsLoading />}>
          <SettingsContent />
					<div className="lg:col-span-2">
						<MpesaSetupInstructions />
					</div>
        </Suspense>
      </div>
    </DashboardLayout>
  )
}