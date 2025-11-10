import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ApiResponse, ProductFormData } from '@/types'

/**
 * GET /api/products
 * List all products
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const products = await prisma.product.findMany({
      where: status !== null ? { status: status === 'true' } : undefined,
      include: {
        options: {
          orderBy: [{ level: 'asc' }, { order: 'asc' }],
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json<ApiResponse>({
      success: true,
      data: products,
    })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/products
 * Create a new product
 */
export async function POST(request: NextRequest) {
  try {
    const body: ProductFormData = await request.json()

    // Validate required fields
    if (!body.code || !body.sku || !body.name) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if code already exists
    const existing = await prisma.product.findUnique({
      where: { code: body.code },
    })

    if (existing) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Product code already exists' },
        { status: 400 }
      )
    }

    const product = await prisma.product.create({
      data: {
        code: body.code,
        sku: body.sku,
        name: body.name,
        width: body.width,
        height: body.height,
        widthUnit: body.widthUnit,
        heightUnit: body.heightUnit,
        status: body.status ?? true,
      },
      include: {
        options: true,
      },
    })

    return NextResponse.json<ApiResponse>(
      { success: true, data: product },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to create product' },
      { status: 500 }
    )
  }
}
