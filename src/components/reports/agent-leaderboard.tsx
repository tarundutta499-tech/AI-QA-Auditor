"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { ArrowUpRight, ArrowDownRight, Trophy, AlertTriangle } from 'lucide-react'

export type AgentRank = {
  id: string
  name: string
  score: number
  audits: number
}

export function AgentLeaderboard({ data }: { data: AgentRank[] }) {
  // Sort descending
  const sorted = [...data].sort((a, b) => b.score - a.score)
  
  const topAgents = sorted.slice(0, 5)
  // Bottom 5 (only if there are enough agents, and we exclude top agents to avoid overlap in small teams)
  const bottomAgents = sorted.slice().reverse().slice(0, 5).filter(a => !topAgents.find(t => t.id === a.id))

  return (
    <Card className="shadow-sm border-2 h-full">
      <CardHeader className="border-b pb-4">
        <CardTitle className="text-xl flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Agent Leaderboard
        </CardTitle>
        <CardDescription>Top and bottom performers based on average QA score.</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid divide-y">
          {/* TOP AGENTS */}
          <div className="p-4 bg-emerald-500/5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-3 flex items-center gap-1">
              <ArrowUpRight className="h-4 w-4" /> Top Performers
            </h4>
            <div className="space-y-3">
              {topAgents.length === 0 ? (
                <p className="text-sm text-muted-foreground">No data available.</p>
              ) : (
                topAgents.map((agent, i) => (
                  <Link href={`/dashboard/agents/${agent.id}`} key={agent.id} className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className="w-6 text-center text-xs font-bold text-muted-foreground">{i + 1}</div>
                      <div>
                        <div className="text-sm font-medium group-hover:underline">{agent.name}</div>
                        <div className="text-xs text-muted-foreground">{agent.audits} audits</div>
                      </div>
                    </div>
                    <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600">
                      {agent.score}%
                    </Badge>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* BOTTOM AGENTS */}
          {bottomAgents.length > 0 && (
            <div className="p-4 bg-rose-500/5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 mb-3 flex items-center gap-1">
                <ArrowDownRight className="h-4 w-4" /> Needs Coaching
              </h4>
              <div className="space-y-3">
                {bottomAgents.map((agent, i) => (
                  <Link href={`/dashboard/agents/${agent.id}`} key={agent.id} className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className="w-6 text-center text-xs font-bold text-muted-foreground">
                        <AlertTriangle className="h-3 w-3 mx-auto text-rose-500" />
                      </div>
                      <div>
                        <div className="text-sm font-medium group-hover:underline">{agent.name}</div>
                        <div className="text-xs text-muted-foreground">{agent.audits} audits</div>
                      </div>
                    </div>
                    <Badge variant="destructive">
                      {agent.score}%
                    </Badge>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
