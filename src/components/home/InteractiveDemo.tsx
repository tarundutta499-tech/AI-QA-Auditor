"use client"

import { useState, useRef } from "react"
import { createBrowserClient } from '@supabase/ssr'
import { Button } from "@/components/ui/button"
import { UploadCloud, FileAudio, Loader2, Sparkles } from "lucide-react"
import Scorecard, { ScorecardData } from "@/components/dashboard/Scorecard"
import { motion, AnimatePresence } from "framer-motion"

export default function InteractiveDemo() {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [scorecard, setScorecard] = useState<ScorecardData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Initialize Supabase client for storage upload
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
      const fileName = `demo_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
      
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

      // 2. Send URL to our AI API (using 'Public Demo' as agent name)
      const response = await fetch('/api/analyze-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileUrl: publicUrl, fileName, agentName: 'Public Demo' })
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
    <div id="demo" className="w-full max-w-5xl mx-auto px-6 py-12 scroll-mt-24">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Test the AI Engine Now</h2>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">Upload a 1-minute mock customer service call (MP3/WAV) and watch Gemini 1.5 Flash instantly grade the interaction.</p>
      </div>

      {/* Upload Zone */}
      {!scorecard && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-[#0B1120] border-2 border-dashed border-gray-700 rounded-3xl p-12 text-center relative hover:border-blue-500/50 transition-colors mx-auto max-w-3xl"
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
              <div className="w-24 h-24 bg-[#020617] rounded-full flex items-center justify-center mb-6 shadow-lg border border-gray-800">
                <UploadCloud className="w-12 h-12 text-blue-400" />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-3">Drop an audio file here</h3>
              <p className="text-gray-500 mb-8 max-w-sm">We don't need your name or credit card. Just upload an MP3 or WAV to see the magic.</p>
              
              <Button 
                onClick={() => fileInputRef.current?.click()}
                className="bg-blue-600 hover:bg-blue-500 text-white rounded-full px-10 py-6 text-lg font-medium shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all hover:scale-105"
              >
                Browse Files
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 bg-blue-500/10 rounded-full flex items-center justify-center mb-6 border border-blue-500/30">
                <FileAudio className="w-12 h-12 text-blue-400" />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-2">{file.name}</h3>
              <p className="text-gray-500 mb-8 text-lg">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              
              <div className="flex gap-4">
                <Button 
                  onClick={() => setFile(null)}
                  variant="ghost"
                  className="text-gray-400 hover:text-white px-6 py-6"
                  disabled={isUploading || isAnalyzing}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleAnalyze}
                  disabled={isUploading || isAnalyzing}
                  className="bg-blue-600 hover:bg-blue-500 text-white rounded-full px-10 py-6 text-lg font-medium flex items-center gap-3 shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all"
                >
                  {isUploading && <Loader2 className="w-5 h-5 animate-spin" />}
                  {isAnalyzing && <Sparkles className="w-5 h-5 animate-pulse text-yellow-300" />}
                  {!isUploading && !isAnalyzing && <Sparkles className="w-5 h-5" />}
                  {isUploading ? "Uploading to Cloud..." : isAnalyzing ? "AI is Analyzing Audio..." : "Run AI Audit"}
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
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6 max-w-4xl mx-auto"
          >
            <div className="flex justify-center">
              <Button 
                onClick={() => {
                  setScorecard(null)
                  setFile(null)
                }}
                variant="outline"
                className="border-gray-700 text-gray-300 hover:text-white mb-4"
              >
                ← Try Another Call
              </Button>
            </div>
            
            <Scorecard data={scorecard} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
