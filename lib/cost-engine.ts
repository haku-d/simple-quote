import { Option, OptionType } from '@prisma/client'
import { Pricebreak, SelectedOption, CostCalculation } from '@/types'

interface OptionWithChildren extends Option {
  children?: OptionWithChildren[]
}

interface ProductWithOptions {
  options: OptionWithChildren[]
}

/**
 * Find the selected Factor option from the options tree
 */
function findSelectedFactor(
  options: OptionWithChildren[],
  selectedMap: Map<string, string | undefined>
): { qty: number; name: string } | null {
  for (const option of options) {
    if (option.type === 'Factor' && selectedMap.has(option.id)) {
      return { qty: option.qty, name: option.name }
    }
    if (option.children && option.children.length > 0) {
      const factor = findSelectedFactor(option.children, selectedMap)
      if (factor) return factor
    }
  }
  return null
}

/**
 * Calculate cost for a single Option based on quantity and pricebreak
 */
function calculateOption(option: Option, costQty: number): number {
  // Factor options have no cost
  if (option.type === 'Factor') return 0

  // Fixed cost options (sameParent = false) don't multiply by quantity
  if (!option.sameParent) {
    return option.cost || 0
  }

  // Get base cost per unit
  let costPerUnit = option.cost || 0

  // Apply pricebreak if available
  if (option.pricebreak) {
    const pricebreaks = option.pricebreak as Pricebreak[]

    // Find the highest tier where minQty <= costQty
    let applicableTier: Pricebreak | null = null
    for (const tier of pricebreaks) {
      if (tier.minQty <= costQty) {
        if (!applicableTier || tier.minQty > applicableTier.minQty) {
          applicableTier = tier
        }
      }
    }

    if (applicableTier) {
      costPerUnit = applicableTier.costPerUnit
    }
  }

  return costPerUnit * costQty
}

/**
 * Calculate cost for a Selector and its selected children
 */
function calculateSelector(
  selector: OptionWithChildren,
  selectedMap: Map<string, string | undefined>,
  costQty: number,
  selectorLevel: number
): number {
  if (!selector.children) return 0

  let total = 0

  // Process each child option
  for (const child of selector.children) {
    // Skip if not selected
    if (!selectedMap.has(child.id)) continue

    // Skip Factor options (they don't have cost)
    if (child.type === 'Factor') continue

    // Calculate cost based on sameParent and level
    if (child.sameParent && child.level === selectorLevel) {
      // Multiply by cost quantity
      total += calculateOption(child, costQty)
    } else {
      // Fixed cost, don't multiply
      total += calculateOption(child, 1)
    }

    // If child is also a Selector, recurse
    if (child.type === 'Selector' && child.children) {
      total += calculateSelector(child, selectedMap, costQty, child.level)
    }
  }

  return total
}

/**
 * Calculate total cost for a product based on order quantity and selected options
 *
 * @param product Product with options
 * @param orderQty Order quantity (user input)
 * @param selected Array of selected option IDs
 * @returns Cost calculation result with total, cost quantity, and factor
 */
export function calculateProductTotal(
  product: ProductWithOptions,
  orderQty: number,
  selected: SelectedOption[]
): CostCalculation {
  // Create a map of selected options for quick lookup
  const selectedMap = new Map(selected.map(s => [s.optionId, s.factorId]))

  // Find selected factor
  const factor = findSelectedFactor(product.options, selectedMap)

  // Calculate cost quantity
  const costQty = orderQty * (factor?.qty || 1)

  let total = 0

  // Get root level options (level 0)
  const rootOptions = product.options.filter(o => o.level === 0)

  for (const option of rootOptions) {
    // Skip Factor options at root level (they don't add cost)
    if (option.type === 'Factor') continue

    const isSelected = selectedMap.has(option.id)

    // Check if required option is selected
    if (!isSelected && option.required && !option.hidden) {
      throw new Error(`${option.name} is required`)
    }

    // Process based on type
    if (option.type === 'Selector') {
      // Selectors don't have their own cost, only their children
      total += calculateSelector(option, selectedMap, costQty, option.level)
    } else if (option.type === 'Option') {
      // Only add cost if selected or required
      if (isSelected || option.required) {
        total += calculateOption(option, costQty)
      }
    }
  }

  return {
    total,
    costQty,
    factor: factor || undefined,
  }
}

/**
 * Calculate quotation totals including discount and tax
 */
export function calculateQuotationTotals(
  subtotal: number,
  discount: number = 0,
  discountType: 'percent' | 'fixed' = 'percent',
  taxRate: number = 10
) {
  // Calculate discount amount
  const discountAmount = discountType === 'percent'
    ? subtotal * (discount / 100)
    : discount

  // Calculate taxable amount
  const taxableAmount = subtotal - discountAmount

  // Calculate tax
  const tax = taxableAmount * (taxRate / 100)

  // Calculate grand total
  const grandTotal = taxableAmount + tax

  return {
    subtotal,
    discountAmount,
    taxableAmount,
    tax,
    grandTotal,
  }
}
