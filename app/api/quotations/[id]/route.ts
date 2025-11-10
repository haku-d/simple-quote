import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ApiResponse } from '@/types'

/**
 * GET /api/quotations/:id
 * Get a single quotation by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const quotation = await prisma.quotation.findUnique({
      where: { id: params.id },
      include: {
        items: {
          include: {
            product: {
              include: {
                options: {
                  include: {
                    children: true,
                  },
                },
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    })

    if (!quotation) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Quotation not found' },
        { status: 404 }
      )
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: quotation,
    })
  } catch (error) {
    console.error('Error fetching quotation:', error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to fetch quotation' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/quotations/:id
 * Update a quotation
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()

    const quotation = await prisma.quotation.update({
      where: { id: params.id },
      data: {
        customerName: body.customerName,
        customerCompany: body.customerCompany,
        discount: body.discount,
        discountType: body.discountType,
        taxRate: body.taxRate,
        expiryDate: body.expiryDate,
        note: body.note,
        policy: body.policy,
        status: body.status,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        user: true,
      },
    })

    return NextResponse.json<ApiResponse>({
      success: true,
      data: quotation,
    })
  } catch (error) {
    console.error('Error updating quotation:', error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to update quotation' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/quotations/:id
 * Delete a quotation
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.quotation.delete({
      where: { id: params.id },
    })

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Quotation deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting quotation:', error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to delete quotation' },
      { status: 500 }
    )
  }
}
