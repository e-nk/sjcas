'use client'

import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'
import html2canvas from 'html2canvas'

// PDF Export Functions
export const exportToPDF = {
  // Export student statement as PDF
  studentStatement: async (elementId: string, studentName: string) => {
    try {
      const element = document.getElementById(elementId)
      if (!element) {
        throw new Error('Statement element not found')
      }

      // Show loading state
      const originalStyle = element.style.display
      element.style.display = 'block'

      const canvas = await html2canvas(element, {
        scale: 1.5,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: element.scrollWidth,
        height: element.scrollHeight,
        logging: false
      })

      // Restore original style
      element.style.display = originalStyle

      const imgData = canvas.toDataURL('image/png', 0.95)
      const pdf = new jsPDF('p', 'mm', 'a4')
      
      const imgWidth = 210
      const pageHeight = 295
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight
      let position = 0

      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      // Add additional pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      const fileName = `${studentName.replace(/[^a-zA-Z0-9]/g, '_')}_Fee_Statement_${new Date().toISOString().split('T')[0]}.pdf`
      pdf.save(fileName)
      
      return { success: true }
    } catch (error) {
      console.error('PDF export error:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Failed to generate PDF' }
    }
  },

  // Export outstanding fees report
  outstandingReport: (students: any[]) => {
    try {
      const pdf = new jsPDF()
      
      // Add header
      pdf.setFontSize(18)
      pdf.setTextColor(114, 0, 38) // School red color
      pdf.text("ST. JOSEPH'S CENTRAL ACADEMY - SIRONOI", 105, 20, { align: 'center' })
      
      pdf.setFontSize(14)
      pdf.setTextColor(0, 0, 0)
      pdf.text('Outstanding Fees Report', 105, 35, { align: 'center' })
      
      pdf.setFontSize(10)
      pdf.text(`Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 105, 45, { align: 'center' })

      // Calculate totals
      let totalOutstanding = 0
      const tableData = students.map(student => {
        const outstanding = student.feeAssignments?.reduce((sum: number, assignment: any) => {
          return sum + parseFloat(assignment.balance?.toString() || '0')
        }, 0) || 0

        totalOutstanding += outstanding

        return [
          `${student.firstName} ${student.lastName}`,
          student.admissionNumber,
          student.currentClass?.name || 'N/A',
          `KES ${outstanding.toLocaleString()}`,
          student.parentPhone || 'N/A'
        ]
      })

      // Add summary
      pdf.setFontSize(12)
      pdf.text(`Total Students with Outstanding Fees: ${students.length}`, 20, 60)
      pdf.text(`Total Outstanding Amount: KES ${totalOutstanding.toLocaleString()}`, 20, 70)

      // Use the imported autoTable function
      autoTable(pdf, {
        head: [['Student Name', 'Admission No.', 'Class', 'Outstanding Amount', 'Parent Phone']],
        body: tableData,
        startY: 80,
        theme: 'grid',
        styles: { 
          fontSize: 9,
          cellPadding: 2
        },
        headStyles: { 
          fillColor: [114, 0, 38], // School red color
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        columnStyles: {
          0: { cellWidth: 40 },
          1: { cellWidth: 30 },
          2: { cellWidth: 25 },
          3: { cellWidth: 35, halign: 'right' },
          4: { cellWidth: 30 }
        }
      })

      pdf.save(`Outstanding_Fees_Report_${new Date().toISOString().split('T')[0]}.pdf`)
      return { success: true }
    } catch (error) {
      console.error('PDF export error:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Failed to generate PDF' }
    }
  },

  // Export fee collection report
  feeCollectionReport: (payments: any[], stats: any) => {
    try {
      const pdf = new jsPDF()
      
      // Add header
      pdf.setFontSize(18)
      pdf.setTextColor(114, 0, 38)
      pdf.text("ST. JOSEPH'S CENTRAL ACADEMY - SIRONOI", 105, 20, { align: 'center' })
      
      pdf.setFontSize(14)
      pdf.setTextColor(0, 0, 0)
      pdf.text('Fee Collection Report', 105, 35, { align: 'center' })
      
      pdf.setFontSize(10)
      pdf.text(`Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 105, 45, { align: 'center' })

      // Add summary box
      pdf.setDrawColor(114, 0, 38)
      pdf.setFillColor(245, 245, 245)
      pdf.rect(20, 55, 170, 25, 'FD')
      
      pdf.setFontSize(12)
      pdf.setTextColor(0, 0, 0)
      pdf.text('Summary:', 25, 65)
      pdf.setFontSize(10)
      pdf.text(`Total Payments: ${stats.totalPayments}`, 25, 72)
      pdf.text(`Total Amount: KES ${stats.totalAmount.toLocaleString()}`, 90, 72)
      pdf.text(`Average Payment: KES ${Math.round(stats.averagePayment).toLocaleString()}`, 140, 72)

      // Prepare payments table (limit to 100 entries for performance)
      const tableData = payments.slice(0, 100).map(payment => [
        payment.paidAt ? new Date(payment.paidAt).toLocaleDateString() : 'N/A',
        payment.student ? `${payment.student.firstName} ${payment.student.lastName}` : 'Unknown',
        payment.student?.admissionNumber || 'N/A',
        `KES ${parseFloat(payment.amount.toString()).toLocaleString()}`,
        payment.paymentMethod === 'MPESA' ? 'M-Pesa' : payment.paymentMethod,
        payment.transactionId || 'N/A'
      ])

      autoTable(pdf, {
        head: [['Date', 'Student', 'Admission No.', 'Amount', 'Method', 'Transaction ID']],
        body: tableData,
        startY: 90,
        theme: 'striped',
        styles: { 
          fontSize: 8,
          cellPadding: 1.5
        },
        headStyles: { 
          fillColor: [114, 0, 38],
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        columnStyles: {
          0: { cellWidth: 25 },
          1: { cellWidth: 35 },
          2: { cellWidth: 25 },
          3: { cellWidth: 25, halign: 'right' },
          4: { cellWidth: 20 },
          5: { cellWidth: 35 }
        }
      })

      // Add note if more than 100 payments
      if (payments.length > 100) {
        const finalY = (pdf as any).lastAutoTable.finalY || 200
        pdf.setFontSize(8)
        pdf.setTextColor(128, 128, 128)
        pdf.text(`Note: Showing first 100 of ${payments.length} total payments`, 20, finalY + 10)
      }

      pdf.save(`Fee_Collection_Report_${new Date().toISOString().split('T')[0]}.pdf`)
      return { success: true }
    } catch (error) {
      console.error('PDF export error:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Failed to generate PDF' }
    }
  }
}

// Excel Export Functions - Keep existing code
export const exportToExcel = {
  // Keep all existing Excel export functions
  students: (students: any[]) => {
    try {
      const workbook = XLSX.utils.book_new()
      
      const studentsData = students.map(student => ({
        'First Name': student.firstName,
        'Middle Name': student.middleName || '',
        'Last Name': student.lastName,
        'Admission Number': student.admissionNumber,
        'Class': student.currentClass?.name || 'N/A',
        'Fee Group': student.feeGroup?.name || 'N/A',
        'Parent Name': student.parentName,
        'Parent Phone': student.parentPhone,
        'Parent Email': student.parentEmail || '',
        'Date of Birth': student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : '',
        'Gender': student.gender,
        'Status': student.status,
        'Academic Year': student.currentAcademicYear,
        'Created': new Date(student.createdAt).toLocaleDateString()
      }))

      const worksheet = XLSX.utils.json_to_sheet(studentsData)
      
      const colWidths = [
        { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 20 }, { wch: 15 },
        { wch: 15 }, { wch: 20 }, { wch: 15 }, { wch: 25 }, { wch: 15 },
        { wch: 10 }, { wch: 10 }, { wch: 15 }, { wch: 12 }
      ]
      worksheet['!cols'] = colWidths

      XLSX.utils.book_append_sheet(workbook, worksheet, 'Students')
      XLSX.writeFile(workbook, `Students_Export_${new Date().toISOString().split('T')[0]}.xlsx`)
      
      return { success: true }
    } catch (error) {
      console.error('Excel export error:', error)
      return { success: false, error: 'Failed to generate Excel file' }
    }
  },

  payments: (payments: any[]) => {
    try {
      const workbook = XLSX.utils.book_new()
      
      const paymentsData = payments.map(payment => ({
        'Date': payment.paidAt ? new Date(payment.paidAt).toLocaleDateString() : 'N/A',
        'Student Name': payment.student ? `${payment.student.firstName} ${payment.student.lastName}` : 'Unknown',
        'Admission Number': payment.student?.admissionNumber || 'N/A',
        'Class': payment.student?.currentClass?.name || 'N/A',
        'Amount': parseFloat(payment.amount.toString()),
        'Payment Method': payment.paymentMethod === 'MPESA' ? 'M-Pesa' : payment.paymentMethod,
        'Transaction ID': payment.transactionId,
        'Reference Number': payment.referenceNumber || '',
        'Status': payment.status,
        'Confirmed At': payment.confirmedAt ? new Date(payment.confirmedAt).toLocaleDateString() : 'N/A'
      }))

      const worksheet = XLSX.utils.json_to_sheet(paymentsData)
      
      const colWidths = [
        { wch: 12 }, { wch: 20 }, { wch: 20 }, { wch: 15 }, { wch: 12 },
        { wch: 15 }, { wch: 25 }, { wch: 20 }, { wch: 12 }, { wch: 15 }
      ]
      worksheet['!cols'] = colWidths

      XLSX.utils.book_append_sheet(workbook, worksheet, 'Payments')
      XLSX.writeFile(workbook, `Payments_Export_${new Date().toISOString().split('T')[0]}.xlsx`)
      
      return { success: true }
    } catch (error) {
      console.error('Excel export error:', error)
      return { success: false, error: 'Failed to generate Excel file' }
    }
  },

  outstandingFees: (students: any[]) => {
    try {
      const workbook = XLSX.utils.book_new()
      
      const outstandingData = students.map(student => {
        const outstanding = student.feeAssignments?.reduce((sum: number, assignment: any) => {
          return sum + parseFloat(assignment.balance?.toString() || '0')
        }, 0) || 0

        const lastPayment = student.payments?.[0]

        return {
          'Student Name': `${student.firstName} ${student.lastName}`,
          'Admission Number': student.admissionNumber,
          'Class': student.currentClass?.name || 'N/A',
          'Fee Group': student.feeGroup?.name || 'N/A',
          'Outstanding Amount': outstanding,
          'Parent Name': student.parentName,
          'Parent Phone': student.parentPhone,
          'Parent Email': student.parentEmail || '',
          'Last Payment Amount': lastPayment ? parseFloat(lastPayment.amount.toString()) : 0,
          'Last Payment Date': lastPayment?.paidAt ? new Date(lastPayment.paidAt).toLocaleDateString() : 'No payments',
          'Status': student.status
        }
      })

      const worksheet = XLSX.utils.json_to_sheet(outstandingData)
      
      const colWidths = [
        { wch: 20 }, { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 15 },
        { wch: 20 }, { wch: 15 }, { wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 10 }
      ]
      worksheet['!cols'] = colWidths

      XLSX.utils.book_append_sheet(workbook, worksheet, 'Outstanding Fees')
      XLSX.writeFile(workbook, `Outstanding_Fees_${new Date().toISOString().split('T')[0]}.xlsx`)
      
      return { success: true }
    } catch (error) {
      console.error('Excel export error:', error)
      return { success: false, error: 'Failed to generate Excel file' }
    }
  }
}

// Generic download function for any data
export function downloadData(data: any[], filename: string, type: 'excel' | 'csv' = 'excel') {
  try {
    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.json_to_sheet(data)
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data')
    
    const extension = type === 'csv' ? 'csv' : 'xlsx'
    XLSX.writeFile(workbook, `${filename}.${extension}`)
    return { success: true }
  } catch (error) {
    console.error('Download error:', error)
    return { success: false, error: 'Failed to download data' }
  }
}