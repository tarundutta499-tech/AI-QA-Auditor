import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'
import { writeFile, unlink } from 'fs/promises'
import os from 'os'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import mammoth from 'mammoth'

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

    let mimeType = documentFile.type
    const fileNameLower = documentFile.name.toLowerCase()
    
    if (!mimeType) {
      if (fileNameLower.endsWith('.pdf')) mimeType = 'application/pdf'
      else if (fileNameLower.endsWith('.txt')) mimeType = 'text/plain'
      else if (fileNameLower.endsWith('.docx')) mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      else mimeType = 'application/octet-stream'
    }

    const isDocx = fileNameLower.endsWith('.docx') || 
                  (mimeType && mimeType.includes('wordprocessingml.document')) || 
                  (mimeType && mimeType.includes('officedocument.wordprocessingml'))

    // Direct Mammoth parsing for Word documents (.docx)
    if (isDocx) {
      const result = await mammoth.extractRawText({ path: tempFilePath })
      const text = result.value
      await unlink(tempFilePath).catch(console.error)
      return NextResponse.json({ success: true, text })
    }

    // Upload to Gemini
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
      contents: [
        { fileData: { fileUri: geminiFile.uri, mimeType: geminiFile.mimeType } },
        prompt
      ]
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
