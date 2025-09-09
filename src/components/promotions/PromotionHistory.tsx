'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
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
import { Alert, AlertDescription } from '@/components/ui/alert'
import { reversePromotion } from '@/lib/actions/promotions'
import { Search, ArrowRight, GraduationCap, RotateCcw, History, CheckCircle, AlertCircle } from 'lucide-react'

interface PromotionHistoryProps {
  promotions: any[]
}

export default function PromotionHistory({ promotions }: PromotionHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedYear, setSelectedYear] = useState('all')
  const [isReversing, setIsReversing] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  // Filter promotions
  const filteredPromotions = promotions.filter(promotion => {
    const matchesSearch = searchTerm === '' || 
      `${promotion.student.firstName} ${promotion.student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      promotion.student.admissionNumber.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesYear = selectedYear === 'all' || promotion.academicYear.toString() === selectedYear
    
    return matchesSearch && matchesYear
  })

  // Get unique years
  const availableYears = [...new Set(promotions.map(p => p.academicYear))].sort((a, b) => b - a)

  const handleReversePromotion = async (promotionId: string) => {
    setIsReversing(promotionId)
    setMessage('')

    const result = await reversePromotion(promotionId)
    
    if (result.success) {
      setMessage(result.message || 'Promotion reversed successfully')
      setIsSuccess(true)
    } else {
      setMessage(result.error || 'Failed to reverse promotion')
      setIsSuccess(false)
    }

    setIsReversing(null)
  }

  const getPromotionTypeBadge = (type: string) => {
    switch (type) {
      case 'PROMOTION':
        return <Badge className="bg-blue-100 text-blue-800">Promotion</Badge>
      case 'GRADUATION':
        return <Badge className="bg-green-100 text-green-800">Graduation</Badge>
      case 'REVERSAL':
        return <Badge className="bg-red-100 text-red-800">Reversal</Badge>
      default:
				return <Badge variant="secondary">{type}</Badge>
   }
 }

 return (
   <div className="space-y-6">
     {message && (
       <Alert className={isSuccess ? 'border-green-200 bg-green-50' : ''} variant={isSuccess ? 'default' : 'destructive'}>
         {isSuccess ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
         <AlertDescription className={isSuccess ? 'text-green-800' : ''}>
           {message}
         </AlertDescription>
       </Alert>
     )}

     <Card>
       <CardHeader>
         <CardTitle className="flex items-center gap-2">
           <History className="h-5 w-5" />
           Promotion History
         </CardTitle>
         <CardDescription>
           Complete record of all student promotions and graduations
         </CardDescription>
       </CardHeader>
       <CardContent>
         {/* Filters */}
         <div className="flex flex-col sm:flex-row gap-4 mb-6">
           <div className="relative flex-1">
             <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
             <Input
               placeholder="Search by student name or admission number..."
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="pl-10"
             />
           </div>
           <select
             value={selectedYear}
             onChange={(e) => setSelectedYear(e.target.value)}
             className="px-3 py-2 border border-gray-300 rounded-md text-sm min-w-[150px]"
           >
             <option value="all">All Years</option>
             {availableYears.map((year) => (
               <option key={year} value={year.toString()}>
                 {year}
               </option>
             ))}
           </select>
         </div>

         {/* Results count */}
         <p className="text-sm text-gray-600 mb-4">
           Showing {filteredPromotions.length} of {promotions.length} promotion records
         </p>

         {/* Promotions Table */}
         <div className="border rounded-lg">
           <Table>
             <TableHeader>
               <TableRow>
                 <TableHead>Student</TableHead>
                 <TableHead>Promotion Details</TableHead>
                 <TableHead>Academic Year</TableHead>
                 <TableHead>Date</TableHead>
                 <TableHead>Type</TableHead>
                 <TableHead>Notes</TableHead>
                 <TableHead>Actions</TableHead>
               </TableRow>
             </TableHeader>
             <TableBody>
               {filteredPromotions.length === 0 ? (
                 <TableRow>
                   <TableCell colSpan={7} className="text-center py-8">
                     <div className="text-gray-500">
                       <History className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                       <p className="font-medium">No promotion records found</p>
                       <p className="text-sm">
                         {searchTerm || selectedYear !== 'all' 
                           ? 'Try adjusting your search or filter criteria' 
                           : 'Start promoting students to see history here'
                         }
                       </p>
                     </div>
                   </TableCell>
                 </TableRow>
               ) : (
                 filteredPromotions.map((promotion) => (
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
                           <GraduationCap className="h-4 w-4 text-green-600" />
                         ) : (
                           <ArrowRight className="h-4 w-4 text-blue-600" />
                         )}
                         {promotion.toClass ? (
                           <Badge variant="outline" className="text-xs">
                             {promotion.toClass.name}
                           </Badge>
                         ) : (
                           <Badge className="bg-green-100 text-green-800 text-xs">
                             Graduated
                           </Badge>
                         )}
                       </div>
                     </TableCell>
                     <TableCell>
                       <Badge className="bg-purple-100 text-purple-800">
                         {promotion.academicYear}
                       </Badge>
                     </TableCell>
                     <TableCell>
                       <div className="text-sm">
                         {new Date(promotion.promotionDate).toLocaleDateString()}
                       </div>
                     </TableCell>
                     <TableCell>
                       {getPromotionTypeBadge(promotion.promotionType)}
                     </TableCell>
                     <TableCell>
                       <div className="max-w-xs">
                         <p className="text-sm text-gray-600 truncate" title={promotion.notes}>
                           {promotion.notes || 'No notes'}
                         </p>
                       </div>
                     </TableCell>
                     <TableCell>
                       {promotion.promotionType !== 'REVERSAL' && (
                         <Button
                           size="sm"
                           variant="outline"
                           onClick={() => handleReversePromotion(promotion.id)}
                           disabled={isReversing === promotion.id}
                           className="text-red-600 hover:text-red-700"
                         >
                           {isReversing === promotion.id ? (
                             <>
                               <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600 mr-1"></div>
                               Reversing...
                             </>
                           ) : (
                             <>
                               <RotateCcw className="h-3 w-3 mr-1" />
                               Reverse
                             </>
                           )}
                         </Button>
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
   </div>
 )
}