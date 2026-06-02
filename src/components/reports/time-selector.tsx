"use client"

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Button } from "@/components/ui/button"

import { Suspense } from 'react'

function TimeSelectorContent() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const range = searchParams.get('range') || 'week'

  function setRange(value: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('range', value)
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex bg-muted/30 p-1 rounded-lg gap-1 border">
      <Button 
        variant={range === 'week' ? 'secondary' : 'ghost'} 
        size="sm" 
        onClick={() => setRange('week')} 
        className={range === 'week' ? 'bg-background shadow-sm font-semibold' : 'text-muted-foreground'}
      >
        7 Days
      </Button>
      <Button 
        variant={range === 'month' ? 'secondary' : 'ghost'} 
        size="sm" 
        onClick={() => setRange('month')} 
        className={range === 'month' ? 'bg-background shadow-sm font-semibold' : 'text-muted-foreground'}
      >
        30 Days
      </Button>
      <Button 
        variant={range === 'year' ? 'secondary' : 'ghost'} 
        size="sm" 
        onClick={() => setRange('year')} 
        className={range === 'year' ? 'bg-background shadow-sm font-semibold' : 'text-muted-foreground'}
      >
        1 Year
      </Button>
    </div>
  )
}

export function TimeSelector() {
  return (
    <Suspense fallback={<div className="h-8 w-64 bg-muted animate-pulse rounded-lg" />}>
      <TimeSelectorContent />
    </Suspense>
  )
}
