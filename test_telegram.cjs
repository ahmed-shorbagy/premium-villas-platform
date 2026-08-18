const fs = require('fs');
const env = fs.readFileSync('.env', 'utf-8');
const urlMatch = env.match(/VITE_SUPABASE_URL="(.*)"/);
const keyMatch = env.match(/VITE_SUPABASE_PUBLISHABLE_KEY="(.*)"/);
const VITE_SUPABASE_URL = urlMatch[1];
const VITE_SUPABASE_PUBLISHABLE_KEY = keyMatch[1];

async function run() {
  const url = `${VITE_SUPABASE_URL}/functions/v1/send-telegram`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${VITE_SUPABASE_PUBLISHABLE_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      propertyTitle: 'Test Villa',
      customer_name: 'Test Customer',
      customer_phone: '0590000000',
      customer_location: 'Dubai',
      check_in: '2026-10-10',
      check_out: '2026-10-12',
      customer_notes: 'None'
    })
  });
  console.log('Status:', res.status);
  console.log(await res.text());
}
run();
