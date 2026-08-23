export const VISIT_TIMEZONE = 'Asia/Jerusalem';

export interface DayVisitStat {
  date: string;
  unique_visitors: number;
  page_views: number;
}

export interface VisitStats {
  today: string;
  timezone: string;
  today_unique_visitors: number;
  today_page_views: number;
  all_time_unique_visitors: number;
  all_time_page_views: number;
  last_7_days: DayVisitStat[];
}

export const emptyVisitStats: VisitStats = {
  today: '',
  timezone: VISIT_TIMEZONE,
  today_unique_visitors: 0,
  today_page_views: 0,
  all_time_unique_visitors: 0,
  all_time_page_views: 0,
  last_7_days: [],
};

export const isPublicVisitPath = (path: string | null | undefined) =>
  !/^\/(admin|owner|لوحة-التحكم)(\/|$)/i.test(path || '');

export const dateInTimeZone = (iso: string, timeZone = VISIT_TIMEZONE) =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(iso));

export const todayInTimeZone = (timeZone = VISIT_TIMEZONE) =>
  dateInTimeZone(new Date().toISOString(), timeZone);

const addDaysYmd = (ymd: string, days: number) => {
  const [year, month, day] = ymd.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days));
  return date.toISOString().slice(0, 10);
};

const asCount = (value: unknown) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

const metadataPath = (metadata: unknown) => {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) return '';
  const path = (metadata as Record<string, unknown>).path;
  return typeof path === 'string' ? path : '';
};

const metadataVisitorId = (metadata: unknown) => {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) return '';
  const id = (metadata as Record<string, unknown>).visitor_id;
  return typeof id === 'string' ? id.trim() : '';
};

export const parseVisitStats = (raw: unknown): VisitStats | null => {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const data = raw as Record<string, unknown>;
  const last7 = Array.isArray(data.last_7_days)
    ? data.last_7_days
        .map((item) => {
          if (!item || typeof item !== 'object' || Array.isArray(item)) return null;
          const row = item as Record<string, unknown>;
          const date = String(row.date || '').slice(0, 10);
          if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
          return {
            date,
            unique_visitors: asCount(row.unique_visitors),
            page_views: asCount(row.page_views),
          };
        })
        .filter((row): row is DayVisitStat => row !== null)
    : [];

  return {
    today: String(data.today || todayInTimeZone()).slice(0, 10),
    timezone: typeof data.timezone === 'string' ? data.timezone : VISIT_TIMEZONE,
    today_unique_visitors: asCount(data.today_unique_visitors),
    today_page_views: asCount(data.today_page_views),
    all_time_unique_visitors: asCount(data.all_time_unique_visitors),
    all_time_page_views: asCount(data.all_time_page_views),
    last_7_days: last7,
  };
};

export const computeVisitStatsFromRows = (
  rows: { created_at: string | null; metadata: unknown }[],
  allTimeUnique: number,
  allTimeViews: number,
  timeZone = VISIT_TIMEZONE,
): VisitStats => {
  const today = todayInTimeZone(timeZone);
  const days = Array.from({ length: 7 }, (_, i) => addDaysYmd(today, i - 6));
  const byDay = new Map(
    days.map((day) => [day, { visitors: new Set<string>(), views: 0 }]),
  );

  for (const row of rows) {
    if (!row.created_at || !isPublicVisitPath(metadataPath(row.metadata))) continue;
    const bucket = byDay.get(dateInTimeZone(row.created_at, timeZone));
    if (!bucket) continue;
    bucket.views += 1;
    const visitorId = metadataVisitorId(row.metadata);
    if (visitorId) bucket.visitors.add(visitorId);
  }

  const todayBucket = byDay.get(today);

  return {
    today,
    timezone: timeZone,
    today_unique_visitors: todayBucket?.visitors.size ?? 0,
    today_page_views: todayBucket?.views ?? 0,
    all_time_unique_visitors: allTimeUnique,
    all_time_page_views: allTimeViews,
    last_7_days: days.map((date) => {
      const bucket = byDay.get(date);
      return {
        date,
        unique_visitors: bucket?.visitors.size ?? 0,
        page_views: bucket?.views ?? 0,
      };
    }),
  };
};
