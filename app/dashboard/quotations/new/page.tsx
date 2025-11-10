import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { QuotationForm } from '@/components/QuotationForm'

export default async function NewQuotationPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/login')
  }

  const products = await prisma.product.findMany({
    where: { status: true },
    include: {
      options: {
        orderBy: [{ level: 'asc' }, { order: 'asc' }],
        include: {
          children: true,
        },
      },
    },
  })

  return (
    <div className="px-4 py-6 max-w-6xl">
      <div className="mb-6">
        <Link href="/dashboard/quotations">
          <Button variant="ghost" size="sm">
            ← Back to Quotations
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create New Quotation</CardTitle>
          <CardDescription>
            Create a quotation for your customer
          </CardDescription>
        </CardHeader>
        <CardContent>
          <QuotationForm products={products} userId={session.user.id} />
        </CardContent>
      </Card>
    </div>
  )
}
