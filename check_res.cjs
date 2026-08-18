const fs = require('fs');
const env = fs.readFileSync('.env', 'utf-8');
const urlMatch = env.match(/VITE_SUPABASE_URL="(.*)"/);
const keyMatch = env.match(/VITE_SUPABASE_PUBLISHABLE_KEY="(.*)"/);
const VITE_SUPABASE_URL = urlMatch[1];
const VITE_SUPABASE_PUBLISHABLE_KEY = keyMatch[1];

async function run() {
  const res = await fetch(`${VITE_SUPABASE_URL}/rest/v1/reservations?select=id,customer_name,created_at&order=created_at.desc&limit=5`, {
    headers: {
      'apikey': VITE_SUPABASE_PUBLISHABLE_KEY,
      'Authorization': `Bearer ${VITE_SUPABASE_PUBLISHABLE_KEY}`
    }
  });
  console.log('Status:', res.status);
  console.log(await res.text());
}
run();
