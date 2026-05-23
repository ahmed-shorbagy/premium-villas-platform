import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // Check for environment variables
  if (!process.env.VITE_SUPABASE_URL || !process.env.VITE_SUPABASE_ANON_KEY) {
    return res.status(500).json({ error: 'Missing Supabase environment variables' });
  }

  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
  );

  const SITE_URL = (process.env.VITE_SITE_URL || '').replace(/\/$/, '');
  if (!SITE_URL) {
    return res.status(500).json({ error: 'Missing VITE_SITE_URL environment variable' });
  }

  try {
    const { data: properties, error } = await supabase
      .from('properties')
      .select('id, updated_at, created_at');

    if (error) throw error;

    const currentDate = new Date().toISOString();

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_URL}/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${SITE_URL}/${encodeURI('عقار')}</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${SITE_URL}/contact</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>${SITE_URL}/${encodeURI('أضف-إعلانك')}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`;

    properties?.forEach((property) => {
      const lastMod = property.updated_at ? new Date(property.updated_at).toISOString() :
        property.created_at ? new Date(property.created_at).toISOString() :
          currentDate;

      xml += `
  <url>
    <loc>${SITE_URL}/${encodeURI('عقار')}/${property.id}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`;
    });

    xml += `
</urlset>`;

    res.setHeader('Content-Type', 'text/xml');
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate'); // Cache for 1 hour
    res.status(200).send(xml);

  } catch (error) {
    console.error('Sitemap generation error:', error);
    res.status(500).json({ error: 'Error processing sitemap' });
  }
}
