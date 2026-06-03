/**
 * Builds supabase/FRESH_PROJECT_BOOTSTRAP.sql in correct dependency order
 * for a brand-new Supabase project (empty public schema).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsDir = path.join(__dirname, "../supabase/migrations");
const outFile = path.join(__dirname, "../supabase/FRESH_PROJECT_BOOTSTRAP.sql");

/** Explicit order — do not rely on filename sort alone */
const MIGRATION_ORDER = [
  "20251218085839_7c7267c8-0c05-4cc1-a804-ca0aae0aa4a4.sql",
  "20251218085906_8c9410f2-e014-4669-b3b0-d6a630389118.sql",
  "20251218085907_add_contact_info_to_properties.sql",
  "20251229120000_add_features.sql",
  "20251231154500_add_listing_type.sql",
  "20260123120000_create_listing_requests.sql",
  "20260124_add_installments.sql",
  "20260125_create_rpc_submit_listing.sql",
  "20260125_grant_permissions_listing_requests.sql",
  "20260202132700_update_property_types.sql",
  "20260205_add_land_type.sql",
  "20260228130000_create_banners_table.sql",
  "20260525120000_add_group_type_to_properties.sql",
  "20260525130000_deprecate_area_columns.sql",
  "20260525_reservations_availability.sql",
  "20260602120000_add_price_weekend.sql",
  "20260602130000_add_rent_count.sql",
  "20260602140000_make_reservation_dates_optional.sql",
  "20260603090000_update_group_type_check.sql",
];

let sql = `-- Shima AK — fresh Supabase project bootstrap
-- Project: idnehwkrufbgfmlkexvi
-- Run once on an EMPTY database (SQL Editor → New query → Run)
-- Generated: ${new Date().toISOString()}

`;

for (const file of MIGRATION_ORDER) {
  const filePath = path.join(migrationsDir, file);
  if (!fs.existsSync(filePath)) {
    console.error(`Missing migration: ${file}`);
    process.exit(1);
  }
  sql += `\n-- ═══════════════════════════════════════\n-- ${file}\n-- ═══════════════════════════════════════\n\n`;
  sql += fs.readFileSync(filePath, "utf8");
  sql += "\n";
}

// Keep legacy alias in sync
const legacyOut = path.join(__dirname, "../supabase/REMOTE_BOOTSTRAP.sql");
fs.writeFileSync(outFile, sql);
fs.writeFileSync(legacyOut, sql);
console.log(`Wrote ${outFile}`);
console.log(`Wrote ${legacyOut}`);
console.log(`${MIGRATION_ORDER.length} migrations in dependency order`);
