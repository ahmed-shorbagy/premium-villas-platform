import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const DEFAULT_ALLOWED_ORIGINS = new Set([
  "https://nuzuul.com",
  "https://www.nuzuul.com",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
]);

function allowedOrigins(): Set<string> {
  const configured = (Deno.env.get("OWNER_PORTAL_ALLOWED_ORIGINS") || "")
    .split(",")
    .map((value) => value.trim().replace(/\/$/, ""))
    .filter(Boolean);
  return new Set([...DEFAULT_ALLOWED_ORIGINS, ...configured]);
}

export function corsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("Origin")?.replace(/\/$/, "") || "";
  const allowedOrigin = allowedOrigins().has(origin) ? origin : "https://www.nuzuul.com";
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type, x-owner-token",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
    "Cache-Control": "no-store",
    "Referrer-Policy": "no-referrer",
  };
}

export function isAllowedOrigin(req: Request): boolean {
  const origin = req.headers.get("Origin");
  if (!origin) return true;
  return allowedOrigins().has(origin.replace(/\/$/, ""));
}

export function jsonResponse(
  req: Request,
  body: unknown,
  status = 200,
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders(req),
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}

export function getServiceClient(): SupabaseClient {
  const url = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !serviceRoleKey) {
    throw new Error("Supabase service environment is not configured");
  }
  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value),
  );
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export function generateOwnerSecret(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  const encoded = btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
  return `ov1_${encoded}`;
}

export function readOwnerSecret(req: Request): string | null {
  const value = req.headers.get("x-owner-token")?.trim() || "";
  return /^ov1_[A-Za-z0-9_-]{43}$/.test(value) ? value : null;
}

export function publicFunctionError(error: unknown): {
  message: string;
  status: number;
} {
  const value = error as { code?: string; message?: string } | null;
  if (value?.code === "42501") {
    return { message: "Access denied", status: 403 };
  }
  if (value?.code === "22023" || value?.code === "22P02") {
    return { message: value.message || "Invalid request", status: 400 };
  }
  if (value?.code === "P0002") {
    return { message: "Not found", status: 404 };
  }
  return { message: "Request failed", status: 500 };
}
