import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@/utils/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { fileName, companyId } = await req.json()
    if (!fileName || !companyId) return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })

    const getAdminClient = () => createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const adminSupabase = getAdminClient()

    const storagePath = `${companyId}/${fileName}`
    
    // Create a signed URL valid for 10 minutes (600 seconds)
    const { data, error } = await adminSupabase.storage
      .from('audio_files')
      .createSignedUploadUrl(storagePath)

    if (error || !data) {
      console.error('Error creating signed URL', error)
      return NextResponse.json({ error: 'Failed to generate upload URL' }, { status: 500 })
    }

    return NextResponse.json({ signedUrl: data.signedUrl, path: data.path, token: data.token })
  } catch (error: any) {
    console.error('Upload URL error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
