// Email templates
export function generatePaymentConfirmationEmail(data: {
  studentName: string
  amount: number
  transactionId: string
  paymentMethod: string
  remainingBalance: number
}): { subject: string; html: string; text: string } {
  const subject = `Payment Confirmation - ${data.studentName}`
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #720026; color: white; padding: 20px; text-align: center;">
        <h1>ST. JOSEPH'S CENTRAL ACADEMY - SIRONOI</h1>
        <p>Payment Confirmation</p>
      </div>
      
      <div style="padding: 20px;">
        <h2>Payment Received Successfully</h2>
        
        <div style="background: #f5f5f5; padding: 15px; margin: 20px 0; border-radius: 5px;">
          <p><strong>Student:</strong> ${data.studentName}</p>
          <p><strong>Amount Paid:</strong> KES ${data.amount.toLocaleString()}</p>
          <p><strong>Payment Method:</strong> ${data.paymentMethod === 'MPESA' ? 'M-Pesa' : data.paymentMethod}</p>
          <p><strong>Transaction ID:</strong> ${data.transactionId}</p>
          <p><strong>Remaining Balance:</strong> KES ${data.remainingBalance.toLocaleString()}</p>
          <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
        </div>
        
        <p>Thank you for your payment. This confirms that we have received your fee payment.</p>
        
        <div style="background: #e8f5e8; padding: 15px; margin: 20px 0; border-radius: 5px;">
          <p><strong>Receipt Details:</strong></p>
          <p>Keep this email as proof of payment. If you have any questions, please contact the school office.</p>
        </div>
      </div>
      
      <div style="background: #f0f0f0; padding: 15px; text-align: center; color: #666;">
        <p>St. Joseph's Central Academy - Sironoi</p>
        <p>For inquiries, contact us at info@stjoseph.ac.ke</p>
      </div>
    </div>
  `
  
  const text = `
ST. JOSEPH'S CENTRAL ACADEMY - SIRONOI
Payment Confirmation

Payment Received Successfully

Student: ${data.studentName}
Amount Paid: KES ${data.amount.toLocaleString()}
Payment Method: ${data.paymentMethod === 'MPESA' ? 'M-Pesa' : data.paymentMethod}
Transaction ID: ${data.transactionId}
Remaining Balance: KES ${data.remainingBalance.toLocaleString()}
Date: ${new Date().toLocaleDateString()}

Thank you for your payment. This confirms that we have received your fee payment.

Keep this email as proof of payment. If you have any questions, please contact the school office.

St. Joseph's Central Academy - Sironoi
For inquiries, contact us at info@stjoseph.ac.ke
  `
  
  return { subject, html, text }
}

export function generateFeeReminderEmail(data: {
  studentName: string
  outstandingAmount: number
  dueDate?: string
  feeDetails: Array<{ name: string; amount: number }>
}): { subject: string; html: string; text: string } {
  const subject = `Fee Payment Reminder - ${data.studentName}`
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #720026; color: white; padding: 20px; text-align: center;">
        <h1>ST. JOSEPH'S CENTRAL ACADEMY - SIRONOI</h1>
        <p>Fee Payment Reminder</p>
      </div>
      
      <div style="padding: 20px;">
        <h2>Outstanding Fee Payment</h2>
        
        <p>Dear Parent/Guardian,</p>
        <p>This is a friendly reminder that there are outstanding fees for <strong>${data.studentName}</strong>.</p>
        
        <div style="background: #fff3cd; padding: 15px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #ffc107;">
          <h3>Outstanding Fees:</h3>
          ${data.feeDetails.map(fee => `
            <p>• ${fee.name}: KES ${fee.amount.toLocaleString()}</p>
          `).join('')}
          <hr>
          <p><strong>Total Outstanding: KES ${data.outstandingAmount.toLocaleString()}</strong></p>
          ${data.dueDate ? `<p><strong>Due Date: ${data.dueDate}</strong></p>` : ''}
        </div>
        
        <div style="background: #e8f5e8; padding: 15px; margin: 20px 0; border-radius: 5px;">
          <h3>How to Pay:</h3>
          <p><strong>M-Pesa Payment:</strong></p>
          <p>1. Go to M-Pesa menu</p>
          <p>2. Select "Pay Bill"</p>
          <p>3. Enter Business Number: <strong>174379</strong></p>
          <p>4. Account Number: <strong>${data.studentName.split(' ')[0].toUpperCase()}_ADMISSION_NO</strong></p>
          <p>5. Enter Amount and confirm</p>
        </div>
        
        <p>Please ensure payment is made as soon as possible to avoid any inconvenience.</p>
      </div>
      
      <div style="background: #f0f0f0; padding: 15px; text-align: center; color: #666;">
        <p>St. Joseph's Central Academy - Sironoi</p>
        <p>For inquiries, contact us at info@stjoseph.ac.ke</p>
      </div>
    </div>
  `
  
  const text = `
ST. JOSEPH'S CENTRAL ACADEMY - SIRONOI
Fee Payment Reminder

Dear Parent/Guardian,

This is a friendly reminder that there are outstanding fees for ${data.studentName}.

Outstanding Fees:
${data.feeDetails.map(fee => `• ${fee.name}: KES ${fee.amount.toLocaleString()}`).join('\n')}

Total Outstanding: KES ${data.outstandingAmount.toLocaleString()}
${data.dueDate ? `Due Date: ${data.dueDate}` : ''}

How to Pay via M-Pesa:
1. Go to M-Pesa menu
2. Select "Pay Bill"
3. Enter Business Number: 174379
4. Account Number: ${data.studentName.split(' ')[0].toUpperCase()}_ADMISSION_NO
5. Enter Amount and confirm

Please ensure payment is made as soon as possible to avoid any inconvenience.

St. Joseph's Central Academy - Sironoi
For inquiries, contact us at info@stjoseph.ac.ke
  `
  
  return { subject, html, text }
}