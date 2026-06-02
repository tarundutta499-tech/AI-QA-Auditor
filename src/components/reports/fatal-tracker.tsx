"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { ShieldAlert, ExternalLink } from 'lucide-react'

export type FatalViolation = {
  id: string // audit id
  parameter: string
  agentName: string
  date: string
}

export function FatalTracker({ data }: { data: FatalViolation[] }) {
  return (
    <Card className="shadow-sm border-2 border-rose-500/20 h-full">
      <CardHeader className="border-b pb-4 bg-rose-500/5">
        <CardTitle className="text-xl flex items-center gap-2 text-rose-600 dark:text-rose-400">
          <ShieldAlert className="h-5 w-5" />
          Fatal Violations
        </CardTitle>
        <CardDescription>Zero-tolerance compliance breaches in this timeframe.</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {data.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground flex flex-col items-center justify-center h-48">
            <ShieldAlert className="h-8 w-8 text-emerald-500/50 mb-2" />
            <p className="font-medium text-emerald-600 dark:text-emerald-400">Zero Fatal Violations!</p>
            <p className="text-xs">Perfect compliance in this period.</p>
          </div>
        ) : (
          <div className="divide-y max-h-[400px] overflow-y-auto">
            {data.map((violation, i) => (
              <div key={i} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                <div>
                  <div className="text-sm font-semibold text-rose-600 dark:text-rose-400 mb-1">
                    {violation.parameter}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">{violation.agentName}</span>
                    <span>•</span>
                    <span>{new Date(violation.date).toLocaleDateString()}</span>
                  </div>
                </div>
                <Link href={`/dashboard/audits/${violation.id}`}>
                  <Badge variant="outline" className="cursor-pointer hover:bg-muted gap-1">
                    Review <ExternalLink className="h-3 w-3" />
                  </Badge>
                </Link>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
