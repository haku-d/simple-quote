'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function NewProductPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    code: '',
    sku: '',
    name: '',
    width: '',
    height: '',
    widthUnit: 'inch',
    heightUnit: 'inch',
    status: true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          width: formData.width ? parseFloat(formData.width) : undefined,
          height: formData.height ? parseFloat(formData.height) : undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to create product')
        return
      }

      router.push(`/dashboard/products/${data.data.id}`)
      router.refresh()
    } catch (error) {
      setError('An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    })
  }

  return (
    <div className="px-4 py-6 max-w-4xl">
      <div className="mb-6">
        <Link href="/dashboard/products">
          <Button variant="ghost" size="sm">
            ← Back to Products
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create New Product</CardTitle>
          <CardDescription>
            Add a new product to your catalog. You can add options after creating the product.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code">Product Code *</Label>
                <Input
                  id="code"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  placeholder="BC-001"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sku">SKU *</Label>
                <Input
                  id="sku"
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  placeholder="BC-STD"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Business Card - Standard"
                required
                disabled={isLoading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="width">Width</Label>
                <Input
                  id="width"
                  name="width"
                  type="number"
                  step="0.01"
                  value={formData.width}
                  onChange={handleChange}
                  placeholder="3.5"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="height">Height</Label>
                <Input
                  id="height"
                  name="height"
                  type="number"
                  step="0.01"
                  value={formData.height}
                  onChange={handleChange}
                  placeholder="2.0"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="widthUnit">Width Unit</Label>
                <Input
                  id="widthUnit"
                  name="widthUnit"
                  value={formData.widthUnit}
                  onChange={handleChange}
                  placeholder="inch"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="heightUnit">Height Unit</Label>
                <Input
                  id="heightUnit"
                  name="heightUnit"
                  value={formData.heightUnit}
                  onChange={handleChange}
                  placeholder="inch"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="status"
                name="status"
                checked={formData.status}
                onChange={handleChange}
                disabled={isLoading}
                className="h-4 w-4"
              />
              <Label htmlFor="status">Active</Label>
            </div>

            <div className="flex space-x-2">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create Product'}
              </Button>
              <Link href="/dashboard/products">
                <Button type="button" variant="outline" disabled={isLoading}>
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> After creating the product, you'll be able to add options, selectors, and factors on the product edit page.
        </p>
      </div>
    </div>
  )
}
