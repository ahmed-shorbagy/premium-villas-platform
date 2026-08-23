-- Accurate daily visit stats for the admin dashboard.
-- "Today" is evaluated in Asia/Jerusalem (Palestine).

CREATE INDEX IF NOT EXISTS analytics_page_view_created_idx
  ON public.analytics (created_at DESC)
  WHERE event_type = 'page_view';

CREATE INDEX IF NOT EXISTS analytics_page_view_visitor_idx
  ON public.analytics ((metadata->>'visitor_id'), created_at DESC)
  WHERE event_type = 'page_view';

CREATE OR REPLACE FUNCTION public.is_public_visit_path(p_path text)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT COALESCE(p_path, '') !~* '^/(admin|owner|لوحة-التحكم)(/|$)';
$$;

CREATE OR REPLACE FUNCTION public.get_visit_stats(
  p_timezone text DEFAULT 'Asia/Jerusalem'
)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH params AS (
    SELECT (timezone(p_timezone, now()))::date AS today
  ),
  public_views AS (
    SELECT
      a.created_at,
      nullif(btrim(a.metadata->>'visitor_id'), '') AS visitor_id,
      (timezone(p_timezone, a.created_at))::date AS visit_day
    FROM public.analytics a
    WHERE a.event_type = 'page_view'
      AND public.is_public_visit_path(a.metadata->>'path')
  ),
  today_rows AS (
    SELECT *
      FROM public_views, params
     WHERE public_views.visit_day = params.today
  ),
  last_7 AS (
    SELECT gs::date AS day
      FROM params, generate_series(params.today - 6, params.today, interval '1 day') gs
  )
  SELECT jsonb_build_object(
    'today', params.today,
    'timezone', p_timezone,
    'today_unique_visitors', (
      SELECT COUNT(DISTINCT visitor_id) FROM today_rows WHERE visitor_id IS NOT NULL
    ),
    'today_page_views', (
      SELECT COUNT(*) FROM today_rows
    ),
    'all_time_unique_visitors', (
      SELECT COUNT(DISTINCT visitor_id) FROM public_views WHERE visitor_id IS NOT NULL
    ),
    'all_time_page_views', (
      SELECT COUNT(*) FROM public_views
    ),
    'last_7_days', (
      SELECT COALESCE(
        jsonb_agg(
          jsonb_build_object(
            'date', last_7.day,
            'unique_visitors', COALESCE(day_stats.unique_visitors, 0),
            'page_views', COALESCE(day_stats.page_views, 0)
          )
          ORDER BY last_7.day
        ),
        '[]'::jsonb
      )
      FROM last_7
      LEFT JOIN (
        SELECT
          visit_day AS day,
          COUNT(DISTINCT visitor_id) FILTER (WHERE visitor_id IS NOT NULL) AS unique_visitors,
          COUNT(*) AS page_views
        FROM public_views, params
        WHERE visit_day >= params.today - 6
        GROUP BY visit_day
      ) day_stats ON day_stats.day = last_7.day
    )
  )
  FROM params;
$$;

REVOKE ALL ON FUNCTION public.get_visit_stats(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_visit_stats(text) TO authenticated;

REVOKE ALL ON FUNCTION public.is_public_visit_path(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_public_visit_path(text) TO authenticated;

-- Keep lifetime RPCs aligned with the same public-path rule.
CREATE OR REPLACE FUNCTION public.count_unique_visitors()
RETURNS bigint
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(DISTINCT nullif(btrim(metadata->>'visitor_id'), ''))
    FROM public.analytics
   WHERE event_type = 'page_view'
     AND metadata ? 'visitor_id'
     AND public.is_public_visit_path(metadata->>'path');
$$;

CREATE OR REPLACE FUNCTION public.count_public_page_views()
RETURNS bigint
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)
    FROM public.analytics
   WHERE event_type = 'page_view'
     AND public.is_public_visit_path(metadata->>'path');
$$;

GRANT INSERT ON public.analytics TO anon, authenticated;
