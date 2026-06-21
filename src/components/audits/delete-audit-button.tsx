'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { deleteAudit } from '@/app/dashboard/audits/actions'

export function DeleteAuditButton({ auditId }: { auditId: string }) {
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this audit? This action cannot be undone and will permanently delete the call, transcript, and AI scores.')) {
      return
    }
    
    setIsDeleting(true)
    try {
      await deleteAudit(auditId)
    } catch (e: any) {
      alert(e.message)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={handleDelete} 
      disabled={isDeleting} 
      className="text-red-500 hover:text-red-700 hover:bg-red-50"
      title="Delete Audit"
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  )
}
