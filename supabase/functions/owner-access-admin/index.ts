import "@supabase/functions-js/edge-runtime.d.ts";
import { requireAdmin } from "../_shared/r2-admin.ts";
import {
  corsHeaders,
  generateOwnerSecret,
  getServiceClient,
  isAllowedOrigin,
  jsonResponse,
  publicFunctionError,
  sha256Hex,
} from "../_shared/owner-access.ts";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function asUuid(value: unknown, optional = false): string | null {
  if (optional && (value === null || value === undefined || value === "")) {
    return null;
  }
  const id = String(value || "");
  if (!UUID_PATTERN.test(id)) throw { code: "22023", message: "Invalid identifier" };
  return id;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders(req) });
  }
  if (req.method !== "POST") {
    return jsonResponse(req, { error: "Method not allowed" }, 405);
  }
  if (!isAllowedOrigin(req)) {
    return jsonResponse(req, { error: "Origin not allowed" }, 403);
  }

  const contentLength = Number(req.headers.get("content-length") || 0);
  if (contentLength > 32_768) {
    return jsonResponse(req, { error: "Request too large" }, 413);
  }

  try {
    const auth = await requireAdmin(req);
    if (auth instanceof Response) return auth;

    const payload = await req.json().catch(() => ({}));
    const action = String(payload.action || "");
    const service = getServiceClient();

    if (action === "list") {
      const [ownersResult, assignmentsResult, tokensResult, propertiesResult] =
        await Promise.all([
          service
            .from("property_owners")
            .select("id, display_name, phone, email, is_active, created_at, updated_at")
            .order("created_at", { ascending: false }),
          service
            .from("owner_property_assignments")
            .select("owner_id, property_id, assigned_at"),
          service
            .from("owner_access_tokens")
            .select("id, owner_id, label, created_at, last_used_at, revoked_at")
            .order("created_at", { ascending: false }),
          service
            .from("properties")
            .select("id, title, location")
            .eq("type", "villa")
            .order("title"),
        ]);

      const error = ownersResult.error || assignmentsResult.error ||
        tokensResult.error || propertiesResult.error;
      if (error) throw error;

      return jsonResponse(req, {
        owners: ownersResult.data || [],
        assignments: assignmentsResult.data || [],
        tokens: tokensResult.data || [],
        properties: propertiesResult.data || [],
      });
    }

    if (action === "save") {
      const owner = payload.owner || {};
      const ownerId = asUuid(owner.id, true);
      const displayName = String(owner.display_name || "").trim();
      const propertyIds = Array.isArray(payload.property_ids)
        ? [...new Set(payload.property_ids.map((id: unknown) => asUuid(id)))]
        : [];

      const { data, error } = await service.rpc("admin_save_property_owner", {
        p_admin_id: auth.user.id,
        p_owner_id: ownerId,
        p_display_name: displayName,
        p_phone: String(owner.phone || ""),
        p_email: String(owner.email || ""),
        p_is_active: owner.is_active !== false,
        p_property_ids: propertyIds,
      });
      if (error) throw error;
      return jsonResponse(req, { owner_id: data });
    }

    if (action === "rotate") {
      const ownerId = asUuid(payload.owner_id);
      const secret = generateOwnerSecret();
      const tokenHash = await sha256Hex(secret);
      const { data, error } = await service.rpc("admin_rotate_owner_token", {
        p_admin_id: auth.user.id,
        p_owner_id: ownerId,
        p_token_hash: tokenHash,
        p_label: String(payload.label || "رابط المالك"),
      });
      if (error) throw error;
      return jsonResponse(req, { token_id: data, secret });
    }

    if (action === "revoke") {
      const ownerId = asUuid(payload.owner_id);
      const { data, error } = await service.rpc("admin_revoke_owner_token", {
        p_admin_id: auth.user.id,
        p_owner_id: ownerId,
      });
      if (error) throw error;
      return jsonResponse(req, { revoked: Boolean(data) });
    }

    return jsonResponse(req, { error: "Unknown action" }, 400);
  } catch (error) {
    const publicError = publicFunctionError(error);
    if (publicError.status === 500) {
      console.error("owner-access-admin failed", error);
    }
    return jsonResponse(req, { error: publicError.message }, publicError.status);
  }
});
