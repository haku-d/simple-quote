import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default async function ProductEditPage({
  params,
}: {
  params: { id: string }
}) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: {
      options: {
        orderBy: [{ level: 'asc' }, { order: 'asc' }],
        include: {
          children: true,
        },
      },
    },
  })

  if (!product) {
    notFound()
  }

  return (
    <div className="px-4 py-6">
      <div className="mb-6">
        <Link href="/dashboard/products">
          <Button variant="ghost" size="sm">
            ← Back to Products
          </Button>
        </Link>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{product.name}</CardTitle>
                <CardDescription>
                  Code: {product.code} | SKU: {product.sku}
                </CardDescription>
              </div>
              <Badge variant={product.status ? 'success' : 'secondary'}>
                {product.status ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Dimensions:</span>{' '}
                {product.width && product.height
                  ? `${product.width} × ${product.height} ${product.widthUnit || 'unit'}`
                  : 'Not set'}
              </div>
              <div>
                <span className="font-medium">Options:</span> {product.options.length}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Product Options</CardTitle>
            <CardDescription>
              Options and pricing configuration for this product
            </CardDescription>
          </CardHeader>
          <CardContent>
            {product.options.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No options configured yet</p>
                <p className="text-sm mt-2">
                  Options can be managed through the API or database
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {product.options
                  .filter((opt) => opt.level === 0)
                  .map((option) => (
                    <div
                      key={option.id}
                      className="border rounded-lg p-4 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{option.name}</h4>
                          <p className="text-sm text-gray-600">
                            {option.sku} | Type: {option.type}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {option.required && (
                            <Badge variant="outline">Required</Badge>
                          )}
                          {option.hidden && (
                            <Badge variant="secondary">Hidden</Badge>
                          )}
                        </div>
                      </div>
                      {option.cost && (
                        <p className="text-sm">
                          Cost: ${option.cost.toFixed(2)}
                        </p>
                      )}
                      {option.children && option.children.length > 0 && (
                        <div className="ml-4 mt-2 space-y-2">
                          {option.children.map((child) => (
                            <div
                              key={child.id}
                              className="border-l-2 border-gray-200 pl-4 text-sm"
                            >
                              <div className="flex items-center justify-between">
                                <span>{child.name}</span>
                                <span className="text-gray-600">
                                  {child.type === 'Factor'
                                    ? `×${child.qty}`
                                    : child.cost
                                    ? `$${child.cost.toFixed(2)}`
                                    : ''}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="p-4 bg-yellow-50 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> Full option editing UI is under development.
            For now, you can manage options through Prisma Studio (
            <code>npm run db:studio</code>) or the API.
          </p>
        </div>
      </div>
    </div>
  )
}
