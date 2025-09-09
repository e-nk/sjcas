import DashboardLayout from '@/components/layouts/DashboardLayout'
import PromotionTabs from '@/components/promotions/PromotionTabs'
import { getClassesForPromotion, getPromotionHistory, getPromotionStats } from '@/lib/actions/promotions'
import { Suspense } from 'react'
import { Card, CardContent } from '@/components/ui/card'

function PromotionLoading() {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="h-6 bg-gray-200 rounded w-48 animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-gray-100 rounded animate-pulse" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

async function PromotionContent() {
  const [classes, promotionHistory, stats] = await Promise.all([
    getClassesForPromotion(),
    getPromotionHistory(),
    getPromotionStats()
  ])
  
  return (
    <PromotionTabs 
      classes={classes} 
      promotionHistory={promotionHistory}
      stats={stats}
    />
  )
}

export default async function StudentPromotionsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Student Promotions</h1>
          <p className="text-gray-600 mt-1">
            Promote students to the next class or graduate them at the end of academic year
          </p>
        </div>

        {/* Content */}
        <Suspense fallback={<PromotionLoading />}>
          <PromotionContent />
        </Suspense>
      </div>
    </DashboardLayout>
  )
}