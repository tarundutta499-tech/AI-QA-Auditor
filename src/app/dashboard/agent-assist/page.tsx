"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Mic, 
  MicOff, 
  Play, 
  RotateCcw, 
  CheckCircle, 
  AlertTriangle, 
  Activity, 
  Sparkles, 
  Volume2, 
  Clock, 
  MessageSquare,
  ShieldCheck,
  UserCheck
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface ChecklistItem {
  id: string
  label: string
  keywords: string[]
  passed: boolean
  triggerPrompt: string
}

export default function AgentAssistPage() {
  const [isRecording, setIsRecording] = useState(false)
  const [isSimulating, setIsSimulating] = useState(false)
  const [transcript, setTranscript] = useState<string[]>([])
  const [currentText, setCurrentText] = useState("")
  const [sentiment, setSentiment] = useState<'neutral' | 'friendly' | 'escalation'>('friendly')
  const [warning, setWarning] = useState<string | null>(null)
  const [callDuration, setCallDuration] = useState(0)

  // Interactive Checklist State
  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    { 
      id: 'greeting', 
      label: 'Standard Opening Greeting', 
      keywords: ['hello', 'welcome', 'thank you for calling', 'name is'], 
      passed: false,
      triggerPrompt: "Say: 'Hello, thank you for calling Nexaviq Support. My name is [Your Name].'" 
    },
    { 
      id: 'auth', 
      label: 'Customer Identification & Authentication', 
      keywords: ['verify', 'name', 'account', 'identity', 'details'], 
      passed: false,
      triggerPrompt: "Say: 'To secure your account, could you please verify your registered email?'"
    },
    { 
      id: 'disclosure', 
      label: 'Security & Call Recording Disclosure', 
      keywords: ['recorded', 'monitor', 'privacy', 'recorded for quality'], 
      passed: false,
      triggerPrompt: "Say: 'Please note that this call is recorded for quality monitoring purposes.'"
    },
    { 
      id: 'assistance', 
      label: 'Offer Further Assistance', 
      keywords: ['anything else', 'further help', 'assist you', 'assistance'], 
      passed: false,
      triggerPrompt: "Say: 'Is there anything else I can assist you with today?'"
    }
  ])

  const recognitionRef = useRef<any>(null)
  const timerRef = useRef<any>(null)
  const simulationIntervalRef = useRef<any>(null)

  // 1. Web Speech API Setup for Microphone
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        const rec = new SpeechRecognition()
        rec.continuous = true
        rec.interimResults = true
        rec.lang = 'en-US'

        rec.onresult = (event: any) => {
          let interimTranscript = ''
          let finalTranscript = ''

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript
            } else {
              interimTranscript += event.results[i][0].transcript
            }
          }

          if (finalTranscript) {
            handleTextInflow(finalTranscript)
          } else if (interimTranscript) {
            setCurrentText(interimTranscript)
          }
        }

        rec.onerror = (e: any) => {
          console.error("Speech Recognition Error:", e)
        }

        recognitionRef.current = rec
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (simulationIntervalRef.current) clearInterval(simulationIntervalRef.current)
    }
  }, [])

  // Call Duration Timer
  useEffect(() => {
    if (isRecording || isSimulating) {
      timerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1)
      }, 1000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    return () => clearInterval(timerRef.current)
  }, [isRecording, isSimulating])

  // Format Timer
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`
  }

  // 2. Keyword check & escalation alerts logic
  const handleTextInflow = (text: string) => {
    const cleanText = text.toLowerCase()
    setTranscript(prev => [...prev, text])
    setCurrentText("")

    // Check checklist items
    setChecklist(prev => prev.map(item => {
      if (item.passed) return item
      const matched = item.keywords.some(kw => cleanText.includes(kw))
      return matched ? { ...item, passed: true } : item
    }))

    // Sarcasm / Abuse check
    const rudeKeywords = ['stupid', 'shut up', 'idiot', 'useless', 'fool']
    const hasRudeWords = rudeKeywords.some(w => cleanText.includes(w))
    if (hasRudeWords) {
      setSentiment('escalation')
      setWarning("🚨 Tone Alert: Sarcasm / Inappropriate behavior detected. Manager Escalation Alert will trigger if behavior continues.")
      setTimeout(() => setWarning(null), 8000)
    }
  }

  // 3. Microphone Start / Stop
  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser. Please use Chrome/Edge or click 'Auto-Run Simulation'!")
      return
    }

    if (isRecording) {
      recognitionRef.current.stop()
      setIsRecording(false)
    } else {
      if (isSimulating) stopSimulation()
      setTranscript([])
      setChecklist(prev => prev.map(i => ({ ...i, passed: false })))
      setCallDuration(0)
      setIsRecording(true)
      recognitionRef.current.start()
    }
  }

  // 4. Auto-Run Simulation (Pitch Deck Hero Option)
  const startSimulation = () => {
    if (isRecording) {
      recognitionRef.current.stop()
      setIsRecording(false)
    }

    setTranscript([])
    setChecklist(prev => prev.map(i => ({ ...i, passed: false })))
    setCallDuration(0)
    setIsSimulating(true)

    const dialogue = [
      { speaker: 'Agent', text: "Hello! Welcome to Nexaviq support. My name is Priya." },
      { speaker: 'Customer', text: "Hi Priya, I am locked out of my campaign settings page." },
      { speaker: 'Agent', text: "I can help with that. First, let's verify your registered account name and email address." },
      { speaker: 'Customer', text: "Sure, my email is admin@acme-bpo.com." },
      { speaker: 'Agent', text: "Perfect. Please note that this call is recorded for quality monitoring purposes while I verify the details." },
      { speaker: 'Customer', text: "Okay, go ahead." },
      { speaker: 'Agent', text: "Your account is verified. I have reset your settings, you should be able to log in now." },
      { speaker: 'Customer', text: "Awesome, it works! Thanks." },
      { speaker: 'Agent', text: "You're welcome. Is there anything else I can assist you with today?" },
      { speaker: 'Customer', text: "No, that's all. Thank you." },
      { speaker: 'Agent', text: "Thank you for calling. Have a great day!" }
    ]

    let index = 0
    simulationIntervalRef.current = setInterval(() => {
      if (index < dialogue.length) {
        const line = dialogue[index]
        handleTextInflow(`[${line.speaker}]: ${line.text}`)
        index++
      } else {
        stopSimulation()
      }
    }, 3500)
  }

  const stopSimulation = () => {
    setIsSimulating(false)
    if (simulationIntervalRef.current) clearInterval(simulationIntervalRef.current)
  }

  const resetAll = () => {
    if (isRecording && recognitionRef.current) recognitionRef.current.stop()
    stopSimulation()
    setIsRecording(false)
    setTranscript([])
    setCurrentText("")
    setCallDuration(0)
    setSentiment('friendly')
    setWarning(null)
    setChecklist(prev => prev.map(i => ({ ...i, passed: false })))
  }

  // Get active guidance
  const nextTarget = checklist.find(item => !item.passed)

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2 tracking-tight text-black flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-blue-500 animate-pulse" />
            Agent Co-Pilot (Real-Time Assist)
          </h1>
          <p className="text-slate-600 text-sm">
            Live speech transcription monitor, instant compliance checklists, and supervisor behavioral escalations.
          </p>
        </div>

        <div className="flex gap-3">
          <Button 
            onClick={toggleRecording} 
            className={`rounded-full h-11 px-5 font-semibold transition-all ${
              isRecording 
                ? 'bg-red-600 hover:bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]' 
                : 'bg-blue-600 hover:bg-blue-500 text-white'
            }`}
          >
            {isRecording ? (
              <span className="flex items-center gap-2">
                <MicOff className="w-4 h-4" /> Stop Live Audio
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Mic className="w-4 h-4" /> Start Live Audio
              </span>
            )}
          </Button>

          <Button 
            onClick={isSimulating ? stopSimulation : startSimulation}
            variant="outline"
            className="rounded-full h-11 border-gray-800 text-gray-300 hover:bg-white/5"
          >
            {isSimulating ? "Stop Simulation" : "Auto-Run Simulation"}
          </Button>

          <Button 
            onClick={resetAll}
            variant="ghost"
            className="rounded-full w-11 h-11 p-0 border border-gray-800 hover:bg-white/5"
            title="Reset Simulator"
          >
            <RotateCcw className="w-4 h-4 text-gray-400" />
          </Button>
        </div>
      </div>

      {/* Warning Notification Toast */}
      <AnimatePresence>
        {warning && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-red-500/10 border-2 border-red-500/30 p-4 rounded-2xl flex items-center gap-3 text-red-200 shadow-lg"
          >
            <AlertTriangle className="w-6 h-6 text-red-500 shrink-0" />
            <p className="text-sm font-semibold">{warning}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: LIVE SPEECH & WAVEFORM PANEL */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Active Call Status Card */}
          <Card className="bg-[#0B1120] border-gray-800 shadow-xl overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 to-violet-500/5 pointer-events-none" />
            
            <CardHeader className="flex flex-row items-center justify-between border-b border-gray-800/80 pb-4">
              <div className="flex items-center gap-3">
                {(isRecording || isSimulating) ? (
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                  </span>
                ) : (
                  <span className="h-3 w-3 rounded-full bg-gray-600" />
                )}
                <CardTitle className="text-white text-base">Active Call Status</CardTitle>
              </div>
              <div className="flex items-center gap-4 text-gray-400 text-sm font-mono">
                <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {formatTime(callDuration)}</span>
                <span className="flex items-center gap-1.5 capitalize">
                  <Volume2 className="w-4 h-4" /> Sentiment: 
                  <strong className={
                    sentiment === 'friendly' ? 'text-green-400' :
                    sentiment === 'neutral' ? 'text-gray-400' : 'text-red-400'
                  }>
                    {sentiment}
                  </strong>
                </span>
              </div>
            </CardHeader>
            <CardContent className="pt-6 h-[300px] flex flex-col justify-between">
              
              {/* Waveform Visualization */}
              <div className="h-28 flex items-center justify-center gap-1 bg-[#020617]/50 rounded-2xl border border-gray-800/80">
                {(isRecording || isSimulating) ? (
                  Array.from({ length: 24 }).map((_, i) => (
                    <motion.div 
                      key={i}
                      className="w-1 bg-blue-500 rounded-full"
                      animate={{
                        height: [12, Math.random() * 64 + 16, 12]
                      }}
                      transition={{
                        duration: 0.5 + Math.random() * 0.3,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                  ))
                ) : (
                  <p className="text-gray-500 text-xs flex items-center gap-2"><Activity className="w-4 h-4 animate-pulse" /> Live audio line dormant. Turn on mic to begin assist.</p>
                )}
              </div>

              {/* Live Streaming Transcript */}
              <div className="h-[120px] overflow-y-auto mt-4 p-4 bg-[#020617] rounded-2xl border border-gray-800 text-sm space-y-2">
                {transcript.length === 0 && !currentText && (
                  <p className="text-gray-500 italic">Call transcript will stream here in real-time...</p>
                )}
                {transcript.map((line, i) => (
                  <div key={i} className={`p-1.5 rounded-lg ${
                    line.includes('[Agent]') ? 'text-blue-400' :
                    line.includes('[Customer]') ? 'text-violet-400' : 'text-gray-300'
                  }`}>
                    {line}
                  </div>
                ))}
                {currentText && (
                  <div className="text-gray-400 italic bg-slate-900/40 p-1.5 rounded animate-pulse">
                    [Listening]: {currentText}
                  </div>
                )}
              </div>

            </CardContent>
          </Card>

          {/* AI Guide Suggestions Banner */}
          <Card className="bg-gradient-to-r from-blue-600/10 to-violet-600/10 border-blue-500/20 shadow-xl">
            <CardContent className="p-6 flex items-start gap-4">
              <div className="p-3 bg-blue-600/20 text-blue-400 rounded-xl shrink-0">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-white text-sm">Nexaviq Live Co-Pilot Suggestion</h4>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {nextTarget ? nextTarget.triggerPrompt : "All compliance checkpoints passed! Ensure proper call wrap-up."}
                </p>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* RIGHT COLUMN: SOP SCORECARD CHECKLIST */}
        <div className="lg:col-span-4">
          <Card className="bg-[#0B1120] border-gray-800 shadow-xl h-full flex flex-col justify-between">
            <CardHeader className="border-b border-gray-800/80 pb-4">
              <CardTitle className="text-white text-base">Live Call Checklist</CardTitle>
              <CardDescription className="text-gray-500">Parameters track as the agent speaks</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4 flex-1">
              {checklist.map((item) => (
                <div 
                  key={item.id} 
                  className={`p-4 rounded-2xl border transition-all duration-300 flex items-start justify-between gap-3 ${
                    item.passed 
                      ? 'bg-green-500/10 border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.05)]' 
                      : 'bg-slate-900/30 border-gray-800/80 opacity-60'
                  }`}
                >
                  <div className="space-y-1">
                    <span className={`text-sm font-semibold transition-colors ${item.passed ? 'text-white' : 'text-gray-400'}`}>
                      {item.label}
                    </span>
                    <p className="text-[10px] text-gray-500">
                      Keywords: {item.keywords.join(', ')}
                    </p>
                  </div>
                  {item.passed ? (
                    <CheckCircle className="w-5 h-5 text-green-400 shrink-0" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border border-gray-700 shrink-0" />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

      </div>

    </div>
  )
}
