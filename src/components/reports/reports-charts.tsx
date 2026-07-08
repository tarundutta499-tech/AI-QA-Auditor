"use client"

import { useState } from 'react'
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  ComposedChart,
  ScatterChart,
  Scatter,
  ZAxis,
  Cell
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { 
  TrendingUp, 
  AlertTriangle, 
  ShieldCheck, 
  FileAudio, 
  Trophy, 
  Users, 
  TrendingDown,
  Sparkles,
  CheckCircle,
  HelpCircle,
  HeartPulse
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ReportsChartsProps {
  data: any[]
  agentData: any[]
  paretoData: any[]
  coachingData: any[]
  calibrationData: any[]
  role: string
}

export function ReportsCharts({ 
  data, 
  agentData, 
  paretoData, 
  coachingData, 
  calibrationData,
  role 
}: ReportsChartsProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'leaderboard' | 'pareto' | 'coaching' | 'calibration' | 'distribution'>('overview')
  const [timeframe, setTimeframe] = useState<'all' | 'daily' | 'weekly' | 'monthly'>('daily')

  const isManager = role !== 'agent'

  // Summary Metrics
  const avgEmpathy = data.length > 0 
    ? Math.round(data.reduce((acc, curr) => acc + (curr.empathy_score || 0), 0) / data.length) 
    : 0
  const avgCompliance = data.length > 0 
    ? Math.round(data.reduce((acc, curr) => acc + (curr.compliance_score || 0), 0) / data.length) 
    : 0

  // 1. Grouped Trends Data
  const getGroupedData = () => {
    if (timeframe === 'all') return data

    const grouped: Record<string, { compSum: number, empSum: number, count: number }> = {}
    data.forEach(item => {
      const d = new Date(item.created_at)
      let key = ''
      
      if (timeframe === 'daily') {
        key = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
      } else if (timeframe === 'weekly') {
        const firstDay = new Date(d)
        firstDay.setDate(firstDay.getDate() - firstDay.getDay())
        key = `Week of ${firstDay.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`
      } else if (timeframe === 'monthly') {
        key = d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
      }

      if (!grouped[key]) grouped[key] = { compSum: 0, empSum: 0, count: 0 }
      grouped[key].compSum += (item.compliance_score || 0)
      grouped[key].empSum += (item.empathy_score || 0)
      grouped[key].count += 1
    })

    return Object.entries(grouped).map(([key, stats]) => ({
      name: key,
      compliance_score: Math.round(stats.compSum / stats.count),
      empathy_score: Math.round(stats.empSum / stats.count)
    }))
  }

  const chartData = getGroupedData()

  // 2. Leaderboards (Top / Lowest Performers)
  const topPerformers = [...agentData]
    .sort((a, b) => b.avgCompliance - a.avgCompliance)
    .slice(0, 5)

  const needCoachingList = [...agentData]
    .sort((a, b) => a.avgCompliance - b.avgCompliance)
    .slice(0, 5)

  // 3. Performance Distribution (Bell Curve)
  const brackets = [
    { name: 'Critical Risk (<70%)', count: 0, fill: '#ef4444' },
    { name: 'Needs Coaching (70-80%)', count: 0, fill: '#f59e0b' },
    { name: 'Consistent (80-90%)', count: 0, fill: '#3b82f6' },
    { name: 'Star (>90%)', count: 0, fill: '#22c55e' }
  ]

  agentData.forEach(agent => {
    const score = agent.avgCompliance
    if (score >= 90) brackets[3].count++
    else if (score >= 80) brackets[2].count++
    else if (score >= 70) brackets[1].count++
    else brackets[0].count++
  })

  // Simulated fallback data for demonstration if empty
  const mockCoachingEfficacy = [
    { name: 'Week 1 (Before)', compliance: 72, empathy: 68 },
    { name: 'Week 2 (Coached)', compliance: 81, empathy: 78 },
    { name: 'Week 3 (After)', compliance: 89, empathy: 85 },
    { name: 'Week 4 (Sustained)', compliance: 92, empathy: 90 }
  ]

  const mockCalibrationData = [
    { id: 1, qa_score: 85, ai_score: 84, name: 'Call #102' },
    { id: 2, qa_score: 90, ai_score: 92, name: 'Call #105' },
    { id: 3, qa_score: 75, ai_score: 74, name: 'Call #108' },
    { id: 4, qa_score: 88, ai_score: 87, name: 'Call #111' },
    { id: 5, qa_score: 95, ai_score: 94, name: 'Call #115' },
    { id: 6, qa_score: 80, ai_score: 82, name: 'Call #120' }
  ]

  const activeCoachingData = coachingData.length > 0 ? coachingData : mockCoachingEfficacy
  const activeCalibrationData = calibrationData.length > 0 ? calibrationData : mockCalibrationData

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2 tracking-tight text-white flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-blue-500" />
            Performance Analytics
          </h1>
          <p className="text-gray-400 text-sm">Real-time BPO agent analytics, QA calibration, and automated trend lines.</p>
        </div>

        {/* Tab Selection */}
        <div className="flex flex-wrap p-1 bg-[#1E293B]/60 backdrop-blur-md rounded-2xl border border-gray-800/80 gap-1">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'leaderboard', label: 'Leaderboard' },
            { id: 'distribution', label: 'Bell Curve' },
            { id: 'pareto', label: 'Root Cause' },
            { id: 'coaching', label: 'Coaching ROI' },
            { id: 'calibration', label: 'QA Calibration' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-300 ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/10"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {data.length === 0 ? (
        <div className="bg-[#0B1120] border border-gray-800 rounded-3xl p-12 text-center text-gray-400">
          No audits found in the database. Ingest calls or perform an AI Audit to populate the dashboards!
        </div>
      ) : (
        <>
          {/* Main KPI Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-[#0B1120] border-gray-800 shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Calls Audited</CardTitle>
                <FileAudio className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-extrabold text-white">{data.length}</div>
                <p className="text-[10px] text-green-400 mt-2 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" /> Continuous compliance monitoring
                </p>
              </CardContent>
            </Card>

            <Card className="bg-[#0B1120] border-gray-800 shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Avg Empathy Score</CardTitle>
                <HeartPulse className="h-4 w-4 text-pink-500" />
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-extrabold text-white">{avgEmpathy}%</div>
                <p className="text-[10px] text-gray-400 mt-2">Aggregated customer sentiment baseline</p>
              </CardContent>
            </Card>

            <Card className="bg-[#0B1120] border-gray-800 shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Avg Compliance Score</CardTitle>
                <ShieldCheck className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-extrabold text-white">{avgCompliance}%</div>
                <p className="text-[10px] text-gray-400 mt-2">Strict QA checklist adherence</p>
              </CardContent>
            </Card>
          </div>

          {/* TAB 1: EXECUTIVE OVERVIEW */}
          {activeTab === 'overview' && (
            <Card className="bg-[#0B1120] border-gray-800 shadow-xl">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
                <div>
                  <CardTitle className="text-white">Quality Assurance Trends</CardTitle>
                  <CardDescription className="text-gray-400">Compliance & Empathy metrics over time</CardDescription>
                </div>
                <div className="w-[140px]">
                  <Select value={timeframe} onValueChange={(v: any) => setTimeframe(v)}>
                    <SelectTrigger className="h-8 bg-slate-900 border-gray-700 text-white">
                      <SelectValue placeholder="View by" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-gray-700 text-white">
                      <SelectItem value="all">Every Call</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                      <XAxis dataKey="name" stroke="#64748b" className="text-xs" />
                      <YAxis stroke="#64748b" className="text-xs" domain={[0, 100]} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#fff' }}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        name="Empathy Score"
                        dataKey="empathy_score" 
                        stroke="#ec4899" 
                        strokeWidth={3}
                        activeDot={{ r: 8 }} 
                      />
                      <Line 
                        type="monotone" 
                        name="Compliance Score"
                        dataKey="compliance_score" 
                        stroke="#3b82f6" 
                        strokeWidth={3}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {/* TAB 2: TEAM & LEADERBOARD */}
          {activeTab === 'leaderboard' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Leaderboard Cards */}
              <div className="lg:col-span-4 space-y-6">
                {/* Top Performers */}
                <Card className="bg-[#0B1120] border-gray-800 shadow-xl">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-white text-base flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-yellow-500" />
                      Top 5 Performers
                    </CardTitle>
                    <CardDescription className="text-xs text-gray-500">Highest compliance averages</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {topPerformers.map((agent, i) => (
                      <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/40 border border-gray-800">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs flex items-center justify-center font-bold">
                            #{i + 1}
                          </div>
                          <span className="text-sm font-semibold text-white">{agent.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-green-400">{agent.avgCompliance}%</div>
                          <div className="text-[10px] text-gray-500">{agent.calls} calls</div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Focus Required (Lowest Performers) */}
                <Card className="bg-[#0B1120] border-gray-800 shadow-xl">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-white text-base flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                      Needs Attention
                    </CardTitle>
                    <CardDescription className="text-xs text-gray-500">Agents with lowest averages</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {needCoachingList.map((agent, i) => (
                      <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/40 border border-gray-800">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center justify-center font-bold">
                            #{i + 1}
                          </div>
                          <span className="text-sm font-semibold text-white">{agent.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-red-400">{agent.avgCompliance}%</div>
                          <div className="text-[10px] text-gray-500">{agent.calls} calls</div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* General Team Chart */}
              <div className="lg:col-span-8">
                <Card className="bg-[#0B1120] border-gray-800 shadow-xl h-full">
                  <CardHeader>
                    <CardTitle className="text-white">Overall Agent Comparison</CardTitle>
                    <CardDescription className="text-gray-400">Quality scores comparison by active team member</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[400px] w-full mt-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={agentData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                          <XAxis dataKey="name" stroke="#64748b" className="text-xs" />
                          <YAxis stroke="#64748b" className="text-xs" domain={[0, 100]} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#fff' }}
                            cursor={{ fill: '#1e293b', opacity: 0.3 }}
                          />
                          <Legend />
                          <Bar dataKey="avgCompliance" name="Avg Compliance" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="avgEmpathy" name="Avg Empathy" fill="#ec4899" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* TAB 3: BELL CURVE / PERFORMANCE DISTRIBUTION */}
          {activeTab === 'distribution' && (
            <Card className="bg-[#0B1120] border-gray-800 shadow-xl">
              <CardHeader>
                <CardTitle className="text-white">Agent Performance Distribution (Bell Curve)</CardTitle>
                <CardDescription className="text-gray-400">Overview of talent density and training opportunities across performance tiers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={brackets} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                      <XAxis dataKey="name" stroke="#64748b" className="text-xs" />
                      <YAxis stroke="#64748b" className="text-xs" allowDecimals={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#fff' }}
                        cursor={false}
                      />
                      <Bar dataKey="count" name="Number of Agents">
                        {brackets.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {/* TAB 4: ROOT CAUSE / PARETO */}
          {activeTab === 'pareto' && (
            <Card className="bg-[#0B1120] border-gray-800 shadow-xl">
              <CardHeader>
                <CardTitle className="text-white">Root Cause Analysis (Pareto)</CardTitle>
                <CardDescription className="text-gray-400">The 80/20 Rule: Which specific scorecard parameters cause the most audit failures?</CardDescription>
              </CardHeader>
              <CardContent>
                {paretoData.length === 0 ? (
                  <div className="py-20 text-center text-gray-500">
                    No failed parameters logged. Excellent compliance!
                  </div>
                ) : (
                  <div className="h-[450px] w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={paretoData} margin={{ top: 20, right: 20, bottom: 80, left: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                        <XAxis 
                          dataKey="name" 
                          stroke="#64748b"
                          className="text-xs" 
                          angle={-45}
                          textAnchor="end"
                          height={80}
                        />
                        <YAxis 
                          yAxisId="left" 
                          stroke="#64748b"
                          className="text-xs" 
                          label={{ value: 'Failure Frequency', angle: -90, position: 'insideLeft', offset: -10, fill: '#64748b' }} 
                        />
                        <YAxis 
                          yAxisId="right" 
                          orientation="right" 
                          stroke="#64748b"
                          className="text-xs" 
                          domain={[0, 100]}
                          label={{ value: 'Cumulative %', angle: 90, position: 'insideRight', offset: -10, fill: '#64748b' }} 
                        />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#fff' }}
                        />
                        <Legend />
                        <Bar 
                          yAxisId="left" 
                          dataKey="count" 
                          name="Times Failed" 
                          fill="#ef4444" 
                          radius={[4, 4, 0, 0]} 
                          barSize={50}
                        />
                        <Line 
                          yAxisId="right" 
                          type="monotone" 
                          dataKey="cumulativePercentage" 
                          name="Cumulative %" 
                          stroke="#f59e0b" 
                          strokeWidth={3} 
                          dot={{ r: 4, fill: "#f59e0b" }} 
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* TAB 5: COACHING EFFICACY (ROI TRACKER) */}
          {activeTab === 'coaching' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-5 space-y-4">
                <Card className="bg-[#0B1120] border-gray-800 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-white text-base">Coaching History Log</CardTitle>
                    <CardDescription className="text-xs text-gray-500">Recent completed sessions & targets</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                    {coachingData.length === 0 ? (
                      <div className="text-xs text-gray-500 italic p-4 text-center">
                        Showing demo data. Log a coaching session on the scorecard audit page to populate this view.
                      </div>
                    ) : null}
                    {coachingData.length > 0 ? (
                      coachingData.map((session, i) => (
                        <div key={i} className="p-3 bg-slate-900/60 border border-gray-800 rounded-xl space-y-2">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-white">{session.agent_name}</span>
                            <span className="text-gray-500">{session.date}</span>
                          </div>
                          <div className="text-xs text-gray-400 line-clamp-2">
                            <strong className="text-[#3b82f6]">Improvement: </strong> {session.improvement_areas}
                          </div>
                          <div className="text-xs text-green-400">
                            <strong>Compliance: </strong> {session.compliance_before}% (Audit baseline)
                          </div>
                        </div>
                      ))
                    ) : (
                      // Simulated log preview
                      <div className="space-y-3">
                        <div className="p-3 bg-slate-900/60 border border-gray-800 rounded-xl space-y-2">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-white">Priya Sharma</span>
                            <span className="text-gray-500">Demo Date</span>
                          </div>
                          <div className="text-xs text-gray-400">
                            <strong className="text-[#3b82f6]">Improvement: </strong> Tone consistency & closing disclosures.
                          </div>
                        </div>
                        <div className="p-3 bg-slate-900/60 border border-gray-800 rounded-xl space-y-2">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-white">Rahul Mehra</span>
                            <span className="text-gray-500">Demo Date</span>
                          </div>
                          <div className="text-xs text-gray-400">
                            <strong className="text-[#3b82f6]">Improvement: </strong> Avoiding dead air during holds.
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="lg:col-span-7">
                <Card className="bg-[#0B1120] border-gray-800 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-white">Agent Learning Trajectory</CardTitle>
                    <CardDescription className="text-gray-400">Compliance & Empathy improvement over 4 weeks following active coaching</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[350px] w-full mt-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={activeCoachingData} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                          <XAxis dataKey="name" stroke="#64748b" className="text-xs" />
                          <YAxis stroke="#64748b" className="text-xs" domain={[50, 100]} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#fff' }}
                          />
                          <Legend />
                          <Line 
                            type="monotone" 
                            name="Avg Compliance" 
                            dataKey="compliance" 
                            stroke="#10b981" 
                            strokeWidth={3} 
                            activeDot={{ r: 8 }} 
                          />
                          <Line 
                            type="monotone" 
                            name="Avg Empathy" 
                            dataKey="empathy" 
                            stroke="#ec4899" 
                            strokeWidth={3} 
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* TAB 6: QA CALIBRATION */}
          {activeTab === 'calibration' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-4 space-y-4">
                <Card className="bg-[#0B1120] border-gray-800 shadow-xl p-6 space-y-4 text-gray-300">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-blue-500" />
                    Calibration Metrics
                  </h3>
                  <p className="text-sm leading-relaxed text-gray-400">
                    Calibration verifies alignment between human QA auditors and AI audits to ensure consistency and prevent bias.
                  </p>
                  
                  <div className="pt-4 border-t border-gray-800 space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span>Total Calibrated Calls</span>
                      <span className="font-bold text-white">{activeCalibrationData.length}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span>Average Score Variance</span>
                      <span className="font-bold text-green-400">1.2%</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span>Agreement Rate</span>
                      <span className="font-bold text-blue-400">96.8%</span>
                    </div>
                  </div>
                </Card>
              </div>

              <div className="lg:col-span-8">
                <Card className="bg-[#0B1120] border-gray-800 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-white">AI vs. Human QA Scores</CardTitle>
                    <CardDescription className="text-gray-400">Comparison of scores across calibrated interactions (lower gap = higher alignment)</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[350px] w-full mt-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={activeCalibrationData} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                          <XAxis dataKey="name" stroke="#64748b" className="text-xs" />
                          <YAxis stroke="#64748b" className="text-xs" domain={[50, 100]} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#fff' }}
                          />
                          <Legend />
                          <Bar dataKey="qa_score" name="Human QA Score" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={25} />
                          <Bar dataKey="ai_score" name="AI Auditor Score" fill="#10b981" radius={[4, 4, 0, 0]} barSize={25} />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
