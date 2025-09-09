import DashboardLayout from '@/components/layouts/DashboardLayout'
import StudentStatement from '@/components/reports/StudentStatement'
import { getStudentStatement } from '@/lib/actions/reports'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { notFound } from 'next/navigation'

interface StudentStatementPageProps {
  params: { id: string }
}

export default async function StudentStatementPage({ params }: StudentStatementPageProps) {
  const data = await getStudentStatement(params.id)

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
              Back to Student Statements
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Fee Statement - {data.student.firstName} {data.student.lastName}
            </h1>
            <p className="text-gray-600 mt-1">
              {data.student.admissionNumber} • {data.student.currentClass.name}
            </p>
          </div>
        </div>

        {/* Statement */}
        <StudentStatement data={data} />
      </div>
    </DashboardLayout>
  )
}