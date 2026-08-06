"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getCompanyAgents, getAgentFailedParameters, generateRefresherPlan } from '@/app/dashboard/knowledge/actions'
import { Loader2, BrainCircuit, Sparkles, BookOpen, CheckCircle2, Award, Lightbulb } from 'lucide-react'

type Runbook = {
  id: string
  title: string
  content: string
}

type Agent = {
  id: string
  name: string
  email: string
}

export function CoachingRefresher({ 
  runbooks, 
  currentUser = { id: '', name: 'Agent', role: 'agent' } 
}: { 
  runbooks: Runbook[]
  currentUser?: { id: string; name: string; role: string }
}) {
  const [agents, setAgents] = useState<Agent[]>([])
  const [selectedAgentId, setSelectedAgentId] = useState('')
  const [selectedRunbookId, setSelectedRunbookId] = useState('')
  const [loading, setLoading] = useState(false)
  const [failedParams, setFailedParams] = useState<any[]>([])
  const [detailedFailures, setDetailedFailures] = useState<any[]>([])
  const [analyzing, setAnalyzing] = useState(false)
  const [plan, setPlan] = useState<any | null>(null)
  
  // Interactive Quiz State
  const [selectedAnswers, setSelectedAnswers] = useState<{ [qIdx: number]: string }>({})
  const [quizScore, setQuizScore] = useState<number | null>(null)

  useEffect(() => {
    async function loadAgents() {
      if (currentUser.role === 'agent') {
        setSelectedAgentId(currentUser.id)
        setLoading(false)
        return
      }

      setLoading(true)
      const res = await getCompanyAgents()
      if (res.success && res.agents) {
        setAgents(res.agents)
        if (res.agents.length > 0) setSelectedAgentId(res.agents[0].id)
      }
      setLoading(false)
    }

    if (runbooks.length > 0) {
      setSelectedRunbookId(runbooks[0].id)
    }
    loadAgents()
  }, [runbooks, currentUser])

  useEffect(() => {
    async function loadFailedParams() {
      if (!selectedAgentId) return
      const res = await getAgentFailedParameters(selectedAgentId)
      if (res.success) {
        setFailedParams(res.failedParameters || [])
        setDetailedFailures(res.detailedFailures || [])
      }
    }
    loadFailedParams()
  }, [selectedAgentId])

  const handleGenerate = async () => {
    const agentName = currentUser.role === 'agent' ? currentUser.name : (agents.find(a => a.id === selectedAgentId)?.name || 'Agent')
    const runbook = runbooks.find(r => r.id === selectedRunbookId)
    if (!runbook) return

    setAnalyzing(true)
    setPlan(null)
    setSelectedAnswers({})
    setQuizScore(null)

    try {
      const res = await generateRefresherPlan(
        agentName,
        runbook.title,
        runbook.content,
        detailedFailures
      )
      if (res.success && res.data) {
        setPlan(res.data)
      } else {
        alert("Error: " + (res.error || "Failed to generate coaching syllabus."))
      }
    } catch (err: any) {
      alert("Error: " + err.message)
    } finally {
      setAnalyzing(false)
    }
  }

  const handleAnswerSelect = (qIdx: number, option: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [qIdx]: option
    }))
  }

  const handleGradeQuiz = () => {
    if (!plan?.quiz) return
    let correctCount = 0
    plan.quiz.forEach((q: any, idx: number) => {
      if (selectedAnswers[idx] === q.answer) {
        correctCount++
      }
    })
    setQuizScore(Math.round((correctCount / plan.quiz.length) * 100))
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Selection Control Panel */}
      <Card className="bg-[#0B1120] border-gray-800 shadow-xl">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <BrainCircuit className="text-blue-500 w-5 h-5" />
            AI Refresher & Training Plan Generator
          </CardTitle>
          <CardDescription>
            Target agent compliance gaps by generating customized training paths and review quizzes mapped directly to your Runbooks and recent Audit failures.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            
            {/* Agent Select or Text */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400">Agent under Training</label>
              {currentUser.role === 'agent' ? (
                <div className="h-10 flex items-center bg-[#020617] border border-gray-800 rounded-xl px-3 text-xs text-white font-semibold">
                  {currentUser.name} (You)
                </div>
              ) : loading ? (
                <div className="h-10 flex items-center justify-center bg-[#020617] border border-gray-800 rounded-xl text-xs text-gray-500">
                  Loading agents...
                </div>
              ) : (
                <select
                  value={selectedAgentId}
                  onChange={(e) => setSelectedAgentId(e.target.value)}
                  className="w-full h-10 bg-[#020617] border border-gray-800 rounded-xl px-3 text-white text-xs focus:ring-1 focus:ring-blue-500"
                >
                  {agents.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.name || a.email.split('@')[0]} ({a.email})
                    </option>
                  ))}
                  {agents.length === 0 && (
                    <option value="">No agents found</option>
                  )}
                </select>
              )}
            </div>

            {/* Runbook Select */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400">Select Runbook / SOP</label>
              <select
                value={selectedRunbookId}
                onChange={(e) => setSelectedRunbookId(e.target.value)}
                className="w-full h-10 bg-[#020617] border border-gray-800 rounded-xl px-3 text-white text-xs focus:ring-1 focus:ring-blue-500"
              >
                {runbooks.map(r => (
                  <option key={r.id} value={r.id}>{r.title}</option>
                ))}
                {runbooks.length === 0 && (
                  <option value="">No runbooks uploaded yet</option>
                )}
              </select>
            </div>

            {/* Generate Action Button */}
            <Button
              onClick={handleGenerate}
              disabled={analyzing || !selectedAgentId || !selectedRunbookId}
              className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl h-10 font-bold text-xs gap-2 flex items-center justify-center"
            >
              {analyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Synthesizing Syllabus...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> Create Custom Syllabus
                </>
              )}
            </Button>

          </div>

          {/* Target Gaps Preview */}
          {failedParams.length > 0 && (
            <div className="mt-6 border-t border-gray-800/80 pt-4 space-y-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block mb-2">Targeting Performance Gaps:</span>
                <div className="flex flex-wrap gap-2">
                  {failedParams.map((p, idx) => (
                    <span key={idx} className="bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
                      {p.name} (failed {p.count}x)
                    </span>
                  ))}
                </div>
              </div>

              {detailedFailures.length > 0 && (
                <div className="border-t border-gray-800/40 pt-4 space-y-3">
                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">Observed Audit History Failures (QA Evidence):</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {detailedFailures.slice(0, 4).map((f, idx) => (
                      <div key={idx} className="bg-[#020617]/50 border border-gray-800/60 rounded-2xl p-3 text-xs space-y-1.5 shadow-inner">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="font-extrabold text-red-400 uppercase tracking-wider">{f.parameterName}</span>
                          <span className="text-gray-500 font-mono font-semibold">{f.date}</span>
                        </div>
                        <p className="text-gray-300 font-medium leading-relaxed italic">"{f.reason}"</p>
                        {f.evidence && (
                          <div className="text-[10px] text-gray-500 font-mono bg-black/20 p-1.5 rounded-lg border border-gray-900 truncate">
                            Evidence: {f.evidence}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Generated Plan Display */}
      {plan && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Syllabus Agenda (Left 7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Focus Gaps Analysis */}
            <Card className="bg-[#0B1120] border-gray-800 shadow-xl">
              <CardHeader>
                <CardTitle className="text-white text-base">Coaching Analysis</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-gray-300 leading-relaxed font-medium bg-slate-950/40 p-4 border border-gray-800/80 rounded-2xl">
                {plan.focus_area}
              </CardContent>
            </Card>

            {/* Curriculum Agenda */}
            <Card className="bg-[#0B1120] border-gray-800 shadow-xl">
              <CardHeader>
                <CardTitle className="text-white text-base">Training Path Agenda</CardTitle>
                <CardDescription>Daily structured exercises mapping the Runbook directly to their target issues.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {plan.daily_agenda.map((agenda: any, idx: number) => (
                  <div key={idx} className="flex gap-4 border-b border-gray-800/60 pb-4 last:border-b-0 last:pb-0">
                    <div className="bg-blue-600/15 border border-blue-500/20 text-blue-400 rounded-xl px-3 py-1.5 font-bold h-10 w-16 text-center text-xs flex items-center justify-center shrink-0">
                      {agenda.day}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">{agenda.topic}</h4>
                      <p className="text-xs text-gray-400 mt-1 leading-relaxed">{agenda.exercise}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Study Tips */}
            <Card className="bg-[#0B1120] border-gray-800 shadow-xl">
              <CardHeader>
                <CardTitle className="text-white text-base flex items-center gap-2">
                  <Lightbulb className="text-yellow-500 w-5 h-5" /> AI Coaching Best Practices
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2.5 text-xs text-gray-300">
                  {plan.coaching_tips.map((tip: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

          </div>

          {/* Interactive Knowledge Quiz (Right 5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="bg-[#0B1120] border-gray-800 shadow-xl">
              <CardHeader>
                <CardTitle className="text-white text-base flex items-center gap-2">
                  <BookOpen className="text-blue-400 w-5 h-5" /> Runbook Practice Quiz
                </CardTitle>
                <CardDescription>Grade agent understanding of standard operating procedures before they go back to the phones.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {plan.quiz.map((q: any, qIdx: number) => {
                  const selectedAnswer = selectedAnswers[qIdx]
                  const isGraded = quizScore !== null
                  return (
                    <div key={qIdx} className="space-y-3 bg-[#020617]/50 p-4 border border-gray-800/80 rounded-2xl text-xs">
                      <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Question {qIdx + 1}</span>
                      <h4 className="font-bold text-white leading-relaxed">{q.question}</h4>
                      
                      <div className="space-y-2 pt-1">
                        {q.options.map((opt: string, oIdx: number) => {
                          const isSelected = selectedAnswer === opt
                          const isCorrect = q.answer === opt
                          
                          let optStyle = 'border-gray-800 hover:border-blue-500/40 text-gray-300'
                          if (isSelected) optStyle = 'bg-blue-600/10 border-blue-500 text-blue-400 font-bold'
                          if (isGraded) {
                            if (isCorrect) optStyle = 'bg-green-500/10 border-green-500 text-green-400 font-bold'
                            else if (isSelected) optStyle = 'bg-red-500/10 border-red-500 text-red-400 font-bold'
                          }

                          return (
                            <button
                              key={oIdx}
                              disabled={isGraded}
                              onClick={() => handleAnswerSelect(qIdx, opt)}
                              className={`w-full text-left p-2.5 rounded-xl border text-xs font-semibold transition-all ${optStyle}`}
                            >
                              {opt}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}

                {/* Grading Action */}
                {quizScore === null ? (
                  <Button
                    onClick={handleGradeQuiz}
                    disabled={Object.keys(selectedAnswers).length < plan.quiz.length}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs h-10 rounded-xl"
                  >
                    Submit Answers for Grading
                  </Button>
                ) : (
                  <div className="text-center p-4 bg-blue-950/20 border border-blue-500/10 rounded-2xl flex flex-col items-center justify-center space-y-2">
                    <Award className="w-8 h-8 text-yellow-500 animate-bounce" />
                    <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Evaluation Grade</span>
                    <h3 className="text-3xl font-black text-white">{quizScore}%</h3>
                    <p className="text-[10px] text-gray-500">
                      {quizScore >= 80 ? 'Passed SOP Certification!' : 'Score below 80%. Re-study runbook parameters.'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

        </div>
      )}

    </div>
  )
}
