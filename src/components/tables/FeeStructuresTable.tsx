'use client'

import { useState } from 'react'
import Link from 'next/link'
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
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Eye, Search, FileText, MoreHorizontal, Edit, ToggleLeft, ToggleRight, DollarSign } from 'lucide-react'
import { FeeStructure, FeeGroup, Class } from '@prisma/client'
import { toggleFeeStructureStatus } from '@/lib/actions/fee-structures'

type FeeStructureWithDetails = FeeStructure & {
  feeGroup: FeeGroup | null
  class: Class | null
  _count: {
    feeAssignments: number
  }
}

interface FeeStructuresTableProps {
  feeStructures: FeeStructureWithDetails[]
}

export default function FeeStructuresTable({ feeStructures }: FeeStructuresTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL')
  const [yearFilter, setYearFilter] = useState<string>('ALL')
  const [loadingToggle, setLoadingToggle] = useState<string | null>(null)

  // Get unique years for filter
  const years = [...new Set(feeStructures.map(fs => fs.year))].sort((a, b) => b - a)

  // Filter fee structures
  const filteredStructures = feeStructures.filter(structure => {
    const matchesSearch = 
      structure.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (structure.feeGroup?.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (structure.class?.name.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesStatus = statusFilter === 'ALL' || 
      (statusFilter === 'ACTIVE' && structure.isActive) ||
      (statusFilter === 'INACTIVE' && !structure.isActive)

    const matchesYear = yearFilter === 'ALL' || structure.year.toString() === yearFilter

    return matchesSearch && matchesStatus && matchesYear
  })

  const handleToggleStatus = async (id: string) => {
    setLoadingToggle(id)
    await toggleFeeStructureStatus(id)
    setLoadingToggle(null)
  }

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Inactive</Badge>
    )
  }

  const getTermBadge = (term: string | null) => {
    if (!term) return <Badge variant="outline">Annual</Badge>
    return <Badge variant="secondary">Term {term}</Badge>
  }

  const totalAmount = feeStructures
    .filter(fs => fs.isActive)
    .reduce((sum, fs) => sum + parseFloat(fs.amount.toString()), 0)

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Structures</p>
                <p className="text-2xl font-bold text-gray-900">{feeStructures.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-green-600 font-semibold">A</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-gray-900">
                  {feeStructures.filter(fs => fs.isActive).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  KES {totalAmount.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                <span className="text-purple-600 font-semibold">A</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Assignments</p>
                <p className="text-2xl font-bold text-gray-900">
                  {feeStructures.reduce((sum, fs) => sum + fs._count.feeAssignments, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fee Structures Table */}
      <Card>
        <CardHeader>
          <CardTitle>Fee Structures</CardTitle>
          <CardDescription>
            Manage fee structures for different terms and student groups
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search fee structures..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="ALL">All Years</option>
                {years.map((year) => (
                  <option key={year} value={year.toString()}>
                    {year}
                  </option>
                ))}
              </select>
              {['ALL', 'ACTIVE', 'INACTIVE'].map((status) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter(status as any)}
                  className={statusFilter === status ? 'bg-school-primary-red hover:bg-school-primary-red/90' : ''}
                >
                  {status === 'ALL' ? 'All' : status.charAt(0) + status.slice(1).toLowerCase()}
                </Button>
              ))}
            </div>
          </div>

          {/* Results count */}
          <p className="text-sm text-gray-600 mb-4">
            Showing {filteredStructures.length} of {feeStructures.length} fee structures
          </p>

          {/* Fee Structures Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Term/Year</TableHead>
                  <TableHead>Group/Class</TableHead>
                  <TableHead>Assignments</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStructures.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No fee structures found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStructures.map((structure) => (
                    <TableRow key={structure.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900">{structure.name}</p>
                          {structure.dueDate && (
                            <p className="text-xs text-gray-500">
                              Due: {new Date(structure.dueDate).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="font-mono font-medium">
                          KES {parseFloat(structure.amount.toString()).toLocaleString()}
                        </p>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {getTermBadge(structure.term)}
                          <Badge variant="outline">{structure.year}</Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {structure.feeGroup && (
                            <Badge variant="secondary" className="text-xs">
                              {structure.feeGroup.name}
                            </Badge>
                          )}
                          {structure.applicableToAllClasses ? (
                            <Badge variant="outline" className="text-xs">All Classes</Badge>
                          ) : structure.class ? (
                            <Badge variant="outline" className="text-xs">
                              {structure.class.name}
                            </Badge>
                          ) : (
                            <span className="text-xs text-gray-400">No class specified</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{structure._count.feeAssignments}</span>
                      </TableCell>
                      <TableCell>{getStatusBadge(structure.isActive)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <Link href={`/fees/structures/${structure.id}`}>
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                            </Link>
                            <Link href={`/fees/structures/${structure.id}/edit`}>
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                            </Link>
                            <DropdownMenuItem
                              onClick={() => handleToggleStatus(structure.id)}
                              disabled={loadingToggle === structure.id}
                            >
                              {structure.isActive ? (
                                <>
                                  <ToggleLeft className="mr-2 h-4 w-4" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <ToggleRight className="mr-2 h-4 w-4" />
                                  Activate
                                </>
                              )}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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