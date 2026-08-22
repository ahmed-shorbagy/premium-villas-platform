-- Integration test for the critical owner/villa isolation boundary.
-- Safe against a linked database: every fixture and write is rolled back.
BEGIN;

DO $test$
DECLARE
  v_owner_id uuid;
  v_assigned_property_id uuid;
  v_unassigned_property_id uuid;
  v_token_hash text := repeat('a', 64);
  v_snapshot jsonb;
  v_availability jsonb;
BEGIN
  SELECT id
    INTO v_assigned_property_id
    FROM public.properties
   ORDER BY id
   LIMIT 1;

  SELECT id
    INTO v_unassigned_property_id
    FROM public.properties
   WHERE id <> v_assigned_property_id
   ORDER BY id
   LIMIT 1;

  IF v_assigned_property_id IS NULL OR v_unassigned_property_id IS NULL THEN
    RAISE EXCEPTION 'Owner security test requires two properties';
  END IF;

  INSERT INTO public.property_owners (display_name)
  VALUES ('owner-access-security-test')
  RETURNING id INTO v_owner_id;

  INSERT INTO public.owner_property_assignments (owner_id, property_id)
  VALUES (v_owner_id, v_assigned_property_id);

  INSERT INTO public.owner_access_tokens (owner_id, token_hash)
  VALUES (v_owner_id, v_token_hash);

  v_snapshot := public.owner_portal_snapshot(v_token_hash);
  IF jsonb_array_length(v_snapshot->'villas') <> 1
     OR (v_snapshot->'villas'->0->>'id')::uuid <> v_assigned_property_id THEN
    RAISE EXCEPTION 'Snapshot leaked an unassigned property';
  END IF;

  BEGIN
    PERFORM public.owner_replace_availability(
      v_token_hash,
      v_unassigned_property_id,
      '[]'::jsonb
    );
    RAISE EXCEPTION 'Unassigned villa write was incorrectly accepted';
  EXCEPTION
    WHEN insufficient_privilege THEN
      NULL;
  END;

  v_availability := v_snapshot->'villas'->0->'availability';
  PERFORM public.owner_replace_availability(
    v_token_hash,
    v_assigned_property_id,
    v_availability
  );

  UPDATE public.owner_access_tokens
     SET revoked_at = now()
   WHERE owner_id = v_owner_id;

  BEGIN
    PERFORM public.owner_portal_snapshot(v_token_hash);
    RAISE EXCEPTION 'Revoked token was incorrectly accepted';
  EXCEPTION
    WHEN insufficient_privilege THEN
      NULL;
  END;
END;
$test$;

ROLLBACK;
