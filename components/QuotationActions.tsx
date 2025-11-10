'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Eye, Download, Check, X, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface QuotationActionsProps {
  quotation: {
    id: string
    number: string
    status: string
  }
}

export function QuotationActions({ quotation }: QuotationActionsProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const [isDeleting, setIsDeleting] = useState(false)
  const [isApproving, setIsApproving] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)

  const canApprove =
    session?.user.role === 'ADMIN' || session?.user.role === 'MANAGER'

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete quotation ${quotation.number}?`)) {
      return
    }

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/quotations/${quotation.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        router.refresh()
      } else {
        alert('Failed to delete quotation')
      }
    } catch (error) {
      alert('An error occurred')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleApprove = async () => {
    setIsApproving(true)
    try {
      const response = await fetch(`/api/quotations/${quotation.id}/approve`, {
        method: 'POST',
      })

      if (response.ok) {
        router.refresh()
      } else {
        alert('Failed to approve quotation')
      }
    } catch (error) {
      alert('An error occurred')
    } finally {
      setIsApproving(false)
    }
  }

  const handleReject = async () => {
    setIsRejecting(true)
    try {
      const response = await fetch(`/api/quotations/${quotation.id}/reject`, {
        method: 'POST',
      })

      if (response.ok) {
        router.refresh()
      } else {
        alert('Failed to reject quotation')
      }
    } catch (error) {
      alert('An error occurred')
    } finally {
      setIsRejecting(false)
    }
  }

  return (
    <div className="flex items-center space-x-2">
      <Link href={`/dashboard/quotations/${quotation.id}`}>
        <Button variant="ghost" size="icon">
          <Eye className="h-4 w-4" />
        </Button>
      </Link>

      {quotation.status === 'PENDING' && canApprove && (
        <>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleApprove}
            disabled={isApproving}
            title="Approve"
          >
            <Check className="h-4 w-4 text-green-600" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleReject}
            disabled={isRejecting}
            title="Reject"
          >
            <X className="h-4 w-4 text-red-600" />
          </Button>
        </>
      )}

      <Button
        variant="ghost"
        size="icon"
        onClick={handleDelete}
        disabled={isDeleting}
      >
        <Trash2 className="h-4 w-4 text-red-600" />
      </Button>
    </div>
  )
}
