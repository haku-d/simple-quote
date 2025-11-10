import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'

export default async function UsersPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/dashboard')
  }

  const users = await prisma.user.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      needApproval: true,
      createdAt: true,
      _count: {
        select: {
          quotations: true,
        },
      },
    },
  })

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'destructive'
      case 'MANAGER':
        return 'default'
      case 'SALE':
        return 'secondary'
      default:
        return 'secondary'
    }
  }

  return (
    <div className="px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Users</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage user accounts and permissions
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {users.map((user) => (
          <Card key={user.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {user.name}
                  </h3>
                  <Badge variant={getRoleBadgeVariant(user.role)}>
                    {user.role}
                  </Badge>
                  {user.needApproval && (
                    <Badge variant="outline">Needs Approval</Badge>
                  )}
                </div>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>
                    <span className="font-medium">Email:</span> {user.email}
                  </p>
                  <p>
                    <span className="font-medium">Quotations:</span>{' '}
                    {user._count.quotations}
                  </p>
                  <p>
                    <span className="font-medium">Joined:</span>{' '}
                    {formatDate(user.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        ))}

        {users.length === 0 && (
          <Card className="p-12 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No users found
            </h3>
            <p className="text-gray-500">
              Users can register through the registration page
            </p>
          </Card>
        )}
      </div>

      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> Full user management (edit, delete, change roles) will be added in a future update.
          For now, you can manage users through Prisma Studio (<code>npm run db:studio</code>).
        </p>
      </div>
    </div>
  )
}
