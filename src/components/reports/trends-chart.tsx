"use client"

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

export type ChartData = { name: string, score: number, calls: number }
export type DefectData = { parameter: string, count: number }

export function QualityScoreChart({ data }: { data: ChartData[] }) {
  const totalAudits = data.reduce((sum, d) => sum + d.calls, 0)
  
  return (
    <div className="space-y-8">
      <div className="h-[350px] w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
            <XAxis 
              dataKey="name" 
              tickLine={false} 
              axisLine={false} 
              tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
              dy={10}
            />
            <YAxis 
              tickLine={false} 
              axisLine={false} 
              tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
              domain={[0, 100]}
            />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--card)', color: 'var(--foreground)' }}
            />
            <Line 
              type="monotone" 
              dataKey="score" 
              stroke="var(--primary)" 
              strokeWidth={3}
              dot={{ r: 4, strokeWidth: 2, fill: 'var(--primary)' }}
              activeDot={{ r: 6, fill: 'var(--primary)' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="rounded-xl border border-white/5 bg-primary/10 p-6 flex flex-col items-center justify-center text-center">
        <h4 className="text-sm font-semibold text-purple-400/80 uppercase tracking-wider mb-2">Total Audits Completed</h4>
        <div className="text-6xl font-black text-primary tracking-tighter drop-shadow-[0_0_15px_rgba(147,51,234,0.3)]">{totalAudits}</div>
      </div>
    </div>
  )
}

export function VolumeChart({ data }: { data: ChartData[] }) {
  return (
    <div className="h-[300px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
          <XAxis 
            dataKey="name" 
            tickLine={false} 
            axisLine={false} 
            tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
            dy={10}
          />
          <YAxis 
            tickLine={false} 
            axisLine={false} 
            tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
          />
          <Tooltip 
            cursor={{ fill: 'var(--muted)' }}
            contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--card)', color: 'var(--foreground)' }}
          />
          <Bar dataKey="calls" fill="var(--primary)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function DefectsChart({ data }: { data: DefectData[] }) {
  if (data.length === 0) {
    return (
      <div className="h-[300px] w-full mt-4 flex items-center justify-center border-2 border-dashed rounded-xl text-muted-foreground bg-muted/10">
        No defects found in this timeframe!
      </div>
    )
  }

  const maxCount = Math.max(...data.map(d => d.count), 0)
  const xDomainMax = Math.max(5, maxCount)
  
  // Calculate dynamic height based on number of items so it never gets squished
  const chartHeight = Math.max(300, data.length * 45)

  return (
    <div className="w-full mt-4 overflow-y-auto pr-4" style={{ height: 400 }}>
      <div style={{ height: chartHeight, width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="hsl(var(--muted))" />
            <XAxis 
              type="number" 
              tickLine={false} 
              axisLine={false} 
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              domain={[0, xDomainMax]}
              allowDecimals={false}
            />
            <YAxis 
              dataKey="parameter" 
              type="category" 
              tickLine={false} 
              axisLine={false} 
              tick={{ fill: 'hsl(var(--foreground))', fontSize: 11, fontWeight: 500 }}
              width={160}
            />
            <Tooltip 
              cursor={{ fill: 'hsl(var(--muted))' }}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Bar dataKey="count" fill="hsl(var(--destructive))" radius={[0, 4, 4, 0]} barSize={24} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
