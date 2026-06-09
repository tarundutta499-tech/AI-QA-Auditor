"use client"

import { useState } from "react"
import { createBrowserClient } from '@supabase/ssr'
import { Button } from "@/components/ui/button"
import { Scale } from "lucide-react"
import { useRouter } from "next/navigation"

export function CalibrationButton({ auditId, aiScore }: { auditId: string, aiScore: number }) {
  const [isOpen, setIsOpen] = useState(false)
  const [qaScore, setQaScore] = useState<number>(aiScore)
  const [disagreement, setDisagreement] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  async function handleCalibrate() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      const variance = qaScore - aiScore
      
      const { error } = await supabase.from('calibrations').insert({
        audit_id: auditId,
        qa_id: user.id,
        ai_score: aiScore,
        qa_score: qaScore,
        variance: variance,
        disagreement_areas: disagreement ? { reason: disagreement } : null,
        suggested_final_score: qaScore
      })
      
      if (!error) {
        setIsOpen(false)
        router.refresh()
        router.push('/dashboard/calibrations')
      } else {
        alert("Error saving calibration: " + error.message)
      }
    }
    setLoading(false)
  }

  if (!isOpen) {
    return (
      <Button onClick={() => setIsOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
        <Scale className="w-4 h-4" /> Calibrate AI Score
      </Button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-[#0B1120] border border-gray-800 rounded-xl p-6 w-full max-w-md shadow-2xl space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Scale className="w-5 h-5 text-blue-400" />
          Calibrate Audit
        </h2>
        <p className="text-sm text-gray-400">
          Review the AI's score of {aiScore}%. Enter your Human QA score below.
        </p>
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">Your QA Score (%)</label>
          <input 
            type="number" 
            value={qaScore} 
            onChange={e => setQaScore(Number(e.target.value))}
            className="w-full bg-[#020617] border border-gray-800 rounded-md p-2 text-white"
            min="0" max="100"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">Disagreement Area (Optional)</label>
          <textarea 
            value={disagreement} 
            onChange={e => setDisagreement(e.target.value)}
            className="w-full bg-[#020617] border border-gray-800 rounded-md p-2 text-white h-24"
            placeholder="Why do you disagree with the AI's scoring?"
          />
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={() => setIsOpen(false)} className="border-gray-700 text-gray-300 hover:text-white">
            Cancel
          </Button>
          <Button onClick={handleCalibrate} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
            {loading ? 'Saving...' : 'Save Calibration'}
          </Button>
        </div>
      </div>
    </div>
  )
}
