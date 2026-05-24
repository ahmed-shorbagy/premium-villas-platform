import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, MousePointer, Users, Activity } from 'lucide-react';
import { platformScope } from '@/config/platform';

const Dashboard = () => {
  const [propertyCount, setPropertyCount] = useState(0);
  const [whatsappClicks, setWhatsappClicks] = useState(0);
  const [userCount, setUserCount] = useState(0);
  const [pageViews, setPageViews] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      // Fetch property count
      const { count: propCount } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .eq('type', platformScope.propertyType)
        .eq('listing_type', platformScope.listingType);

      // Fetch WhatsApp clicks
      const { count: clickCount } = await supabase
        .from('analytics')
        .select('*', { count: 'exact', head: true })
        .eq('event_type', 'preview_request');

      // Fetch user count
      const { count: uCount } = await supabase
        .from('user_roles')
        .select('*', { count: 'exact', head: true });

      // Fetch page views (unique visitors)
      const { data: pageViewsData } = await supabase
        .from('analytics')
        .select('metadata')
        .eq('event_type', 'page_view');

      const uniqueVisitors = new Set(
        pageViewsData?.map((event: any) => event.metadata?.visitor_id).filter(Boolean)
      ).size;

      setPropertyCount(propCount || 0);
      setWhatsappClicks(clickCount || 0);
      setUserCount(uCount || 0);
      setPageViews(uniqueVisitors || 0);
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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              فلل للإيجار
            </CardTitle>
            <Building2 className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {loading ? '...' : propertyCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              عدد الفلل المتاحة للإيجار
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              إجمالي الزيارات
            </CardTitle>
            <Activity className="h-5 w-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {loading ? '...' : pageViews}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              عدد مشاهدات الصفحات
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              إجمالي المستخدمين
            </CardTitle>
            <Users className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {loading ? '...' : userCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              عدد المستخدمين المسجلين
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              إجمالي نقرات واتساب
            </CardTitle>
            <MousePointer className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {loading ? '...' : whatsappClicks}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              عدد طلبات المعاينة المرسلة عبر واتساب
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
