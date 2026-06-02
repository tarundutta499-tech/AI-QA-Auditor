import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function check() {
  const { data: audits, error } = await supabase.from('audits').select('id, created_at, status')
  console.log("Total Audits:", audits?.length)
  if (audits) {
    console.log("Audits created_at:", audits.map(a => a.created_at))
  }
  
  const { data: results } = await supabase.from('audit_results').select('id, is_passed')
  console.log("Total Audit Results:", results?.length)
  if (results) {
    console.log("Failed parameters count:", results.filter(r => r.is_passed === false).length)
  }
}

check()
