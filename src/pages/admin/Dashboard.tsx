import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, CalendarCheck, Users, Activity, Eye, CalendarDays } from 'lucide-react';
import { platformScope } from '@/config/platform';
import {
  VISIT_TIMEZONE,
  emptyVisitStats,
  parseVisitStats,
  computeVisitStatsFromRows,
  type VisitStats,
} from '@/utils/visitStats';

const formatDay = (value: string) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!match) return value;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return new Intl.DateTimeFormat('ar-EG', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(date);
};

const fetchRecentPageViews = async () => {
  const since = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString();
  const pageSize = 1000;
  const rows: { created_at: string | null; metadata: unknown }[] = [];

  for (let from = 0; from < 20_000; from += pageSize) {
    const { data, error } = await supabase
      .from('analytics')
      .select('created_at, metadata')
      .eq('event_type', 'page_view')
      .gte('created_at', since)
      .order('created_at', { ascending: true })
      .range(from, from + pageSize - 1);

    if (error) throw error;
    if (!data?.length) break;
    rows.push(...data);
    if (data.length < pageSize) break;
  }

  return rows;
};

const loadVisitStats = async (): Promise<VisitStats> => {
  const { data, error } = await supabase.rpc('get_visit_stats', {
    p_timezone: VISIT_TIMEZONE,
  });
  const parsed = !error ? parseVisitStats(data) : null;
  if (parsed) return parsed;

  if (error) console.error('Failed to load visit stats RPC:', error);

  const [{ data: uniqueData }, { data: pageViewData }, recentRows] = await Promise.all([
    supabase.rpc('count_unique_visitors'),
    supabase.rpc('count_public_page_views'),
    fetchRecentPageViews(),
  ]);

  return computeVisitStatsFromRows(
    recentRows,
    Number(uniqueData) || 0,
    Number(pageViewData) || 0,
  );
};

const Dashboard = () => {
  const [propertyCount, setPropertyCount] = useState(0);
  const [reservationCount, setReservationCount] = useState(0);
  const [userCount, setUserCount] = useState(0);
  const [visits, setVisits] = useState<VisitStats>(emptyVisitStats);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const [{ count: propCount }, { count: resCount }, { count: uCount }, visitStats] =
        await Promise.all([
          supabase
            .from('properties')
            .select('id', { count: 'exact', head: true })
            .eq('type', platformScope.propertyType),
          supabase
            .from('analytics')
            .select('*', { count: 'exact', head: true })
            .eq('event_type', 'reservation_submitted'),
          supabase
            .from('user_roles')
            .select('*', { count: 'exact', head: true }),
          loadVisitStats().catch((error) => {
            console.error('Failed to load visit stats:', error);
            return emptyVisitStats;
          }),
        ]);

      setPropertyCount(propCount || 0);
      setReservationCount(resCount || 0);
      setUserCount(uCount || 0);
      setVisits(visitStats);
      setLoading(false);
    };

    void fetchStats();
  }, []);

  const maxDayViews = Math.max(1, ...visits.last_7_days.map((d) => d.unique_visitors));

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">لوحة التحكم</h1>
          <p className="text-muted-foreground">مرحباً بك في لوحة تحكم الإدارة</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-gold/40 bg-gold/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              زيارات اليوم
            </CardTitle>
            <CalendarDays className="h-5 w-5 text-gold" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {loading ? '...' : visits.today_unique_visitors}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              زوار فريدون اليوم
              {visits.today ? ` — ${formatDay(visits.today)}` : ''}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              مشاهدات اليوم
            </CardTitle>
            <Eye className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {loading ? '...' : visits.today_page_views}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              صفحات فُتحت اليوم (بدون لوحة التحكم)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              الزيارات الفريدة (الكل)
            </CardTitle>
            <Users className="h-5 w-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {loading ? '...' : visits.all_time_unique_visitors}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              إجمالي الزوار الفريدين — {visits.all_time_page_views} مشاهدة
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              فلل للإيجار
            </CardTitle>
            <Building2 className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{loading ? '...' : propertyCount}</div>
            <p className="text-xs text-muted-foreground mt-1">عدد الفلل المتاحة للإيجار</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              إجمالي المستخدمين
            </CardTitle>
            <Activity className="h-5 w-5 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{loading ? '...' : userCount}</div>
            <p className="text-xs text-muted-foreground mt-1">عدد المستخدمين المسجلين</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              طلبات الحجز
            </CardTitle>
            <CalendarCheck className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{loading ? '...' : reservationCount}</div>
            <p className="text-xs text-muted-foreground mt-1">عدد طلبات الحجز المرسلة</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">الزيارات خلال آخر 7 أيام</CardTitle>
          <p className="text-sm text-muted-foreground">
            عدد الزوار الفريدين لكل يوم (توقيت القدس)
          </p>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">جاري التحميل...</p>
          ) : visits.last_7_days.length === 0 ? (
            <p className="text-sm text-muted-foreground">لا توجد بيانات زيارات بعد.</p>
          ) : (
            <div className="space-y-3">
              {visits.last_7_days.map((day) => (
                <div key={day.date} className="grid grid-cols-[7.5rem_1fr_auto] items-center gap-3">
                  <span className="text-sm text-muted-foreground">{formatDay(day.date)}</span>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-gold"
                      style={{ width: `${(day.unique_visitors / maxDayViews) * 100}%` }}
                    />
                  </div>
                  <span className="min-w-[4.5rem] text-left text-sm font-medium tabular-nums">
                    {day.unique_visitors} زائر
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
