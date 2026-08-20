import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, CalendarCheck, Users, Activity, Eye } from 'lucide-react';
import { platformScope } from '@/config/platform';

const Dashboard = () => {
  const [propertyCount, setPropertyCount] = useState(0);
  const [reservationCount, setReservationCount] = useState(0);
  const [userCount, setUserCount] = useState(0);
  const [pageViews, setPageViews] = useState(0);
  const [uniqueVisitors, setUniqueVisitors] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const { count: propCount } = await supabase
        .from('properties')
        .select('id', { count: 'exact', head: true })
        .eq('type', platformScope.propertyType);

      const { count: resCount } = await supabase
        .from('analytics')
        .select('*', { count: 'exact', head: true })
        .eq('event_type', 'reservation_submitted');

      const { count: uCount } = await supabase
        .from('user_roles')
        .select('*', { count: 'exact', head: true });

      let pageViewCount = 0;
      const { data: pageViewData, error: pageViewError } = await supabase.rpc(
        'count_public_page_views'
      );
      if (!pageViewError && pageViewData != null) {
        pageViewCount = Number(pageViewData) || 0;
      } else {
        // Fallback if RPC not yet deployed: client-side filter is imperfect but better than raw
        const { count } = await supabase
          .from('analytics')
          .select('id', { count: 'exact', head: true })
          .eq('event_type', 'page_view');
        pageViewCount = count || 0;
      }

      let uniqueVisitorsCount = 0;
      const { data: uniqueData, error: uniqueError } = await supabase.rpc(
        'count_unique_visitors'
      );
      if (!uniqueError && uniqueData != null) {
        uniqueVisitorsCount = Number(uniqueData) || 0;
      }

      setPropertyCount(propCount || 0);
      setReservationCount(resCount || 0);
      setUserCount(uCount || 0);
      setPageViews(pageViewCount);
      setUniqueVisitors(uniqueVisitorsCount);
      setLoading(false);
    };

    fetchStats();
  }, []);

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">لوحة التحكم</h1>
          <p className="text-muted-foreground">مرحباً بك في لوحة تحكم الإدارة</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
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
              الزيارات الفريدة
            </CardTitle>
            <Users className="h-5 w-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{loading ? '...' : uniqueVisitors}</div>
            <p className="text-xs text-muted-foreground mt-1">
              زوار فريدون (بدون لوحة التحكم)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              مشاهدات الصفحات
            </CardTitle>
            <Eye className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{loading ? '...' : pageViews}</div>
            <p className="text-xs text-muted-foreground mt-1">
              مشاهدات عامة (بدون لوحة التحكم)
            </p>
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
            <CalendarCheck className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{loading ? '...' : reservationCount}</div>
            <p className="text-xs text-muted-foreground mt-1">عدد طلبات الحجز المرسلة</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
