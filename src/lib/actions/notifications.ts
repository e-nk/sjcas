'use server'

import { db } from '@/lib/db'
import { sendSMS, sendBulkSMS } from '@/lib/services/sms'
import { sendEmail, sendBulkEmails } from '@/lib/services/email'
import { isValidPhoneNumber, isValidEmail } from '@/lib/utils/validation'
import { generatePaymentConfirmationEmail, generateFeeReminderEmail } from '@/lib/utils/email-templates'
import { revalidatePath } from 'next/cache'

export type NotificationType = 'PAYMENT_CONFIRMATION' | 'FEE_REMINDER' | 'ASSIGNMENT_NOTIFICATION' | 'CUSTOM'

export type NotificationData = {
  type: NotificationType
  studentIds?: string[]
  classIds?: string[]
  message?: string
  subject?: string
  sendSMS: boolean
  sendEmail: boolean
}

// Send payment confirmation notifications
export async function sendPaymentConfirmation(paymentId: string) {
  try {
    const payment = await db.payment.findUnique({
      where: { id: paymentId },
      include: {
        student: {
          include: {
            feeAssignments: {
              where: { balance: { gt: 0 } }
            }
          }
        }
      }
    })

    if (!payment || !payment.student) {
      throw new Error('Payment or student not found')
    }

    const student = payment.student
    const remainingBalance = student.feeAssignments.reduce((sum: number, assignment: { balance: number | bigint }) => {
      return sum + parseFloat(assignment.balance.toString())
    }, 0)

    // SMS notification
    if (student.parentPhone && isValidPhoneNumber(student.parentPhone)) {
      const smsMessage = `Payment Received: KES ${parseFloat(payment.amount.toString()).toLocaleString()} for ${student.firstName} ${student.lastName}. Transaction ID: ${payment.transactionId}. Balance: KES ${remainingBalance.toLocaleString()}. Thank you! - SJCAS`
      
      const smsResult = await sendSMS({
        to: student.parentPhone,
        message: smsMessage
      })

      if (smsResult.success) {
        console.log(`Payment confirmation SMS sent to ${student.parentPhone}`)
      } else {
        console.error('Failed to send payment confirmation SMS:', smsResult.error)
      }
    }

    // Email notification
    if (student.parentEmail && isValidEmail(student.parentEmail)) {
      const emailTemplate = generatePaymentConfirmationEmail({
        studentName: `${student.firstName} ${student.lastName}`,
        amount: parseFloat(payment.amount.toString()),
        transactionId: payment.transactionId,
        paymentMethod: payment.paymentMethod,
        remainingBalance
      })

      const emailResult = await sendEmail({
        to: student.parentEmail,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
        text: emailTemplate.text
      })

      if (emailResult.success) {
        console.log(`Payment confirmation email sent to ${student.parentEmail}`)
      } else {
        console.error('Failed to send payment confirmation email:', emailResult.error)
      }
    }

    // Log notification
    await db.notification.create({
      data: {
        type: 'PAYMENT_CONFIRMATION',
        studentId: student.id,
        title: 'Payment Confirmation',
        message: `Payment of KES ${parseFloat(payment.amount.toString()).toLocaleString()} confirmed`,
        status: 'SENT'
      }
    })

    return { success: true }
  } catch (error) {
    console.error('Error sending payment confirmation:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Failed to send confirmation' }
  }
}

// Send fee reminder notifications
export async function sendFeeReminders(studentIds: string[]) {
  try {
    const students = await db.student.findMany({
      where: {
        id: { in: studentIds },
        status: 'ACTIVE'
      },
      include: {
        feeAssignments: {
          where: { balance: { gt: 0 } },
          include: {
            feeStructure: true
          }
        }
      }
    })

    const results = []

    for (const student of students) {
      if (student.feeAssignments.length === 0) continue

      const outstandingAmount = student.feeAssignments.reduce((sum: number, assignment: { balance: number | bigint }) => {
        return sum + parseFloat(assignment.balance.toString())
      }, 0)

      const feeDetails = student.feeAssignments.map((assignment: { feeStructure: { name: string }, balance: number | bigint }) => ({
        name: assignment.feeStructure.name,
        amount: parseFloat(assignment.balance.toString())
      }))

      // SMS reminder
      if (student.parentPhone && isValidPhoneNumber(student.parentPhone)) {
        const smsMessage = `Fee Reminder: ${student.firstName} ${student.lastName} has outstanding fees of KES ${outstandingAmount.toLocaleString()}. Pay via M-Pesa Paybill 174379, Account: ${student.admissionNumber}. - SJCAS`
        
        const smsResult = await sendSMS({
          to: student.parentPhone,
          message: smsMessage
        })

        results.push({ studentId: student.id, sms: smsResult.success })
      }

      // Email reminder
      if (student.parentEmail && isValidEmail(student.parentEmail)) {
        const emailTemplate = generateFeeReminderEmail({
          studentName: `${student.firstName} ${student.lastName}`,
          outstandingAmount,
          feeDetails
        })

        const emailResult = await sendEmail({
          to: student.parentEmail,
          subject: emailTemplate.subject,
          html: emailTemplate.html,
          text: emailTemplate.text
        })

        results.push({ studentId: student.id, email: emailResult.success })
      }

      // Log notification
      await db.notification.create({
        data: {
          type: 'FEE_REMINDER',
          studentId: student.id,
          title: 'Fee Payment Reminder',
          message: `Reminder sent for outstanding fees of KES ${outstandingAmount.toLocaleString()}`,
          status: 'SENT'
        }
      })
    }

    return { success: true, results }
  } catch (error) {
    console.error('Error sending fee reminders:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Failed to send reminders' }
  }
}

// Send custom notifications
export async function sendCustomNotifications(data: NotificationData) {
  try {
    let students: any[] = []

    if (data.studentIds && data.studentIds.length > 0) {
      students = await db.student.findMany({
        where: {
          id: { in: data.studentIds },
          status: 'ACTIVE'
        }
      })
    } else if (data.classIds && data.classIds.length > 0) {
      students = await db.student.findMany({
        where: {
          currentClassId: { in: data.classIds },
          status: 'ACTIVE'
        }
      })
    }

    if (!data.message || students.length === 0) {
      throw new Error('Message and recipients required')
    }

    const results = []

    for (const student of students) {
      // Send SMS
      if (data.sendSMS && student.parentPhone && isValidPhoneNumber(student.parentPhone)) {
        const smsResult = await sendSMS({
          to: student.parentPhone,
          message: `${data.message} - SJCAS`
        })
        results.push({ studentId: student.id, sms: smsResult.success })
      }

      // Send Email
      if (data.sendEmail && student.parentEmail && isValidEmail(student.parentEmail)) {
        const emailResult = await sendEmail({
          to: student.parentEmail,
          subject: data.subject || 'Important Notice from School',
          html: `
            <div style="font-family: Arial, sans-serif;">
              <h2>ST. JOSEPH'S CENTRAL ACADEMY - SIRONOI</h2>
              <p>Dear Parent/Guardian,</p>
              <p>${data.message}</p>
              <p>Best regards,<br>School Administration</p>
            </div>
          `,
          text: `ST. JOSEPH'S CENTRAL ACADEMY - SIRONOI\n\nDear Parent/Guardian,\n\n${data.message}\n\nBest regards,\nSchool Administration`
        })
        results.push({ studentId: student.id, email: emailResult.success })
      }

      // Log notification
      await db.notification.create({
        data: {
          type: data.type,
          studentId: student.id,
          title: data.subject || 'School Notice',
          message: data.message,
          status: 'SENT'
        }
      })
    }

    return { success: true, results, totalSent: results.length }
  } catch (error) {
    console.error('Error sending custom notifications:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Failed to send notifications' }
  }
}

// Get notification history
export async function getNotificationHistory() {
  try {
    const notifications = await db.notification.findMany({
      include: {
        student: {
          select: {
            firstName: true,
            lastName: true,
            admissionNumber: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 100
    })

    return notifications
  } catch (error) {
    console.error('Error getting notification history:', error)
    return []
  }
}