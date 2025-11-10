'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getDefaultExpiryDate, formatCurrency } from '@/lib/utils'

interface QuotationFormProps {
  products: any[]
  userId: string
}

export function QuotationForm({ products, userId }: QuotationFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    customerName: '',
    customerCompany: '',
    discount: '',
    discountType: 'percent' as 'percent' | 'fixed',
    taxRate: '10',
    expiryDate: getDefaultExpiryDate().toISOString().split('T')[0],
    note: '',
    policy: '',
  })

  const [selectedProduct, setSelectedProduct] = useState('')
  const [orderQty, setOrderQty] = useState('1')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!selectedProduct) {
      setError('Please select a product')
      return
    }

    setIsLoading(true)

    try {
      // For MVP, create quotation with minimal item data
      // In production, this would include full option selection
      const response = await fetch('/api/quotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          discount: formData.discount ? parseFloat(formData.discount) : undefined,
          taxRate: parseFloat(formData.taxRate),
          expiryDate: new Date(formData.expiryDate),
          userId,
          items: [
            {
              productId: selectedProduct,
              orderQty: parseInt(orderQty),
              selectedOptions: [], // Simplified for MVP
            },
          ],
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to create quotation')
        return
      }

      router.push(`/dashboard/quotations/${data.data.id}`)
      router.refresh()
    } catch (error) {
      setError('An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Customer Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Customer Information</h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="customerName">Customer Name *</Label>
            <Input
              id="customerName"
              name="customerName"
              value={formData.customerName}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="customerCompany">Company</Label>
            <Input
              id="customerCompany"
              name="customerCompany"
              value={formData.customerCompany}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>
        </div>
      </div>

      {/* Product Selection */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Product</h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="product">Select Product *</Label>
            <select
              id="product"
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              required
              disabled={isLoading}
            >
              <option value="">Select a product...</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} ({product.sku})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="orderQty">Quantity *</Label>
            <Input
              id="orderQty"
              type="number"
              min="1"
              value={orderQty}
              onChange={(e) => setOrderQty(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="p-3 bg-blue-50 rounded text-sm text-blue-800">
          <strong>Note:</strong> For this MVP version, quotations are created with default product options.
          Full option selection UI will be added in the next phase.
        </div>
      </div>

      {/* Pricing */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Pricing</h3>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="discount">Discount</Label>
            <Input
              id="discount"
              name="discount"
              type="number"
              step="0.01"
              min="0"
              value={formData.discount}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="discountType">Discount Type</Label>
            <select
              id="discountType"
              name="discountType"
              value={formData.discountType}
              onChange={handleChange}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              disabled={isLoading}
            >
              <option value="percent">Percentage</option>
              <option value="fixed">Fixed Amount</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="taxRate">Tax Rate (%)</Label>
            <Input
              id="taxRate"
              name="taxRate"
              type="number"
              step="0.01"
              min="0"
              value={formData.taxRate}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </div>
        </div>
      </div>

      {/* Additional Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Additional Information</h3>

        <div className="space-y-2">
          <Label htmlFor="expiryDate">Expiry Date</Label>
          <Input
            id="expiryDate"
            name="expiryDate"
            type="date"
            value={formData.expiryDate}
            onChange={handleChange}
            required
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="note">Note</Label>
          <textarea
            id="note"
            name="note"
            value={formData.note}
            onChange={handleChange}
            rows={3}
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="policy">Terms & Conditions</Label>
          <textarea
            id="policy"
            name="policy"
            value={formData.policy}
            onChange={handleChange}
            rows={3}
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="flex space-x-2">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Creating...' : 'Create Quotation'}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={isLoading}
          onClick={() => router.back()}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
