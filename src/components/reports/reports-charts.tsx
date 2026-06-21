"use client"

import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { TrendingUp, AlertTriangle, ShieldCheck, FileAudio } from "lucide-react"

export function ReportsCharts({ data, agentData, role }: { data: any[], agentData: any[], role: string }) {
  const avgEmpathy = data.length > 0 
    ? Math.round(data.reduce((acc, curr) => acc + (curr.empathy_score || 0), 0) / data.length) 
    : 0
  const avgCompliance = data.length > 0 
    ? Math.round(data.reduce((acc, curr) => acc + (curr.compliance_score || 0), 0) / data.length) 
    : 0

  const isManager = role !== 'agent'

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2 tracking-tight">Performance Analytics</h1>
          <p className="text-muted-foreground">Historical QA data and AI grading trends.</p>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="bg-muted/20 border border-border/50 rounded-3xl p-12 text-center text-muted-foreground">
          No audits found in the database. Go to the dashboard and run an AI Audit first!
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-border/50 shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Calls Audited</CardTitle>
                <FileAudio className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">{data.length}</div>
                <p className="text-xs text-green-500 mt-2 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" /> Recorded calls
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Avg Empathy Score</CardTitle>
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">{avgEmpathy}%</div>
                <p className="text-xs text-muted-foreground mt-2">Across all recorded calls</p>
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Avg Compliance Score</CardTitle>
                <ShieldCheck className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">{avgCompliance}%</div>
                <p className="text-xs text-muted-foreground mt-2">Strict QA protocol adherence</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="border-border/50 shadow-xl">
              <CardHeader>
                <CardTitle>Quality Assurance Trends</CardTitle>
                <CardDescription>Empathy vs Compliance scores over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                      <XAxis dataKey="name" className="text-muted-foreground text-xs" />
                      <YAxis className="text-muted-foreground text-xs" domain={[0, 100]} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', borderRadius: '8px' }}
                      />
                      <Legend wrapperStyle={{ paddingTop: '20px' }} />
                      <Line 
                        type="monotone" 
                        name="Empathy Score"
                        dataKey="empathy_score" 
                        stroke="#3b82f6" 
                        strokeWidth={3}
                        activeDot={{ r: 8 }} 
                      />
                      <Line 
                        type="monotone" 
                        name="Compliance Score"
                        dataKey="compliance_score" 
                        stroke="#22c55e" 
                        strokeWidth={3}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {isManager && agentData.length > 0 && (
              <Card className="border-border/50 shadow-xl">
                <CardHeader>
                  <CardTitle>Agent Leaderboard</CardTitle>
                  <CardDescription>Average performance per agent</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px] w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={agentData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                        <XAxis dataKey="name" className="text-muted-foreground text-xs" />
                        <YAxis className="text-muted-foreground text-xs" domain={[0, 100]} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', borderRadius: '8px' }}
                          cursor={{ fill: 'var(--muted)' }}
                        />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                        <Bar dataKey="avgCompliance" name="Avg Compliance" fill="#22c55e" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="avgEmpathy" name="Avg Empathy" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </>
      )}
    </div>
  )
}
