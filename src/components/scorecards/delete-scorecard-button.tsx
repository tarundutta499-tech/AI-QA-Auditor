"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { deleteScorecard } from "@/app/dashboard/scorecards/actions"

export function DeleteScorecardButton({ id }: { id: string }) {
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this scorecard? This action cannot be undone.")) return
    
    setIsDeleting(true)
    try {
      const result = await deleteScorecard(id)
      if (result?.success) {
        router.refresh()
      }
    } catch (error) {
      console.error("Failed to delete scorecard:", error)
      alert("Failed to delete scorecard. It might be in use.")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-destructive hover:bg-destructive hover:text-destructive-foreground ml-2"
    >
      <Trash2 className="h-4 w-4 mr-2" />
      {isDeleting ? "Deleting..." : "Delete"}
    </Button>
  )
}
