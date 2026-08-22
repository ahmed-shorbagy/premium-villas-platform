import type {
  OwnerAvailabilityPeriod,
  OwnerPortalSnapshot,
} from "@/types/ownerAccess";

const OWNER_TOKEN_KEY = "owner_portal_token";
const OWNER_TOKEN_PATTERN = /^ov1_[A-Za-z0-9_-]{43}$/;

export function consumeOwnerTokenFromUrl(): string | null {
  const hash = window.location.hash.startsWith("#")
    ? window.location.hash.slice(1)
    : window.location.hash;
  const access = new URLSearchParams(hash).get("access")?.trim() || "";
  if (OWNER_TOKEN_PATTERN.test(access)) {
    sessionStorage.setItem(OWNER_TOKEN_KEY, access);
    window.history.replaceState(
      null,
      document.title,
      `${window.location.pathname}${window.location.search}`,
    );
    return access;
  }
  const stored = sessionStorage.getItem(OWNER_TOKEN_KEY) || "";
  return OWNER_TOKEN_PATTERN.test(stored) ? stored : null;
}

export function clearOwnerToken(): void {
  sessionStorage.removeItem(OWNER_TOKEN_KEY);
}

async function ownerRequest<T>(
  token: string,
  body: Record<string, unknown>,
): Promise<T> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const publishableKey = import.meta.env
    .VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;
  if (!supabaseUrl || !publishableKey) {
    throw new Error("إعدادات الاتصال غير مكتملة");
  }

  const response = await fetch(`${supabaseUrl}/functions/v1/owner-portal`, {
    method: "POST",
    headers: {
      apikey: publishableKey,
      "Content-Type": "application/json",
      "x-owner-token": token,
    },
    body: JSON.stringify(body),
    referrerPolicy: "no-referrer",
    cache: "no-store",
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 403) clearOwnerToken();
    throw new Error(
      response.status === 403
        ? "الرابط غير صالح أو تم إلغاؤه"
        : String(data?.error || "فشل تنفيذ الطلب"),
    );
  }
  return data as T;
}

export function fetchOwnerSnapshot(
  token: string,
): Promise<OwnerPortalSnapshot> {
  return ownerRequest<OwnerPortalSnapshot>(token, { action: "snapshot" });
}

export async function saveOwnerAvailability(
  token: string,
  propertyId: string,
  periods: Array<Pick<OwnerAvailabilityPeriod, "available_from" | "available_to"> & {
    id?: string;
  }>,
): Promise<OwnerAvailabilityPeriod[]> {
  const result = await ownerRequest<{ availability: OwnerAvailabilityPeriod[] }>(
    token,
    {
      action: "save_availability",
      property_id: propertyId,
      periods,
    },
  );
  return result.availability;
}
