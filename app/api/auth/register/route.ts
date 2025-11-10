import { NextRequest, NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { ApiResponse } from '@/types'

/**
 * POST /api/auth/register
 * Register a new user
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password } = body

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'User already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await hash(password, 10)

    // Create user (default role: SALE)
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'SALE',
        needApproval: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    })

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: user,
        message: 'User created successfully',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to create user' },
      { status: 500 }
    )
  }
}
