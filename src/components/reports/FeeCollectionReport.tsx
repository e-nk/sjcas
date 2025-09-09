'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Download, Printer, DollarSign, TrendingUp, Calendar, CreditCard, BarChart3 } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts'

interface FeeCollectionReportProps {
  data: {
    payments: any[]
    stats: {
      totalPayments: number
      totalAmount: number
      averagePayment: number
    }
    byMethod: Array<{
      method: string
      count: number
      total: number
    }>
    byClass: Array<{
      className: string
      count: number
      total: number
    }>
    byFeeStructure: Array<{
      structureName: string
      count: number
      total: number
    }>
    dailyCollection: Record<string, number>
  }
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']

export default function FeeCollectionReport({ data }: FeeCollectionReportProps) {
  const [dateRange, setDateRange] = useState('30')
  const [viewType, setViewType] = useState<'summary' | 'detailed' | 'charts'>('summary')
  const [printLoading, setPrintLoading] = useState(false)
  const [exportLoading, setExportLoading] = useState(false)

  const handlePrint = () => {
    setPrintLoading(true)
    setTimeout(() => {
      window.print()
      setPrintLoading(false)
    }, 500)
  }

  const handleExport = async () => {
    setExportLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      alert('Excel export functionality will be implemented soon')
    } finally {
      setExportLoading(false)
    }
  }

  // Prepare daily collection chart data
  const chartData = Object.entries(data.dailyCollection)
    .map(([date, amount]) => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      amount
    }))
    .slice(-14) // Last 14 days

  // Prepare pie chart data for payment methods
  const methodChartData = data.byMethod.map((method, index) => ({
    name: method.method,
    value: method.total,
    color: COLORS[index % COLORS.length]
  }))

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex justify-between items-center print:hidden">
        <div>
          <h2 className="text-2xl font-bold">Fee Collection Report</h2>
          <p className="text-gray-600">Payment collection analysis and trends</p>
        </div>
        <div className="flex gap-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 90 Days</option>
            <option value="365">Last Year</option>
          </select>
          
          <Button variant="outline" onClick={handleExport} disabled={exportLoading}>
            {exportLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Export Excel
              </>
            )}
          </Button>
          
          <Button variant="outline" onClick={handlePrint} disabled={printLoading}>
            {printLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                Preparing...
              </>
            ) : (
              <>
                <Printer className="h-4 w-4 mr-2" />
                Print Report
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Report Header (for print) */}
      <Card className="hidden print:block">
        <CardHeader className="text-center border-b">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-school-primary-red">
              ST. JOSEPH'S CENTRAL ACADEMY - SIRONOI
            </h1>
            <p className="text-gray-600">Fee Management System</p>
            <h2 className="text-xl font-semibold">FEE COLLECTION REPORT</h2>
            <p className="text-sm text-gray-500">
              Generated on: {new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </CardHeader>
      </Card>

      {/* View Type Selector */}
      <div className="flex gap-2 print:hidden">
        {[
          { key: 'summary', label: 'Summary', icon: DollarSign },
          { key: 'charts', label: 'Charts', icon: BarChart3 },
          { key: 'detailed', label: 'Detailed', icon: CreditCard }
        ].map(({ key, label, icon: Icon }) => (
          <Button
            key={key}
            variant={viewType === key ? 'default' : 'outline'}
            onClick={() => setViewType(key as any)}
            className={viewType === key ? 'bg-school-primary-red hover:bg-school-primary-red/90' : ''}
          >
            <Icon className="h-4 w-4 mr-2" />
            {label}
          </Button>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CreditCard className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Payments</p>
                <p className="text-2xl font-bold text-gray-900">{data.stats.totalPayments}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Amount</p>
                <p className="text-2xl font-bold text-green-600">
                  KES {data.stats.totalAmount.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Average Payment</p>
                <p className="text-2xl font-bold text-purple-600">
                  KES {Math.round(data.stats.averagePayment).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary View */}
      {viewType === 'summary' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* By Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle>Collections by Payment Method</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Method</TableHead>
                    <TableHead className="text-right">Count</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Percentage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.byMethod.map((method) => (
                    <TableRow key={method.method}>
                      <TableCell>
                        <Badge variant="outline">{method.method}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {method.count}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        KES {method.total.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {data.stats.totalAmount > 0 
                          ? Math.round((method.total / data.stats.totalAmount) * 100)
                          : 0}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* By Class */}
          <Card>
            <CardHeader>
              <CardTitle>Collections by Class</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Class</TableHead>
                    <TableHead className="text-right">Count</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.byClass.slice(0, 10).map((cls) => (
                    <TableRow key={cls.className}>
                      <TableCell className="font-medium">{cls.className}</TableCell>
                      <TableCell className="text-right">{cls.count}</TableCell>
                      <TableCell className="text-right font-mono">
                        KES {cls.total.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts View */}
      {viewType === 'charts' && (
        <div className="space-y-6">
          {/* Daily Collection Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Daily Collection Trend (Last 14 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => [`KES ${value.toLocaleString()}`, 'Amount']} />
                    <Line type="monotone" dataKey="amount" stroke="#dc2626" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Payment Methods Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Methods Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={methodChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(props: any) => `${props.name} ${(props.percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {methodChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => [`KES ${value.toLocaleString()}`, 'Amount']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Top Classes Bar Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Top Classes by Collection</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.byClass.slice(0, 5)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="className" />
                      <YAxis />
                      <Tooltip formatter={(value: number) => [`KES ${value.toLocaleString()}`, 'Amount']} />
                      <Bar dataKey="total" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Detailed View */}
      {viewType === 'detailed' && (
        <Card>
          <CardHeader>
            <CardTitle>Detailed Payment Records</CardTitle>
            <CardDescription>Recent payment transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Transaction ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.payments.slice(0, 20).map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      {payment.paidAt ? new Date(payment.paidAt).toLocaleDateString() : 'Not set'}
                    </TableCell>
                    <TableCell>
                      {payment.student ? (
                        <div>
                          <p className="font-medium">
                            {payment.student.firstName} {payment.student.lastName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {payment.student.admissionNumber}
                          </p>
                        </div>
                      ) : (
                        'Unknown'
                      )}
                    </TableCell>
                    <TableCell className="font-mono font-bold text-green-600">
                      KES {parseFloat(payment.amount.toString()).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{payment.paymentMethod}</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {payment.transactionId}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {data.payments.length > 20 && (
              <div className="text-center mt-4">
                <p className="text-sm text-gray-500">
                  Showing 20 of {data.payments.length} payments
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Footer for print */}
      <div className="text-center text-sm text-gray-500 print:block hidden">
        <p>This is a computer-generated report. No signature required.</p>
        <p>For any queries, contact the school administration.</p>
      </div>
    </div>
  )
}