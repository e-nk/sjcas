import DashboardLayout from '@/components/layouts/DashboardLayout'
import { getStudents } from '@/lib/actions/students'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import Link from 'next/link'
import { FileText, User, Search } from 'lucide-react'

export default async function StudentStatementsPage() {
  const students = await getStudents()

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Student Statements</h1>
          <p className="text-gray-600 mt-1">
            Generate detailed fee statements for individual students
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Student Selection */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Select Student
                </CardTitle>
                <CardDescription>
                  Choose a student to generate their fee statement
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {students.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <User className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No students found</p>
                    <Link href="/students/add">
                      <Button className="mt-4">Add Students</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                    {students.map((student) => (
                      <Link key={student.id} href={`/reports/student-statements/${student.id}`}>
                        <Card className="hover:bg-gray-50 cursor-pointer transition-colors">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-school-primary-blue/10 rounded-full flex items-center justify-center">
                                <User className="h-5 w-5 text-school-primary-red" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">
                                  {student.firstName} {student.lastName}
                                </p>
                                <p className="text-sm text-gray-500 truncate">
                                  {student.admissionNumber} • {student.currentClass.name}
                                </p>
                                {student.feeGroup && (
                                  <p className="text-xs text-gray-400">
                                    {student.feeGroup.name}
                                  </p>
                                )}
                              </div>
                              <FileText className="h-4 w-4 text-gray-400" />
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/reports/outstanding">
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Outstanding Fees Report
                  </Button>
                </Link>
                
                <Link href="/reports/fee-collection">
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Fee Collection Report
                  </Button>
                </Link>

                <Link href="/students">
                  <Button variant="outline" className="w-full justify-start">
                    <User className="h-4 w-4 mr-2" />
                    Manage Students
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Report Features</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-2 text-gray-600">
                  <li>• Complete fee assignment history</li>
                  <li>• Detailed payment records</li>
                  <li>• Student ledger in accounting format</li>
                  <li>• Available credit balances</li>
                  <li>• Print and email capabilities</li>
                  <li>• Professional formatting</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}