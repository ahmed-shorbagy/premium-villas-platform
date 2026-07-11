const fs = require('fs');
const env = fs.readFileSync('.env', 'utf-8');
const urlMatch = env.match(/VITE_SUPABASE_URL="(.*)"/);
const keyMatch = env.match(/VITE_SUPABASE_PUBLISHABLE_KEY="(.*)"/);
const VITE_SUPABASE_URL = urlMatch[1];
const VITE_SUPABASE_PUBLISHABLE_KEY = keyMatch[1];

async function run() {
  const res = await fetch(`${VITE_SUPABASE_URL}/rest/v1/reservations`, {
    method: 'POST',
    headers: {
      'apikey': VITE_SUPABASE_PUBLISHABLE_KEY,
      'Authorization': `Bearer ${VITE_SUPABASE_PUBLISHABLE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({
      property_id: '4560a746-56b4-4771-9815-418b00c6bb58', 
      customer_name: 'Test',
      customer_phone: '0590000000',
      check_in: '2026-10-10',
      check_out: '2026-10-12',
      num_guests: 1,
      pricing_type: 'per_night',
      price_per_night: 100,
      total_price: 200
    })
  });
  console.log(res.status);
  console.log(await res.text());
}
run();
