import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { QuotationActions } from '@/components/QuotationActions'
import { formatCurrency, formatDate } from '@/lib/utils'
import { calculateQuotationTotals } from '@/lib/cost-engine'

export default async function QuotationsPage() {
  const quotations = await prisma.quotation.findMany({
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      items: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return 'secondary'
      case 'PENDING':
        return 'pending'
      case 'APPROVED':
        return 'success'
      case 'REJECTED':
        return 'destructive'
      case 'SENT':
        return 'default'
      default:
        return 'secondary'
    }
  }

  return (
    <div className="px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quotations</h1>
          <p className="mt-2 text-sm text-gray-700">
            Create and manage customer quotations
          </p>
        </div>
        <Link href="/dashboard/quotations/new">
          <Button>Create Quotation</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {quotations.length === 0 ? (
          <Card className="p-12 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No quotations yet
            </h3>
            <p className="text-gray-500 mb-4">
              Get started by creating your first quotation
            </p>
            <Link href="/dashboard/quotations/new">
              <Button>Create Quotation</Button>
            </Link>
          </Card>
        ) : (
          quotations.map((quotation) => {
            const subtotal = quotation.items.reduce(
              (sum, item) => sum + item.lineTotal,
              0
            )
            const totals = calculateQuotationTotals(
              subtotal,
              quotation.discount || 0,
              quotation.discountType || 'percent',
              quotation.taxRate
            )

            return (
              <Card key={quotation.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {quotation.number}
                      </h3>
                      <Badge variant={getStatusVariant(quotation.status)}>
                        {quotation.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                      <div>
                        <p>
                          <span className="font-medium">Customer:</span>{' '}
                          {quotation.customerName}
                        </p>
                        {quotation.customerCompany && (
                          <p>
                            <span className="font-medium">Company:</span>{' '}
                            {quotation.customerCompany}
                          </p>
                        )}
                        <p>
                          <span className="font-medium">Created by:</span>{' '}
                          {quotation.user.name}
                        </p>
                      </div>
                      <div>
                        <p>
                          <span className="font-medium">Items:</span>{' '}
                          {quotation.items.length}
                        </p>
                        <p>
                          <span className="font-medium">Total:</span>{' '}
                          {formatCurrency(totals.grandTotal, quotation.currency)}
                        </p>
                        <p>
                          <span className="font-medium">Expires:</span>{' '}
                          {formatDate(quotation.expiryDate)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <QuotationActions quotation={quotation} />
                </div>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
