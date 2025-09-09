import DashboardLayout from '@/components/layouts/DashboardLayout'
import StudentStatement from '@/components/reports/StudentStatement'
import { getStudentStatement } from '@/lib/actions/reports'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { notFound } from 'next/navigation'

interface StudentStatementPageProps {
  params: Promise<{ id: string }> // Changed this line
}

export default async function StudentStatementPage({ params }: StudentStatementPageProps) {
  const { id } = await params // Added await here
  const data = await getStudentStatement(id) // Use id instead of params.id

  if (!data) {
    notFound()
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 print:hidden">
          <Link href="/reports/student-statements">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Students
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Student Fee Statement
            </h1>
            <p className="text-gray-600">
              {data.student.firstName} {data.student.lastName} • {data.student.admissionNumber}
            </p>
          </div>
        </div>

        {/* Statement */}
        <StudentStatement data={data} />
      </div>
    </DashboardLayout>
  )
}