import { Prisma } from '@prisma/client'

// Enums
export type Role = 'ADMIN' | 'MANAGER' | 'SALE'
export type OptionType = 'Option' | 'Selector' | 'Factor'
export type SelectionType = 'Exclusive' | 'Inclusive'
export type QuotationStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'SENT'
export type DiscountType = 'percent' | 'fixed'

// Pricebreak type
export interface Pricebreak {
  minQty: number
  costPerUnit: number
}

// Product with options
export type ProductWithOptions = Prisma.ProductGetPayload<{
  include: { options: true }
}>

// Option with children and parent
export type OptionWithRelations = Prisma.OptionGetPayload<{
  include: { children: true; parent: true }
}>

// Quotation with items and user
export type QuotationWithDetails = Prisma.QuotationGetPayload<{
  include: {
    items: {
      include: {
        product: {
          include: {
            options: true
          }
        }
      }
    }
    user: true
  }
}>

// Selected options for quotation items
export interface SelectedOption {
  optionId: string
  factorId?: string
}

// Cost calculation result
export interface CostCalculation {
  total: number
  costQty: number
  factor?: {
    qty: number
    name: string
  }
}

// Quotation totals
export interface QuotationTotals {
  subtotal: number
  discountAmount: number
  taxableAmount: number
  tax: number
  grandTotal: number
}

// PDF data structure
export interface PDFQuotationData {
  number: string
  date: string
  expiryDate: string
  customerName: string
  customerCompany?: string
  items: PDFQuotationItem[]
  subtotal: number
  discount?: {
    type: DiscountType
    value: number
    amount: number
    reason?: string
  }
  taxRate: number
  tax: number
  grandTotal: number
  note?: string
  policy?: string
  salesName: string
}

export interface PDFQuotationItem {
  productName: string
  productSku: string
  orderQty: number
  factorQty?: number
  selectedOptions: string[] // Formatted option descriptions
  unitPrice: number
  lineTotal: number
}

// Form data types
export interface ProductFormData {
  code: string
  sku: string
  name: string
  width?: number
  height?: number
  widthUnit?: string
  heightUnit?: string
  status: boolean
}

export interface OptionFormData {
  code: string
  sku: string
  name: string
  type: OptionType
  level: number
  order: number
  groupName?: string
  selection?: SelectionType
  required: boolean
  sameParent: boolean
  hidden: boolean
  qty: number
  cost?: number
  pricebreak?: Pricebreak[]
  parentId?: string
}

export interface QuotationFormData {
  customerName: string
  customerCompany?: string
  discount?: number
  discountType?: DiscountType
  taxRate: number
  expiryDate: Date
  note?: string
  policy?: string
  items: QuotationItemFormData[]
}

export interface QuotationItemFormData {
  productId: string
  orderQty: number
  selectedOptions: SelectedOption[]
}

// User settings
export interface UserSettings {
  needApproval: boolean
}

// API response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}
