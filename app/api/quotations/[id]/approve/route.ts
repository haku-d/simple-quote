import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ApiResponse } from '@/types'

/**
 * POST /api/quotations/:id/approve
 * Approve a pending quotation (Manager only)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Check user role (MANAGER or ADMIN)
    // const session = await getServerSession(authOptions)
    // if (!session || (session.user.role !== 'MANAGER' && session.user.role !== 'ADMIN')) {
    //   return NextResponse.json<ApiResponse>(
    //     { success: false, error: 'Unauthorized' },
    //     { status: 403 }
    //   )
    // }

    const quotation = await prisma.quotation.findUnique({
      where: { id: params.id },
    })

    if (!quotation) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Quotation not found' },
        { status: 404 }
      )
    }

    if (quotation.status !== 'PENDING') {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Only pending quotations can be approved' },
        { status: 400 }
      )
    }

    const updated = await prisma.quotation.update({
      where: { id: params.id },
      data: { status: 'APPROVED' },
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
      data: updated,
      message: 'Quotation approved successfully',
    })
  } catch (error) {
    console.error('Error approving quotation:', error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to approve quotation' },
      { status: 500 }
    )
  }
}
