import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ApiResponse } from '@/types'

/**
 * POST /api/products/:id/clone
 * Clone a product with all its options
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get the original product with all options
    const originalProduct = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        options: {
          include: {
            children: true,
          },
        },
      },
    })

    if (!originalProduct) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Product not found' },
        { status: 404 }
      )
    }

    // Generate new unique code
    const timestamp = Date.now().toString().slice(-6)
    const newCode = `${originalProduct.code}-CLONE-${timestamp}`
    const newSku = `${originalProduct.sku}-CLONE`
    const newName = `${originalProduct.name} (Copy)`

    // Create the cloned product with options
    const clonedProduct = await prisma.product.create({
      data: {
        code: newCode,
        sku: newSku,
        name: newName,
        width: originalProduct.width,
        height: originalProduct.height,
        widthUnit: originalProduct.widthUnit,
        heightUnit: originalProduct.heightUnit,
        status: originalProduct.status,
        options: {
          create: await cloneOptionsRecursively(originalProduct.options),
        },
      },
      include: {
        options: {
          orderBy: [{ level: 'asc' }, { order: 'asc' }],
          include: {
            children: true,
          },
        },
      },
    })

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: clonedProduct,
        message: 'Product cloned successfully',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error cloning product:', error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to clone product' },
      { status: 500 }
    )
  }
}

/**
 * Helper function to recursively clone options
 */
async function cloneOptionsRecursively(options: any[]): Promise<any[]> {
  return options
    .filter(opt => !opt.parentId) // Only root options
    .map(option => ({
      code: option.code,
      sku: option.sku,
      name: option.name,
      type: option.type,
      level: option.level,
      order: option.order,
      groupName: option.groupName,
      selection: option.selection,
      required: option.required,
      sameParent: option.sameParent,
      hidden: option.hidden,
      qty: option.qty,
      cost: option.cost,
      pricebreak: option.pricebreak,
      children: option.children
        ? {
            create: option.children.map((child: any) => ({
              code: child.code,
              sku: child.sku,
              name: child.name,
              type: child.type,
              level: child.level,
              order: child.order,
              groupName: child.groupName,
              selection: child.selection,
              required: child.required,
              sameParent: child.sameParent,
              hidden: child.hidden,
              qty: child.qty,
              cost: child.cost,
              pricebreak: child.pricebreak,
            })),
          }
        : undefined,
    }))
}
