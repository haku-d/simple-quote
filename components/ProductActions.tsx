'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Copy, Edit, Trash2, MoreVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ProductActionsProps {
  product: {
    id: string
    code: string
    name: string
  }
}

export function ProductActions({ product }: ProductActionsProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [isCloning, setIsCloning] = useState(false)

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${product.name}"?`)) {
      return
    }

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/products/${product.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        router.refresh()
      } else {
        alert('Failed to delete product')
      }
    } catch (error) {
      alert('An error occurred')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleClone = async () => {
    setIsCloning(true)
    try {
      const response = await fetch(`/api/products/${product.id}/clone`, {
        method: 'POST',
      })

      if (response.ok) {
        router.refresh()
      } else {
        alert('Failed to clone product')
      }
    } catch (error) {
      alert('An error occurred')
    } finally {
      setIsCloning(false)
    }
  }

  return (
    <div className="flex items-center space-x-2">
      <Link href={`/dashboard/products/${product.id}`}>
        <Button variant="ghost" size="icon">
          <Edit className="h-4 w-4" />
        </Button>
      </Link>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleClone}
        disabled={isCloning}
      >
        <Copy className="h-4 w-4" />
      </Button>
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
