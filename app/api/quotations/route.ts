import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ApiResponse, QuotationFormData } from '@/types'
import { generateQuotationNumber } from '@/lib/utils'
import { calculateProductTotal } from '@/lib/cost-engine'

/**
 * GET /api/quotations
 * List all quotations
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const quotations = await prisma.quotation.findMany({
      where: status ? { status: status as any } : undefined,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json<ApiResponse>({
      success: true,
      data: quotations,
    })
  } catch (error) {
    console.error('Error fetching quotations:', error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to fetch quotations' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/quotations
 * Create a new quotation
 */
export async function POST(request: NextRequest) {
  try {
    const body: QuotationFormData & { userId: string } = await request.json()

    // Validate required fields
    if (!body.customerName || !body.userId || !body.items || body.items.length === 0) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Calculate line totals for each item
    const itemsWithTotals = await Promise.all(
      body.items.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          include: {
            options: {
              include: {
                children: true,
              },
            },
          },
        })

        if (!product) {
          throw new Error(`Product ${item.productId} not found`)
        }

        const { total } = calculateProductTotal(
          product,
          item.orderQty,
          item.selectedOptions
        )

        return {
          productId: item.productId,
          orderQty: item.orderQty,
          selectedOptions: item.selectedOptions,
          lineTotal: total,
        }
      })
    )

    // Generate quotation number
    const number = generateQuotationNumber()

    // Get user to check approval requirements
    const user = await prisma.user.findUnique({
      where: { id: body.userId },
    })

    // Determine initial status
    let status: 'DRAFT' | 'PENDING' = 'DRAFT'
    if (user?.role === 'SALE' && user.needApproval && body.discount && body.discount > 0) {
      status = 'PENDING'
    }

    // Create quotation
    const quotation = await prisma.quotation.create({
      data: {
        number,
        customerName: body.customerName,
        customerCompany: body.customerCompany,
        status,
        discount: body.discount,
        discountType: body.discountType,
        taxRate: body.taxRate,
        expiryDate: body.expiryDate,
        note: body.note,
        policy: body.policy,
        userId: body.userId,
        items: {
          create: itemsWithTotals,
        },
      },
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
        user: true,
      },
    })

    return NextResponse.json<ApiResponse>(
      { success: true, data: quotation },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating quotation:', error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to create quotation' },
      { status: 500 }
    )
  }
}
