import { Decimal } from '@prisma/client/runtime/library'

// Convert Decimal to number for client components
export function decimalToNumber(decimal: Decimal | number | string): number {
  if (typeof decimal === 'number') return decimal
  if (typeof decimal === 'string') return parseFloat(decimal)
  return decimal.toNumber()
}

// Convert Decimal to string for client components
export function decimalToString(decimal: Decimal | number | string): string {
  if (typeof decimal === 'string') return decimal
  if (typeof decimal === 'number') return decimal.toString()
  return decimal.toString()
}

// Serialize object with Decimals for client components
export function serializeDecimal<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj
  
  if (obj instanceof Decimal) {
    return obj.toNumber() as unknown as T
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => serializeDecimal(item)) as unknown as T
  }
  
  if (typeof obj === 'object') {
    const serialized: any = {}
    for (const [key, value] of Object.entries(obj)) {
      serialized[key] = serializeDecimal(value)
    }
    return serialized
  }
  
  return obj
}