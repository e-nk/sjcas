'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import IndividualPromotionForm from './IndividualPromotionForm'
import BulkPromotionForm from './BulkPromotionForm'
import PromotionHistory from './PromotionHistory'
import PromotionStats from './PromotionStats'

interface PromotionTabsProps {
  classes: any[]
  promotionHistory: any[]
  stats: any
}

export default function PromotionTabs({ classes, promotionHistory, stats }: PromotionTabsProps) {
  return (
    <Tabs defaultValue="individual" className="space-y-6">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="individual">Individual</TabsTrigger>
        <TabsTrigger value="bulk">Bulk Promotion</TabsTrigger>
        <TabsTrigger value="history">History</TabsTrigger>
        <TabsTrigger value="stats">Statistics</TabsTrigger>
      </TabsList>

      <TabsContent value="individual">
        <Card>
          <CardHeader>
            <CardTitle>Individual Student Promotion</CardTitle>
            <CardDescription>
              Promote selected students to the next class or graduate them
            </CardDescription>
          </CardHeader>
          <CardContent>
            <IndividualPromotionForm classes={classes} />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="bulk">
        <Card>
          <CardHeader>
            <CardTitle>Bulk Class Promotion</CardTitle>
            <CardDescription>
              Promote entire classes or selected students in bulk
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BulkPromotionForm classes={classes} />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="history">
        <PromotionHistory promotions={promotionHistory} />
      </TabsContent>

      <TabsContent value="stats">
        <PromotionStats stats={stats} />
      </TabsContent>
    </Tabs>
  )
}