import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ApiResponse, ProductFormData } from '@/types'

/**
 * GET /api/products/:id
 * Get a single product by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Product not found' },
        { status: 404 }
      )
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: product,
    })
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to fetch product' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/products/:id
 * Update a product
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body: ProductFormData = await request.json()

    const product = await prisma.product.update({
      where: { id: params.id },
      data: {
        sku: body.sku,
        name: body.name,
        width: body.width,
        height: body.height,
        widthUnit: body.widthUnit,
        heightUnit: body.heightUnit,
        status: body.status,
      },
      include: {
        options: true,
      },
    })

    return NextResponse.json<ApiResponse>({
      success: true,
      data: product,
    })
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to update product' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/products/:id
 * Delete a product
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.product.delete({
      where: { id: params.id },
    })

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Product deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to delete product' },
      { status: 500 }
    )
  }
}
