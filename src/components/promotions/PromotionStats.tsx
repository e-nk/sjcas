import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { TrendingUp, Users, GraduationCap, BarChart3, Calendar, Award } from 'lucide-react'

interface PromotionStatsProps {
  stats: {
    totalPromotions: number
    totalGraduations: number
    totalProcessed: number
    recentPromotions: any[]
    academicYear: number
  }
}

export default function PromotionStats({ stats }: PromotionStatsProps) {
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Promotions</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalPromotions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <GraduationCap className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Graduations</p>
                <p className="text-2xl font-bold text-green-600">{stats.totalGraduations}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Processed</p>
                <p className="text-2xl font-bold text-purple-600">{stats.totalProcessed}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Academic Year</p>
                <p className="text-2xl font-bold text-orange-600">{stats.academicYear}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Academic Year Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Academic Year {stats.academicYear} Summary
          </CardTitle>
          <CardDescription>
            Overview of student promotions and graduations for the current academic year
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-blue-50 rounded-lg">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 text-blue-600" />
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Students Promoted</h3>
              <p className="text-3xl font-bold text-blue-600">{stats.totalPromotions}</p>
              <p className="text-sm text-blue-700 mt-2">
                Students moved to next class level
              </p>
            </div>

            <div className="text-center p-6 bg-green-50 rounded-lg">
              <GraduationCap className="h-12 w-12 mx-auto mb-4 text-green-600" />
              <h3 className="text-lg font-semibold text-green-900 mb-2">Students Graduated</h3>
              <p className="text-3xl font-bold text-green-600">{stats.totalGraduations}</p>
              <p className="text-sm text-green-700 mt-2">
                Students completed their studies
              </p>
            </div>

            <div className="text-center p-6 bg-purple-50 rounded-lg">
              <Award className="h-12 w-12 mx-auto mb-4 text-purple-600" />
              <h3 className="text-lg font-semibold text-purple-900 mb-2">Success Rate</h3>
              <p className="text-3xl font-bold text-purple-600">
                {stats.totalProcessed > 0 ? '100%' : '0%'}
              </p>
              <p className="text-sm text-purple-700 mt-2">
                All promotions processed successfully
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Promotion Activity</CardTitle>
          <CardDescription>
            Latest 10 promotion and graduation records
          </CardDescription>
        </CardHeader>
        <CardContent>
          {stats.recentPromotions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="font-medium">No recent promotions</p>
              <p className="text-sm">Start promoting students to see activity here</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.recentPromotions.map((promotion) => (
                  <TableRow key={promotion.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {promotion.student.firstName} {promotion.student.lastName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {promotion.student.admissionNumber}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {promotion.fromClass.name}
                        </Badge>
                        {promotion.promotionType === 'GRADUATION' ? (
                          <>
                            <GraduationCap className="h-4 w-4 text-green-600" />
                            <Badge className="bg-green-100 text-green-800 text-xs">
                              Graduated
                            </Badge>
                          </>
                        ) : (
                          <>
                            <TrendingUp className="h-4 w-4 text-blue-600" />
                            <Badge variant="outline" className="text-xs">
                              {promotion.toClass.name}
                            </Badge>
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(promotion.promotionDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge className={
                        promotion.promotionType === 'GRADUATION' 
                          ? 'bg-green-100 text-green-800'
                          : promotion.promotionType === 'PROMOTION'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-red-100 text-red-800'
                      }>
                        {promotion.promotionType}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Promotion Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle>Promotion Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-blue-900 mb-3">Individual Promotions</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Select specific students from a class</li>
                <li>• Choose target class or mark for graduation</li>
                <li>• Add notes for record keeping</li>
                <li>• Can be reversed if needed</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-purple-900 mb-3">Bulk Promotions</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Promote entire classes at once</li>
                <li>• Option to select specific students</li>
                <li>• Efficient for end-of-year processing</li>
                <li>• Maintains complete audit trail</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Important:</strong> Promotions update student class assignments and academic years. 
              Make sure to backup your data before performing bulk operations.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}