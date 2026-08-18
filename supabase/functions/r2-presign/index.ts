import "@supabase/functions-js/edge-runtime.d.ts";
import {
  ALLOWED_CONTENT_TYPES,
  CACHE_CONTROL,
  PRESIGN_EXPIRES_SECONDS,
  corsHeaders,
  extensionFor,
  getR2Config,
  jsonResponse,
  maxBytesFor,
  requireAdmin,
} from "../_shared/r2-admin.ts";

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
    const contentType = String(payload.contentType || "").toLowerCase().trim();
    const includeThumb = Boolean(payload.includeThumb) && contentType.startsWith("image/");
    const contentLength = Number(payload.contentLength);

    if (!ALLOWED_CONTENT_TYPES[contentType]) {
      return jsonResponse(
        { error: `Unsupported content type: ${contentType || "(empty)"}` },
        400,
      );
    }

    if (Number.isFinite(contentLength) && contentLength > maxBytesFor(contentType)) {
      return jsonResponse(
        { error: `File exceeds the ${Math.round(maxBytesFor(contentType) / (1024 * 1024))}MB limit` },
        400,
      );
    }

    const ext = extensionFor(contentType);
    const stem = crypto.randomUUID();
    const variants = includeThumb ? (["full", "sm"] as const) : (["full"] as const);

    const objects = [];
    for (const variant of variants) {
      const key = variant === "sm"
        ? `properties/${stem}_sm.${ext}`
        : `properties/${stem}.${ext}`;
      const objectUrl =
        `${r2.endpoint}/${r2.bucket}/${key}?X-Amz-Expires=${PRESIGN_EXPIRES_SECONDS}`;

      const signed = await r2.client.sign(
        new Request(objectUrl, {
          method: "PUT",
          headers: {
            "Content-Type": contentType,
            "Cache-Control": CACHE_CONTROL,
          },
        }),
        { aws: { signQuery: true } },
      );

      objects.push({
        variant,
        key,
        uploadUrl: signed.url,
        publicUrl: `${r2.publicBaseUrl}/${key}`,
      });
    }

    return jsonResponse({
      stem,
      contentType,
      cacheControl: CACHE_CONTROL,
      objects,
      publicUrl: objects.find((item) => item.variant === "full")?.publicUrl,
    });
  } catch (error) {
    console.error("r2-presign failed", error);
    return jsonResponse({ error: "Failed to create upload URL" }, 500);
  }
});
