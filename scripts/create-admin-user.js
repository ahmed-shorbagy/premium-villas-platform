/**
 * Creates (or updates) the initial admin user in Supabase Auth + user_roles.
 *
 * Requires in .env:
 *   VITE_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY  (Dashboard → Settings → API → service_role secret)
 *
 * Usage:
 *   npm run admin:create
 *   ADMIN_EMAIL=admin@admin.com ADMIN_PASSWORD=123456 npm run admin:create
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  const env = { ...process.env };
  for (const file of [".env", ".env.local"]) {
    const envPath = path.join(__dirname, "..", file);
    if (!fs.existsSync(envPath)) continue;
    for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const i = t.indexOf("=");
      if (i === -1) continue;
      let v = t.slice(i + 1).trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
        v = v.slice(1, -1);
      }
      env[t.slice(0, i).trim()] = v;
    }
  }
  return env;
}

const env = loadEnv();
const url = env.VITE_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
const email = env.ADMIN_EMAIL || "admin@admin.com";
const password = env.ADMIN_PASSWORD || "123456";

if (!url || !serviceKey) {
  console.error(`
Missing SUPABASE_SERVICE_ROLE_KEY or VITE_SUPABASE_URL.

1. Open https://supabase.com/dashboard/project/idnehwkrufbgfmlkexvi/settings/api
2. Copy the service_role key (secret — never commit or expose in the browser)
3. Add to .env:

SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

Then run: npm run admin:create
`);
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function findUserByEmail(targetEmail) {
  let page = 1;
  const perPage = 200;
  while (true) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) throw error;
    const match = data.users.find((u) => u.email?.toLowerCase() === targetEmail.toLowerCase());
    if (match) return match;
    if (data.users.length < perPage) break;
    page += 1;
  }
  return null;
}

async function main() {
  console.log(`Setting up admin: ${email}`);

  let user = await findUserByEmail(email);

  if (user) {
    console.log("User already exists, updating password and confirming email...");
    const { data, error } = await admin.auth.admin.updateUserById(user.id, {
      password,
      email_confirm: true,
    });
    if (error) throw error;
    user = data.user;
  } else {
    console.log("Creating new auth user...");
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (error) throw error;
    user = data.user;
  }

  const { error: roleError } = await admin.from("user_roles").upsert(
    { user_id: user.id, role: "admin" },
    { onConflict: "user_id,role" },
  );

  if (roleError) {
    const { error: insertError } = await admin.from("user_roles").insert({
      user_id: user.id,
      role: "admin",
    });
    if (insertError) throw insertError;
  }

  console.log("\nAdmin ready.");
  console.log(`  User ID: ${user.id}`);
  console.log(`  Email:   ${email}`);
  console.log(`  Login:   ${url.replace(".supabase.co", "")} → /لوحة-التحكم/تسجيل-الدخول`);
  console.log("         or /admin/login");
}

main().catch((err) => {
  console.error("Failed:", err.message || err);
  process.exit(1);
});
