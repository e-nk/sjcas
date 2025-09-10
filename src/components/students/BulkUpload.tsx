'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { bulkUploadStudents } from '@/lib/actions/students'
import { Upload, Download, Users, CheckCircle, AlertCircle, FileText, X } from 'lucide-react'
import * as XLSX from 'xlsx'

interface BulkUploadProps {
  classes: any[]
  feeGroups: any[]
}

export default function BulkUpload({ classes, feeGroups }: BulkUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [parsedData, setParsedData] = useState<any[]>([])
  const [errors, setErrors] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState<any>(null)
  const [previewMode, setPreviewMode] = useState(false)

  // Download template
  const downloadTemplate = () => {
    const templateData = [
      {
        'First Name': 'John',
        'Middle Name': 'Peter',
        'Last Name': 'Doe',
        'Admission Number': 'SJOPED2510',
        'Date of Birth': '2010-05-15',
        'Class Name': 'Grade 1',
        'Fee Group Name': 'Boarder',
        'Parent Name': 'Jane Doe',
        'Parent Phone': '0712345678',
        'Parent Email': 'jane.doe@email.com',
        'Academic Year': new Date().getFullYear()
      }
    ]

    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.json_to_sheet(templateData)
    
    // Set column widths
    const colWidths = [
      { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 20 }, { wch: 12 },
      { wch: 10 }, { wch: 15 }, { wch: 20 }, { wch: 20 }, { wch: 15 },
      { wch: 25 }, { wch: 12 }
    ]
    worksheet['!cols'] = colWidths

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Student Template')
    XLSX.writeFile(workbook, `Student_Upload_Template_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      parseFile(selectedFile)
    }
  }

  // Parse Excel file
  const parseFile = async (file: File) => {
    try {
      setErrors([])
      setParsedData([])
      setPreviewMode(false)

      const data = await file.arrayBuffer()
      const workbook = XLSX.read(data)
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      const jsonData = XLSX.utils.sheet_to_json(worksheet)

      if (jsonData.length === 0) {
        setErrors(['File is empty or has no data'])
        return
      }

      // Validate required columns
      const requiredColumns = [
        'First Name', 'Last Name', 'Admission Number', 'Class Name', 
        'Fee Group Name', 'Parent Name', 'Parent Phone'
      ]

      const firstRow = jsonData[0] as any
      const missingColumns = requiredColumns.filter(col => !(col in firstRow))

      if (missingColumns.length > 0) {
        setErrors([`Missing required columns: ${missingColumns.join(', ')}`])
        return
      }

      // Validate and process data
      const processedData = []
      const validationErrors = []

      for (let i = 0; i < jsonData.length; i++) {
        const row = jsonData[i] as any
        const rowNumber = i + 2 // Account for header row

        // Check required fields
        if (!row['First Name']) validationErrors.push(`Row ${rowNumber}: First Name is required`)
        if (!row['Last Name']) validationErrors.push(`Row ${rowNumber}: Last Name is required`)
        if (!row['Admission Number']) validationErrors.push(`Row ${rowNumber}: Admission Number is required`)
        if (!row['Class Name']) validationErrors.push(`Row ${rowNumber}: Class Name is required`)
        if (!row['Fee Group Name']) validationErrors.push(`Row ${rowNumber}: Fee Group Name is required`)
        if (!row['Parent Name']) validationErrors.push(`Row ${rowNumber}: Parent Name is required`)
        if (!row['Parent Phone']) validationErrors.push(`Row ${rowNumber}: Parent Phone is required`)

        // Validate class exists
        const classExists = classes.find(c => c.name.toLowerCase() === row['Class Name']?.toLowerCase())
        if (row['Class Name'] && !classExists) {
          validationErrors.push(`Row ${rowNumber}: Class "${row['Class Name']}" not found`)
        }

        // Validate fee group exists
        const feeGroupExists = feeGroups.find(fg => fg.name.toLowerCase() === row['Fee Group Name']?.toLowerCase())
        if (row['Fee Group Name'] && !feeGroupExists) {
          validationErrors.push(`Row ${rowNumber}: Fee Group "${row['Fee Group Name']}" not found`)
        }

        // Validate gender
        if (row['Gender'] && !['MALE', 'FEMALE'].includes(row['Gender']?.toUpperCase())) {
          validationErrors.push(`Row ${rowNumber}: Gender must be MALE or FEMALE`)
        }

        // Process the row if no errors
        if (validationErrors.length === 0 || validationErrors.filter(e => e.includes(`Row ${rowNumber}`)).length === 0) {
          processedData.push({
            firstName: row['First Name'],
            middleName: row['Middle Name'] || '',
            lastName: row['Last Name'],
            admissionNumber: row['Admission Number'],
            dateOfBirth: row['Date of Birth'] ? new Date(row['Date of Birth']) : null,
            className: row['Class Name'],
            feeGroupName: row['Fee Group Name'],
            parentName: row['Parent Name'],
            parentPhone: row['Parent Phone'],
            parentEmail: row['Parent Email'] || '',
            academicYear: row['Academic Year'] || new Date().getFullYear(),
            classId: classExists?.id,
            feeGroupId: feeGroupExists?.id
          })
        }
      }

      setParsedData(processedData)
      setErrors(validationErrors)
      
      if (validationErrors.length === 0) {
        setPreviewMode(true)
      }

    } catch (error) {
      console.error('File parsing error:', error)
      setErrors(['Failed to parse file. Please ensure it is a valid Excel file.'])
    }
  }

  // Handle upload
  const handleUpload = async () => {
    if (parsedData.length === 0) {
      setErrors(['No valid data to upload'])
      return
    }

    setIsUploading(true)
    setUploadResult(null)

    try {
      const result = await bulkUploadStudents(parsedData)
      setUploadResult(result)
      
      if (result.success) {
        // Clear form on success
        setFile(null)
        setParsedData([])
        setPreviewMode(false)
        // Reset file input
        const fileInput = document.getElementById('bulk-upload-file') as HTMLInputElement
        if (fileInput) fileInput.value = ''
      }
    } catch (error) {
      console.error('Upload failed:', error)
      setUploadResult({
        success: false,
        error: 'Upload failed: ' + (error instanceof Error ? error.message : 'Unknown error')
      })
    } finally {
      setIsUploading(false)
    }
  }

  const clearFile = () => {
    setFile(null)
    setParsedData([])
    setErrors([])
    setPreviewMode(false)
    setUploadResult(null)
    const fileInput = document.getElementById('bulk-upload-file') as HTMLInputElement
    if (fileInput) fileInput.value = ''
  }

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Bulk Student Upload
          </CardTitle>
          <CardDescription>
            Upload multiple students at once using an Excel file
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Download Template */}
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div>
                <h4 className="font-medium text-blue-900">Step 1: Download Template</h4>
                <p className="text-sm text-blue-700">Download the Excel template with required columns</p>
              </div>
              <Button variant="outline" onClick={downloadTemplate}>
                <Download className="h-4 w-4 mr-2" />
                Download Template
              </Button>
            </div>

            {/* Upload Instructions */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">Step 2: Prepare Your Data</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Fill in the template with your student data</li>
                <li>• Ensure Class Name matches existing classes exactly</li>
                <li>• Ensure Fee Group Name matches existing fee groups exactly</li>
                <li>• Date of Birth format: YYYY-MM-DD (e.g., 2010-05-15)</li>
                <li>• Gender must be either MALE or FEMALE</li>
                <li>• Parent Phone should include country code or start with 0</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* File Upload */}
      <Card>
        <CardHeader>
          <CardTitle>Step 3: Upload Your File</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Label htmlFor="bulk-upload-file" className="cursor-pointer">
                <div className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
                  <Upload className="h-5 w-5" />
                  <span>Choose Excel File</span>
                </div>
              </Label>
              <Input
                id="bulk-upload-file"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
              />
              
              {file && (
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="flex items-center gap-2">
                    <FileText className="h-3 w-3" />
                    {file.name}
                  </Badge>
                  <Button variant="ghost" size="sm" onClick={clearFile}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            {/* Available Classes and Fee Groups */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h5 className="font-medium mb-2">Available Classes:</h5>
                <div className="flex flex-wrap gap-2">
                  {classes.map(cls => (
                    <Badge key={cls.id} variant="outline" className="text-xs">
                      {cls.name}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <h5 className="font-medium mb-2">Available Fee Groups:</h5>
                <div className="flex flex-wrap gap-2">
                  {feeGroups.map(fg => (
                    <Badge key={fg.id} variant="outline" className="text-xs">
                      {fg.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Validation Errors */}
      {errors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium">Please fix the following errors:</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Upload Result */}
      {uploadResult && (
        <Alert className={uploadResult.success ? 'border-green-200 bg-green-50' : ''} variant={uploadResult.success ? 'default' : 'destructive'}>
          {uploadResult.success ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          <AlertDescription className={uploadResult.success ? 'text-green-800' : ''}>
            <div className="space-y-2">
              {uploadResult.success ? (
                <>
                  <p className="font-medium">Upload completed!</p>
                  <p>Successfully uploaded {uploadResult.summary?.successful || 0} students</p>
                  {uploadResult.summary?.failed > 0 && (
                    <p className="text-red-600">Failed to upload {uploadResult.summary.failed} students</p>
                  )}
                </>
              ) : (
                <p>{uploadResult.error}</p>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Data Preview */}
      {previewMode && parsedData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 4: Preview & Confirm Upload</CardTitle>
            <CardDescription>
              Review the {parsedData.length} students to be uploaded
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Preview Table */}
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Admission No.</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Fee Group</TableHead>
                      <TableHead>Parent</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Gender</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedData.slice(0, 10).map((student, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {student.firstName} {student.middleName} {student.lastName}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>{student.admissionNumber}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{student.className}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{student.feeGroupName}</Badge>
                        </TableCell>
                        <TableCell>{student.parentName}</TableCell>
                        <TableCell>{student.parentPhone}</TableCell>
                        <TableCell>
                          <Badge className={student.gender === 'MALE' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'}>
                            {student.gender}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {parsedData.length > 10 && (
                <p className="text-sm text-gray-600 text-center">
                  Showing first 10 of {parsedData.length} students. All {parsedData.length} will be uploaded.
                </p>
              )}

              {/* Upload Button */}
              <div className="flex justify-end">
                <Button
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="bg-school-primary-red hover:bg-school-primary-red/90"
                >
                  {isUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Uploading {parsedData.length} Students...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload {parsedData.length} Students
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}