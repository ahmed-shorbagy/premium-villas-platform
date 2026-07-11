const fs = require('fs');
const env = fs.readFileSync('.env', 'utf-8');
const urlMatch = env.match(/VITE_SUPABASE_URL="(.*)"/);
const keyMatch = env.match(/VITE_SUPABASE_PUBLISHABLE_KEY="(.*)"/);
const VITE_SUPABASE_URL = urlMatch[1];
const VITE_SUPABASE_PUBLISHABLE_KEY = keyMatch[1];

async function run() {
  const res = await fetch(`${VITE_SUPABASE_URL}/rest/v1/properties?select=id,slug`, {
    headers: { 'apikey': VITE_SUPABASE_PUBLISHABLE_KEY, 'Authorization': `Bearer ${VITE_SUPABASE_PUBLISHABLE_KEY}` }
  });
  
  if (!res.ok) {
    console.error("Failed to fetch properties", await res.text());
    return;
  }
  
  const properties = await res.json();
  console.log(`Found ${properties.length} properties.`);
  
  let updatedCount = 0;
  
  for (const p of properties) {
    if (p.slug) {
      const parts = p.slug.split('-');
      // If it has hyphens, it's likely an old slug with Arabic text
      if (parts.length > 1) {
        let shortId = parts[parts.length - 1];
        if (shortId.length >= 4) {
          // Check if another property already has this shortId as slug
          const checkRes = await fetch(`${VITE_SUPABASE_URL}/rest/v1/properties?slug=eq.${shortId}`, {
             headers: { 'apikey': VITE_SUPABASE_PUBLISHABLE_KEY, 'Authorization': `Bearer ${VITE_SUPABASE_PUBLISHABLE_KEY}` }
          });
          const existing = await checkRes.json();
          if (existing && existing.length > 0 && existing[0].id !== p.id) {
             // collision! append something
             shortId = shortId + Math.random().toString(36).substring(2, 4);
          }

          // Update the slug in DB
          const updateRes = await fetch(`${VITE_SUPABASE_URL}/rest/v1/properties?id=eq.${p.id}`, {
            method: 'PATCH',
            headers: {
              'apikey': VITE_SUPABASE_PUBLISHABLE_KEY,
              'Authorization': `Bearer ${VITE_SUPABASE_PUBLISHABLE_KEY}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ slug: shortId })
          });
          
          if (updateRes.ok) {
            console.log(`Updated ${p.slug} -> ${shortId}`);
            updatedCount++;
          } else {
            console.error(`Failed to update ${p.slug}`, await updateRes.text());
          }
        }
      }
    }
  }
  
  console.log(`Successfully updated ${updatedCount} slugs.`);
}

run();
