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
  CheckCircle2
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { sendSandboxTurn } from "./actions"

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

const SCENARIOS: Scenario[] = [
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
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null)
  const [isActiveCall, setIsActiveCall] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [enableVoice, setEnableVoice] = useState(true)
  const [history, setHistory] = useState<Message[]>([])
  const [empathyScore, setEmpathyScore] = useState<number | null>(null)
  const [coachingTip, setCoachingTip] = useState<string>("Start the call to receive live coaching.")
  const [completedCheckpoints, setCompletedCheckpoints] = useState<string[]>([])
  
  const recognitionRef = useRef<any>(null)
  const synthesisRef = useRef<any>(null)

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
    
    // Speak initial greeting
    setTimeout(() => {
      speakVoice(scenario.initialCustomerGreeting)
    }, 500)
  }

  const endCall = () => {
    setIsActiveCall(false)
    setIsRecording(false)
    if (synthesisRef.current) {
      synthesisRef.current.cancel()
    }
    setHistory([])
    setEmpathyScore(null)
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
            // Match checklist items loosely
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

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
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

      {!isActiveCall ? (
        // Scenario Selection Workspace
        <div className="space-y-6">
          <div className="text-lg font-bold text-white">Select Call Situation Scenario:</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SCENARIOS.map((item) => (
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
                  </div>
                  <CardTitle className="text-white text-lg">{item.title}</CardTitle>
                  <CardDescription className="text-gray-400 text-sm mt-1">{item.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="border-t border-gray-800/60 pt-4 mt-2">
                    <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block mb-2">Required SOP Objectives:</span>
                    <ul className="space-y-1 text-xs text-gray-400">
                      {item.checkpoints.map((chk, idx) => (
                        <li key={idx} className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-gray-700" />
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
                <PhoneOff className="w-3.5 h-3.5" /> End Simulation
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

    </div>
  )
}
