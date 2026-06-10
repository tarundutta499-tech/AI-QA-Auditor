const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function addPolicies() {
  // We can just add policies directly using SQL
  const sql = `
    CREATE POLICY "Enable read access for all users" ON "public"."scorecards" AS PERMISSIVE FOR SELECT TO public USING (true);
    CREATE POLICY "Enable insert for authenticated users only" ON "public"."scorecards" AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (true);
    CREATE POLICY "Enable update for users based on email" ON "public"."scorecards" AS PERMISSIVE FOR UPDATE TO public USING (true) WITH CHECK (true);
    CREATE POLICY "Enable delete for users based on user_id" ON "public"."scorecards" AS PERMISSIVE FOR DELETE TO public USING (true);

    CREATE POLICY "Enable read access for all users" ON "public"."scorecard_parameters" AS PERMISSIVE FOR SELECT TO public USING (true);
    CREATE POLICY "Enable insert for authenticated users only" ON "public"."scorecard_parameters" AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (true);
    CREATE POLICY "Enable update for users based on email" ON "public"."scorecard_parameters" AS PERMISSIVE FOR UPDATE TO public USING (true) WITH CHECK (true);
    CREATE POLICY "Enable delete for users based on user_id" ON "public"."scorecard_parameters" AS PERMISSIVE FOR DELETE TO public USING (true);
  `;
  
  // Actually Supabase JS Client doesn't let us run arbitrary SQL easily without a Postgres connection or an RPC function.
  // Let me just disable RLS to see if it fixes it, or I can use Postgres client.
  
  // Wait, I can try to insert a test scorecard with service role to see if the schema allows it.
  const { data, error } = await supabase.from('scorecards').insert({
    company_id: '123e4567-e89b-12d3-a456-426614174000', // random uuid
    name: 'Test Scorecard',
    description: 'Test'
  });
  console.log('Service role insert:', data, error);
}

addPolicies();
