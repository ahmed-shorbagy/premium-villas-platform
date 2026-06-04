import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Note: To run this you need to install dotenv and tsx if not already installed
// npm install dotenv
// npx tsx scripts/migrate_slugs.ts

dotenv.config({ path: resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY; // For an admin script, ideally use SERVICE_ROLE_KEY if RLS blocks updates.

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase URL or Key in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const generateSlug = (title: string): string => {
  let slug = title.toLowerCase();
  slug = slug.replace(/[^\w\s\u0621-\u064A\u0660-\u0669-]/g, '');
  slug = slug.replace(/[\s-]+/g, '-');
  slug = slug.replace(/^-+|-+$/g, '');
  const randomStr = Math.random().toString(36).substring(2, 6);
  return `${slug}-${randomStr}`;
};

async function migrateSlugs() {
  console.log('Fetching properties...');
  const { data: properties, error } = await supabase.from('properties').select('id, title, slug');

  if (error) {
    console.error('Error fetching properties:', error);
    return;
  }

  console.log(`Found ${properties.length} properties. Migrating slugs...`);

  let count = 0;
  for (const property of properties) {
    if (!property.slug) {
      const newSlug = generateSlug(property.title || 'property');
      const { error: updateError } = await supabase
        .from('properties')
        .update({ slug: newSlug })
        .eq('id', property.id);

      if (updateError) {
        console.error(`Failed to update slug for property ${property.id}:`, updateError);
      } else {
        console.log(`Updated property ${property.id} with slug: ${newSlug}`);
        count++;
      }
    }
  }

  console.log(`Migration complete. Updated ${count} properties.`);
}

migrateSlugs();
