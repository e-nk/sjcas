import { registerC2BUrls } from '@/lib/actions/mpesa'

export async function setupMpesaUrls() {
  console.log('Registering M-Pesa C2B URLs...')
  const result = await registerC2BUrls()
  
  if (result.success) {
    console.log('✅ M-Pesa URLs registered successfully')
    console.log(result.data)
  } else {
    console.error('❌ Failed to register M-Pesa URLs:', result.error)
  }
  
  return result
}