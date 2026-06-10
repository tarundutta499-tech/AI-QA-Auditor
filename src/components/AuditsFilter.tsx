"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useCallback, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, X } from "lucide-react"

export function AuditsFilter({ agents }: { agents: any[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [agentId, setAgentId] = useState(searchParams.get('agent') || '')
  const [minScore, setMinScore] = useState(searchParams.get('minScore') || '')

  const handleApply = useCallback(() => {
    const params = new URLSearchParams()
    if (agentId) params.set('agent', agentId)
    if (minScore) params.set('minScore', minScore)
    router.push(`/dashboard/audits?${params.toString()}`)
  }, [agentId, minScore, router])

  const handleClear = () => {
    setAgentId('')
    setMinScore('')
    router.push(`/dashboard/audits`)
  }

  return (
    <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-muted/20 rounded-lg border">
      {agents && agents.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">Agent:</span>
          <select 
            className="flex h-10 w-[200px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            value={agentId}
            onChange={(e) => setAgentId(e.target.value)}
          >
            <option value="">All Agents</option>
            {agents.map(a => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </div>
      )}

      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">Min Score:</span>
        <Input 
          type="number" 
          placeholder="e.g. 80" 
          className="w-[100px]"
          value={minScore}
          onChange={(e) => setMinScore(e.target.value)}
        />
      </div>

      <Button variant="secondary" onClick={handleApply}>
        <Search className="mr-2 h-4 w-4" /> Filter
      </Button>

      {(agentId || minScore) && (
        <Button variant="ghost" onClick={handleClear} className="text-muted-foreground">
          <X className="mr-2 h-4 w-4" /> Clear
        </Button>
      )}
    </div>
  )
}
