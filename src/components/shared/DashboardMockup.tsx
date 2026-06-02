"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"
import { LayoutDashboard, Users, FileText, BarChart3, Settings, TrendingUp, Search } from "lucide-react"

export default function DashboardMockup() {
  const containerRef = useRef<HTMLDivElement>(null)
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  })

  // Subtle parallax effect
  const y = useTransform(scrollYProgress, [0, 1], [30, -30])

  return (
    <div ref={containerRef} className="relative w-full max-w-6xl mx-auto perspective-1000">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-violet-600 blur-[100px] opacity-20" />
      
      <motion.div 
        style={{ y }}
        className="relative bg-[#020617] border border-gray-800 rounded-xl overflow-hidden shadow-2xl flex flex-col md:flex-row h-[600px] w-full"
      >
        {/* Sidebar */}
        <div className="w-64 bg-[#0B1120] border-r border-gray-800 flex-shrink-0 hidden md:flex flex-col">
          <div className="p-6 border-b border-gray-800">
            <span className="font-bold text-white flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center">
                <span className="text-white text-xs">QA</span>
              </div>
              Copilot
            </span>
          </div>
          <div className="p-4 space-y-2">
            {[
              { icon: LayoutDashboard, label: "Dashboard", active: true },
              { icon: Users, label: "Agents", active: false },
              { icon: FileText, label: "Audits", active: false },
              { icon: BarChart3, label: "Reports", active: false },
              { icon: Settings, label: "Settings", active: false },
            ].map((item, i) => (
              <div key={i} className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm ${item.active ? 'bg-blue-600/10 text-blue-400' : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'}`}>
                <item.icon className="w-4 h-4" />
                {item.label}
              </div>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col bg-[#020617] overflow-hidden min-w-[800px] md:min-w-0 overflow-x-auto">
          {/* Header */}
          <div className="h-16 border-b border-gray-800 flex items-center justify-between px-6 bg-[#0B1120]/50 shrink-0">
            <h2 className="text-white font-medium">Dashboard Overview</h2>
            <div className="w-64 h-9 bg-[#020617] border border-gray-800 rounded-lg flex items-center px-3 gap-2">
              <Search className="w-4 h-4 text-gray-500" />
              <div className="text-gray-500 text-sm">Search audits...</div>
            </div>
          </div>

          <div className="p-6 flex-1 flex gap-6 overflow-hidden min-w-[800px] md:min-w-0">
            {/* Leaderboard */}
            <div className="flex-1 flex flex-col gap-4">
              <div className="grid grid-cols-3 gap-4 shrink-0">
                {[
                  { label: "Total Audits (30d)", value: "8,432", change: "+12%" },
                  { label: "Avg QA Score", value: "92.4", change: "+1.2" },
                  { label: "Fatal Errors", value: "3", change: "-5" },
                ].map((stat, i) => (
                  <div key={i} className="bg-[#0B1120] border border-gray-800 rounded-xl p-4">
                    <div className="text-gray-400 text-xs mb-1">{stat.label}</div>
                    <div className="flex items-end justify-between">
                      <div className="text-2xl font-bold text-white">{stat.value}</div>
                      <div className={`text-xs ${stat.change.startsWith('+') && !stat.label.includes('Fatal') ? 'text-green-400' : 'text-blue-400'}`}>{stat.change}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex-1 bg-[#0B1120] border border-gray-800 rounded-xl flex flex-col overflow-hidden">
                <div className="p-4 border-b border-gray-800">
                  <h3 className="text-white text-sm font-medium">Top Agents</h3>
                </div>
                <div className="flex-1 p-0 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-[#0B1120]">
                      <tr className="text-left text-gray-500 border-b border-gray-800">
                        <th className="px-4 py-3 font-medium">Agent</th>
                        <th className="px-4 py-3 font-medium">Audits</th>
                        <th className="px-4 py-3 font-medium">Avg Score</th>
                        <th className="px-4 py-3 font-medium text-center">Empathy</th>
                        <th className="px-4 py-3 font-medium text-center">Fatal Errors</th>
                        <th className="px-4 py-3 font-medium">Trend</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { name: "Priya Sharma", audits: 142, score: 98, empathy: 95, fatal: 0, trend: "up" },
                        { name: "Rahul Mehra", audits: 138, score: 96, empathy: 92, fatal: 0, trend: "up" },
                        { name: "Anjali Verma", audits: 145, score: 94, empathy: 88, fatal: 1, trend: "down" },
                        { name: "David Kim", audits: 120, score: 89, empathy: 85, fatal: 0, trend: "up" },
                        { name: "Sarah Jenkins", audits: 110, score: 88, empathy: 90, fatal: 0, trend: "down" },
                      ].map((row, i) => (
                        <tr key={i} className="border-b border-gray-800/50 text-gray-300">
                          <td className="px-4 py-3 flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-gray-700" />
                            {row.name}
                          </td>
                          <td className="px-4 py-3 text-gray-400">{row.audits}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-full bg-gray-800 rounded-full h-1.5 max-w-[60px]">
                                <div className={`h-1.5 rounded-full ${row.score > 90 ? 'bg-green-500' : 'bg-blue-500'}`} style={{ width: `${row.score}%` }} />
                              </div>
                              <span className="text-xs">{row.score}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center text-gray-400">{row.empathy}</td>
                          <td className="px-4 py-3 text-center">
                            {row.fatal > 0 ? (
                              <span className="bg-red-500/20 text-red-400 px-2 py-0.5 rounded text-xs">{row.fatal}</span>
                            ) : (
                              <span className="text-gray-500">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {row.trend === "up" ? <TrendingUp className="w-4 h-4 text-green-400" /> : <TrendingUp className="w-4 h-4 text-red-400 rotate-180" />}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right Panel - Audit Preview */}
            <div className="w-80 shrink-0 bg-[#0B1120] border border-gray-800 rounded-xl p-4 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-white text-sm font-medium">Recent Audit</h3>
                <span className="px-2 py-0.5 rounded text-xs bg-green-500/20 text-green-400 font-medium">Score: 94/100</span>
              </div>
              
              <div className="space-y-3">
                {[
                  { label: "Opening Script", score: "10/10" },
                  { label: "Empathy & Tone", score: "22/25" },
                  { label: "Problem Resolution", score: "35/35" },
                  { label: "Closing Script", score: "10/10" },
                  { label: "Compliance", score: "17/20" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">{item.label}</span>
                    <span className="text-white">{item.score}</span>
                  </div>
                ))}
              </div>

              <div className="mt-auto bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-blue-400 text-xs font-bold uppercase tracking-wider">AI Coaching Note</span>
                </div>
                <p className="text-xs text-blue-200/70 leading-relaxed">
                  Agent successfully resolved the issue but missed the required SLA disclosure during the compliance phase. Suggest reviewing section 4 of the SOP.
                </p>
              </div>
            </div>

          </div>
        </div>
        
        {/* Mobile Swipe Hint */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 md:hidden text-gray-500 text-xs flex items-center gap-1 bg-[#020617]/90 px-4 py-2 rounded-full border border-gray-800 shadow-xl z-20 whitespace-nowrap">
          ← Swipe to view full dashboard →
        </div>
      </motion.div>
    </div>
  )
}
