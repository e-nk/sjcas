// Validate email address
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Validate phone number
export function isValidPhoneNumber(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '')
  
  // Kenyan phone numbers should be 12 digits (254XXXXXXXXX)
  if (cleaned.startsWith('254') && cleaned.length === 12) {
    return true
  }
  
  // Local format (0XXXXXXXXX) should be 10 digits
  if (cleaned.startsWith('0') && cleaned.length === 10) {
    return true
  }
  
  // 9 digits without country code or leading zero
  if (cleaned.length === 9) {
    return true
  }
  
  return false
}

// Format phone number for display
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.startsWith('254')) {
    return `+${cleaned}`
  }
  return phone
}