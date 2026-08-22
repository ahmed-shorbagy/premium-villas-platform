import "@supabase/functions-js/edge-runtime.d.ts";
import {
  corsHeaders,
  getServiceClient,
  isAllowedOrigin,
  jsonResponse,
  publicFunctionError,
  readOwnerSecret,
  sha256Hex,
} from "../_shared/owner-access.ts";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

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
  if (contentLength > 65_536) {
    return jsonResponse(req, { error: "Request too large" }, 413);
  }

  const secret = readOwnerSecret(req);
  if (!secret) {
    return jsonResponse(req, { error: "Access denied" }, 403);
  }

  try {
    const tokenHash = await sha256Hex(secret);
    const payload = await req.json().catch(() => ({}));
    const action = String(payload.action || "");
    const service = getServiceClient();

    if (action === "snapshot") {
      const { data, error } = await service.rpc("owner_portal_snapshot", {
        p_token_hash: tokenHash,
      });
      if (error) throw error;
      return jsonResponse(req, data);
    }

    if (action === "save_availability") {
      const propertyId = String(payload.property_id || "");
      if (!UUID_PATTERN.test(propertyId)) {
        throw { code: "22023", message: "Invalid villa identifier" };
      }

      if (!Array.isArray(payload.periods) || payload.periods.length > 100) {
        throw { code: "22023", message: "Invalid availability periods" };
      }

      const periods = payload.periods.map((period: unknown) => {
        const value = period as Record<string, unknown>;
        const id = value?.id == null || value.id === "" ? null : String(value.id);
        const availableFrom = String(value?.available_from || "");
        const availableTo = String(value?.available_to || "");
        if (
          (id && !UUID_PATTERN.test(id)) ||
          !DATE_PATTERN.test(availableFrom) ||
          !DATE_PATTERN.test(availableTo)
        ) {
          throw { code: "22023", message: "Invalid availability period" };
        }
        return {
          ...(id ? { id } : {}),
          available_from: availableFrom,
          available_to: availableTo,
        };
      });

      const { data, error } = await service.rpc("owner_replace_availability", {
        p_token_hash: tokenHash,
        p_property_id: propertyId,
        p_periods: periods,
      });
      if (error) throw error;
      return jsonResponse(req, { availability: data });
    }

    return jsonResponse(req, { error: "Unknown action" }, 400);
  } catch (error) {
    const publicError = publicFunctionError(error);
    if (publicError.status === 500) {
      console.error("owner-portal request failed", error);
    }
    return jsonResponse(req, { error: publicError.message }, publicError.status);
  }
});
