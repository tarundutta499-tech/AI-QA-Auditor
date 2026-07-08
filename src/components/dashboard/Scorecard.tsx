"use client"

import { motion } from "framer-motion"
import { CheckCircle2, AlertOctagon, Clock, User, ShieldAlert } from "lucide-react"

export interface ScorecardData {
  empathyScore: number
  complianceScore: number
  fatalErrors: string[]
  coachingNotes: string[]
  callSummary: string
  checklist?: {
    parameter: string
    status: string
    reasoning: string
  }[]
}

interface ScorecardProps {
  data: ScorecardData | null
}

export default function Scorecard({ data }: ScorecardProps) {
  if (!data) return null

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#0B1120] border border-gray-800 rounded-3xl p-8 shadow-2xl space-y-8"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">AI Audit Scorecard</h2>
          <p className="text-gray-400">Generated automatically by Nexaviq</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-[#020617] border border-gray-800 rounded-lg p-3 text-center min-w-[100px]">
            <div className="text-sm text-gray-400 mb-1">Empathy</div>
            <div className={`text-2xl font-bold ${data.empathyScore >= 80 ? 'text-green-400' : data.empathyScore >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
              {data.empathyScore}/100
            </div>
          </div>
          <div className="bg-[#020617] border border-gray-800 rounded-lg p-3 text-center min-w-[100px]">
            <div className="text-sm text-gray-400 mb-1">Compliance</div>
            <div className={`text-2xl font-bold ${data.complianceScore >= 90 ? 'text-green-400' : 'text-red-400'}`}>
              {data.complianceScore}/100
            </div>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-blue-400" />
          Call Summary
        </h3>
        <p className="text-gray-300 leading-relaxed bg-[#020617] p-4 rounded-xl border border-gray-800/50">
          {data.callSummary}
        </p>
      </div>

      {/* Detailed Checklist */}
      {data.checklist && data.checklist.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-blue-400" />
            Detailed QA Checklist
          </h3>
          <div className="space-y-3">
            {data.checklist.map((item, idx) => (
              <div key={idx} className="bg-[#020617] p-4 rounded-xl border border-gray-800/50 flex flex-col md:flex-row md:items-start gap-4">
                <div className="flex-1">
                  <div className="font-medium text-gray-200">{item.parameter}</div>
                  <div className="text-sm text-gray-500 mt-1">{item.reasoning}</div>
                </div>
                <div className="shrink-0">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    item.status.toLowerCase() === 'yes' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                    item.status.toLowerCase() === 'no' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                    'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                  }`}>
                    {item.status.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fatal Errors */}
      {data.fatalErrors && data.fatalErrors.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-red-400 mb-3 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5" />
            Fatal Compliance Errors Detected
          </h3>
          <ul className="space-y-2">
            {data.fatalErrors.map((err, idx) => (
              <li key={idx} className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 p-3 rounded-lg text-red-200">
                <AlertOctagon className="w-5 h-5 shrink-0 mt-0.5" />
                <span>{err}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Coaching Notes */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <User className="w-5 h-5 text-violet-400" />
          Actionable Coaching Notes
        </h3>
        <ul className="space-y-3">
          {data.coachingNotes.map((note, idx) => (
            <li key={idx} className="flex items-start gap-3 bg-[#020617] p-4 rounded-xl border border-gray-800/50 text-gray-300">
              <div className="w-6 h-6 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center shrink-0 text-sm font-bold mt-0.5">
                {idx + 1}
              </div>
              <span>{note}</span>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  )
}
