
import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple .env parser (checks .env.local first, then .env)
function loadEnv() {
    let env = { ...process.env };
    try {
        const files = ['.env', '.env.local']; // Load .env first, then .env.local to override
        for (const file of files) {
            const envPath = path.resolve(__dirname, `../${file}`);
            if (fs.existsSync(envPath)) {
                console.log(`Loading ${file}...`);
                const content = fs.readFileSync(envPath, 'utf-8');
                content.split(/\r?\n/).forEach(line => {
                    const trimmedLine = line.trim();
                    if (!trimmedLine || trimmedLine.startsWith('#')) return;

                    const match = trimmedLine.match(/^([^=]+)=(.*)$/);
                    if (match) {
                        let value = match[2].trim();
                        if (value.startsWith('"') && value.endsWith('"')) {
                            value = value.slice(1, -1);
                        }
                        env[match[1].trim()] = value;
                    }
                });
            }
        }
    } catch (e) {
        console.warn('Could not read env files', e);
    }
    return env;
}

const env = loadEnv();
console.log('Final Env Keys:', Object.keys(env));
const SUPABASE_URL = env.VITE_SUPABASE_URL;
const SUPABASE_KEY = env.VITE_SUPABASE_PUBLISHABLE_KEY;
const DOMAIN = (env.VITE_SITE_URL || 'http://localhost:5173').replace(/\/$/, '');

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Missing Supabase credentials in .env');
    process.exit(1);
}

const fetchProperties = () => {
    return new Promise((resolve, reject) => {
        const url = `${SUPABASE_URL}/rest/v1/properties?select=id,updated_at,created_at`;
        const options = {
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`
            }
        };

        https.get(url, options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    try {
                        resolve(JSON.parse(data));
                    } catch (e) {
                        reject(e);
                    }
                } else {
                    reject(new Error(`Failed to fetch properties: ${res.statusCode} ${data}`));
                }
            });
        }).on('error', reject);
    });
};

const generateSitemap = async () => {
    try {
        console.log('Fetching properties...');
        
        let properties = [];
        try {
            properties = await fetchProperties();
            console.log(`Found ${properties.length} properties.`);
        } catch (fetchError) {
            console.warn('⚠️ Could not fetch properties from Supabase. Generating static sitemap only.');
            console.warn('Reason:', fetchError.message);
        }

        let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${DOMAIN}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${DOMAIN}/%D8%B9%D9%82%D8%A7%D8%B1</loc> 
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${DOMAIN}/contact</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>${DOMAIN}/%D8%A3%D9%86%D8%B6%D9%81-%D8%A5%D8%B9%D9%84%D8%A7%D9%86%D9%83</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>${DOMAIN}/%D8%B4%D9%82%D9%82</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${DOMAIN}/%D9%81%D9%84%D9%84</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${DOMAIN}/%D9%85%D9%83%D8%A7%D8%AA%D8%A8</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${DOMAIN}/%D8%AA%D8%AC%D8%A7%D8%B1%D9%8A</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${DOMAIN}/%D8%AF%D9%88%D8%A8%D9%84%D9%83%D8%B3</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${DOMAIN}/%D8%A7%D8%B1%D8%A7%D8%B6%D9%8A</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
`;

        properties.forEach(property => {
            const lastMod = property.updated_at ? new Date(property.updated_at).toISOString().split('T')[0] :
                property.created_at ? new Date(property.created_at).toISOString().split('T')[0] :
                    new Date().toISOString().split('T')[0];

            // /عقار/:id -> encodeURI('/عقار/') + id
            const path = encodeURI('/عقار/') + property.id;

            sitemap += `  <url>
    <loc>${DOMAIN}${path}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
`;
        });

        sitemap += '</urlset>';

        const publicDir = path.resolve(__dirname, '../public');
        const sitemapPath = path.join(publicDir, 'sitemap.xml');

        fs.writeFileSync(sitemapPath, sitemap);
        console.log(`Sitemap generated at ${sitemapPath}`);

    } catch (error) {
        console.error('Critical error generating sitemap:', error);
        // We do not exit with 1 anymore to prevent breaking the Vercel build
    }
};

generateSitemap();
