import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate } from '@/lib/utils'
import { calculateQuotationTotals } from '@/lib/cost-engine'
import { Download } from 'lucide-react'

export default async function QuotationDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const quotation = await prisma.quotation.findUnique({
    where: { id: params.id },
    include: {
      items: {
        include: {
          product: {
            include: {
              options: true,
            },
          },
        },
      },
      user: {
        select: {
          name: true,
          email: true,
          role: true,
        },
      },
    },
  })

  if (!quotation) {
    notFound()
  }

  const subtotal = quotation.items.reduce((sum, item) => sum + item.lineTotal, 0)
  const totals = calculateQuotationTotals(
    subtotal,
    quotation.discount || 0,
    quotation.discountType || 'percent',
    quotation.taxRate
  )

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
    <div className="px-4 py-6 max-w-5xl">
      <div className="mb-6">
        <Link href="/dashboard/quotations">
          <Button variant="ghost" size="sm">
            ← Back to Quotations
          </Button>
        </Link>
      </div>

      <div className="space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">{quotation.number}</CardTitle>
                <CardDescription>
                  Created by {quotation.user.name} on {formatDate(quotation.createdAt)}
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant={getStatusVariant(quotation.status)}>
                  {quotation.status}
                </Badge>
                <Button variant="outline" size="sm" disabled>
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Customer Information */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Customer Name</p>
                <p className="text-sm">{quotation.customerName}</p>
              </div>
              {quotation.customerCompany && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Company</p>
                  <p className="text-sm">{quotation.customerCompany}</p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-gray-500">Expiry Date</p>
                <p className="text-sm">{formatDate(quotation.expiryDate)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Currency</p>
                <p className="text-sm">{quotation.currency}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Items */}
        <Card>
          <CardHeader>
            <CardTitle>Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {quotation.items.map((item, index) => (
                <div
                  key={item.id}
                  className="border rounded-lg p-4 space-y-2"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{item.product.name}</h4>
                      <p className="text-sm text-gray-600">{item.product.sku}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {formatCurrency(item.lineTotal, quotation.currency)}
                      </p>
                      <p className="text-sm text-gray-600">
                        Qty: {item.orderQty}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Totals */}
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>{formatCurrency(totals.subtotal, quotation.currency)}</span>
              </div>
              {quotation.discount && quotation.discount > 0 && (
                <div className="flex justify-between text-sm text-red-600">
                  <span>
                    Discount ({quotation.discountType === 'percent' ? `${quotation.discount}%` : 'Fixed'})
                  </span>
                  <span>-{formatCurrency(totals.discountAmount, quotation.currency)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm border-t pt-2">
                <span>Amount after discount</span>
                <span>{formatCurrency(totals.taxableAmount, quotation.currency)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tax ({quotation.taxRate}%)</span>
                <span>{formatCurrency(totals.tax, quotation.currency)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t-2 pt-2">
                <span>Grand Total</span>
                <span>{formatCurrency(totals.grandTotal, quotation.currency)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notes & Policy */}
        {(quotation.note || quotation.policy) && (
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {quotation.note && (
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Note</p>
                  <p className="text-sm whitespace-pre-wrap">{quotation.note}</p>
                </div>
              )}
              {quotation.policy && (
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Terms & Conditions</p>
                  <p className="text-sm whitespace-pre-wrap">{quotation.policy}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="p-4 bg-yellow-50 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> PDF generation functionality is under development.
            For now, you can view quotation details here.
          </p>
        </div>
      </div>
    </div>
  )
}
