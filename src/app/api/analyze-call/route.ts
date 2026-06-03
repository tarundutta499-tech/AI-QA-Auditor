import { GoogleGenAI } from '@google/genai'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Initialize the new Google Gen AI SDK
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

// Initialize Supabase admin client for backend operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

const SYSTEM_SOP = `You are an expert QA Manager at an enterprise BPO. Your job is to strictly audit the attached customer service call recording.
Grade the agent's performance against standard compliance and empathy metrics.

You MUST return your analysis as a strict, raw JSON object. Do NOT include markdown blocks like \`\`\`json. Return ONLY the raw JSON string matching this exact structure:
{
  "empathyScore": <number between 0 and 100>,
  "complianceScore": <number between 0 and 100>,
  "fatalErrors": [<array of strings containing any severe compliance violations like swearing, hanging up, or exposing PII. Empty array if none>],
  "coachingNotes": [<array of 3 specific, actionable coaching tips for the agent>],
  "callSummary": "<A clear 2-sentence summary of what the customer wanted and if it was resolved>"
}`

export async function POST(req: Request) {
  try {
    const { fileUrl } = await req.json()

    if (!fileUrl) {
      return NextResponse.json({ success: false, error: "No file URL provided" }, { status: 400 })
    }

    console.log("1. Fetching audio from Supabase bucket...")
    const audioRes = await fetch(fileUrl)
    if (!audioRes.ok) {
      throw new Error("Failed to download audio from Supabase")
    }

    // Convert the downloaded audio to a Base64 string for Gemini inline data
    const arrayBuffer = await audioRes.arrayBuffer()
    const base64Audio = Buffer.from(arrayBuffer).toString('base64')
    
    // Determine mime type (default to mp3)
    const mimeType = fileUrl.toLowerCase().endsWith('.wav') ? 'audio/wav' : 
                     fileUrl.toLowerCase().endsWith('.m4a') ? 'audio/m4a' : 'audio/mp3'

    console.log(`2. Sending ${Math.round(base64Audio.length / 1024 / 1024)}MB of audio to Gemini 1.5 Flash...`)
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: SYSTEM_SOP },
            {
              inlineData: {
                data: base64Audio,
                mimeType: mimeType
              }
            }
          ]
        }
      ],
      config: {
        temperature: 0.0, // Forced to 0.0 for deterministic, robotic grading
      }
    })

    console.log("3. Gemini analysis complete. Parsing results...")
    
    // The response is strict JSON based on our prompt
    const resultText = response.text
    if (!resultText) {
      throw new Error("Gemini returned an empty response")
    }

    // Clean up potential markdown wrappers just in case
    const cleanedJson = resultText.replace(/```json/gi, '').replace(/```/g, '').trim()
    
    const scorecardData = JSON.parse(cleanedJson)

    console.log("4. Saving scorecard to Supabase Database...")
    const { error: dbError } = await supabase
      .from('demo_scorecards')
      .insert({
        audio_url: fileUrl,
        empathy_score: scorecardData.empathyScore,
        compliance_score: scorecardData.complianceScore,
        fatal_errors: scorecardData.fatalErrors,
        coaching_notes: scorecardData.coachingNotes,
        call_summary: scorecardData.callSummary
      })

    if (dbError) {
      console.error("Database save error (non-fatal):", dbError)
      // We still return success to the user so the demo works, but log the error
    }

    return NextResponse.json({ success: true, data: scorecardData }, { status: 200 })

  } catch (error: any) {
    console.error("AI Pipeline Error:", error)
    return NextResponse.json(
      { success: false, error: error.message || "An unknown error occurred during AI analysis." },
      { status: 500 }
    )
  }
}
