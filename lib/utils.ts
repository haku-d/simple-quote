import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generate unique quotation number
 */
export function generateQuotationNumber(): string {
  const year = new Date().getFullYear()
  const timestamp = Date.now().toString().slice(-6)
  return `Q-${year}-${timestamp}`
}

/**
 * Format currency
 */
export function formatCurrency(value: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(value)
}

/**
 * Format date
 */
export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Calculate default expiry date (7 days from now)
 */
export function getDefaultExpiryDate(): Date {
  const date = new Date()
  date.setDate(date.getDate() + 7)
  return date
}

/**
 * Check if user has permission
 */
export function hasPermission(userRole: string, requiredRole: string | string[]): boolean {
  const roleHierarchy = {
    ADMIN: 3,
    MANAGER: 2,
    SALE: 1,
  }

  const userLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] || 0

  if (Array.isArray(requiredRole)) {
    return requiredRole.some(role => {
      const requiredLevel = roleHierarchy[role as keyof typeof roleHierarchy] || 0
      return userLevel >= requiredLevel
    })
  }

  const requiredLevel = roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0
  return userLevel >= requiredLevel
}
