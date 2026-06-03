"use client"

import { useState, useRef } from "react"
import { createBrowserClient } from '@supabase/ssr'
import { Button } from "@/components/ui/button"
import { UploadCloud, FileAudio, Loader2, Sparkles } from "lucide-react"
import Scorecard, { ScorecardData } from "@/components/dashboard/Scorecard"
import { motion, AnimatePresence } from "framer-motion"

export default function DashboardPage() {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [scorecard, setScorecard] = useState<ScorecardData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Initialize Supabase client
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setError(null)
      setScorecard(null)
    }
  }

  const handleAnalyze = async () => {
    if (!file) return

    try {
      setIsUploading(true)
      setError(null)
      
      // 1. Upload to Supabase Storage
      const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
      
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('calls')
        .upload(fileName, file)

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}. Make sure you created the 'calls' bucket!`)
      }

      // Get public URL
      const { data: { publicUrl } } = supabase
        .storage
        .from('calls')
        .getPublicUrl(fileName)

      setIsUploading(false)
      setIsAnalyzing(true)

      // 2. Send URL to our AI API
      const response = await fetch('/api/analyze-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileUrl: publicUrl, fileName })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to analyze call")
      }

      setScorecard(result.data)

    } catch (err: any) {
      console.error(err)
      setError(err.message)
    } finally {
      setIsUploading(false)
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#020617] selection:bg-blue-500/30 selection:text-white flex flex-col">
      <main className="flex-1 pt-12 pb-24">
        <div className="max-w-4xl mx-auto px-6">
          
          <div className="mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Manual QA Auditor</h1>
            <p className="text-gray-400">Upload an audio recording (.mp3, .wav, .m4a) to see the AI generate a scorecard instantly.</p>
          </div>

          {/* Upload Zone */}
          {!scorecard && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#0B1120] border-2 border-dashed border-gray-700 rounded-3xl p-12 text-center relative hover:border-blue-500/50 transition-colors"
            >
              <input 
                type="file" 
                accept="audio/*" 
                className="hidden" 
                ref={fileInputRef}
                onChange={handleFileSelect}
              />
              
              {!file ? (
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 bg-[#020617] rounded-full flex items-center justify-center mb-6 shadow-lg border border-gray-800">
                    <UploadCloud className="w-10 h-10 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Select an audio file</h3>
                  <p className="text-gray-500 mb-8 max-w-sm">Upload a mock customer service call to test the AI grading engine.</p>
                  <Button 
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-blue-600 hover:bg-blue-500 text-white rounded-full px-8"
                  >
                    Browse Files
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mb-6 border border-blue-500/30">
                    <FileAudio className="w-10 h-10 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{file.name}</h3>
                  <p className="text-gray-500 mb-8">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  
                  <div className="flex gap-4">
                    <Button 
                      onClick={() => setFile(null)}
                      variant="ghost"
                      className="text-gray-400 hover:text-white"
                      disabled={isUploading || isAnalyzing}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleAnalyze}
                      disabled={isUploading || isAnalyzing}
                      className="bg-blue-600 hover:bg-blue-500 text-white rounded-full px-8 flex items-center gap-2 shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                    >
                      {isUploading && <Loader2 className="w-4 h-4 animate-spin" />}
                      {isAnalyzing && <Sparkles className="w-4 h-4 animate-pulse" />}
                      {!isUploading && !isAnalyzing && <Sparkles className="w-4 h-4" />}
                      {isUploading ? "Uploading to Cloud..." : isAnalyzing ? "AI is Analyzing..." : "Run AI Audit"}
                    </Button>
                  </div>
                </div>
              )}

              {error && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-full max-w-md px-4">
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-lg">
                    {error}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Results Area */}
          <AnimatePresence>
            {scorecard && (
              <div className="space-y-6">
                <Button 
                  onClick={() => {
                    setScorecard(null)
                    setFile(null)
                  }}
                  variant="outline"
                  className="border-gray-700 text-gray-300 hover:text-white"
                >
                  ← Audit Another Call
                </Button>
                
                <Scorecard data={scorecard} />
              </div>
            )}
          </AnimatePresence>

        </div>
      </main>
    </div>
  )
}
