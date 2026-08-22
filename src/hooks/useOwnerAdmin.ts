import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { OwnerAdminData, OwnerRecord } from "@/types/ownerAccess";

const EMPTY_DATA: OwnerAdminData = {
  owners: [],
  assignments: [],
  tokens: [],
  properties: [],
};

async function errorMessage(error: unknown): Promise<string> {
  if (error && typeof error === "object" && "context" in error) {
    const context = (error as { context?: unknown }).context;
    if (context instanceof Response) {
      try {
        const body = await context.clone().json();
        if (body?.error) return String(body.error);
      } catch {
        // Fall through to the generic message.
      }
    }
  }
  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message: string }).message);
  }
  return "فشل تنفيذ الطلب";
}

async function invokeAdmin<T>(body: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.functions.invoke<T>("owner-access-admin", {
    body,
  });
  if (error) throw new Error(await errorMessage(error));
  return data as T;
}

export interface OwnerSaveInput {
  id?: string;
  display_name: string;
  phone: string;
  email: string;
  is_active: boolean;
  property_ids: string[];
}

export function useOwnerAdmin() {
  const [data, setData] = useState<OwnerAdminData>(EMPTY_DATA);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setData(await invokeAdmin<OwnerAdminData>({ action: "list" }));
      setError(null);
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : "فشل تحميل الملاك",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const saveOwner = async (input: OwnerSaveInput) => {
    const result = await invokeAdmin<{ owner_id: string }>({
      action: "save",
      owner: {
        id: input.id,
        display_name: input.display_name,
        phone: input.phone,
        email: input.email,
        is_active: input.is_active,
      },
      property_ids: input.property_ids,
    });
    await refresh();
    return result.owner_id;
  };

  const rotateLink = async (ownerId: string) => {
    const result = await invokeAdmin<{ token_id: string; secret: string }>({
      action: "rotate",
      owner_id: ownerId,
    });
    await refresh();
    return result.secret;
  };

  const revokeLink = async (ownerId: string) => {
    await invokeAdmin<{ revoked: boolean }>({
      action: "revoke",
      owner_id: ownerId,
    });
    await refresh();
  };

  const assignmentsFor = (ownerId: string) =>
    data.assignments
      .filter((assignment) => assignment.owner_id === ownerId)
      .map((assignment) => assignment.property_id);

  const activeTokenFor = (ownerId: string) =>
    data.tokens.find(
      (token) => token.owner_id === ownerId && token.revoked_at === null,
    );

  const ownerById = (ownerId: string): OwnerRecord | undefined =>
    data.owners.find((owner) => owner.id === ownerId);

  return {
    ...data,
    loading,
    error,
    refresh,
    saveOwner,
    rotateLink,
    revokeLink,
    assignmentsFor,
    activeTokenFor,
    ownerById,
  };
}
