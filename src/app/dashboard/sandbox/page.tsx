"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Play, 
  Mic, 
  MicOff, 
  PhoneOff, 
  Cpu, 
  Sparkles, 
  User, 
  Heart, 
  ThumbsUp, 
  Lightbulb, 
  Volume2, 
  VolumeX, 
  Info,
  CheckCircle2,
  Plus,
  X,
  Star,
  Check,
  AlertTriangle,
  ArrowRight,
  Loader2,
  Flame,
  BrainCircuit
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { sendSandboxTurn, generateSandboxReport, getCompanyScorecards, getAIRecommendedScenarios } from "./actions"

interface Message {
  role: "agent" | "customer"
  text: string
}

interface Scenario {
  id: string
  title: string
  description: string
  difficulty: "Easy" | "Medium" | "Hard"
  prompt: string
  initialCustomerGreeting: string
  checkpoints: string[]
}

const DEFAULT_SCENARIOS: Scenario[] = [
  {
    id: "billing_dispute",
    title: "Angry Billing Dispute",
    description: "Customer is furious about an unexpected 20% surcharge and wants an immediate refund.",
    difficulty: "Medium",
    prompt: "Furious customer arguing about a 20% billing surcharge on their invoice. Insists on refund and threatens to write a negative review.",
    initialCustomerGreeting: "Yes, hello! I just opened my invoice and there's a ridiculous surcharge on here. I want this refunded immediately!",
    checkpoints: ["Warm Greeting", "Acknowledge Frustration", "Explain Surcharge clearly", "Offer Solution / Wave Fee"]
  },
  {
    id: "tech_support",
    title: "Locked Out Panic",
    description: "User is locked out of their work account with a major presentation in 10 minutes.",
    difficulty: "Easy",
    prompt: "Panicked caller locked out of their account who has a critical executive presentation in 10 minutes. Needs fast password reset.",
    initialCustomerGreeting: "Hi! I'm in a complete panic. I have a presentation to our CEO in 10 minutes and my account is locked out! Can you reset this right now?!",
    checkpoints: ["Professional Greeting", "Calm and Reassure", "Perform Identity Check", "Confirm Account Reset"]
  },
  {
    id: "abusive_caller",
    title: "Hostile / Rude Caller",
    description: "Customer is screaming and calling the company names over a late delivery.",
    difficulty: "Hard",
    prompt: "Abusive caller who is screaming and calling the company names because their package is 2 days late. The agent must maintain boundary while de-escalating.",
    initialCustomerGreeting: "This is completely useless! Your company has delayed my delivery again and you guys are just incompetent! What are you going to do about this?!",
    checkpoints: ["Calm Professional Greeting", "Express Empathy", "De-escalate boundaries", "Offer Package Tracking Update"]
  }
]

export default function SandboxPage() {
  const [scenarios, setScenarios] = useState<Scenario[]>(DEFAULT_SCENARIOS)
  const [aiScenarios, setAiScenarios] = useState<Scenario[]>([])
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null)
  const [isActiveCall, setIsActiveCall] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [enableVoice, setEnableVoice] = useState(true)
  const [history, setHistory] = useState<Message[]>([])
  const [empathyScore, setEmpathyScore] = useState<number | null>(null)
  const [coachingTip, setCoachingTip] = useState<string>("Start the call to receive live coaching.")
  const [completedCheckpoints, setCompletedCheckpoints] = useState<string[]>([])
  
  // Custom Scenario States
  const [customTitle, setCustomTitle] = useState("")
  const [customDesc, setCustomDesc] = useState("")
  const [customGreeting, setCustomGreeting] = useState("")
  const [customObjectives, setCustomObjectives] = useState("")
  const [customDifficulty, setCustomDifficulty] = useState<"Easy" | "Medium" | "Hard">("Medium")
  const [showCustomModal, setShowCustomModal] = useState(false)

  // Report State
  const [loadingReport, setLoadingReport] = useState(false)
  const [loadingAi, setLoadingAi] = useState(true)
  const [report, setReport] = useState<any | null>(null)

  const recognitionRef = useRef<any>(null)
  const synthesisRef = useRef<any>(null)

  // Load Scorecards & AI Recommended Scenarios
  useEffect(() => {
    async function loadScenarios() {
      // 1. Fetch Company Scorecards
      const scRes = await getCompanyScorecards()
      let scorecardScenarios: Scenario[] = []
      if (scRes.success && scRes.scorecards) {
        scorecardScenarios = scRes.scorecards.map((sc: any) => ({
          id: sc.id,
          title: sc.name,
          description: sc.description || "Simulate live customer support calls using active campaign scorecards.",
          difficulty: "Medium",
          prompt: `Roleplay a customer for this campaign: "${sc.description || sc.name}". Evaluate if the agent satisfies the scorecard guidelines: ${sc.scorecard_parameters.map((p: any) => p.name).join(', ')}.`,
          initialCustomerGreeting: `Hello, I need help in regards to the ${sc.name} campaign issue.`,
          checkpoints: sc.scorecard_parameters.map((p: any) => p.name)
        }))
      }
      setScenarios([...scorecardScenarios, ...DEFAULT_SCENARIOS])

      // 2. Fetch AI Audit Recommendations
      setLoadingAi(true)
      const aiRes = await getAIRecommendedScenarios()
      if (aiRes.success && aiRes.scenarios) {
        setAiScenarios(aiRes.scenarios.map((s: any, idx: number) => ({
          id: `ai_${idx}_${Date.now()}`,
          ...s
        })))
      }
      setLoadingAi(false)
    }
    loadScenarios()
  }, [])

  // Initialize Speech Web API
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        const rec = new SpeechRecognition()
        rec.continuous = false
        rec.interimResults = false
        rec.lang = 'en-US'

        rec.onresult = async (event: any) => {
          const speechToText = event.results[0][0].transcript
          setIsRecording(false)
          if (speechToText.trim()) {
            await handleAgentTurn(speechToText)
          }
        }

        rec.onerror = (e: any) => {
          console.error("STT Error:", e)
          setIsRecording(false)
        }

        rec.onend = () => {
          setIsRecording(false)
        }

        recognitionRef.current = rec
      }

      synthesisRef.current = window.speechSynthesis
    }
  }, [history, selectedScenario])

  // Play voice response using TTS
  const speakVoice = (text: string) => {
    if (!enableVoice || !synthesisRef.current) return
    
    // Stop any active speech
    synthesisRef.current.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = "en-US"
    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    synthesisRef.current.speak(utterance)
  }

  const startCall = (scenario: Scenario) => {
    setSelectedScenario(scenario)
    setIsActiveCall(true)
    setHistory([{ role: "customer", text: scenario.initialCustomerGreeting }])
    setEmpathyScore(null)
    setCoachingTip("Greet the customer warmly and ask how you can resolve their issue.")
    setCompletedCheckpoints([])
    setReport(null)
  }

  const endCall = async () => {
    setIsRecording(false)
    if (synthesisRef.current) {
      synthesisRef.current.cancel()
    }

    if (history.length > 1 && selectedScenario) {
      setLoadingReport(true)
      const res = await generateSandboxReport(
        selectedScenario.title,
        selectedScenario.prompt,
        selectedScenario.checkpoints,
        history
      )
      setLoadingReport(false)
      if (res.success && res.data) {
        setReport(res.data)
      } else {
        // Fallback reset
        setIsActiveCall(false)
        setHistory([])
        setEmpathyScore(null)
      }
    } else {
      setIsActiveCall(false)
      setHistory([])
      setEmpathyScore(null)
    }
  }

  const startListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser.")
      return
    }
    if (isRecording) {
      recognitionRef.current.stop()
    } else {
      if (synthesisRef.current) {
        synthesisRef.current.cancel()
      }
      setIsRecording(true)
      recognitionRef.current.start()
    }
  }

  const handleAgentTurn = async (agentText: string) => {
    if (!selectedScenario) return

    const newHistory: Message[] = [...history, { role: "agent", text: agentText }]
    setHistory(newHistory)
    
    setIsSpeaking(true) // show wave loader during AI response

    const res = await sendSandboxTurn(selectedScenario.prompt, newHistory, agentText)
    
    if (res.success && res.data) {
      const responseData = res.data
      setHistory(prev => [...prev, { role: "customer", text: responseData.customer_response }])
      setEmpathyScore(responseData.agent_empathy_score)
      setCoachingTip(responseData.coaching_tip)
      
      // Update checklist
      if (responseData.checklist_completed && Array.isArray(responseData.checklist_completed)) {
        setCompletedCheckpoints(prev => {
          const updated = [...prev]
          responseData.checklist_completed.forEach((chk: string) => {
            const match = selectedScenario.checkpoints.find(
              c => c.toLowerCase().includes(chk.toLowerCase()) || chk.toLowerCase().includes(c.toLowerCase())
            )
            if (match && !updated.includes(match)) {
              updated.push(match)
            }
          })
          return updated
        })
      }

      speakVoice(responseData.customer_response)
    } else {
      setCoachingTip("Error syncing response. Check connection.")
      setIsSpeaking(false)
    }
  }

  const handleCreateCustomScenario = (e: React.FormEvent) => {
    e.preventDefault()
    if (!customTitle || !customDesc || !customGreeting) {
      alert("Please fill in all required fields.")
      return
    }

    const checkpointsArray = customObjectives
      ? customObjectives.split(",").map(c => c.trim()).filter(Boolean)
      : ["Polite Greeting", "Active Listening", "Problem Resolution"]

    const newScenario: Scenario = {
      id: `custom_${Date.now()}`,
      title: customTitle,
      description: customDesc,
      difficulty: customDifficulty,
      prompt: `${customDesc}. Speak in character as a customer who starts the conversation by saying: "${customGreeting}". React dynamically to the agent, checking if they hit these guidelines: ${checkpointsArray.join(', ')}`,
      initialCustomerGreeting: customGreeting,
      checkpoints: checkpointsArray
    }

    setScenarios(prev => [newScenario, ...prev])
    setShowCustomModal(false)

    // Clear form
    setCustomTitle("")
    setCustomDesc("")
    setCustomGreeting("")
    setCustomObjectives("")
    setCustomDifficulty("Medium")
  }

  const resetSandbox = () => {
    setReport(null)
    setIsActiveCall(false)
    setHistory([])
    setEmpathyScore(null)
    setSelectedScenario(null)
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
            <Cpu className="text-blue-500 w-8 h-8 animate-pulse" />
            AI Agent Sandbox
          </h1>
          <p className="text-muted-foreground mt-2">
            Practice customer simulations. Choose scenarios, speak into the mic, and listen to the AI customer talk back.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#0B1120] border border-gray-800 rounded-xl px-4 py-2 text-xs">
          <span className="text-gray-400 font-medium">Customer Voice (TTS):</span>
          <button 
            onClick={() => setEnableVoice(!enableVoice)}
            className={`p-1 rounded transition-all ${enableVoice ? 'text-blue-400' : 'text-gray-600'}`}
          >
            {enableVoice ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {loadingReport ? (
        // Evaluating page state
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
          <h2 className="text-xl font-bold text-white">AI Auditor Evaluating Performance...</h2>
          <p className="text-xs text-gray-400">Comparing mock-call transcript with campaign scorecard parameters.</p>
        </div>
      ) : report ? (
        // SHOW PERFORMANCE REPORT
        <div className="space-y-8 animate-in zoom-in-95 duration-200">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white">Mock-Call Quality Audit Report</h2>
              <p className="text-sm text-gray-400">Review highlights, improvements, and scorecard metrics evaluation below.</p>
            </div>
            <Button onClick={resetSandbox} className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold text-sm">
              Start New Practice Session <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* QA Grade Score */}
            <Card className="bg-[#0B1120] border-gray-800 shadow-xl flex flex-col justify-center items-center py-8">
              <span className="text-xs uppercase font-bold text-gray-500 tracking-wider">Audit Score</span>
              <div className={`text-6xl font-black rounded-full h-32 w-32 flex flex-col items-center justify-center border-8 mt-4 ${
                report.score >= 80 ? 'text-green-500 border-green-500' :
                report.score >= 50 ? 'text-yellow-500 border-yellow-500' :
                'text-red-500 border-red-500'
              }`}>
                {report.score}%
              </div>
              <div className="flex items-center gap-1 mt-4">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star 
                    key={s} 
                    className={`w-5 h-5 ${
                      s <= Math.round(report.score / 20) 
                        ? 'fill-yellow-500 text-yellow-500' 
                        : 'text-gray-700'
                    }`} 
                  />
                ))}
              </div>
              <span className="text-xs text-gray-400 mt-2 font-semibold">
                {report.score >= 80 ? 'Excellent Performance' : report.score >= 60 ? 'Needs Attention' : 'Unsatisfactory Grade'}
              </span>
            </Card>

            {/* Strengths & Improvements */}
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Strengths */}
              <Card className="bg-[#0B1120] border-gray-800 shadow-xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-green-400 text-base flex items-center gap-2">
                    <Check className="w-5 h-5" /> What You Did Good
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-2">
                  <ul className="space-y-3 text-xs text-gray-300">
                    {report.strengths.map((str: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 bg-[#020617]/40 p-2.5 rounded-xl border border-gray-800/40">
                        <span className="text-green-500 mt-0.5 font-bold">✔</span>
                        {str}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Improvements */}
              <Card className="bg-[#0B1120] border-gray-800 shadow-xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-yellow-400 text-base flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" /> Could Have Done Better
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-2">
                  <ul className="space-y-3 text-xs text-gray-300">
                    {report.improvements.map((imp: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 bg-[#020617]/40 p-2.5 rounded-xl border border-gray-800/40">
                        <span className="text-yellow-500 mt-0.5 font-bold">⚠</span>
                        {imp}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Detailed Scorecard Evaluation Breakdown */}
          <Card className="bg-[#0B1120] border-gray-800 shadow-xl">
            <CardHeader>
              <CardTitle className="text-white text-base">SOP Scorecard Parameter Breakdown</CardTitle>
              <CardDescription>Evaluation of agent compliance against standard campaign procedures.</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-400 uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Parameter Name</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Audit Evaluation & Feedback</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/40">
                  {report.parameter_breakdown.map((param: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-950/20 transition-colors">
                      <td className="py-4 px-4 font-bold text-white text-sm">{param.parameter}</td>
                      <td className="py-4 px-4">
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          param.passed 
                            ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}>
                          {param.passed ? 'PASSED' : 'FAILED'}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-gray-300 leading-relaxed font-medium">{param.feedback}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      ) : !isActiveCall ? (
        // Scenario Selection Workspace
        <div className="space-y-10">

          {/* AI GENERATED RECOMMENDATIONS SECTION */}
          {aiScenarios.length > 0 && (
            <div className="space-y-4 bg-gradient-to-br from-blue-950/20 to-purple-950/10 border border-blue-500/10 p-6 rounded-3xl relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/15 rounded-xl text-blue-400 shadow-md">
                  <BrainCircuit className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                    AI-Driven Scenarios <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full uppercase tracking-wider font-extrabold animate-pulse">Live from QA Audits</span>
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">These custom training roleplays were automatically synthesized to target the most common failures found in your team's audited calls.</p>
                </div>
              </div>

              {loadingAi ? (
                <div className="flex items-center gap-2 py-8 text-xs text-gray-400 font-medium">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-500" /> Analysing recent compliance trends...
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                  {aiScenarios.map((item) => (
                    <Card key={item.id} className="bg-[#0B1120]/80 border-blue-900/40 hover:border-blue-500/50 transition-all flex flex-col justify-between shadow-xl">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-center mb-1">
                          <span className="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            Failed Audit Fix
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                            item.difficulty === 'Easy' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                            item.difficulty === 'Medium' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                            'bg-red-500/10 text-red-400 border border-red-500/20'
                          }`}>
                            {item.difficulty}
                          </span>
                        </div>
                        <CardTitle className="text-foreground text-base">{item.title}</CardTitle>
                        <CardDescription className="text-gray-400 text-xs mt-1 leading-relaxed">{item.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="border-t border-gray-800/80 pt-3">
                          <span className="text-[9px] uppercase font-bold text-gray-500 tracking-wider block mb-1.5">Scorecard Objectives:</span>
                          <ul className="space-y-1 text-[11px] text-gray-400">
                            {item.checkpoints.map((chk, idx) => (
                              <li key={idx} className="flex items-center gap-1.5">
                                <CheckCircle2 className="w-3 h-3 text-blue-500 shrink-0" />
                                <span className="truncate">{chk}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <Button 
                          onClick={() => startCall(item)} 
                          className="w-full bg-blue-600 hover:bg-blue-500 text-white mt-5 rounded-xl flex items-center justify-center gap-2 text-xs h-9 font-bold"
                        >
                          <Play className="w-3.5 h-3.5 fill-white" /> Train on Audited Issue
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* MAIN SCENARIO SELECTION GRID */}
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="text-lg font-bold text-foreground">Campaign & Standard Scenarios:</div>
              <Button onClick={() => setShowCustomModal(true)} className="bg-blue-600 hover:bg-blue-500 text-white gap-2 rounded-xl text-xs font-semibold h-9 px-4">
                <Plus className="w-4 h-4" /> Create Custom Scenario
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {scenarios.map((item) => (
                <Card key={item.id} className="bg-[#0B1120] border-gray-800 hover:border-blue-500/50 transition-all flex flex-col justify-between shadow-lg">
                  <CardHeader>
                    <div className="flex justify-between items-center mb-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        item.difficulty === 'Easy' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                        item.difficulty === 'Medium' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                        'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                        {item.difficulty} Difficulty
                      </span>
                      {item.id.startsWith('custom_') && (
                        <span className="text-[9px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded uppercase font-extrabold tracking-wider">Custom</span>
                      )}
                      {!item.id.startsWith('custom_') && item.id !== 'billing_dispute' && item.id !== 'tech_support' && item.id !== 'abusive_caller' && (
                        <span className="text-[9px] bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded uppercase font-extrabold tracking-wider font-semibold">Scorecard</span>
                      )}
                    </div>
                    <CardTitle className="text-foreground text-lg">{item.title}</CardTitle>
                    <CardDescription className="text-gray-400 text-sm mt-1">{item.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="border-t border-gray-800/60 pt-4 mt-2">
                      <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block mb-2">Required SOP Objectives:</span>
                      <ul className="space-y-1 text-xs text-gray-400">
                        {item.checkpoints.map((chk, idx) => (
                          <li key={idx} className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-gray-700 animate-in fade-in" />
                            {chk}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <Button 
                      onClick={() => startCall(item)} 
                      className="w-full bg-blue-600 hover:bg-blue-500 text-white mt-6 rounded-xl flex items-center justify-center gap-2"
                    >
                      <Play className="w-4 h-4 fill-white" /> Start Practice Call
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      ) : (
        // Active Simulation Workspace
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start h-[600px]">
          
          {/* LEFT PANEL: QA Checklist & Live Coach */}
          <div className="lg:col-span-4 space-y-6 flex flex-col h-full">
            <Card className="bg-[#0B1120] border-gray-800 shadow-xl shrink-0">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-base flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-yellow-500" /> Live Empathy Index
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center py-6 flex flex-col items-center justify-center">
                <div className={`text-5xl font-black rounded-full h-24 w-24 flex items-center justify-center border-4 ${
                  empathyScore === null ? 'text-gray-600 border-gray-800' :
                  empathyScore >= 80 ? 'text-green-500 border-green-500' :
                  empathyScore >= 50 ? 'text-yellow-500 border-yellow-500' :
                  'text-red-500 border-red-500'
                }`}>
                  {empathyScore !== null ? `${empathyScore}%` : "—"}
                </div>
                <span className="text-xs text-gray-500 mt-3 font-semibold uppercase tracking-wider">AI Speech Quality Rating</span>
              </CardContent>
            </Card>

            <Card className="bg-[#0B1120] border-gray-800 shadow-xl flex-1 overflow-auto">
              <CardHeader>
                <CardTitle className="text-white text-base flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-blue-500" /> AI Coach Feedback
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-slate-950/40 p-4 border border-gray-800/80 rounded-2xl text-xs text-gray-300 leading-relaxed font-semibold italic">
                  {coachingTip}
                </div>

                <div className="border-t border-gray-800/60 pt-4">
                  <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block mb-3">Objectives Checklist:</span>
                  <ul className="space-y-2 text-xs">
                    {selectedScenario?.checkpoints.map((chk, idx) => {
                      const isDone = completedCheckpoints.includes(chk)
                      return (
                        <li key={idx} className={`flex items-center gap-2 p-2 rounded-xl border ${
                          isDone 
                            ? 'bg-green-500/5 border-green-500/20 text-green-400 font-semibold' 
                            : 'bg-slate-950/30 border-gray-900 text-gray-500'
                        }`}>
                          <CheckCircle2 className={`w-4 h-4 shrink-0 ${isDone ? 'text-green-500' : 'text-gray-800'}`} />
                          {chk}
                        </li>
                      )
                    })}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT PANEL: Voice Pulsing Wave & Chat Stream */}
          <div className="lg:col-span-8 bg-[#0B1120] border border-gray-800 rounded-3xl flex flex-col h-full overflow-hidden shadow-2xl relative">
            
            {/* Simulation Header */}
            <div className="p-4 border-b border-gray-800 bg-[#070b13] flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 bg-red-600 rounded-full animate-pulse" />
                <span className="text-xs text-gray-300 font-semibold uppercase tracking-wider">{selectedScenario?.title} Live Practice</span>
              </div>
              <Button onClick={endCall} variant="destructive" className="h-8 text-xs font-bold gap-1 rounded-lg">
                <PhoneOff className="w-3.5 h-3.5" /> End & Review Call
              </Button>
            </div>

            {/* Pulsing visual wave */}
            <div className="bg-[#020617] h-32 border-b border-gray-900 flex items-center justify-center relative overflow-hidden">
              <AnimatePresence>
                {isSpeaking && (
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((bar) => (
                      <motion.div
                        key={bar}
                        animate={{ height: [12, 48, 12] }}
                        transition={{
                          duration: 0.8,
                          repeat: Infinity,
                          delay: bar * 0.08
                        }}
                        className="w-1 bg-gradient-to-t from-blue-600 to-indigo-400 rounded-full"
                      />
                    ))}
                  </div>
                )}
              </AnimatePresence>
              {!isSpeaking && (
                <div className="text-xs text-gray-500 font-mono tracking-widest uppercase">Waiting for agent to speak...</div>
              )}
            </div>

            {/* Chat Stream */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin">
              {history.map((msg, idx) => (
                <div key={idx} className={`flex gap-3 max-w-[85%] ${msg.role === 'agent' ? 'ml-auto flex-row-reverse' : ''}`}>
                  <div className={`p-2 rounded-xl h-8 w-8 flex items-center justify-center shrink-0 ${
                    msg.role === 'agent' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-red-400'
                  }`}>
                    {msg.role === 'agent' ? <User className="w-4 h-4" /> : <PhoneOff className="w-4 h-4 transform rotate-135" />}
                  </div>
                  <div className={`p-3 rounded-2xl text-xs leading-relaxed ${
                    msg.role === 'agent' 
                      ? 'bg-blue-600 text-white rounded-tr-sm font-semibold' 
                      : 'bg-slate-900/60 border border-gray-800 text-gray-300 rounded-tl-sm'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer Control mic */}
            <div className="p-6 border-t border-gray-800 bg-[#070b13] flex flex-col items-center justify-center gap-3">
              <Button
                onClick={startListening}
                className={`h-16 w-16 rounded-full flex items-center justify-center shadow-xl shadow-blue-500/10 ${
                  isRecording 
                    ? 'bg-red-600 border border-red-500 text-white animate-pulse' 
                    : 'bg-blue-600 hover:bg-blue-500 text-white'
                }`}
              >
                {isRecording ? <MicOff className="w-6 h-6 animate-bounce" /> : <Mic className="w-6 h-6" />}
              </Button>
              <span className="text-[10px] text-gray-400 font-semibold tracking-wider uppercase">
                {isRecording ? "Listening... Speak now and press microphone button again to send" : "Tap Microphone to Speak"}
              </span>
            </div>

          </div>

        </div>
      )}

      {/* CREATE CUSTOM SCENARIO MODAL */}
      <AnimatePresence>
        {showCustomModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0B1120] border border-gray-800 rounded-3xl p-6 max-w-lg w-full space-y-6 shadow-2xl relative"
            >
              <button 
                onClick={() => setShowCustomModal(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>

              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Cpu className="text-blue-500 w-5 h-5" /> Custom Call Scenario
                </h3>
                <p className="text-xs text-gray-400 mt-1">Configure a custom customer situation to train agents on specific customer issues.</p>
              </div>

              <form onSubmit={handleCreateCustomScenario} className="space-y-4 text-sm">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-400">Scenario Title *</label>
                  <Input 
                    value={customTitle} 
                    onChange={(e) => setCustomTitle(e.target.value)} 
                    placeholder="e.g. Stripe Refund Delayed" 
                    className="bg-[#020617] border-gray-800 rounded-xl"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-400">Situation Description *</label>
                  <textarea
                    value={customDesc}
                    onChange={(e) => setCustomDesc(e.target.value)}
                    placeholder="Describe the customer's issue, their mood, and what they want to achieve."
                    rows={3}
                    className="w-full bg-[#020617] border border-gray-800 rounded-xl p-3 text-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-400">Initial Customer Greeting *</label>
                  <Input 
                    value={customGreeting} 
                    onChange={(e) => setCustomGreeting(e.target.value)} 
                    placeholder="The very first thing the customer says when the agent answers." 
                    className="bg-[#020617] border-gray-800 rounded-xl"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-400">Checkpoints / Objectives (Comma-separated)</label>
                  <Input 
                    value={customObjectives} 
                    onChange={(e) => setCustomObjectives(e.target.value)} 
                    placeholder="e.g. Verify account, Explain 5-day latency, Propose alternative payment" 
                    className="bg-[#020617] border-gray-800 rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-400">Difficulty Level</label>
                    <select
                      value={customDifficulty}
                      onChange={(e) => setCustomDifficulty(e.target.value as any)}
                      className="w-full h-10 bg-[#020617] border border-gray-800 rounded-xl px-3 text-white text-xs"
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                </div>

                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-xl h-11 font-bold">
                  Create and Save Scenario
                </Button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  )
}
