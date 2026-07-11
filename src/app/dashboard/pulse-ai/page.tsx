"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  Workflow, 
  TrendingUp, 
  Clock, 
  ShieldAlert, 
  AlertTriangle,
  FileText,
  Mic,
  MicOff,
  Copy,
  Check,
  ArrowUpRight
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { askPulseAI } from "./actions"
import Link from "next/link"

interface Message {
  id: string
  role: "user" | "assistant"
  text: string
  timestamp: string
}

export default function PulseAIPage() {
  const [query, setQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const recognitionRef = useRef<any>(null)

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "Hello! I am **Pulse AI**, your cognitive operations analyst. Ask me anything about your call durations, compliance alerts, agent trends, or customer feedback signals.",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }
  ])

  // Setup Web Speech API for voice search
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        const rec = new SpeechRecognition()
        rec.continuous = false
        rec.interimResults = false
        rec.lang = 'en-US'

        rec.onresult = (event: any) => {
          const speechToText = event.results[0][0].transcript
          setQuery(prev => (prev ? prev + " " + speechToText : speechToText))
          setIsRecording(false)
        }

        rec.onerror = (e: any) => {
          console.error("Speech Recognition Error:", e)
          setIsRecording(false)
        }

        rec.onend = () => {
          setIsRecording(false)
        }

        recognitionRef.current = rec
      }
    }
  }, [])

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser.")
      return
    }

    if (isRecording) {
      recognitionRef.current.stop()
    } else {
      setIsRecording(true)
      recognitionRef.current.start()
    }
  }

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const suggestedQueries = [
    { label: "Why is call handling time high?", query: "Why is our Average Handle Time (AHT) high? What are the main causes?" },
    { label: "List main compliance issues", query: "Summarize the top compliance guidelines that agents are failing on." },
    { label: "Summarize call quality trends", query: "Give me an overview of the call quality and compliance scores across all audited recordings." }
  ]

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }

    setMessages(prev => [...prev, userMsg])
    setQuery("")
    setIsLoading(true)

    const res = await askPulseAI(textToSend)
    setIsLoading(false)

    if (res.success && res.answer) {
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        text: res.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }
      setMessages(prev => [...prev, assistantMsg])
    } else {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        text: `⚠️ **Error Syncing Database**: ${res.error || "Please check your database connections or Gemini API key."}`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }
      setMessages(prev => [...prev, errorMsg])
    }
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 h-[calc(100vh-80px)] flex flex-col">
      
      {/* Header */}
      <div className="border-b border-gray-800 pb-6 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <Sparkles className="h-7 w-7 text-blue-500 animate-pulse" />
            Pulse AI Operations Analyst
          </h1>
          <p className="text-gray-400 text-sm">
            Conversational RAG assistant summarizing compliance logs, handle time delays, and performance insights directly from your database.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 min-h-0">
        
        {/* LEFT COLUMN: GUIDES & METRICS */}
        <div className="lg:col-span-4 space-y-6 hidden lg:flex flex-col">
          <Card className="bg-[#0B1120] border-gray-800 shadow-xl shrink-0">
            <CardHeader>
              <CardTitle className="text-white text-base">Quick Operational Analysis</CardTitle>
              <CardDescription>Click any prompt below to ask Pulse AI about your database records:</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {suggestedQueries.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(item.query)}
                  disabled={isLoading}
                  className="w-full text-left p-3 rounded-xl bg-[#020617] border border-gray-800 hover:border-blue-500/50 hover:bg-blue-950/20 text-xs text-gray-300 transition-all font-semibold block"
                >
                  {item.label}
                </button>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-[#0B1120] border-gray-800 shadow-xl flex-1 overflow-auto">
            <CardHeader>
              <CardTitle className="text-white text-base">Analytical Scope</CardTitle>
              <CardDescription>Pulse AI has context on the following columns:</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs text-gray-400">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-400 shrink-0" />
                <span>**Average Handle Time (AHT)** from Call Durations</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>**Compliance Percentages** from Audit Outcomes</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
                <span>**Failed Parameters** from Audit Results</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-violet-400 shrink-0" />
                <span>**Transcripts & Audited Summaries**</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: CHAT PANEL */}
        <div className="lg:col-span-8 bg-[#0B1120] border border-gray-800 rounded-3xl flex flex-col h-full min-h-0 shadow-2xl relative overflow-hidden">
          
          {/* Messages stream */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-gray-800">
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
                >
                  <div className={`p-2 rounded-xl h-9 w-9 shrink-0 flex items-center justify-center ${
                    msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-violet-400'
                  }`}>
                    {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>

                  <div className={`p-4 rounded-2xl text-sm leading-relaxed relative group ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-sm'
                      : 'bg-slate-900/50 text-gray-300 rounded-tl-sm border border-gray-800'
                  }`}>
                    {/* Simplified markdown formatter for strong/bold text & interactive Citations */}
                    {msg.text.split("\n").map((line, lIdx) => {
                      const parts = line.split("**")
                      return (
                        <p key={lIdx} className="mb-2 last:mb-0">
                          {parts.map((part, pIdx) => {
                            if (pIdx % 2 === 1) {
                              return <strong key={pIdx} className="text-white font-bold">{part}</strong>
                            }
                            
                            // Check for "Call #[ID]" citation structures
                            const callMatch = part.match(/(Call\s*#([a-zA-Z0-9-]+))/i)
                            if (callMatch) {
                              const matchText = callMatch[1]
                              const id = callMatch[2]
                              const segmentSplit = part.split(callMatch[0])
                              return (
                                <span key={pIdx}>
                                  {segmentSplit[0]}
                                  <Link 
                                    href={`/dashboard/audits/${id}`}
                                    className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded bg-blue-950 text-blue-400 hover:bg-blue-900 border border-blue-800/80 text-xs font-bold font-mono transition-all ml-1"
                                  >
                                    {matchText} <ArrowUpRight className="w-3 h-3" />
                                  </Link>
                                  {segmentSplit[1]}
                                </span>
                              )
                            }
                            return part
                          })}
                        </p>
                      )
                    })}
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-800/40">
                      <span className="text-[10px] text-gray-500">{msg.timestamp}</span>
                      {msg.role === 'assistant' && (
                        <button 
                          onClick={() => handleCopy(msg.id, msg.text)}
                          className="opacity-0 group-hover:opacity-100 transition-all p-1 text-gray-500 hover:text-gray-300 rounded"
                          title="Copy to clipboard"
                        >
                          {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isLoading && (
              <div className="flex gap-3 max-w-[80%]">
                <div className="p-2 rounded-xl h-9 w-9 bg-gray-800 text-violet-400 flex items-center justify-center">
                  <Bot className="w-4 h-4 animate-spin" />
                </div>
                <div className="p-4 rounded-2xl text-sm bg-slate-900/50 text-gray-400 rounded-tl-sm border border-gray-800 flex items-center gap-2">
                  <span className="animate-bounce">●</span>
                  <span className="animate-bounce delay-75">●</span>
                  <span className="animate-bounce delay-150">●</span>
                  <span>Pulse AI is auditing the database...</span>
                </div>
              </div>
            )}
          </div>

          {/* Chat input form */}
          <div className="p-4 border-t border-gray-800 bg-slate-950/40 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSend(query)
              }}
              className="flex gap-2"
            >
              <Button
                type="button"
                onClick={toggleVoiceInput}
                className={`rounded-xl h-12 w-12 p-0 flex items-center justify-center shrink-0 border ${
                  isRecording 
                    ? 'bg-red-600 border-red-500 text-white animate-pulse' 
                    : 'bg-[#020617] border-gray-800 text-gray-400 hover:bg-white/5'
                }`}
                title={isRecording ? "Listening..." : "Voice Search"}
              >
                {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </Button>

              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={isRecording ? "Listening... Speak your query..." : "Ask Pulse AI about your operational performance..."}
                disabled={isLoading}
                className="bg-[#020617] border-gray-800 rounded-xl h-12 text-sm focus-visible:ring-blue-500 text-white placeholder-gray-500"
              />

              <Button
                type="submit"
                disabled={isLoading || !query.trim()}
                className="bg-blue-600 hover:bg-blue-500 rounded-xl h-12 w-12 p-0 flex items-center justify-center text-white shadow-lg shadow-blue-500/10"
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>

        </div>

      </div>

    </div>
  )
}
