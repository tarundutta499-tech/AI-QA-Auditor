import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'
import { writeFile, unlink } from 'fs/promises'
import os from 'os'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

export async function POST(req: NextRequest) {
  let tempFilePath = ''
  let geminiFile: any = null
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

  try {
    const formData = await req.formData()
    const documentFile = formData.get('document') as File | null

    if (!documentFile) {
      return NextResponse.json({ error: 'Missing document file' }, { status: 400 })
    }

    // Save to temp file
    const buffer = Buffer.from(await documentFile.arrayBuffer())
    const tempFileName = `${uuidv4()}-${documentFile.name}`
    tempFilePath = path.join(os.tmpdir(), tempFileName)
    await writeFile(tempFilePath, buffer)

    // Upload to Gemini
    let mimeType = documentFile.type
    if (!mimeType) {
      if (documentFile.name.endsWith('.pdf')) mimeType = 'application/pdf'
      else if (documentFile.name.endsWith('.txt')) mimeType = 'text/plain'
      else mimeType = 'application/octet-stream'
    }

    geminiFile = await ai.files.upload({
      file: tempFilePath,
      config: { mimeType: mimeType },
    })

    const prompt = `
You are a document extraction assistant. 
Please extract all the readable text from this document. 
Preserve formatting, paragraphs, and lists as best as possible.
Do not add any commentary. Just return the pure text content of the document.
`

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [geminiFile, prompt]
    })

    const text = response.text

    // Cleanup
    await unlink(tempFilePath).catch(console.error)
    await ai.files.delete({ name: geminiFile.name }).catch(console.error)

    return NextResponse.json({ success: true, text })

  } catch (error: any) {
    console.error('Extraction error:', error)
    
    // Cleanup on error
    if (tempFilePath) await unlink(tempFilePath).catch(() => {})
    if (geminiFile) await ai.files.delete({ name: geminiFile.name }).catch(() => {})
      
    return NextResponse.json({ error: error.message || 'Failed to extract text from document.' }, { status: 500 })
  }
}
