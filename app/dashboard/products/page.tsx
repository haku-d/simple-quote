import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ProductActions } from '@/components/ProductActions'

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    include: {
      options: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return (
    <div className="px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage your product catalog and options
          </p>
        </div>
        <Link href="/dashboard/products/new">
          <Button>Create Product</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {products.length === 0 ? (
          <Card className="p-12 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No products yet
            </h3>
            <p className="text-gray-500 mb-4">
              Get started by creating your first product
            </p>
            <Link href="/dashboard/products/new">
              <Button>Create Product</Button>
            </Link>
          </Card>
        ) : (
          products.map((product) => (
            <Card key={product.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {product.name}
                    </h3>
                    <Badge variant={product.status ? 'success' : 'secondary'}>
                      {product.status ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>
                      <span className="font-medium">Code:</span> {product.code}
                    </p>
                    <p>
                      <span className="font-medium">SKU:</span> {product.sku}
                    </p>
                    {product.width && product.height && (
                      <p>
                        <span className="font-medium">Dimensions:</span>{' '}
                        {product.width} × {product.height}{' '}
                        {product.widthUnit || 'unit'}
                      </p>
                    )}
                    <p>
                      <span className="font-medium">Options:</span>{' '}
                      {product.options.length}
                    </p>
                  </div>
                </div>
                <ProductActions product={product} />
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
