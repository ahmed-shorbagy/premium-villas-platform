import "@supabase/functions-js/edge-runtime.d.ts";
import {
  corsHeaders,
  getR2Config,
  jsonResponse,
  requireAdmin,
} from "../_shared/r2-admin.ts";

function keyFromUrlOrKey(value: string, publicBaseUrl: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  let key = trimmed;
  try {
    if (/^https?:\/\//i.test(trimmed)) {
      const url = new URL(trimmed);
      key = decodeURIComponent(url.pathname.replace(/^\/+/, ""));
      const basePath = new URL(publicBaseUrl).pathname.replace(/^\/+|\/+$/g, "");
      if (basePath && key.startsWith(`${basePath}/`)) {
        key = key.slice(basePath.length + 1);
      }
    }
  } catch {
    return null;
  }

  key = key.replace(/^\/+/, "");
  if (!key.startsWith("properties/") || key.includes("..")) return null;
  return key;
}

function withThumbSibling(key: string): string[] {
  const keys = new Set([key]);
  const match = key.match(/^(properties\/[0-9a-f-]+)(\.[a-z0-9]+)$/i);
  if (match) keys.add(`${match[1]}_sm${match[2]}`);
  return [...keys];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const auth = await requireAdmin(req);
    if (auth instanceof Response) return auth;

    const r2 = getR2Config();
    if (!r2) {
      return jsonResponse({ error: "R2 secrets are not configured" }, 500);
    }

    const payload = await req.json().catch(() => ({}));
    const rawValues = [
      ...(Array.isArray(payload.urls) ? payload.urls : []),
      ...(Array.isArray(payload.keys) ? payload.keys : []),
    ].filter((value) => typeof value === "string");

    const keys = [...new Set(
      rawValues
        .map((value) => keyFromUrlOrKey(value, r2.publicBaseUrl))
        .filter((key): key is string => Boolean(key))
        .flatMap(withThumbSibling),
    )];

    if (keys.length === 0) {
      return jsonResponse({ deleted: 0 });
    }

    const results = await Promise.allSettled(
      keys.map(async (key) => {
        const objectUrl = `${r2.endpoint}/${r2.bucket}/${key}`;
        const signed = await r2.client.sign(
          new Request(objectUrl, { method: "DELETE" }),
          { aws: { signQuery: true } },
        );
        const res = await fetch(signed.url, { method: "DELETE" });
        if (!res.ok && res.status !== 404) {
          throw new Error(`Failed to delete ${key}`);
        }
      }),
    );

    const failed = results.filter((result) => result.status === "rejected").length;
    if (failed > 0) {
      console.error(`r2-delete: ${failed}/${keys.length} objects failed`);
    }

    return jsonResponse({ deleted: keys.length - failed, failed });
  } catch (error) {
    console.error("r2-delete failed", error);
    return jsonResponse({ error: "Failed to delete media" }, 500);
  }
});
